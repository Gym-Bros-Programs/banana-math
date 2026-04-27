const { spawn } = require("child_process");

console.log("🍌 Starting banana-math in UI-Only Mock Mode...");

spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_MOCK_DB: "true",
    NEXT_PUBLIC_MOCK_AUTH: "true"
  }
});
