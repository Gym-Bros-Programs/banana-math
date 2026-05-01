const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })

async function checkProfiles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_CLOUD_URL
  const key = process.env.SUPABASE_SERVICE_KEY_PROD

  if (!url || !key) {
    console.error("Missing cloud credentials")
    return
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase.from("profiles").select("username, id")

  if (error) {
    console.error("Error fetching profiles:", error)
  } else {
    console.log("Profiles found in cloud DB:", data)
  }
}

checkProfiles()
