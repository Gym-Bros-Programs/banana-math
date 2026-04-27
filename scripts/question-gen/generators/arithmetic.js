/**
 * generators/arithmetic.js
 * 
 * Logic for generating basic arithmetic questions (+, -, *, /).
 */

function getDigitCount(n) {
  if (n === 0) return 1
  return Math.floor(Math.log10(Math.abs(n))) + 1
}

function calcDifficultyScore(a, b, answer) {
  let d = getDigitCount(a) + getDigitCount(b) + getDigitCount(answer)
  if (a < 0 || b < 0 || answer < 0) d += 3
  return d
}

function hasNeg(a, b, answer) {
  return a < 0 || b < 0 || answer < 0
}

function generateAddition(range, allowNegatives) {
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
        difficulty: calcDifficultyScore(a, b, answer),
      })
    }
  }
  return questions
}

function generateSubtraction(range, allowNegatives) {
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
        difficulty: calcDifficultyScore(a, b, answer),
      })
    }
  }
  return questions
}

function generateMultiplication(difficultyLevel) {
  const questions = []
  const maxMul = difficultyLevel === "Easy" ? 10 : difficultyLevel === "Medium" ? 12 : 20
  for (let a = 0; a <= maxMul; a++) {
    for (let b = 0; b <= maxMul; b++) {
      const answer = a * b
      questions.push({
        category: "arithmetic",
        sub_type: "multiplication",
        operand_a: a,
        operand_b: b,
        operator: "*",
        question_text: `${a} × ${b} = ?`,
        correct_answer: String(answer),
        has_negatives: false,
        difficulty: calcDifficultyScore(a, b, answer),
      })
    }
  }
  return questions
}

function generateDivision(difficultyLevel) {
  const questions = []
  const maxRes = difficultyLevel === "Easy" ? 10 : difficultyLevel === "Medium" ? 12 : 20
  const maxDivisor = difficultyLevel === "Easy" ? 10 : difficultyLevel === "Medium" ? 12 : 20

  for (let res = 0; res <= maxRes; res++) {
    for (let divisor = 1; divisor <= maxDivisor; divisor++) {
      const dividend = res * divisor
      questions.push({
        category: "arithmetic",
        sub_type: "division",
        operand_a: dividend,
        operand_b: divisor,
        operator: "/",
        question_text: `${dividend} ÷ ${divisor} = ?`,
        correct_answer: String(res),
        has_negatives: false,
        difficulty: calcDifficultyScore(dividend, divisor, res),
      })
    }
  }
  return questions
}

module.exports = {
  generate(options) {
    const { difficulty, ops, allowNegatives } = options
    const RANGES = {
      Easy: { min: 0, max: 9 },
      Medium: { min: 0, max: 99 },
      Hard: { min: 0, max: 999 },
    }
    const range = RANGES[difficulty] || RANGES.Easy
    let all = []

    if (ops.includes("addition")) all = all.concat(generateAddition(range, allowNegatives))
    if (ops.includes("subtraction")) all = all.concat(generateSubtraction(range, allowNegatives))
    if (ops.includes("multiplication")) all = all.concat(generateMultiplication(difficulty))
    if (ops.includes("division")) all = all.concat(generateDivision(difficulty))

    return all
  }
}
