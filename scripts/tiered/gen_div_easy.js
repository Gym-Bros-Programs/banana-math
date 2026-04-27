// div_easy: derived from 1d × 1d  →  (result × divisor) ÷ divisor = result
// result: 0-9, divisor: 1-9  (divisor never 0)
const { divFromMul, uploadToDB } = require("./core")
const qs = divFromMul(0, 9, 1, 9)
uploadToDB(qs, "div_easy  |  from 1d×1d  (divisors 1-9)").catch(console.error)
