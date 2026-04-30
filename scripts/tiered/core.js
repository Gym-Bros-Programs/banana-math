/**
 * scripts/tiered/core.js
 *
 * Shared logic for all tiered DB-population scripts.
 * Each script generates questions from digit-based ranges and upserts directly to Supabase.
 *
 * Digit ranges:
 *   1d : 0 – 9
 *   2d : 10 – 99
 *   3d : 100 – 999
 */

const { createClient } = require("@supabase/supabase-js")
const path = require("path")
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") })

const BATCH_SIZE = 500
const ROW_CAP = 10_000

// Fisher-Yates in-place shuffle, then slice to n.
function randomSample(arr, n) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, n)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDigitCount(n) {
  if (n === 0) return 1
  return Math.floor(Math.log10(Math.abs(n))) + 1
}

function calcDifficulty(a, b, answer) {
  let d = getDigitCount(a) + getDigitCount(b) + getDigitCount(answer)
  if (a < 0 || b < 0 || answer < 0) d += 3
  return d
}

// ─── Generators ───────────────────────────────────────────────────────────────

/**
 * Addition: all (a, b) pairs in [aMin,aMax] × [bMin,bMax].
 */
function addRange(aMin, aMax, bMin, bMax) {
  const qs = []
  for (let a = aMin; a <= aMax; a++) {
    for (let b = bMin; b <= bMax; b++) {
      const answer = a + b
      qs.push({
        category: "arithmetic",
        sub_type: "addition",
        operand_a: a,
        operand_b: b,
        operator: "+",
        question_text: `${a} + ${b} = ?`,
        correct_answer: String(answer),
        has_negatives: false,
        difficulty: calcDifficulty(a, b, answer)
      })
    }
  }
  return qs
}

/**
 * Subtraction: all (a, b) pairs in [aMin,aMax] × [bMin,bMax] where a >= b.
 * Bigger number always in front — answer is always >= 0.
 */
function subRange(aMin, aMax, bMin, bMax) {
  const qs = []
  for (let a = aMin; a <= aMax; a++) {
    for (let b = bMin; b <= bMax; b++) {
      if (a < b) continue
      const answer = a - b
      qs.push({
        category: "arithmetic",
        sub_type: "subtraction",
        operand_a: a,
        operand_b: b,
        operator: "-",
        question_text: `${a} - ${b} = ?`,
        correct_answer: String(answer),
        has_negatives: false,
        difficulty: calcDifficulty(a, b, answer)
      })
    }
  }
  return qs
}

/**
 * Multiplication: all (a, b) pairs in [aMin,aMax] × [bMin,bMax].
 */
function mulRange(aMin, aMax, bMin, bMax) {
  const qs = []
  for (let a = aMin; a <= aMax; a++) {
    for (let b = bMin; b <= bMax; b++) {
      const answer = a * b
      qs.push({
        category: "arithmetic",
        sub_type: "multiplication",
        operand_a: a,
        operand_b: b,
        operator: "*",
        question_text: `${a} × ${b} = ?`,
        correct_answer: String(answer),
        has_negatives: false,
        difficulty: calcDifficulty(a, b, answer)
      })
    }
  }
  return qs
}

/**
 * Division: derived from multiplication pairs in [aMin,aMax] × [bMin,bMax].
 * For each (result, divisor): question is (result × divisor) ÷ divisor = result.
 * bMin is clamped to >= 1 (never divide by 0).
 * Deduplicates by (dividend, divisor).
 */
function divFromMul(aMin, aMax, bMin, bMax) {
  const seen = new Set()
  const qs = []
  const safeB = Math.max(bMin, 1)

  for (let result = aMin; result <= aMax; result++) {
    for (let divisor = safeB; divisor <= bMax; divisor++) {
      const dividend = result * divisor
      const key = `${dividend}/${divisor}`
      if (seen.has(key)) continue
      seen.add(key)

      qs.push({
        category: "arithmetic",
        sub_type: "division",
        operand_a: dividend,
        operand_b: divisor,
        operator: "/",
        question_text: `${dividend} ÷ ${divisor} = ?`,
        correct_answer: String(result),
        has_negatives: false,
        difficulty: calcDifficulty(dividend, divisor, result)
      })
    }
  }
  return qs
}

// ─── DB Upload ────────────────────────────────────────────────────────────────

async function uploadToDB(questions, label) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local")
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const total = questions.length
  let rows = questions

  if (total > ROW_CAP) {
    rows = randomSample(questions, ROW_CAP)
    console.log(`\n🍌 ${label}`)
    console.log(`   Pool  : ${total.toLocaleString()} questions`)
    console.log(`   Cap   : randomly sampled ${ROW_CAP.toLocaleString()} from pool`)
  } else {
    console.log(`\n🍌 ${label}`)
    console.log(`   ${total.toLocaleString()} questions to upsert...`)
  }
  console.log()

  let inserted = 0
  let skipped = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)

    const { data, error } = await supabase
      .from("questions")
      .upsert(batch, { onConflict: "operand_a,operand_b,operator", ignoreDuplicates: true })
      .select("id")

    if (error) {
      console.error(`\n❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message)
    } else {
      inserted += data?.length ?? 0
      skipped += batch.length - (data?.length ?? 0)
    }

    const pct = Math.round(((i + batch.length) / rows.length) * 100)
    process.stdout.write(
      `  ${pct}% (${(i + batch.length).toLocaleString()}/${rows.length.toLocaleString()})...\r`
    )
  }

  console.log(`\n✅ Done!`)
  console.log(`   Inserted : ${inserted.toLocaleString()}`)
  console.log(`   Skipped  : ${skipped.toLocaleString()} (already existed)\n`)
}

module.exports = { addRange, subRange, mulRange, divFromMul, uploadToDB }
