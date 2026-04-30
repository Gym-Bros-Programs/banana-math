CREATE INDEX IF NOT EXISTS idx_questions_session_sample
  ON questions (category, difficulty, has_negatives, sub_type, id);

CREATE OR REPLACE FUNCTION get_questions_for_session(
  p_category        text,
  p_operator_set    text[],
  p_allow_negatives boolean,
  p_limit           integer,
  p_difficulty      text DEFAULT 'Easy'
)
RETURNS SETOF questions
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_match_count integer;
  v_offset integer;
BEGIN
  SELECT COUNT(*)
  INTO v_match_count
  FROM questions
  WHERE category = p_category
    AND sub_type = ANY(p_operator_set)
    AND (p_allow_negatives = true OR has_negatives = false)
    AND difficulty = p_difficulty;

  IF v_match_count = 0 THEN
    RETURN;
  END IF;

  v_offset := FLOOR(random() * GREATEST(v_match_count - p_limit + 1, 1));

  RETURN QUERY
  SELECT *
  FROM questions
  WHERE category = p_category
    AND sub_type = ANY(p_operator_set)
    AND (p_allow_negatives = true OR has_negatives = false)
    AND difficulty = p_difficulty
  ORDER BY id
  OFFSET v_offset
  LIMIT p_limit;
END;
$$;
