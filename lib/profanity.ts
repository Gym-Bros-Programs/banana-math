const BAD_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "dick",
  "pussy",
  "slut",
  "whore",
  "faggot",
  "nigger",
  "nigga",
  "twat",
  "bastard",
  "admin",
  "moderator",
  "system",
  "banana-math"
]

/**
 * Basic profanity and reserved word filter for usernames.
 */
export function isProfane(text: string): boolean {
  if (!text) return false
  const lower = text.toLowerCase()

  // For strict filtering on usernames where boundaries might not exist (e.g. 'fuck123')
  return BAD_WORDS.some((word) => lower.includes(word))
}
