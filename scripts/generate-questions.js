/**
 * generate-questions.js
 * 
 * Generates arithmetic questions with specific difficulty levels and rules.
 * 
 * Usage:
 *   node scripts/generate-questions.js --difficulty Easy --ops addition,subtraction
 *   node scripts/generate-questions.js --difficulty Medium --ops multiplication,division
 * 
 * Flags:
 *   --difficulty [Easy|Medium|Hard]  (default: Easy)
 *   --ops [comma-separated ops]     (default: addition,subtraction)
 *   --allow-negatives [true|false]  (default: false)
 *   --dry-run                       (don't write to file)
 * 
 * Difficulty Definitions (1-digit = Easy, etc.):
 *   Easy:   Operands 0-9
 *   Medium: Operands 0-99
 *   Hard:   Operands 0-999
 */

const fs = require("fs")
const path = require("path")

// --- Config ---
const args = process.argv.slice(2)
const getArg = (flag, defaultVal) => {
  const idx = args.indexOf(flag)
  if (idx !== -1 && args[idx + 1] !== undefined) return args[idx + 1]
  return defaultVal
}

const DIFFICULTY = getArg("--difficulty", "Easy")
const OPS = getArg("--ops", "addition,subtraction").split(",")
const ALLOW_NEGATIVES = getArg("--allow-negatives", "false") === "true"
const DRY_RUN = args.includes("--dry-run")
const OUT_FILE = path.resolve(process.cwd(), `scripts/questions_${DIFFICULTY.toLowerCase()}.json`)

const RANGES = {
  Easy: { min: 0, max: 9 },
  Medium: { min: 0, max: 99 },
  Hard: { min: 0, max: 999 },
}

// --- Helpers ---
function getDigitCount(n) {
  if (n === 0) return 1
  return Math.floor(Math.log10(Math.abs(n))) + 1
}

function calcDifficultyScore(a, b, answer) {
  // Simple scoring: sum of digits + penalty for negatives
  let d = getDigitCount(a) + getDigitCount(b) + getDigitCount(answer)
  if (a < 0 || b < 0 || answer < 0) d += 3
  return d
}

function hasNeg(a, b, answer) {
  return a < 0 || b < 0 || answer < 0
}

// --- Generators ---

function generateAddition(range) {
  const questions = []
  for (let a = range.min; a <= range.max; a++) {
    for (let b = range.min; b <= range.max; b++) {
      const answer = a + b
      if (!ALLOW_NEGATIVES && hasNeg(a, b, answer)) continue
      
      questions.push({
        category: "arithmetic",
        sub_type: "addition",
        operand_a: a,
        operand_b: b,
        operator: "+",
        question_text: `${a} + ${b} = ?`,
        correct_answer: String(answer),
        has_negatives: hasNeg(a, b, answer),
        difficulty: calcDifficultyScore(a, b, answer),
      })
    }
  }
  return questions
}

function generateSubtraction(range) {
  const questions = []
  for (let a = range.min; a <= range.max; a++) {
    for (let b = range.min; b <= range.max; b++) {
      const answer = a - b
      if (!ALLOW_NEGATIVES && (a < b || hasNeg(a, b, answer))) continue
      
      questions.push({
        category: "arithmetic",
        sub_type: "subtraction",
        operand_a: a,
        operand_b: b,
        operator: "-",
        question_text: `${a} - ${b} = ?`,
        correct_answer: String(answer),
        has_negatives: hasNeg(a, b, answer),
        difficulty: calcDifficultyScore(a, b, answer),
      })
    }
  }
  return questions
}

function generateMultiplication(range) {
  // For multiplication, we might want smaller ranges even in Medium/Hard to avoid massive files
  // But let's follow the provided range for now.
  const questions = []
  const maxMul = DIFFICULTY === "Easy" ? 10 : DIFFICULTY === "Medium" ? 12 : 20
  for (let a = 0; a <= maxMul; a++) {
    for (let b = 0; b <= maxMul; b++) {
      const answer = a * b
      questions.push({
        category: "arithmetic",
        sub_type: "multiplication",
        operand_a: a,
        operand_b: b,
        operator: "*",
        question_text: `${a} × ${b} = ?`,
        correct_answer: String(answer),
        has_negatives: false,
        difficulty: calcDifficultyScore(a, b, answer),
      })
    }
  }
  return questions
}

function generateDivision(range) {
  const questions = []
  const maxRes = DIFFICULTY === "Easy" ? 10 : DIFFICULTY === "Medium" ? 12 : 20
  const maxDivisor = DIFFICULTY === "Easy" ? 10 : DIFFICULTY === "Medium" ? 12 : 20

  for (let res = 0; res <= maxRes; res++) {
    for (let divisor = 1; divisor <= maxDivisor; divisor++) {
      const dividend = res * divisor
      questions.push({
        category: "arithmetic",
        sub_type: "division",
        operand_a: dividend,
        operand_b: divisor,
        operator: "/",
        question_text: `${dividend} ÷ ${divisor} = ?`,
        correct_answer: String(res),
        has_negatives: false,
        difficulty: calcDifficultyScore(dividend, divisor, res),
      })
    }
  }
  return questions
}

// --- Main ---

function main() {
  const range = RANGES[DIFFICULTY] || RANGES.Easy
  let allQuestions = []

  console.log(`\n🍌 banana-math Question Generator`)
  console.log(`   Difficulty : ${DIFFICULTY}`)
  console.log(`   Range      : ${range.min} to ${range.max}`)
  console.log(`   Operators  : ${OPS.join(", ")}`)
  console.log(`   Negatives  : ${ALLOW_NEGATIVES}`)
  console.log()

  if (OPS.includes("addition")) {
    console.log("Generating addition...")
    allQuestions = allQuestions.concat(generateAddition(range))
  }
  if (OPS.includes("subtraction")) {
    console.log("Generating subtraction...")
    allQuestions = allQuestions.concat(generateSubtraction(range))
  }
  if (OPS.includes("multiplication")) {
    console.log("Generating multiplication...")
    allQuestions = allQuestions.concat(generateMultiplication(range))
  }
  if (OPS.includes("division")) {
    console.log("Generating division...")
    allQuestions = allQuestions.concat(generateDivision(range))
  }

  console.log(`\nTotal questions generated: ${allQuestions.length}`)

  if (DRY_RUN) {
    console.log("Dry run - no file written.")
  } else {
    fs.writeFileSync(OUT_FILE, JSON.stringify(allQuestions, null, 2))
    console.log(`✅ Questions saved to ${OUT_FILE}`)
    console.log(`Next: node scripts/addQuestionsToDB.js ${OUT_FILE}\n`)
  }
}

main()
