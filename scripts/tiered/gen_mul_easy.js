// mul_easy: 1d × 1d  (0–9 × 0–9, all 100 combos)
const { mulRange, uploadToDB } = require("./core")
const qs = mulRange(0, 9, 0, 9)
uploadToDB(qs, "mul_easy  |  1d × 1d  (0-9 × 0-9)").catch(console.error)
