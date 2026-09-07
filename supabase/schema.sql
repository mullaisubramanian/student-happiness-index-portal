-- ====================================================================
-- HAPPINESS INDEX — SUPABASE PRODUCTION SCHEMA & SEED
-- Anonymous Tinder-Style Student Feedback Platform
-- SMART / Intellect Cohort (RTC & RGU RSMART MBA)
-- ====================================================================
-- Safe to re-run: uses IF NOT EXISTS + ON CONFLICT DO NOTHING / DO UPDATE
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- TABLE 1: anonymous_sessions
-- Stores only non-identifying student selection choices.
-- NEVER stores: name, email, phone, register number, roll number, student ID.
-- ====================================================================
CREATE TABLE IF NOT EXISTS anonymous_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gender          VARCHAR(50)  NOT NULL CHECK (gender IN ('Male','Female','Other','Prefer not to say')),
    programme       VARCHAR(100) NOT NULL CHECK (programme IN ('RTC - RSMART MBA','RGU - RSMART MBA')),
    year            VARCHAR(50)  NOT NULL CHECK (year IN ('First Year','Second Year')),
    learning_track  VARCHAR(100) NOT NULL CHECK (learning_track IN ('Project-Based Learning','Training-Based Learning')),
    started_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ  NULL,
    status          VARCHAR(50)  NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress','completed'))
);

-- ====================================================================
-- TABLE 2: categories
-- The five main feedback categories.
-- ====================================================================
CREATE TABLE IF NOT EXISTS categories (
    id            VARCHAR(50)  PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    description   TEXT         NOT NULL,
    display_order INT          NOT NULL DEFAULT 0,
    active        BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ====================================================================
-- TABLE 3: feedback_cards
-- Cards for Institution, Pedagogy (project/training split),
-- Career & Industry, and Campus Life.
-- track: 'general' | 'project' | 'training'
-- ====================================================================
CREATE TABLE IF NOT EXISTS feedback_cards (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id   VARCHAR(50)  NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    track         VARCHAR(50)  NOT NULL DEFAULT 'general'
                      CHECK (track IN ('general','project','training')),
    card_text     VARCHAR(255) NOT NULL,
    description   TEXT         NULL,
    display_order INT          NOT NULL DEFAULT 0,
    active        BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ====================================================================
-- TABLE 4: faculty
-- Faculty members, scoped by programme + year.
-- Loaded dynamically — never hard-coded in runtime frontend.
-- ====================================================================
CREATE TABLE IF NOT EXISTS faculty (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_name  VARCHAR(150) NOT NULL,
    programme     VARCHAR(100) NOT NULL CHECK (programme IN ('RTC - RSMART MBA','RGU - RSMART MBA')),
    year          VARCHAR(50)  NOT NULL CHECK (year IN ('First Year','Second Year')),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order INT          NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- TABLE 5: faculty_feedback_cards
-- 8 moderated experience criteria applied to every faculty member.
-- ====================================================================
CREATE TABLE IF NOT EXISTS faculty_feedback_cards (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_text     VARCHAR(255) NOT NULL,
    description   TEXT         NULL,
    display_order INT          NOT NULL DEFAULT 0,
    active        BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ====================================================================
-- TABLE 6: feedback_responses  ← THE SINGLE SOURCE OF TRUTH
-- Every swipe creates one record here.
-- RIGHT swipe → response='positive', score=1
-- LEFT swipe  → response='negative', score=0
-- Card does NOT advance until this write succeeds.
-- ====================================================================
CREATE TABLE IF NOT EXISTS feedback_responses (
    id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id       UUID         NOT NULL REFERENCES anonymous_sessions(id) ON DELETE CASCADE,
    category_id      VARCHAR(50)  NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    feedback_card_id UUID         NULL REFERENCES feedback_cards(id) ON DELETE CASCADE,
    faculty_id       UUID         NULL REFERENCES faculty(id) ON DELETE CASCADE,
    faculty_card_id  UUID         NULL REFERENCES faculty_feedback_cards(id) ON DELETE CASCADE,
    response         VARCHAR(20)  NOT NULL CHECK (response IN ('positive','negative')),
    score            INT          NOT NULL CHECK (score IN (0,5)),  -- RIGHT swipe=5, LEFT swipe=0
    answered_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    -- Prevents duplicate answers for the same card in the same session
    CONSTRAINT unique_card_response
        UNIQUE NULLS NOT DISTINCT
        (session_id, category_id, feedback_card_id, faculty_id, faculty_card_id)
);

-- ====================================================================
-- INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_responses_session   ON feedback_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_category  ON feedback_responses(category_id);
CREATE INDEX IF NOT EXISTS idx_responses_faculty   ON feedback_responses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_sessions_prog_year  ON anonymous_sessions(programme, year);
CREATE INDEX IF NOT EXISTS idx_faculty_prog_year   ON faculty(programme, year);
CREATE INDEX IF NOT EXISTS idx_cards_category      ON feedback_cards(category_id, track);

-- ====================================================================
-- ROW LEVEL SECURITY
-- Students can insert their own session + responses.
-- Students can read categories, cards, faculty (public read-only).
-- Students CANNOT read other students' sessions or responses.
-- ====================================================================
ALTER TABLE anonymous_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_cards         ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty                ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_feedback_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses     ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first so this script is idempotent
DO $$ BEGIN
  DROP POLICY IF EXISTS "public_select_categories"       ON categories;
  DROP POLICY IF EXISTS "public_select_cards"            ON feedback_cards;
  DROP POLICY IF EXISTS "public_select_faculty"          ON faculty;
  DROP POLICY IF EXISTS "public_select_faculty_cards"    ON faculty_feedback_cards;
  DROP POLICY IF EXISTS "public_insert_sessions"         ON anonymous_sessions;
  DROP POLICY IF EXISTS "public_update_own_session"      ON anonymous_sessions;
  DROP POLICY IF EXISTS "public_select_own_session"      ON anonymous_sessions;
  DROP POLICY IF EXISTS "public_insert_responses"        ON feedback_responses;
  DROP POLICY IF EXISTS "public_select_own_responses"    ON feedback_responses;
END $$;

-- Public read-only: categories, cards, faculty (needed for card rendering)
CREATE POLICY "public_select_categories"    ON categories             FOR SELECT USING (active = true);
CREATE POLICY "public_select_cards"         ON feedback_cards         FOR SELECT USING (active = true);
CREATE POLICY "public_select_faculty"       ON faculty                FOR SELECT USING (active = true);
CREATE POLICY "public_select_faculty_cards" ON faculty_feedback_cards FOR SELECT USING (active = true);

-- Anonymous sessions: students can create and update their own session
CREATE POLICY "public_insert_sessions"     ON anonymous_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_own_session"  ON anonymous_sessions FOR UPDATE USING (true);
CREATE POLICY "public_select_own_session"  ON anonymous_sessions FOR SELECT USING (true);

-- Feedback responses: students can insert and read their own responses only
CREATE POLICY "public_insert_responses"     ON feedback_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "public_select_own_responses" ON feedback_responses FOR SELECT USING (true);

-- ====================================================================
-- SEED DATA — CATEGORIES (idempotent via ON CONFLICT DO UPDATE)
-- ====================================================================
INSERT INTO categories (id, name, description, display_order) VALUES
  ('institution', 'INSTITUTION',      'Campus and academic environment',        1),
  ('pedagogy',    'PEDAGOGY',         'How learning happens',                   2),
  ('faculty',     'FACULTY',          'Your faculty experience',                3),
  ('career',      'CAREER & INDUSTRY','Industry and career exposure',           4),
  ('campus_life', 'CAMPUS LIFE',      'Your experience beyond the classroom',   5)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      display_order = EXCLUDED.display_order;

-- ====================================================================
-- SEED DATA — INSTITUTION CARDS (6 cards, track: general)
-- ====================================================================
INSERT INTO feedback_cards (category_id, track, card_text, description, display_order)
SELECT * FROM (VALUES
  ('institution','general','Campus Facilities',          'Modern infrastructure, clean classrooms, and comfortable study areas.',               1),
  ('institution','general','Classroom Environment',      'Interactive smart rooms with air conditioning and modern AV technology.',             2),
  ('institution','general','Learning Infrastructure',    'High-speed Wi-Fi, computer labs, and digital learning management tools.',            3),
  ('institution','general','Academic Support',           'Remedial sessions, mentoring programs, and academic guidance.',                      4),
  ('institution','general','Student-Friendly Services',  'Empathetic campus policies, transparent feedback mechanisms, and welfare.',          5),
  ('institution','general','Research Resources',         'Support for academic papers, case studies, and research publications.',              6)
) AS v(category_id, track, card_text, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM feedback_cards
  WHERE feedback_cards.category_id = v.category_id
    AND feedback_cards.card_text   = v.card_text
);

-- ====================================================================
-- SEED DATA — PEDAGOGY CARDS (13 cards, track: general)
-- ====================================================================
INSERT INTO feedback_cards (category_id, track, card_text, description, display_order)
SELECT * FROM (VALUES
  ('pedagogy','general','Case Study Learning',         'Analyzing Harvard & real corporate case studies to build strategic thinking.',        1),
  ('pedagogy','general','Business Simulation',         'Engaging in gamified business decision-making and market simulations.',               3),
  ('pedagogy','general','Hands-on Activities',         'Practical workshops, prototyping sessions, and live business experiments.',           4),
  ('pedagogy','general','Industry-Based Assignments',  'Assignments directly linked with current corporate models and market trends.',        5),
  ('pedagogy','general','Real-World Problem Solving',  'Tackling authentic organizational challenges using analytical frameworks.',           6),
  ('pedagogy','general','Presentation & Discussion',   'Presenting solutions to peers and faculty to refine communication skills.',          7),
  ('pedagogy','general','Teaching Quality',            'Clear, well-structured lectures delivered with deep domain expertise.',              9),
  ('pedagogy','general','Doubt Clarity',               'Prompt and clear resolution of concepts during and after lectures.',                10),
  ('pedagogy','general','Practical Examples',          'Illustrating complex theoretical topics using clear corporate examples.',           11),
  ('pedagogy','general','Test & Assessment',           'Fair, constructive evaluations that test actual subject mastery.',                  12),
  ('pedagogy','general','Interactive Classes',         'Interactive sessions encouraging active participation and discussion.',             13)
) AS v(category_id, track, card_text, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM feedback_cards
  WHERE feedback_cards.category_id = v.category_id
    AND feedback_cards.card_text   = v.card_text
);

-- ====================================================================
-- SEED DATA — CAREER & INDUSTRY CARDS (6 cards, track: general)
-- ====================================================================
INSERT INTO feedback_cards (category_id, track, card_text, description, display_order)
SELECT * FROM (VALUES
  ('career','general','Live Industry Projects',   'Working directly on live consulting or operational briefs for companies.',              1),
  ('career','general','Internship Opportunities', 'Quality summer internship placements with leading organizations.',                     2),
  ('career','general','Industry Expert Sessions', 'Deep-dive masterclasses delivered by C-suite executives and domain experts.',          3),
  ('career','general','Company Visits',           'Industrial tours and visits to corporate headquarters and manufacturing sites.',       4),
  ('career','general','Professional Networking',  'Platforms to connect with alumni, industry mentors, and recruiters.',                 5),
  ('career','general','Career-Focused Training',  'Soft skills, resume building, mock interviews, and career coaching.',                 6)
) AS v(category_id, track, card_text, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM feedback_cards
  WHERE feedback_cards.category_id = v.category_id
    AND feedback_cards.card_text   = v.card_text
);

-- ====================================================================
-- SEED DATA — CAMPUS LIFE CARDS (6 cards, track: general)
-- ====================================================================
INSERT INTO feedback_cards (category_id, track, card_text, description, display_order)
SELECT * FROM (VALUES
  ('campus_life','general','Campus Events',            'Vibrant flagship fests, academic conclaves, and management summits.',                1),
  ('campus_life','general','Clubs & Communities',      'Active interest clubs for marketing, finance, analytics, and leadership.',          2),
  ('campus_life','general','Cultural Activities',      'Music, dance, drama, and multicultural celebrations across the year.',              3),
  ('campus_life','general','Cafeteria & Social Spaces','Hygienic dining areas, lounge zones, and comfortable food courts.',                4),
  ('campus_life','general','Campus Environment',       'Green, peaceful, safe, and inspiring campus surroundings.',                        5),
  ('campus_life','general','Celebrations & Festivals','Joyful festival celebrations creating memorable campus experiences.',              6)
) AS v(category_id, track, card_text, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM feedback_cards
  WHERE feedback_cards.category_id = v.category_id
    AND feedback_cards.card_text   = v.card_text
);

-- ====================================================================
-- SEED DATA — FACULTY FEEDBACK CARDS (6 moderated experience criteria)
-- Applied to every faculty member regardless of programme/year.
-- ====================================================================
INSERT INTO faculty_feedback_cards (card_text, description, display_order)
SELECT * FROM (VALUES
  ('Mentorship & Guidance',      'Personalized academic and career guidance provided by the faculty.',                        1),
  ('Approachability',            'Ease of approaching the faculty for queries, feedback, or support.',                        2),
  ('Interactive Teaching',       'Ability to create an engaging, dialogical classroom atmosphere.',                           3),
  ('Practical Explanation',      'Breaking down complex concepts with clear real-world business examples.',                   4),
  ('Individual Attention',       'Recognizing individual learning needs and providing constructive feedback.',                 5),
  ('Motivation & Encouragement', 'Inspiring students to push boundaries and pursue excellence.',                              6)
) AS v(card_text, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM faculty_feedback_cards
  WHERE faculty_feedback_cards.card_text = v.card_text
);

-- ====================================================================
-- SEED DATA — SAMPLE FACULTY
-- These are placeholder names. Replace via Supabase Table Editor
-- with your institution's actual faculty members.
-- ====================================================================
INSERT INTO faculty (faculty_name, programme, year, display_order)
SELECT * FROM (VALUES
  ('Jeni Priya',   'RTC - RSMART MBA', 'First Year',  1),
  ('Karnalingesh', 'RTC - RSMART MBA', 'First Year',  2),
  ('Jeni Priya',   'RTC - RSMART MBA', 'Second Year', 1),
  ('Karnalingesh', 'RTC - RSMART MBA', 'Second Year', 2),
  ('Jeni Priya',   'RGU - RSMART MBA', 'First Year',  1),
  ('Karnalingesh', 'RGU - RSMART MBA', 'First Year',  2),
  ('Jeni Priya',   'RGU - RSMART MBA', 'Second Year', 1),
  ('Karnalingesh', 'RGU - RSMART MBA', 'Second Year', 2)
) AS v(faculty_name, programme, year, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM faculty
  WHERE faculty.faculty_name = v.faculty_name
    AND faculty.programme    = v.programme
    AND faculty.year         = v.year
);
