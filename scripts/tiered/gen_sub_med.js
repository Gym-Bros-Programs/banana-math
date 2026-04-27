// sub_med: 2d - 1d (always valid), 2d - 2d (a >= b filter)
// Note: 1d - 2d is always negative — excluded by design
const { subRange, uploadToDB } = require("./core")
const qs = [
  ...subRange(10, 99, 0,  9),   // 2d - 1d  (a always >= b)
  ...subRange(10, 99, 10, 99),  // 2d - 2d  (a >= b filter applied)
]
uploadToDB(qs, "sub_med  |  2d-1d, 2d-2d  (a >= b)").catch(console.error)
