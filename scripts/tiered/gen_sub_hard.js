// sub_hard: all combos with a 3d operand as the minuend (a >= b always)
// 3d-1d, 3d-2d always valid; 3d-3d has a>=b filter
const { subRange, uploadToDB } = require("./core")
const qs = [
  ...subRange(100, 999, 0,   9),    // 3d - 1d
  ...subRange(100, 999, 10,  99),   // 3d - 2d
  ...subRange(100, 999, 100, 999),  // 3d - 3d  (a >= b filter applied)
]
uploadToDB(qs, "sub_hard  |  3d-1d, 3d-2d, 3d-3d  (a >= b)").catch(console.error)
