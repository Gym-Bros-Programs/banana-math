import type { QuestionSubType } from "./types/database"

export const SUB_TYPE_LABELS: Record<QuestionSubType, string> = {
  addition: "+",
  subtraction: "−",
  multiplication: "×",
  division: "÷",
  decimal: ".",
  fraction: "½",
  exponent: "^",
  linear: "Linear",
  quadratic: "Quadratic"
}

export function formatOperatorSet(set: string[] | null | undefined): string {
  if (!set || !Array.isArray(set)) return ""
  return set.map((s) => SUB_TYPE_LABELS[s as QuestionSubType] ?? s).join(" ")
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}
