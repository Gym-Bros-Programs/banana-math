const { spawn, exec } = require("child_process");
const net = require("net");
const { killPort } = require("./kill-port");

function checkSupabase() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: 54321 });
    socket.on("connect", () => { socket.destroy(); resolve(true); });
    socket.on("error", () => { socket.destroy(); resolve(false); });
  });
}

async function main() {
  const up = await checkSupabase();
  if (!up) {
    console.error("\n❌ Cannot reach Supabase on port 54321.");
    console.error("   Make sure Docker is running and Supabase is started:");
    console.error("   → npx supabase start\n");
    process.exit(1);
  }

  killPort(3000);
  console.log("🍌 Starting banana-math connected to Local Supabase DB...");
  startNext();
}

function startNext() {
  const proc = spawn("npx", ["next", "dev"], {
    stdio: ["inherit", "pipe", "inherit"],
    shell: true,
    env: {
      ...process.env,
      NEXT_PUBLIC_MOCK_DB: "false",
      NEXT_PUBLIC_MOCK_AUTH: "false"
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
