//Usage: node scripts/generateQuestions.js -10 10 test_questions.json

const fs = require("fs")
const path = require("path")

// Calculates the number of digits in a number(ignoring the sign).
function getDigitCount(n) {
  if (n === 0) return 1
  return Math.floor(Math.log10(Math.abs(n))) + 1
}

//Generates an array of tags based on the question's properties.
function generateTags(a, b, answer, operation) {
  const tags = ["one_operation"]
  tags.push(operation)

  // Check for negative numbers
  if (a < 0 || b < 0 || answer < 0) {
    tags.push("negative")
  }

  // Determine the number of digits of the largest operand
  const maxOperandDigits = getDigitCount(Math.max(Math.abs(a), Math.abs(b)))
  tags.push(`${maxOperandDigits}-digit`)

  return tags
}

//Calculates the difficulty score for a question.

function calculateDifficulty(a, b, answer) {
  const digitsA = getDigitCount(a)
  const digitsB = getDigitCount(b)
  const digitsAnswer = getDigitCount(answer)

  let difficulty = digitsA + digitsB + digitsAnswer

  // Add 5 to difficulty if any number is negative
  if (a < 0 || b < 0 || answer < 0) {
    difficulty += 5
  }

  return difficulty
}

//Main function to generate questions and save them to a file.
function generate() {
  const args = process.argv.slice(2)
  if (args.length !== 3) {
    console.error("Error: Invalid arguments.")
    console.log(
      "Usage: node generateQuestions.js <start_number> <end_number> <output_filename.json>"
    )
    console.log("Example: node generateQuestions.js -10 10 questions.json")
    return
  }

  const startNum = parseInt(args[0], 10)
  const endNum = parseInt(args[1], 10)
  const outputFilename = args[2]

  if (isNaN(startNum) || isNaN(endNum)) {
    console.error("Error: Start and end numbers must be valid integers.")
    return
  }

  console.log(`Generating questions for numbers from ${startNum} to ${endNum}...`)
  console.warn("Warning: Large ranges can take a very long time and produce huge files!")

  const allQuestions = []

  for (let i = startNum; i <= endNum; i++) {
    for (let j = startNum; j <= endNum; j++) {
      // Addition
      const sum = i + j
      const additionQuestion = {
        question_text: `${i} + ${j} = ?`,
        correct_answer: String(sum),
        topic: "Arithmetic",
        difficulty: calculateDifficulty(i, j, sum),
        tags: generateTags(i, j, sum, "addition")
      }
      allQuestions.push(additionQuestion)

      // Subtraction
      const difference = i - j
      const subtractionQuestion = {
        question_text: `${i} - ${j} = ?`,
        correct_answer: String(difference),
        topic: "Arithmetic",
        difficulty: calculateDifficulty(i, j, difference),
        tags: generateTags(i, j, difference, "subtraction")
      }
      allQuestions.push(subtractionQuestion)
    }
  }

  console.log(`Generated a total of ${allQuestions.length} questions.`)

  // Write to File
  try {
    const outputPath = path.resolve(process.cwd(), outputFilename)
    fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2))
    console.log(`\n✅ Successfully saved questions to ${outputPath}`)
  } catch (error) {
    console.error("Error writing to file:", error.message)
  }
}

generate()
