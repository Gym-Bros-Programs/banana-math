const { spawn, exec } = require("child_process");
require("dotenv").config({ path: ".env.local" });
const { killPort } = require("./kill-port");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_CLOUD_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_CLOUD_ANON_KEY;

  if (!url || !key) {
    console.error("\n❌ Missing cloud Supabase credentials in .env.local");
    console.error("   Required:");
    console.error("   → NEXT_PUBLIC_SUPABASE_CLOUD_URL");
    console.error("   → NEXT_PUBLIC_SUPABASE_CLOUD_ANON_KEY\n");
    process.exit(1);
  }

  killPort(3000);
  console.log("🍌 Starting banana-math connected to Cloud Supabase...");
  console.log(`   URL: ${url}\n`);
  startNext(url, key);
}

function startNext(url, key) {
  const proc = spawn("npx", ["next", "dev"], {
    stdio: ["inherit", "pipe", "inherit"],
    shell: true,
    env: {
      ...process.env,
      NEXT_PUBLIC_MOCK_DB: "false",
      NEXT_PUBLIC_MOCK_AUTH: "false",
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
    }
  });

  let opened = false;
  proc.stdout.on("data", (data) => {
    process.stdout.write(data);
    if (!opened && data.toString().includes("Ready in")) {
      opened = true;
      const url = "http://localhost:3000";
      const cmd = process.platform === "win32" ? `start ${url}` : process.platform === "darwin" ? `open ${url}` : `xdg-open ${url}`;
      exec(cmd);
    }
  });
}

main();
