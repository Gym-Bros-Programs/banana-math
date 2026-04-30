/**
 * generators/arithmetic.js
 *
 * Logic for generating basic arithmetic questions (+, -, *, /).
 *
 * Difficulty ranges:
 *   Easy   — 1-digit operands (0–9 for add/sub, 1–9 excl 0 for mul/div)
 *   Medium — 2-digit operands (10–99), both directions for mul/div
 *   Hard   — 3-digit operands (100–999), both directions for mul/div
 *
 * "Both directions" for mul: a×b AND b×a are separate questions.
 * "Both directions" for div: (a×b)÷b=a AND (a×b)÷a=b are separate questions.
 *
 * If generated count > MAX_PER_OP, a random sample of MAX_PER_OP is taken.
 */

function hasNeg(a, b, answer) {
  return a < 0 || b < 0 || answer < 0
}

function generateAddition(range, allowNegatives, difficulty) {
  const questions = []
  for (let a = range.min; a <= range.max; a++) {
    for (let b = range.min; b <= range.max; b++) {
      const answer = a + b
      if (!allowNegatives && hasNeg(a, b, answer)) continue
      questions.push({
        category: "arithmetic",
        sub_type: "addition",
        operand_a: a,
        operand_b: b,
        operator: "+",
        question_text: `${a} + ${b} = ?`,
        correct_answer: String(answer),
        has_negatives: hasNeg(a, b, answer),
        difficulty
      })
    }
  }
  return questions
}

function generateSubtraction(range, allowNegatives, difficulty) {
  const questions = []
  for (let a = range.min; a <= range.max; a++) {
    for (let b = range.min; b <= range.max; b++) {
      const answer = a - b
      if (!allowNegatives && (a < b || hasNeg(a, b, answer))) continue
      questions.push({
        category: "arithmetic",
        sub_type: "subtraction",
        operand_a: a,
        operand_b: b,
        operator: "-",
        question_text: `${a} - ${b} = ?`,
        correct_answer: String(answer),
        has_negatives: hasNeg(a, b, answer),
        difficulty
      })
    }
  }
  return questions
}

function getMulRanges(difficultyLevel) {
  if (difficultyLevel === "Easy") {
    return [{ aMin: 0, aMax: 9, bMin: 0, bMax: 9 }]
  }
  if (difficultyLevel === "Medium") {
    // 1d×2d, 2d×1d, 2d×2d
    return [
      { aMin: 1, aMax: 9, bMin: 10, bMax: 99 }, // 1d × 2d
      { aMin: 10, aMax: 99, bMin: 1, bMax: 9 }, // 2d × 1d
      { aMin: 10, aMax: 99, bMin: 10, bMax: 99 } // 2d × 2d
    ]
  }
  // Hard: 1d×3d, 3d×1d, 2d×3d, 3d×2d, 3d×3d
  return [
    { aMin: 1, aMax: 9, bMin: 100, bMax: 999 }, // 1d × 3d
    { aMin: 100, aMax: 999, bMin: 1, bMax: 9 }, // 3d × 1d
    { aMin: 10, aMax: 99, bMin: 100, bMax: 999 }, // 2d × 3d
    { aMin: 100, aMax: 999, bMin: 10, bMax: 99 }, // 3d × 2d
    { aMin: 100, aMax: 999, bMin: 100, bMax: 999 } // 3d × 3d
  ]
}

function generateMultiplication(difficultyLevel) {
  const questions = []
  for (const { aMin, aMax, bMin, bMax } of getMulRanges(difficultyLevel)) {
    for (let a = aMin; a <= aMax; a++) {
      for (let b = bMin; b <= bMax; b++) {
        questions.push({
          category: "arithmetic",
          sub_type: "multiplication",
          operand_a: a,
          operand_b: b,
          operator: "*",
          question_text: `${a} × ${b} = ?`,
          correct_answer: String(a * b),
          has_negatives: false,
          difficulty: difficultyLevel
        })
      }
    }
  }
  return questions
}

function generateDivision(difficultyLevel) {
  const seen = new Set()
  const questions = []
  for (const { aMin, aMax, bMin, bMax } of getMulRanges(difficultyLevel)) {
    for (let a = aMin; a <= aMax; a++) {
      for (let b = bMin; b <= bMax; b++) {
        if (a === 0 || b === 0) continue
        const dividend = a * b

        const key1 = `${dividend}|${b}`
        if (!seen.has(key1)) {
          seen.add(key1)
          questions.push({
            category: "arithmetic",
            sub_type: "division",
            operand_a: dividend,
            operand_b: b,
            operator: "/",
            question_text: `${dividend} ÷ ${b} = ?`,
            correct_answer: String(a),
            has_negatives: false,
            difficulty: difficultyLevel
          })
        }

        if (a !== b) {
          const key2 = `${dividend}|${a}`
          if (!seen.has(key2)) {
            seen.add(key2)
            questions.push({
              category: "arithmetic",
              sub_type: "division",
              operand_a: dividend,
              operand_b: a,
              operator: "/",
              question_text: `${dividend} ÷ ${a} = ?`,
              correct_answer: String(b),
              has_negatives: false,
              difficulty: difficultyLevel
            })
          }
        }
      }
    }
  }
  return questions
}

const MAX_PER_OP = 20000

function sample(arr, n) {
  if (arr.length <= n) return arr
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, n)
}

module.exports = {
  generate(options) {
    const { difficulty, ops, allowNegatives } = options
    const RANGES = {
      Easy: { min: 0, max: 9 },
      Medium: { min: 10, max: 99 },
      Hard: { min: 100, max: 999 }
    }
    const range = RANGES[difficulty] || RANGES.Easy
    let all = []

    if (ops.includes("addition"))
      all = all.concat(sample(generateAddition(range, allowNegatives, difficulty), MAX_PER_OP))
    if (ops.includes("subtraction"))
      all = all.concat(sample(generateSubtraction(range, allowNegatives, difficulty), MAX_PER_OP))
    if (ops.includes("multiplication"))
      all = all.concat(sample(generateMultiplication(difficulty), MAX_PER_OP))
    if (ops.includes("division")) all = all.concat(sample(generateDivision(difficulty), MAX_PER_OP))

    return all
  }
}
