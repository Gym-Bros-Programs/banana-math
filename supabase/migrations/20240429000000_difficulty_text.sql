-- Drop existing RPC first (signature change)
DROP FUNCTION IF EXISTS get_questions_for_session(text, text[], boolean, integer, integer);

-- Clear questions (will be re-seeded with text difficulty labels)
TRUNCATE TABLE questions CASCADE;

-- Change difficulty from integer score to text label
ALTER TABLE questions ALTER COLUMN difficulty TYPE text USING 'Easy';
ALTER TABLE questions ALTER COLUMN difficulty SET DEFAULT 'Easy';

-- Recreate RPC with text difficulty filter
CREATE OR REPLACE FUNCTION get_questions_for_session(
  p_category        text,
  p_operator_set    text[],
  p_allow_negatives boolean,
  p_limit           integer,
  p_difficulty      text DEFAULT 'Easy'
)
RETURNS SETOF questions
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM   questions
  WHERE  category  = p_category
    AND  sub_type  = ANY(p_operator_set)
    AND  (p_allow_negatives = true OR has_negatives = false)
    AND  difficulty = p_difficulty
  ORDER BY random()
  LIMIT  p_limit;
$$;
