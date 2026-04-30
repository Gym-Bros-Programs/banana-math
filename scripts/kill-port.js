const { execSync } = require("child_process")

function killPort(port) {
  try {
    if (process.platform === "win32") {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" })
      const pids = [
        ...new Set(
          result
            .split("\n")
            .map((line) => line.trim().split(/\s+/).pop())
            .filter((pid) => pid && /^\d+$/.test(pid) && pid !== "0")
        )
      ]
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" })
        } catch {}
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore" })
    }
  } catch {}
}

module.exports = { killPort }
