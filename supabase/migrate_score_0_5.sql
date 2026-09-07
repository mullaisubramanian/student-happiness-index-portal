-- ====================================================================
-- HAPPINESS INDEX — Score Constraint Migration
-- Run this in Supabase SQL Editor to update score from (0,1) to (0,5)
-- RIGHT swipe = 5, LEFT swipe = 0
-- ====================================================================

-- Step 1: Drop the old check constraint
ALTER TABLE feedback_responses
  DROP CONSTRAINT IF EXISTS feedback_responses_score_check;

-- Step 2: Add the updated constraint allowing 0 and 5
ALTER TABLE feedback_responses
  ADD CONSTRAINT feedback_responses_score_check
  CHECK (score IN (0, 5));

-- Step 3: Update any existing test rows that have score=1 to score=5
UPDATE feedback_responses SET score = 5 WHERE score = 1;

-- Verify
SELECT id, response, score FROM feedback_responses LIMIT 10;
