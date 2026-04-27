// add_easy: 1d + 1d  (0–9 × 0–9)
const { addRange, uploadToDB } = require("./core")
const qs = addRange(0, 9, 0, 9)
uploadToDB(qs, "add_easy  |  1d + 1d  (0-9 + 0-9)").catch(console.error)
