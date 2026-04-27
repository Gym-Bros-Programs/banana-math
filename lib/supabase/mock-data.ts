export const DEFAULT_MOCK_SESSIONS = [
  // --- TIMED SESSIONS ---
  {
    id: "mock-t-1", user_id: "mock-user-id", category: "arithmetic",
    operator_set: ["addition", "subtraction"], allow_negatives: false,
    session_mode: "timed", duration_seconds: 15, question_limit: null,
    correct_count: 8, total_count: 8, accuracy: 100, percentile: 0.9,
    completed_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), session_answers: [],
    _primaryScore: 8, difficulty: "Easy"
  },
  {
    id: "mock-t-2", user_id: "mock-user-id", category: "arithmetic",
    operator_set: ["addition", "subtraction", "multiplication", "division"], allow_negatives: true,
    session_mode: "timed", duration_seconds: 30, question_limit: null,
    correct_count: 14, total_count: 16, accuracy: 87.5, percentile: 15.0,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), session_answers: [],
    _primaryScore: 14, difficulty: "Hard"
  },
  {
    id: "mock-t-3", user_id: "mock-user-id", category: "arithmetic",
    operator_set: ["multiplication", "division"], allow_negatives: false,
    session_mode: "timed", duration_seconds: 60, question_limit: null,
    correct_count: 22, total_count: 25, accuracy: 88, percentile: 17.7,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), session_answers: [],
    _primaryScore: 22, difficulty: "Medium"
  },
  {
    id: "mock-t-4", user_id: "mock-user-id", category: "arithmetic",
    operator_set: ["addition"], allow_negatives: false,
    session_mode: "timed", duration_seconds: 120, question_limit: null,
    correct_count: 55, total_count: 58, accuracy: 94.8, percentile: 7.5,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), session_answers: [],
    _primaryScore: 55, difficulty: "Easy"
  },

  // --- FIXED SESSIONS ---
  {
    id: "mock-f-1", user_id: "mock-user-id", category: "arithmetic",
    operator_set: ["addition", "subtraction"], allow_negatives: false,
    session_mode: "fixed", duration_seconds: null, question_limit: 10,
    correct_count: 10, total_count: 10, accuracy: 100, percentile: 1.5,
    completed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), session_answers: [],
    _primaryScore: 18, // 18 seconds to complete 10 questions
    difficulty: "Easy"
  },
  {
    id: "mock-f-2", user_id: "mock-user-id", category: "arithmetic",
    operator_set: ["multiplication", "division"], allow_negatives: false,
    session_mode: "fixed", duration_seconds: null, question_limit: 25,
    correct_count: 23, total_count: 25, accuracy: 92, percentile: 12.0,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), session_answers: [],
    _primaryScore: 45, // 45 seconds to complete 25 questions
    difficulty: "Medium"
  },
  {
    id: "mock-f-3", user_id: "mock-user-id", category: "arithmetic",
    operator_set: ["addition", "subtraction", "multiplication", "division"], allow_negatives: true,
    session_mode: "fixed", duration_seconds: null, question_limit: 50,
    correct_count: 48, total_count: 50, accuracy: 96, percentile: 4.5,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), session_answers: [],
    _primaryScore: 110, // 110 seconds to complete 50 questions
    difficulty: "Hard"
  },
  {
    id: "mock-f-4", user_id: "mock-user-id", category: "arithmetic",
    operator_set: ["subtraction"], allow_negatives: true,
    session_mode: "fixed", duration_seconds: null, question_limit: 100,
    correct_count: 95, total_count: 100, accuracy: 95, percentile: 6.0,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), session_answers: [],
    _primaryScore: 240, // 240 seconds to complete 100 questions
    difficulty: "Medium"
  },
  
  // --- EXTRA ENTRIES FOR OTHER USERS (For Leaderboard Variety) ---
  {
    id: "mock-ext-1", user_id: "other-user-1", category: "arithmetic",
    operator_set: ["addition", "subtraction"], allow_negatives: false,
    session_mode: "timed", duration_seconds: 15, question_limit: null,
    correct_count: 12, total_count: 12, accuracy: 100, percentile: 0.1,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), session_answers: [],
    _primaryScore: 12, difficulty: "Easy"
  },
  {
    id: "mock-ext-2", user_id: "other-user-2", category: "arithmetic",
    operator_set: ["addition", "subtraction", "multiplication", "division"], allow_negatives: true,
    session_mode: "fixed", duration_seconds: null, question_limit: 50,
    correct_count: 50, total_count: 50, accuracy: 100, percentile: 0.1,
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), session_answers: [],
    _primaryScore: 85, // Only took 85 seconds for 50 hard questions!
    difficulty: "Hard"
  }
];
