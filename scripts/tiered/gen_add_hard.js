// add_hard: any combo involving a 3d operand
// 1d+3d, 2d+3d, 3d+1d, 3d+2d, 3d+3d
// ⚠️  3d+3d alone is 900×900 = 810k rows — this will take a while
const { addRange, uploadToDB } = require("./core")
const qs = [
  ...addRange(0,   9,   100, 999),  // 1d + 3d
  ...addRange(10,  99,  100, 999),  // 2d + 3d
  ...addRange(100, 999, 0,   9),    // 3d + 1d
  ...addRange(100, 999, 10,  99),   // 3d + 2d
  ...addRange(100, 999, 100, 999),  // 3d + 3d
]
uploadToDB(qs, "add_hard  |  all combos with 3d operands").catch(console.error)
