const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })

async function clearGuestSessions() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_CLOUD_URL
  const key = process.env.SUPABASE_SERVICE_KEY_PROD

  if (!url || !key) {
    console.error("❌ Missing cloud credentials in .env.local")
    return
  }

  const supabase = createClient(url, key)

  console.log("🧹 Clearing all guest sessions (user_id is NULL) from cloud DB...")

  // session_answers should cascade delete if set up correctly, 
  // but we'll do it explicitly if needed. 
  // For now, let's try deleting from sessions directly.
  const { data, error, count } = await supabase
    .from("sessions")
    .delete({ count: "exact" })
    .is("user_id", null)

  if (error) {
    console.error("❌ Error deleting guest sessions:", error.message)
    if (error.details?.includes("foreign key constraint")) {
       console.log("Attempting to clear session_answers first...")
       // If cascade is not enabled:
       const { data: guestSessionIds } = await supabase.from("sessions").select("id").is("user_id", null)
       if (guestSessionIds?.length) {
         const ids = guestSessionIds.map(s => s.id)
         await supabase.from("session_answers").delete().in("session_id", ids)
         const { count: count2, error: error2 } = await supabase.from("sessions").delete({ count: "exact" }).is("user_id", null)
         if (error2) console.error("❌ Still failed:", error2.message)
         else console.log(`✅ Successfully cleared ${count2} guest sessions (and their answers).`)
       }
    }
  } else {
    console.log(`✅ Successfully cleared ${count} guest sessions from cloud DB.`)
  }
}

clearGuestSessions()
