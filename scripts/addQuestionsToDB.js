/**
 * addQuestionsToDB.js
 * Uploads a generated questions JSON file to the Supabase questions table.
 *
 * Usage:
 *   node scripts/addQuestionsToDB.js scripts/arithmetic_questions.json
 *
 * Required in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=
 *   SUPABASE_SERVICE_KEY=   (service_role key — bypasses RLS)
 */

const { createClient } = require("@supabase/supabase-js")
const fs   = require("fs")
const path = require("path")

require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") })

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const BATCH_SIZE       = 500

function loadQuestions(filename) {
  const jsonPath = path.resolve(process.cwd(), filename)
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ File not found: ${jsonPath}`)
    process.exit(1)
  }
  const questions = JSON.parse(fs.readFileSync(jsonPath, "utf8"))
  console.log(`Loaded ${questions.length.toLocaleString()} questions from ${filename}`)
  return questions
}

async function uploadQuestions(questions) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local")
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })

  console.log("\nUploading to Supabase questions table...")
  let inserted = 0
  let skipped  = 0

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE)

    const { data, error } = await supabase
      .from("questions")
      .upsert(batch, {
        onConflict: "operand_a,operand_b,operator", // matches UNIQUE constraint
        ignoreDuplicates: true,
      })
      .select("id")

    if (error) {
      console.error(`\n❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message)
    } else {
      inserted += data?.length ?? 0
      skipped  += batch.length - (data?.length ?? 0)
    }

    const pct = Math.round(((i + batch.length) / questions.length) * 100)
    process.stdout.write(`  ${pct}% (${i + batch.length}/${questions.length})...\r`)
  }

  console.log(`\n\n✅ Done!`)
  console.log(`   Inserted : ${inserted.toLocaleString()}`)
  console.log(`   Skipped  : ${skipped.toLocaleString()} (already existed)\n`)
}

async function main() {
  const filename = process.argv[2]
  if (!filename) {
    console.error("Usage: node scripts/addQuestionsToDB.js <questions.json>")
    process.exit(1)
  }

  const questions = loadQuestions(filename)
  await uploadQuestions(questions)
}

main().catch((err) => {
  console.error("\n💥 Fatal:", err)
  process.exit(1)
})
