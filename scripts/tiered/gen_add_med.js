// add_med: 1d + 2d, 2d + 1d, 2d + 2d
const { addRange, uploadToDB } = require("./core")
const qs = [
  ...addRange(0, 9, 10, 99), // 1d + 2d
  ...addRange(10, 99, 0, 9), // 2d + 1d
  ...addRange(10, 99, 10, 99) // 2d + 2d
]
uploadToDB(qs, "add_med  |  1d+2d, 2d+1d, 2d+2d").catch(console.error)
