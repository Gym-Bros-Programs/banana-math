-- ============================================================
-- banana-math: Full Schema v2
-- Run this after the original scaffold migration
-- ============================================================

-- ─── Drop old tables (safe, cascade will handle FKs) ────────
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS attempts CASCADE;

-- ─── profiles ────────────────────────────────────────────────
-- Extends auth.users. Created automatically via trigger on signup.
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text        UNIQUE NOT NULL,
  display_name  text,
  created_at    timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- ─── questions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  category       text    NOT NULL DEFAULT 'arithmetic',
  sub_type       text    NOT NULL, -- 'addition' | 'subtraction' | 'multiplication' | 'division'
                                   -- | 'decimal' | 'fraction' | 'exponent'
  operand_a      numeric,
  operand_b      numeric,
  operator       text,             -- '+' | '-' | '*' | '/'
  question_text  text    NOT NULL,
  correct_answer text    NOT NULL,
  has_negatives  boolean NOT NULL DEFAULT false,
  difficulty     integer NOT NULL DEFAULT 1,
  created_at     timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (operand_a, operand_b, operator)
);

CREATE INDEX IF NOT EXISTS idx_questions_category    ON questions (category);
CREATE INDEX IF NOT EXISTS idx_questions_sub_type    ON questions (sub_type);
CREATE INDEX IF NOT EXISTS idx_questions_negatives   ON questions (has_negatives);

-- ─── sessions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid    REFERENCES auth.users(id) ON DELETE SET NULL,
  category         text    NOT NULL DEFAULT 'arithmetic',
  operator_set     text[]  NOT NULL,            -- sorted array e.g. ['addition','multiplication']
  allow_negatives  boolean NOT NULL DEFAULT true,
  session_mode     text    NOT NULL DEFAULT 'timed', -- 'timed' | 'fixed'
  duration_seconds integer,                     -- set when session_mode = 'timed'
  question_limit   integer,                     -- set when session_mode = 'fixed'
  correct_count    integer NOT NULL DEFAULT 0,
  total_count      integer NOT NULL DEFAULT 0,
  accuracy         numeric NOT NULL DEFAULT 0,  -- 0-100
  cqpm             numeric NOT NULL DEFAULT 0,
  percentile       numeric,                     -- 0-100, computed at session end
  is_leaderboard_eligible boolean NOT NULL DEFAULT false, -- true only for standard preset combos
  completed_at     timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id  ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_category ON sessions (category);

-- ─── session_answers ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_answers (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid    NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id      uuid    NOT NULL REFERENCES questions(id),
  user_answer      text    NOT NULL,
  is_correct       boolean NOT NULL,
  time_taken_ms    integer,
  order_in_session integer NOT NULL,
  answered_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_session_answers_session ON session_answers (session_id);
CREATE INDEX IF NOT EXISTS idx_session_answers_question ON session_answers (question_id);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;

-- profiles: users can read all, only write their own
CREATE POLICY "profiles_public_read"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_write"     ON profiles FOR ALL    USING (auth.uid() = id);

-- questions: public read (required for fetching question pools)
CREATE POLICY "questions_public_read"  ON questions FOR SELECT USING (true);

-- sessions: users can read/write their own; guests (user_id IS NULL) handled client-side
CREATE POLICY "sessions_own_all"       ON sessions FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "sessions_public_read"   ON sessions FOR SELECT USING (true); -- for percentile

-- session_answers: readable via session ownership
CREATE POLICY "session_answers_own"    ON session_answers FOR ALL
  USING (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid()));
CREATE POLICY "session_answers_read"   ON session_answers FOR SELECT USING (true);

-- ─── RPC: get_questions_for_session ──────────────────────────
-- Fetches a pool of deduplicated random questions matching session config.
CREATE OR REPLACE FUNCTION get_questions_for_session(
  p_category      text,
  p_operator_set  text[],
  p_allow_negatives boolean,
  p_limit         integer
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
  ORDER BY random()
  LIMIT  p_limit;
$$;

-- ─── RPC: calculate_session_percentile ───────────────────────
-- Computes what % of comparable sessions scored LOWER than the given session.
CREATE OR REPLACE FUNCTION calculate_session_percentile(p_session_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_session       sessions%ROWTYPE;
  v_total         integer;
  v_below         integer;
BEGIN
  SELECT * INTO v_session FROM sessions WHERE id = p_session_id;

  IF NOT FOUND THEN RETURN NULL; END IF;

  -- Count sessions in the same comparison group
  SELECT COUNT(*) INTO v_total
  FROM   sessions
  WHERE  category        = v_session.category
    AND  operator_set    = v_session.operator_set
    AND  allow_negatives = v_session.allow_negatives
    AND  session_mode    = v_session.session_mode
    AND  (
      (v_session.session_mode = 'timed'  AND duration_seconds = v_session.duration_seconds) OR
      (v_session.session_mode = 'fixed'  AND question_limit   = v_session.question_limit)
    )
    AND  completed_at IS NOT NULL;

  -- Count sessions that scored strictly lower
  SELECT COUNT(*) INTO v_below
  FROM   sessions
  WHERE  category        = v_session.category
    AND  operator_set    = v_session.operator_set
    AND  allow_negatives = v_session.allow_negatives
    AND  session_mode    = v_session.session_mode
    AND  (
      (v_session.session_mode = 'timed'  AND duration_seconds = v_session.duration_seconds) OR
      (v_session.session_mode = 'fixed'  AND question_limit   = v_session.question_limit)
    )
    AND  completed_at IS NOT NULL
    AND  accuracy < v_session.accuracy;

  IF v_total = 0 THEN RETURN 100; END IF;

  RETURN ROUND((v_below::numeric / v_total::numeric) * 100, 1);
END;
$$;

-- ─── Trigger: auto-create profile on signup ──────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
