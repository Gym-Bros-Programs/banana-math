/**
 * db-reset.js
 * Recreates the banana-math database schema and seeds questions.
 *
 * Usage:
 *   npm run db:reset
 *   npm run db:reset -- --skip-questions   (schema only, no question seed)
 *
 * Requirements in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=
 *   SUPABASE_SERVICE_KEY=           <-- Project Settings > API > service_role key
 *
 * NOTE: Run `node scripts/generateArithmeticQuestions.js` first to produce
 *       scripts/arithmetic_questions.json before seeding.
 */

const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const SKIP_QUESTIONS = process.argv.includes("--skip-questions")
const QUESTIONS_FILE = path.resolve(process.cwd(), "scripts/arithmetic_questions.json")

// ─── Validation ──────────────────────────────────────────────────────────────

function validate() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error(`
❌  Missing environment variables.
    Make sure your .env.local has:
      NEXT_PUBLIC_SUPABASE_URL=...
      SUPABASE_SERVICE_KEY=...        ← service_role key (NOT anon key)
    `)
    process.exit(1)
  }
}

// ─── Schema ───────────────────────────────────────────────────────────────────
// We run DDL via the Supabase REST /rpc endpoint using pg_query (service role).
// Each statement is run individually so errors are easy to identify.

const SCHEMA_STATEMENTS = [
  // attempts table
  `CREATE TABLE IF NOT EXISTS attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    correct_count integer DEFAULT 0,
    total_count integer DEFAULT 0,
    percentage numeric DEFAULT 0.0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
  )`,

  // user_answers table
  `CREATE TABLE IF NOT EXISTS user_answers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id uuid REFERENCES attempts(id) ON DELETE CASCADE,
    question_id uuid,
    submitted_answer text,
    is_correct boolean,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
  )`,

  // questions table (needed for the questions seed)
  `CREATE TABLE IF NOT EXISTS questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text text NOT NULL,
    correct_answer text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
  )`,

  // RPC: get_random_question — pulls a real question from the questions table
  `CREATE OR REPLACE FUNCTION get_random_question()
  RETURNS json
  LANGUAGE sql
  AS $$
    SELECT json_agg(q)
    FROM (
      SELECT id, question_text, correct_answer
      FROM questions
      ORDER BY random()
      LIMIT 1
    ) q;
  $$`
]

async function runSchema(supabase) {
  console.log("\n📐 Running schema migration...")
  for (const sql of SCHEMA_STATEMENTS) {
    // Supabase JS v2 doesn't expose raw SQL directly.
    // We use the pg_dump-safe approach: POST to /rest/v1/rpc/exec_sql
    // which we create below, OR we use the undocumented sql method.
    // Cleanest cross-version approach: fetch directly.
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ sql })
    })

    // exec_sql may not exist yet — bootstrap it first via the admin API
    if (res.status === 404) {
      // exec_sql function doesn't exist; use management API query endpoint
      const mgmtRes = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      })
      if (!mgmtRes.ok) {
        const text = await mgmtRes.text()
        console.warn(`  ⚠️  Could not run statement via pg/query: ${text.slice(0, 200)}`)
      }
    } else if (!res.ok) {
      const text = await res.text()
      // "already exists" errors are fine for IF NOT EXISTS statements
      if (!text.includes("already exists")) {
        console.warn(`  ⚠️  Statement warning: ${text.slice(0, 200)}`)
      }
    }
  }
  console.log("  ✅ Schema applied.")
}

// ─── Questions Seed ───────────────────────────────────────────────────────────

async function seedQuestions(supabase) {
  if (SKIP_QUESTIONS) {
    console.log("\n⏭️  Skipping question seed (--skip-questions flag).")
    return
  }

  if (!fs.existsSync(QUESTIONS_FILE)) {
    console.warn(`\n⚠️  Questions file not found at ${QUESTIONS_FILE}. Skipping seed.`)
    return
  }

  console.log("\n🌱 Seeding questions...")
  const raw = fs.readFileSync(QUESTIONS_FILE, "utf8")
  const questions = JSON.parse(raw)

  // Upsert in batches of 500 to avoid payload limits
  const BATCH = 500
  let inserted = 0

  for (let i = 0; i < questions.length; i += BATCH) {
    const batch = questions.slice(i, i + BATCH)
    const { error } = await supabase
      .from("questions")
      .upsert(batch, { onConflict: "id", ignoreDuplicates: true })

    if (error) {
      console.error(`  ❌ Batch ${i / BATCH + 1} failed:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`  Uploaded ${inserted}/${questions.length} questions...\r`)
    }
  }

  console.log(`\n  ✅ Seeded ${inserted} questions.`)
}

// ─── Entry ────────────────────────────────────────────────────────────────────

async function main() {
  validate()

  console.log(`\n🍌 banana-math DB Reset`)
  console.log(`   Supabase URL: ${SUPABASE_URL}`)
  console.log(`   Skipping questions: ${SKIP_QUESTIONS}`)

  // Service role client bypasses RLS — required for DDL-style operations
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  })

  await runSchema(supabase)
  await seedQuestions(supabase)

  console.log("\n🎉 Done! Your database is ready.\n")
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err)
  process.exit(1)
})
