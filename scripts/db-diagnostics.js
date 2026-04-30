const { createClient } = require("@supabase/supabase-js")
const path = require("path")
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  console.log("🔍 Starting DB Diagnostics...\n")

  // 1. Check Questions
  console.log("--- 1. Testing Question Fetch (Easy + -) ---")
  const { data: questions, error: qError } = await supabase.rpc("get_questions_for_session", {
    p_category: "arithmetic",
    p_operator_set: ["addition", "subtraction"],
    p_allow_negatives: false,
    p_limit: 5,
    p_max_difficulty: 4
  })

  if (qError) {
    console.error("❌ Question fetch failed:", qError.message)
  } else {
    console.log(`✅ Fetched ${questions?.length || 0} questions.`)
  }

  // 2. Check Session Insertion
  console.log("\n--- 2. Testing Session Insertion ---")
  const testSession = {
    user_id: null, // Guest session
    category: "arithmetic",
    operator_set: ["addition", "subtraction"],
    allow_negatives: false,
    session_mode: "timed",
    duration_seconds: 15,
    correct_count: 5,
    total_count: 5,
    accuracy: 100,
    cqpm: 20,
    difficulty: "Easy"
  }

  const { data: sData, error: sError } = await supabase
    .from("sessions")
    .insert(testSession)
    .select()
    .single()

  if (sError) {
    console.error("❌ Session insertion failed:", sError.message)
    if (sError.details) console.error("Details:", sError.details)
    if (sError.hint) console.error("Hint:", sError.hint)
  } else {
    console.log("✅ Session inserted successfully. ID:", sData.id)
  }

  // 3. Check Session Fetch
  if (sData) {
    console.log("\n--- 3. Testing Session Retrieval ---")
    const { data: fetchResult, error: fError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sData.id)
      .single()

    if (fError) {
      console.error("❌ Session retrieval failed:", fError.message)
    } else {
      console.log("✅ Session retrieved correctly. Accuracy:", fetchResult.accuracy)
    }

    // Cleanup
    await supabase.from("sessions").delete().eq("id", sData.id)
    console.log("\n🧹 Test session cleaned up.")
  }

  console.log("\n🏁 Diagnostics Complete.")
}

main()
