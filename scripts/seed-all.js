const { execSync } = require("child_process")

const steps = [
  ["db:generate:easy",   "Generating Easy questions..."],
  ["db:seed:prod",       "Uploading Easy to cloud..."],
  ["db:generate:medium", "Generating Medium questions..."],
  ["db:seed:medium:prod","Uploading Medium to cloud..."],
  ["db:generate:hard",   "Generating Hard questions..."],
  ["db:seed:hard:prod",  "Uploading Hard to cloud..."],
]

for (const [script, label] of steps) {
  console.log(`\n🍌 ${label}`)
  execSync(`npm run ${script}`, { stdio: "inherit" })
}

console.log("\n✅ All questions generated and seeded!")
