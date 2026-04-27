const { spawn } = require("child_process");

console.log("🍌 Starting banana-math connected to Local Supabase DB...");

spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_MOCK_DB: "false",
    NEXT_PUBLIC_MOCK_AUTH: "false"
  }
});
