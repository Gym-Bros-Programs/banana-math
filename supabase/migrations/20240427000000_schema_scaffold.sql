-- Initial tables used by the first local prototype.

CREATE TABLE IF NOT EXISTS attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  correct_count integer DEFAULT 0,
  total_count integer DEFAULT 0,
  percentage numeric DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_answers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id uuid REFERENCES attempts(id) ON DELETE CASCADE,
  question_id uuid, -- nullable for random generated questions
  submitted_answer text,
  is_correct boolean,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION get_random_question()
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN '[{"id": "test-1", "question_text": "5 + 5", "correct_answer": "10"}]'::json;
END;
$$;
