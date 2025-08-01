// Usage: node scripts/addQuestionsToDB.js scripts/testquestion.json

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local file
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });


// The script now reads these values from your .env.local file.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Function to read and parse the JSON data file
function loadQuestions(filename) {
    try {
        const jsonPath = path.resolve(process.cwd(), filename);
        console.log(`Attempting to read questions from: ${jsonPath}`);
        if (!fs.existsSync(jsonPath)) {
            console.error(`Error: File not found at ${jsonPath}`);
            return null;
        }
        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        const questions = JSON.parse(fileContent);
        console.log(`Successfully loaded ${questions.length} questions from ${filename}.`);
        return questions;
    } catch (error) {
        console.error(`Error reading or parsing ${filename}:`, error.message);
        return null;
    }
}

// Main async function to upload the data
async function uploadData() {
    // Get the filename from the command-line arguments
    const filename = process.argv[2];

    if (!filename) {
        console.error('Error: Please provide the JSON filename as an argument.');
        console.log('Usage: node seed.js <your_file.json>');
        return;
    }

    // Check if credentials are loaded
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('Error: Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env.local file.');
        return;
    }

    // Load the questions from the specified file
    const questionsToUpload = loadQuestions(filename);

    if (!questionsToUpload || questionsToUpload.length === 0) {
        console.log('No valid questions found to upload. Exiting.');
        return;
    }

    console.log('Initializing Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log('Starting upload...');
    try {
        const { data, error } = await supabase
            .from('questions')
            .insert(questionsToUpload)
            .select();

        if (error) {
            console.error('Error uploading questions:', error.message);
            return;
        }

        console.log(`\n✅ Successfully uploaded ${data.length} questions!`);
        console.log('A sample of uploaded data:', data[0]);

    } catch (err) {
        console.error('An unexpected error occurred during the upload:', err);
    }
}

uploadData();
