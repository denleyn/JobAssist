"use client"

import { useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function ResultsSection({ result, onReset }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getScoreColor = (score) => {
    if (score >= 70) return "text-success"
    if (score >= 40) return "text-warning"
    return "text-destructive"
  }

  const getScoreBg = (score) => {
    if (score >= 70) return "bg-success"
    if (score >= 40) return "bg-warning"
    return "bg-destructive"
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <Button
            variant="ghost"
            onClick={onReset}
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Start New Analysis
          </Button>

          <div className="mb-8 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-muted-foreground">
              Resume Match Score
            </h2>
            <div className="relative mx-auto mb-4 h-40 w-40">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/30"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${result.matchScore * 2.83} 283`}
                  strokeLinecap="round"
                  className={getScoreColor(result.matchScore)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-4xl font-bold ${getScoreColor(result.matchScore)}`}
                >
                  {result.matchScore}%
                </span>
              </div>
            </div>
            <p className="text-muted-foreground">
              {result.matchScore >= 70
                ? "Great match! Your resume aligns well with this position."
                : result.matchScore >= 40
                ? "Good start! Consider adding missing keywords to improve your match."
                : "Needs improvement. Focus on incorporating more relevant keywords."}
            </p>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h3 className="font-semibold text-card-foreground">
                  Matched Keywords
                </h3>
                <span className="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  {result.matchedKeywords.length} found
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-success/10 px-3 py-1 text-sm text-success"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold text-card-foreground">
                  Missing Keywords
                </h3>
                <span className="ml-auto rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  {result.missingKeywords.length} missing
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-destructive/10 px-3 py-1 text-sm text-destructive"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-card-foreground">
                Improvement Suggestions
              </h3>
            </div>
            <ul className="space-y-3">
              {result.suggestions.map((suggestion, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                    {i + 1}
                  </span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-card-foreground">
                Generated Cover Letter
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {result.coverLetter}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
