// insert_test.js - Node script to test Supabase insert of a feedback response
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or key not set in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  // fetch a feedback card (any category)
  const { data: card, error: cardErr } = await supabase
    .from('feedback_cards')
    .select('id, category_id')
    .limit(1)
    .single();
  if (cardErr) {
    console.error('Error fetching card:', cardErr);
    return;
  }

  const sessionId = '949ba2c4-c8d6-483f-8fe6-84dc4ee405bd'; // existing session id

  const payload = {
    session_id: sessionId,
    category_id: card.category_id,
    feedback_card_id: card.id,
    response: 'positive',
    score: 5,
    answered_at: new Date().toISOString(),
  };

  const { data: insertData, error: insertErr } = await supabase
    .from('feedback_responses')
    .insert(payload)
    .select()
    .single();
  if (insertErr) {
    console.error('Insert error:', insertErr);
    return;
  }
  console.log('Insert succeeded:', insertData);

  // Verify by fetching responses for session
  const { data: responses, error: fetchErr } = await supabase
    .from('feedback_responses')
    .select('*')
    .eq('session_id', sessionId);
  if (fetchErr) {
    console.error('Fetch responses error:', fetchErr);
    return;
  }
  console.log('All responses for session:', responses);
}

main();
