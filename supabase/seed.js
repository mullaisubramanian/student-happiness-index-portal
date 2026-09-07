/**
 * HAPPINESS INDEX — Database Seeder
 * Run this ONCE to seed categories, feedback cards, faculty cards, and sample faculty.
 * This uses the Supabase anon/publishable key via upsert (safe to re-run).
 *
 * Usage:
 *   node supabase/seed.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jnihhbkwgmxonfwcrfha.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_EQ1M78IN2NtYfDT8TASsrg_ARTLasdc';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function seed() {
  console.log('🌱 Starting HAPPINESS INDEX database seed...\n');

  // ── Categories ──────────────────────────────────────────────────────
  console.log('Seeding categories...');
  const { error: catErr } = await supabase.from('categories').upsert([
    { id: 'institution', name: 'INSTITUTION',       description: 'Campus and academic environment',        display_order: 1 },
    { id: 'pedagogy',    name: 'PEDAGOGY',           description: 'How learning happens',                   display_order: 2 },
    { id: 'faculty',     name: 'FACULTY',            description: 'Your faculty experience',                display_order: 3 },
    { id: 'career',      name: 'CAREER & INDUSTRY',  description: 'Industry and career exposure',           display_order: 4 },
    { id: 'campus_life', name: 'CAMPUS LIFE',        description: 'Your experience beyond the classroom',   display_order: 5 },
  ], { onConflict: 'id' });
  if (catErr) { console.error('  ❌ Categories error:', catErr.message); } else { console.log('  ✅ Categories seeded'); }

  // ── Institution Cards (6) ────────────────────────────────────────────
  console.log('Seeding institution cards...');
  const { error: instErr } = await supabase.from('feedback_cards').upsert([
    { category_id: 'institution', track: 'general', card_text: 'Campus Facilities',        description: 'Modern infrastructure, clean classrooms, and comfortable study areas.',               display_order: 1 },
    { category_id: 'institution', track: 'general', card_text: 'Classroom Environment',     description: 'Interactive smart rooms with air conditioning and modern AV technology.',             display_order: 2 },
    { category_id: 'institution', track: 'general', card_text: 'Learning Infrastructure',   description: 'High-speed Wi-Fi, computer labs, and digital learning management tools.',            display_order: 3 },
    { category_id: 'institution', track: 'general', card_text: 'Academic Support',        description: 'Remedial sessions, mentoring programs, and academic guidance.',                      display_order: 4 },
    { category_id: 'institution', track: 'general', card_text: 'Student-Friendly Services', description: 'Empathetic campus policies, transparent feedback mechanisms, and welfare.',          display_order: 5 },
    { category_id: 'institution', track: 'general', card_text: 'Research Resources',        description: 'Support for academic papers, case studies, and research publications.',              display_order: 6 },
  ], { onConflict: 'id', ignoreDuplicates: true });
  if (instErr) { console.error('  ❌ Institution cards error:', instErr.message); } else { console.log('  ✅ Institution cards seeded (6)'); }

  // ── Pedagogy Cards (13) ──────────────────────────────────────────────
  console.log('Seeding pedagogy cards...');
  const { error: pedErr } = await supabase.from('feedback_cards').upsert([
    { category_id: 'pedagogy', track: 'general', card_text: 'Project-Based Learning',     description: 'Learning through practical projects that address real operational challenges.',  display_order: 1 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Case Study Learning',        description: 'Analyzing Harvard & real corporate case studies to build strategic thinking.',  display_order: 2 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Business Simulation',        description: 'Engaging in gamified business decision-making and market simulations.',         display_order: 3 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Hands-on Activities',        description: 'Practical workshops, prototyping sessions, and live business experiments.',     display_order: 4 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Industry-Based Assignments', description: 'Assignments directly linked with current corporate models and market trends.',   display_order: 5 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Real-World Problem Solving', description: 'Tackling authentic organizational challenges using analytical frameworks.',      display_order: 6 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Presentation & Discussion',  description: 'Presenting solutions to peers and faculty to refine communication skills.',    display_order: 7 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Training-Based Learning',    description: 'Structured skill development sessions focused on core industry competencies.',  display_order: 8 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Teaching Quality',           description: 'Clear, well-structured lectures delivered with deep domain expertise.',         display_order: 9 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Doubt Clarity',              description: 'Prompt and clear resolution of concepts during and after lectures.',           display_order: 10 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Practical Examples',         description: 'Illustrating complex theoretical topics using clear corporate examples.',      display_order: 11 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Test & Assessment',          description: 'Fair, constructive evaluations that test actual subject mastery.',             display_order: 12 },
    { category_id: 'pedagogy', track: 'general', card_text: 'Interactive Classes',        description: 'Interactive sessions encouraging active participation and discussion.',          display_order: 13 },
  ], { onConflict: 'id', ignoreDuplicates: true });
  if (pedErr) { console.error('  ❌ Pedagogy cards error:', pedErr.message); } else { console.log('  ✅ Pedagogy cards seeded (13)'); }

  // ── Career & Industry Cards (6) ──────────────────────────────────────
  console.log('Seeding career & industry cards...');
  const { error: carErr } = await supabase.from('feedback_cards').upsert([
    { category_id: 'career', track: 'general', card_text: 'Live Industry Projects',   description: 'Working directly on live consulting or operational briefs for companies.',             display_order: 1 },
    { category_id: 'career', track: 'general', card_text: 'Internship Opportunities', description: 'Quality summer internship placements with leading organizations.',                    display_order: 2 },
    { category_id: 'career', track: 'general', card_text: 'Industry Expert Sessions', description: 'Deep-dive masterclasses delivered by C-suite executives and domain experts.',         display_order: 3 },
    { category_id: 'career', track: 'general', card_text: 'Company Visits',           description: 'Industrial tours and visits to corporate headquarters and manufacturing sites.',      display_order: 4 },
    { category_id: 'career', track: 'general', card_text: 'Professional Networking',  description: 'Platforms to connect with alumni, industry mentors, and recruiters.',                display_order: 5 },
    { category_id: 'career', track: 'general', card_text: 'Career-Focused Training',  description: 'Soft skills, resume building, mock interviews, and career coaching.',                display_order: 6 },
  ], { onConflict: 'id', ignoreDuplicates: true });
  if (carErr) { console.error('  ❌ Career cards error:', carErr.message); } else { console.log('  ✅ Career & Industry cards seeded (6)'); }

  // ── Campus Life Cards (6) ───────────────────────────────────────────
  console.log('Seeding campus life cards...');
  const { error: campErr } = await supabase.from('feedback_cards').upsert([
    { category_id: 'campus_life', track: 'general', card_text: 'Campus Events',            description: 'Vibrant flagship fests, academic conclaves, and management summits.',             display_order: 1 },
    { category_id: 'campus_life', track: 'general', card_text: 'Clubs & Communities',      description: 'Active interest clubs for marketing, finance, analytics, and leadership.',       display_order: 2 },
    { category_id: 'campus_life', track: 'general', card_text: 'Cultural Activities',      description: 'Music, dance, drama, and multicultural celebrations across the year.',            display_order: 3 },
    { category_id: 'campus_life', track: 'general', card_text: 'Cafeteria & Social Spaces',description: 'Hygienic dining areas, lounge zones, and comfortable food courts.',              display_order: 4 },
    { category_id: 'campus_life', track: 'general', card_text: 'Campus Environment',       description: 'Green, peaceful, safe, and inspiring campus surroundings.',                      display_order: 5 },
    { category_id: 'campus_life', track: 'general', card_text: 'Celebrations & Festivals', description: 'Joyful festival celebrations creating memorable campus experiences.',            display_order: 6 },
  ], { onConflict: 'id', ignoreDuplicates: true });
  if (campErr) { console.error('  ❌ Campus life cards error:', campErr.message); } else { console.log('  ✅ Campus Life cards seeded (6)'); }

  // ── Faculty Experience Cards (6) ────────────────────────────────────
  console.log('Seeding faculty feedback cards...');
  const { error: facCardErr } = await supabase.from('faculty_feedback_cards').upsert([
    { card_text: 'Mentorship & Guidance',      description: 'Personalized academic and career guidance provided by the faculty.',                  display_order: 1 },
    { card_text: 'Approachability',            description: 'Ease of approaching the faculty for queries, feedback, or support.',                   display_order: 2 },
    { card_text: 'Interactive Teaching',       description: 'Ability to create an engaging, dialogical classroom atmosphere.',                      display_order: 3 },
    { card_text: 'Practical Explanation',      description: 'Breaking down complex concepts with clear real-world business examples.',              display_order: 4 },
    { card_text: 'Individual Attention',       description: 'Recognizing individual learning needs and providing constructive feedback.',            display_order: 5 },
    { card_text: 'Motivation & Encouragement', description: 'Inspiring students to push boundaries and pursue excellence.',                         display_order: 6 },
  ], { onConflict: 'card_text', ignoreDuplicates: true });
  if (facCardErr) { console.error('  ❌ Faculty cards error:', facCardErr.message); } else { console.log('  ✅ Faculty experience cards seeded (6)'); }

  // ── Sample Faculty Members ───────────────────────────────────────────
  console.log('Seeding sample faculty members...');
  const { error: facErr } = await supabase.from('faculty').upsert([
    { faculty_name: 'Jeni Priya',   programme: 'RTC - RSMART MBA', year: 'First Year',  display_order: 1 },
    { faculty_name: 'Karnalingesh', programme: 'RTC - RSMART MBA', year: 'First Year',  display_order: 2 },
    { faculty_name: 'Jeni Priya',   programme: 'RTC - RSMART MBA', year: 'Second Year', display_order: 1 },
    { faculty_name: 'Karnalingesh', programme: 'RTC - RSMART MBA', year: 'Second Year', display_order: 2 },
    { faculty_name: 'Jeni Priya',   programme: 'RGU - RSMART MBA', year: 'First Year',  display_order: 1 },
    { faculty_name: 'Karnalingesh', programme: 'RGU - RSMART MBA', year: 'First Year',  display_order: 2 },
    { faculty_name: 'Jeni Priya',   programme: 'RGU - RSMART MBA', year: 'Second Year', display_order: 1 },
    { faculty_name: 'Karnalingesh', programme: 'RGU - RSMART MBA', year: 'Second Year', display_order: 2 },
  ], { onConflict: 'id', ignoreDuplicates: true });
  if (facErr) { console.error('  ❌ Faculty error:', facErr.message); } else { console.log('  ✅ Faculty members seeded (8)'); }

  console.log('\n✅ Seeding complete! Open http://localhost:3001 to test the application.');
}

seed().catch(console.error);
