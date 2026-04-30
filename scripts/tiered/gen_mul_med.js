// mul_med: 1d×2d, 2d×1d (exclude 0 and 1 from 1d — trivial), 2d×2d
const { mulRange, uploadToDB } = require("./core")
const qs = [
  ...mulRange(2, 9, 10, 99), // 1d × 2d  (1d: 2-9, skip 0 and 1)
  ...mulRange(10, 99, 2, 9), // 2d × 1d  (1d: 2-9, skip 0 and 1)
  ...mulRange(10, 99, 10, 99) // 2d × 2d
]
uploadToDB(qs, "mul_med  |  1d×2d, 2d×1d (excl 0,1), 2d×2d").catch(console.error)
