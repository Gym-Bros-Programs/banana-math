/**
 * db-restore.js
 * Uses the Supabase Management API to restore a paused project.
 *
 * Usage:
 *   npm run db:restore
 *
 * Required in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
 *   SUPABASE_ACCESS_TOKEN=      <-- Personal Access Token from supabase.com/dashboard/account/tokens
 *
 * How it works:
 *   1. Extracts the project ref from NEXT_PUBLIC_SUPABASE_URL
 *   2. Calls GET  /v1/projects/{ref}  to check current status
 *   3. If status is "INACTIVE" (paused), calls POST /v1/projects/{ref}/restore
 *   4. Polls GET  /v1/projects/{ref}  until status is "ACTIVE_HEALTHY"
 *
 * NOTE: If the project has been paused for 90+ days it is DELETED by Supabase
 * and cannot be restored. In that case you must create a new project manually,
 * update your .env.local, and then apply migrations from the Supabase dashboard
 * or CLI.
 */

const path = require("path")

require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

const MGMT_API = "https://api.supabase.com"
const POLL_INTERVAL_MS = 5000 // check every 5 seconds
const MAX_WAIT_MS = 5 * 60 * 1000 // give up after 5 minutes

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractRef(url) {
  if (!url) return null
  // URL format: https://<ref>.supabase.co
  const match = url.match(/https:\/\/([a-z]+)\.supabase\.co/)
  return match ? match[1] : null
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function mgmtFetch(path, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    }
  }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${MGMT_API}${path}`, opts)
  return { status: res.status, data: res.status !== 204 ? await res.json() : null }
}

// ─── Validate ─────────────────────────────────────────────────────────────────

function validate() {
  const errors = []
  if (!SUPABASE_URL) errors.push("NEXT_PUBLIC_SUPABASE_URL is missing from .env.local")
  if (!ACCESS_TOKEN)
    errors.push(`SUPABASE_ACCESS_TOKEN is missing from .env.local
     Get one at: https://supabase.com/dashboard/account/tokens`)

  if (errors.length) {
    console.error("\n❌ Missing environment variables:\n")
    errors.forEach((e) => console.error(`   - ${e}`))
    console.error()
    process.exit(1)
  }

  const ref = extractRef(SUPABASE_URL)
  if (!ref) {
    console.error(`\n❌ Could not extract project ref from URL: ${SUPABASE_URL}`)
    console.error("   Expected format: https://<ref>.supabase.co\n")
    process.exit(1)
  }

  return ref
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const ref = validate()

  console.log(`\n🍌 banana-math DB Restore`)
  console.log(`   Project ref : ${ref}`)

  // 1. Check current project status
  console.log("\n🔍 Checking project status...")
  const { status: s, data: project } = await mgmtFetch(`/v1/projects/${ref}`)

  if (s === 404) {
    console.error(`
❌  Project not found (404).

    This means either:
    - The project was deleted (paused for 90+ days)
    - Your NEXT_PUBLIC_SUPABASE_URL is wrong

    If the project was deleted, you must:
    1. Create a new project at https://supabase.com/dashboard
    2. Update NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
       and SUPABASE_SERVICE_KEY in your .env.local
    3. Run: npm run db:reset
    `)
    process.exit(1)
  }

  if (s !== 200) {
    console.error(`\n❌ Management API error ${s}:`, project)
    process.exit(1)
  }

  const currentStatus = project.status
  console.log(`   Current status: ${currentStatus}`)

  // 2. If already active, nothing to do
  if (currentStatus === "ACTIVE_HEALTHY") {
    console.log("\n✅ Project is already active and healthy!")
    return
  }

  // 3. Trigger restore if paused
  if (currentStatus === "INACTIVE" || currentStatus === "PAUSE_FAILED") {
    console.log("\n⏰ Project is paused. Sending restore request...")
    const { status: rs, data: rd } = await mgmtFetch(`/v1/projects/${ref}/restore`, "POST")

    if (rs !== 200 && rs !== 201) {
      console.error(`\n❌ Restore request failed (${rs}):`, rd)
      process.exit(1)
    }
    console.log("   Restore initiated. Waiting for project to come online...")
  } else {
    console.log(`\n⏳ Project status is "${currentStatus}". Waiting for it to stabilize...`)
  }

  // 4. Poll until active
  const startTime = Date.now()
  while (true) {
    await sleep(POLL_INTERVAL_MS)
    const elapsed = Math.round((Date.now() - startTime) / 1000)

    const { data: p } = await mgmtFetch(`/v1/projects/${ref}`)
    const status = p?.status ?? "UNKNOWN"
    process.stdout.write(`   [${elapsed}s] Status: ${status}...\r`)

    if (status === "ACTIVE_HEALTHY") {
      console.log(`\n\n✅ Project is online! (took ${elapsed}s)`)
      break
    }

    if (Date.now() - startTime > MAX_WAIT_MS) {
      console.error(`\n\n❌ Timed out after ${MAX_WAIT_MS / 1000}s. Current status: ${status}`)
      console.error("   Try checking the Supabase dashboard manually.")
      process.exit(1)
    }
  }

  console.log("\n✅ Restore complete.\n")
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err)
  process.exit(1)
})
