/**
 * scripts/question-gen/index.js
 * 
 * Main entry point for question generation and database management.
 * Dispatches to specific generators and the uploader.
 */

const fs = require("fs")
const path = require("path")

// --- Imports ---
const arithmetic = require("./generators/arithmetic")
const { uploadQuestions } = require("./db/uploader")

// --- Config ---
const args = process.argv.slice(2)
const getArg = (flag, defaultVal) => {
  const arg = args.find(a => a.startsWith(`--${flag}=`))
  if (arg) return arg.split("=")[1]
  
  // Also support old style --flag value
  const idx = args.indexOf(`--${flag}`)
  if (idx !== -1 && args[idx + 1] !== undefined) return args[idx + 1]
  
  return defaultVal
}

const COMMAND = args[0] // e.g. "generate", "upload"
const TYPE = getArg("type", "arithmetic")
const DIFFICULTY = getArg("difficulty", "Easy")
const OPS = getArg("ops", "addition,subtraction").split(",")
const ALLOW_NEGATIVES = getArg("allow-negatives", "false") === "true"
const TARGET = getArg("target", "default")
const DRY_RUN = args.includes("--dry-run")

const OUTPUT_DIR = path.resolve(__dirname, "output")
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

async function run() {
  console.log(`\n🍌 Banana-Math Question System`)
  
  if (COMMAND === "generate") {
    let questions = []
    
    if (TYPE === "arithmetic") {
      questions = arithmetic.generate({ difficulty: DIFFICULTY, ops: OPS, allowNegatives: ALLOW_NEGATIVES })
    } else {
      console.error(`❌ Unknown generator type: ${TYPE}`)
      process.exit(1)
    }

    console.log(`   Type       : ${TYPE}`)
    console.log(`   Difficulty : ${DIFFICULTY}`)
    console.log(`   Operators  : ${OPS.join(", ")}`)
    console.log(`   Count      : ${questions.length}`)

    const outFile = path.join(OUTPUT_DIR, `questions_${DIFFICULTY.toLowerCase()}.json`)
    
    if (DRY_RUN) {
      console.log(`\n🔍 Dry Run: Would save to ${outFile}`)
    } else {
      fs.writeFileSync(outFile, JSON.stringify(questions, null, 2))
      console.log(`✅ Questions saved to ${outFile}`)
    }
  } 
  
  else if (COMMAND === "upload") {
    const filename = (args[1] && !args[1].startsWith("--")) ? args[1] : path.join(OUTPUT_DIR, `questions_${DIFFICULTY.toLowerCase()}.json`)
    await uploadQuestions(filename, { target: TARGET })
  } 
  
  else {
    console.log(`
Usage:
  node scripts/question-gen/index.js generate [options]
  node scripts/question-gen/index.js upload <file> [options]

Options:
  --type=arithmetic         Type of questions to generate
  --difficulty=Easy|Medium|Hard
  --ops=addition,subtraction,multiplication,division
  --allow-negatives=true|false
  --target=default|prod     Supabase target environment
  --dry-run                 Show output without saving
    `)
  }
}

run().catch(console.error)
