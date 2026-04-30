-- Allow question_id to be NULL so deleting questions doesn't destroy session history.
-- Session scores and leaderboard entries are unaffected; only breakdown detail is lost.
ALTER TABLE session_answers
  ALTER COLUMN question_id DROP NOT NULL;

ALTER TABLE session_answers
  DROP CONSTRAINT IF EXISTS session_answers_question_id_fkey;

ALTER TABLE session_answers
  ADD CONSTRAINT session_answers_question_id_fkey
  FOREIGN KEY (question_id)
  REFERENCES questions(id)
  ON DELETE SET NULL;
