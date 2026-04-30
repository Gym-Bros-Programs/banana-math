import type { SessionConfig } from "@/lib/types/database"

export function getQuestionPoolSize(config: SessionConfig): number {
  if (config.sessionMode === "fixed") {
    return config.questionLimit ?? 20
  }

  return (config.durationSeconds ?? 60) * 5
}
