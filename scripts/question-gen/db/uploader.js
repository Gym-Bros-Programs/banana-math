/**
 * db/uploader.js
 * 
 * Handles uploading questions to Supabase.
 * Supports switching between local and actual Supabase if different env vars are provided.
 */

const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

// Load .env.local from the project root
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") })

const BATCH_SIZE = 500

async function uploadQuestions(filename, options = {}) {
  const { target = "default" } = options

  // Allow overriding via target flag if user has different keys in .env
  const urlKey = target === "prod" ? "SUPABASE_URL_PROD" : "NEXT_PUBLIC_SUPABASE_URL"
  const serviceKeyName = target === "prod" ? "SUPABASE_SERVICE_KEY_PROD" : "SUPABASE_SERVICE_KEY"

  const SUPABASE_URL = process.env[urlKey] || process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env[serviceKeyName] || process.env.SUPABASE_SERVICE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error(`❌ Missing Supabase credentials for target: ${target}`)
    console.error(`   Expected ${urlKey} and ${serviceKeyName} in .env.local`)
    process.exit(1)
  }

  const jsonPath = path.resolve(process.cwd(), filename)
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ File not found: ${jsonPath}`)
    process.exit(1)
  }

  const questions = JSON.parse(fs.readFileSync(jsonPath, "utf8"))
  console.log(`\n🚀 Uploading ${questions.length.toLocaleString()} questions to ${SUPABASE_URL} (${target})`)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })

  let inserted = 0
  let skipped = 0

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE)

    const { data, error } = await supabase
      .from("questions")
      .upsert(batch, {
        onConflict: "operand_a,operand_b,operator",
        ignoreDuplicates: true,
      })
      .select("id")

    if (error) {
      console.error(`\n❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message)
    } else {
      inserted += data?.length ?? 0
      skipped += batch.length - (data?.length ?? 0)
    }

    const pct = Math.round(((i + batch.length) / questions.length) * 100)
    process.stdout.write(`  ${pct}% (${i + batch.length}/${questions.length})...\r`)
  }

  console.log(`\n\n✅ Upload Complete!`)
  console.log(`   Inserted : ${inserted.toLocaleString()}`)
  console.log(`   Skipped  : ${skipped.toLocaleString()} (already existed)\n`)
}

module.exports = { uploadQuestions }

if (require.main === module) {
  const args = process.argv.slice(2)
  const filename = args.find(a => !a.startsWith("--"))
  const target = args.find(a => a.startsWith("--target="))?.split("=")[1] || "default"

  if (!filename) {
    console.error("Usage: node scripts/question-gen/db/uploader.js <questions.json> [--target=prod|local]")
    process.exit(1)
  }

  uploadQuestions(filename, { target }).catch(err => {
    console.error("\n💥 Fatal Error:", err)
    process.exit(1)
  })
}
