// mul_hard: all combos involving a 3d operand (0/1 excluded from 1d cross-pairs)
// ⚠️  3d×3d alone is 900×900 = 810k rows — this will take a while
const { mulRange, uploadToDB } = require("./core")
const qs = [
  ...mulRange(2, 9, 100, 999), // 1d × 3d  (1d: 2-9)
  ...mulRange(10, 99, 100, 999), // 2d × 3d
  ...mulRange(100, 999, 2, 9), // 3d × 1d  (1d: 2-9)
  ...mulRange(100, 999, 10, 99), // 3d × 2d
  ...mulRange(100, 999, 100, 999) // 3d × 3d
]
uploadToDB(qs, "mul_hard  |  all combos with 3d operands").catch(console.error)
