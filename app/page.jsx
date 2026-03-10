"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { UploadSection } from "@/components/upload-section"
import { ResultsSection } from "@/components/results-section"

export default function Home() {
  const [resumeText, setResumeText] = useState("")
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleReset = () => {
    setResult(null)
    setResumeText("")
    setResumeFile(null)
    setJobDescription("")
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {!result ? (
          <>
            <Hero />
            <UploadSection
              resumeText={resumeText}
              setResumeText={setResumeText}
              resumeFile={resumeFile}
              setResumeFile={setResumeFile}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
              setResult={setResult}
              error={error}
              setError={setError}
            />
          </>
        ) : (
          <ResultsSection result={result} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}
