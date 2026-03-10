"use client"

import { useCallback, useState } from "react"
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function UploadSection({
  resumeText,
  setResumeText,
  resumeFile,
  setResumeFile,
  jobDescription,
  setJobDescription,
  isAnalyzing,
  setIsAnalyzing,
  setResult,
  error,
  setError,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = useCallback(
    (file) => {
      setResumeFile(file)
      setFileName(file.name)
      const isTextFile =
        file.type?.startsWith("text/") || file.name?.toLowerCase().endsWith(".txt")
      if (isTextFile) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setResumeText(e.target?.result ?? "")
        }
        reader.readAsText(file)
      } else {
        setResumeText("")
      }
    },
    [setResumeFile, setResumeText]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile]
  )

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile]
  )

  const handleAnalyzeClick = useCallback(async () => {
    const hasFile = resumeFile != null
    const hasPastedText = resumeText.trim().length > 0
    const hasJobDescription = jobDescription.trim().length > 0

    if (!hasFile && !hasPastedText) {
      setError("Please upload a resume file or paste your resume text.")
      return
    }
    if (!hasJobDescription) {
      setError("Please enter the job description.")
      return
    }

    setError(null)
    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      if (hasFile) {
        formData.append("resume", resumeFile)
      } else {
        const blob = new Blob([resumeText.trim()], { type: "text/plain" })
        formData.append("resume", blob, "resume.txt")
      }
      formData.append("jobDescription", jobDescription.trim())

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      let data
      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed. Please try again.")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.")
    } finally {
      setIsAnalyzing(false)
    }
  }, [
    resumeFile,
    resumeText,
    jobDescription,
    setError,
    setIsAnalyzing,
    setResult,
  ])

  const hasResume = resumeFile != null || resumeText.trim().length > 0
  const hasJobDescription = jobDescription.trim().length > 0
  const canSubmit = hasResume && hasJobDescription && !isAnalyzing

  return (
    <section id="how-it-works" className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-center text-2xl font-bold text-foreground md:text-3xl">
            Analyze Your Application
          </h2>
          <p className="mb-10 text-center text-muted-foreground">
            Upload your resume and paste the job description to get started
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Your Resume
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : resumeFile || resumeText
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
                }`}
              >
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                {resumeFile || resumeText ? (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <FileText className="h-10 w-10 text-primary" />
                    <p className="font-medium text-foreground">
                      {fileName || "Resume uploaded"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {resumeFile
                        ? "File ready for analysis"
                        : `${resumeText.length} characters loaded`}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium text-foreground">
                      Drop your resume here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse (.txt, .pdf, .doc)
                    </p>
                  </div>
                )}
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Or paste your resume text here..."
                className="h-32 w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="h-[calc(200px+8rem+0.75rem)] w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={!canSubmit}
              size="lg"
              className="min-w-[200px] gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Analyze Application
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Sparkles({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
