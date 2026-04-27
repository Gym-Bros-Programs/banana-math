// div_med: derived from mul_med pairs
// result × 2d-divisor, result × 1d-divisor (skip 0,1), 2d-result × 2d-divisor
const { divFromMul, uploadToDB } = require("./core")
const qs = [
  ...divFromMul(2,  9,  10, 99),  // 1d result ÷ 2d divisor
  ...divFromMul(10, 99, 2,  9),   // 2d result ÷ 1d divisor  (skip 0,1)
  ...divFromMul(10, 99, 10, 99),  // 2d result ÷ 2d divisor
]
uploadToDB(qs, "div_med  |  from mul_med pairs").catch(console.error)
