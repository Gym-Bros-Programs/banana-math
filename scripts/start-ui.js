const { spawn, exec } = require("child_process")
const { killPort } = require("./kill-port")

killPort(3000)
console.log("🍌 Starting banana-math in UI-Only Mock Mode...")

const proc = spawn("npx", ["next", "dev"], {
  stdio: ["inherit", "pipe", "inherit"],
  shell: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_MOCK_DB: "true",
    NEXT_PUBLIC_MOCK_AUTH: "true",
    NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: "false",
    NEXT_PUBLIC_DISABLE_GOOGLE_AUTH: "true",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000"
  }
})

let opened = false
proc.stdout.on("data", (data) => {
  process.stdout.write(data)
  if (!opened && data.toString().includes("Ready in")) {
    opened = true
    const url = "http://localhost:3000"
    const cmd =
      process.platform === "win32"
        ? `start ${url}`
        : process.platform === "darwin"
          ? `open ${url}`
          : `xdg-open ${url}`
    exec(cmd)
  }
})
