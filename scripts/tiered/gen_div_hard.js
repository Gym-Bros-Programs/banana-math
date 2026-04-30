// div_hard: derived from mul_hard pairs (all combos involving 3d)
// ⚠️  large — matches the scope of mul_hard
const { divFromMul, uploadToDB } = require("./core")
const qs = [
  ...divFromMul(2, 9, 100, 999), // 1d result ÷ 3d divisor
  ...divFromMul(10, 99, 100, 999), // 2d result ÷ 3d divisor
  ...divFromMul(100, 999, 2, 9), // 3d result ÷ 1d divisor
  ...divFromMul(100, 999, 10, 99), // 3d result ÷ 2d divisor
  ...divFromMul(100, 999, 100, 999) // 3d result ÷ 3d divisor
]
uploadToDB(qs, "div_hard  |  from mul_hard pairs").catch(console.error)
