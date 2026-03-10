import Groq from "groq-sdk"
import { z } from "zod"
import { extractText, getDocumentProxy } from "unpdf"
import mammoth from "mammoth"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const PDF_MIME = "application/pdf"
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

const analysisSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall match percentage between resume and job description"),
  matchedKeywords: z
    .array(z.string())
    .describe("Keywords from the job description that appear in the resume"),
  missingKeywords: z
    .array(z.string())
    .describe(
      "Important keywords from the job description that are missing from the resume"
    ),
  suggestions: z
    .array(z.string())
    .describe(
      "Specific, actionable suggestions for improving the resume to better match the job"
    ),
  coverLetter: z
    .string()
    .describe(
      "A professional cover letter tailored to the job description, highlighting relevant experience from the resume"
    ),
})

async function extractResumeText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)
  const type = file.type || ""

  if (type === PDF_MIME) {
    const pdf = await getDocumentProxy(buffer)
    const { text } = await extractText(pdf, { mergePages: true })
    return text
  }

  if (type === DOCX_MIME) {
    const nodeBuffer = Buffer.from(arrayBuffer)
    const result = await mammoth.extractRawText({ buffer: nodeBuffer })
    return result.value
  }

  throw new Error(
    "Unsupported file type. Please upload a PDF or DOCX file."
  )
}

export async function POST(req) {
  try {
    const formData = await req.formData()
    const resumeFile = formData.get("resume")
    const jobDescription = formData.get("jobDescription")

    if (!resumeFile || typeof resumeFile === "string") {
      return Response.json(
        { error: "Resume file is required (PDF or DOCX)." },
        { status: 400 }
      )
    }

    if (!jobDescription || typeof jobDescription !== "string") {
      return Response.json(
        { error: "Job description is required." },
        { status: 400 }
      )
    }

    const resumeText = await extractResumeText(resumeFile)

    if (!resumeText?.trim()) {
      return Response.json(
        { error: "Could not extract text from the resume file." },
        { status: 400 }
      )
    }

    const prompt = `You are an expert career coach and resume analyst. Analyze the following resume against the job description and provide detailed feedback.

## Resume:
${resumeText}

## Job Description:
${jobDescription}

## Instructions:
1. Calculate a match score (0-100) based on how well the resume aligns with the job requirements
2. Identify keywords from the job description that appear in the resume (matched keywords)
3. Identify important keywords from the job description that are missing from the resume
4. Provide 3-5 specific, actionable suggestions for improving the resume
5. Write a professional cover letter (3-4 paragraphs) that:
   - Opens with enthusiasm for the specific role
   - Highlights relevant experience from the resume
   - Addresses key requirements from the job description
   - Ends with a confident call to action

Be thorough but concise. Focus on the most impactful improvements.

Respond with a single JSON object only (no markdown or other text) with exactly these keys: matchScore (number), matchedKeywords (array of strings), missingKeywords (array of strings), suggestions (array of strings), coverLetter (string).`

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    })

    const rawContent = completion.choices[0].message.content
    const parsed = JSON.parse(rawContent)
    const result = analysisSchema.parse(parsed)

    return Response.json(result)
  } catch (error) {
    console.error("Analysis error:", error)
    return Response.json(
      {
        error:
          error.message?.startsWith("Unsupported file type") ||
          error.message?.startsWith("Could not extract")
            ? error.message
            : "Failed to analyze application. Please try again.",
      },
      { status: error.message?.startsWith("Unsupported") ? 400 : 500 }
    )
  }
}
