"use client";

import { useState } from "react";

interface AiAssistantProps {
  scanId: string;
}

export function AiAssistant({ scanId }: AiAssistantProps) {
  const [question, setQuestion] = useState("How should I prioritize and fix these issues on my site?");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, question }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "AI assistant request failed");
      }

      setAnswer(typeof data?.answer === "string" ? data.answer : "");
    } catch (err) {
      console.error("AI assistant error", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="ai-assistant"
      className="space-y-3 rounded-2xl border border-emerald-700/40 bg-emerald-950/40 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-emerald-50">
            AI Compliance Assistant
          </h2>
          <p className="mt-1 text-[11px] text-emerald-100/80">
            Ask AI to turn these findings into clear, developer-ready fixes.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
          Agency
        </span>
      </div>

      <form onSubmit={handleAsk} className="space-y-2">
        <textarea
          className="min-h-18 w-full rounded-lg border border-emerald-700/50 bg-black/40 px-3 py-2 text-xs text-emerald-50 placeholder:text-emerald-200/40 focus:border-emerald-400 focus:outline-none focus:ring-0"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Asking AI..." : "Ask AI for a fix plan"}
        </button>
      </form>

      {error && (
        <p className="text-[11px] text-red-300">
          {error}
        </p>
      )}

      {answer && (
        <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-lg border border-emerald-700/40 bg-black/40 p-3 text-[11px] leading-relaxed text-emerald-50">
          {answer.split("\n").map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      )}
    </section>
  );
}
