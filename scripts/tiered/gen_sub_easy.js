// sub_easy: 1d - 1d  (a >= b, answer always >= 0)
const { subRange, uploadToDB } = require("./core")
const qs = subRange(0, 9, 0, 9)
uploadToDB(qs, "sub_easy  |  1d - 1d  (a >= b)").catch(console.error)
