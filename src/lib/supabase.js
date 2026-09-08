import { createClient } from '@supabase/supabase-js';

// Browser-safe environment variables only.
// NEVER use sb_secret_* or service_role keys here.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error(
    'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const SESSION_STORAGE_KEY = 'smart_happiness_session_id';

// --------------------------------------------------------------------
// SESSION MANAGEMENT (PRESERVES ANONYMOUS SESSION ID ON REFRESH)
// --------------------------------------------------------------------

export function getStoredSessionId() {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

export function saveStoredSessionId(sessionId) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch (e) {
    console.warn('Unable to store session ID:', e);
  }
}

export function clearStoredSessionId() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    // Ignore
  }
}

// --------------------------------------------------------------------
// SUPABASE ANONYMOUS SESSIONS
// --------------------------------------------------------------------

export async function createAnonymousSessionInSupabase(sessionPayload) {
  const newSessionId = crypto.randomUUID();
  const sessionData = {
    id: newSessionId,
    gender: sessionPayload.gender,
    programme: sessionPayload.programme,
    year: sessionPayload.year,
    learning_track: sessionPayload.learningTrack,
    started_at: new Date().toISOString(),
    status: 'in_progress',
  };

  const { data, error } = await supabase
    .from('anonymous_sessions')
    .insert([sessionData])
    .select()
    .single();

  if (error) {
    console.error('Supabase session creation error:', error);
    throw new Error(`Unable to create session in Supabase: ${error.message}`);
  }

  saveStoredSessionId(newSessionId);
  return {
    ...data,
    learningTrack: data.learning_track,
  };
}

export async function fetchSessionFromSupabase(sessionId) {
  if (!sessionId) return null;

  const { data, error } = await supabase
    .from('anonymous_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) {
    clearStoredSessionId();
    return null;
  }

  return {
    ...data,
    learningTrack: data.learning_track,
  };
}

// --------------------------------------------------------------------
// SUPABASE READ QUERIES (NO HARDCODED FALLBACKS)
// --------------------------------------------------------------------

export async function fetchCategoriesFromSupabase() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories from Supabase:', error);
    throw new Error(`Failed to load categories from Supabase: ${error.message}`);
  }

  return data || [];
}

export const OFFICIAL_PEDAGOGY_CARDS = {
  'Project-Based Learning': [
    { cardText: 'Case Study Learning', dbId: '521be268-043e-48d1-b376-ec3ce1879dab', description: 'Analyzing Harvard & real corporate case studies to build strategic thinking.' },
    { cardText: 'Business Simulation', dbId: '2dda8518-f4e8-49ca-a98f-00c05f9aab3e', description: 'Engaging in gamified business decision-making and market simulations.' },
    { cardText: 'Hands-on Activities', dbId: 'd01fc985-0bc4-4586-a58b-bb7bf86a2f29', description: 'Practical workshops, prototyping sessions, and live business experiments.' },
    { cardText: 'Industry-Based Assignments', dbId: 'dc9d6beb-5e0c-4f29-b8d1-23477ed493c9', description: 'Assignments directly linked with current corporate models and market trends.' },
    { cardText: 'Real-World Problem Solving', dbId: '07829f8f-4fda-4838-bb02-11db0b79cbb0', description: 'Tackling authentic organizational challenges using analytical frameworks.' },
    { cardText: 'Presentation & Discussion', dbId: 'eb7007d9-9d22-4eb2-8deb-dd753d019d60', description: 'Presenting solutions to peers and faculty to refine communication skills.' },
  ],
  'Training-Based Learning': [
    { cardText: 'Teaching Quality', dbId: 'e46757e7-b603-4449-ab59-33ff9b03b0ab', description: 'Clear, structured lectures delivered with deep domain expertise.' },
    { cardText: 'Doubt Clarity', dbId: 'e68fe72f-2705-4608-aab7-bb36b2e8c414', description: 'Prompt and clear resolution of concepts during and after lectures.' },
    { cardText: 'Practical Examples', dbId: 'cd034b49-67c5-4f96-b200-77be873c494e', description: 'Illustrating complex theoretical topics using clear corporate examples.' },
    { cardText: 'Test & Assessment', dbId: '40abcbd0-7794-423c-97cd-d0fe2144e2ec', description: 'Fair, constructive evaluations that test actual subject mastery.' },
    { cardText: 'Interactive Classes', dbId: '28145b63-8738-496f-97cd-c2bd916d3cd3', description: 'Interactive sessions encouraging active participation and discussion.' },
    { cardText: 'Classroom Engagement', dbId: '04568a3d-a719-4eb8-b97b-81085918b109', description: 'Active student participation, vibrant peer dialogue, and engaging learning atmosphere.' },
  ],
};

export const OFFICIAL_CATEGORY_CARDS = {
  institution: [
    { cardText: 'Campus Facilities', description: 'Modern infrastructure, clean classrooms, and comfortable study areas.' },
    { cardText: 'Classroom Environment', description: 'Interactive smart rooms with air conditioning and modern AV technology.' },
    { cardText: 'Learning Infrastructure', description: 'High-speed Wi-Fi, computer labs, and digital learning management tools.' },
    { cardText: 'Academic Support', description: 'Remedial sessions, mentoring programs, and academic guidance.' },
    { cardText: 'Student-Friendly Services', description: 'Empathetic campus policies, transparent feedback mechanisms, and welfare.' },
    { cardText: 'Research Resources', description: 'Support for academic papers, case studies, and research publications.' },
  ],
  pedagogy: [
    ...OFFICIAL_PEDAGOGY_CARDS['Project-Based Learning'],
    ...OFFICIAL_PEDAGOGY_CARDS['Training-Based Learning'],
  ],
  career: [
    { cardText: 'Live Industry Projects', description: 'Working directly on live consulting or operational briefs for companies.' },
    { cardText: 'Internship Opportunities', description: 'Quality summer internship placements with leading organizations.' },
    { cardText: 'Industry Expert Sessions', description: 'Deep-dive masterclasses delivered by C-suite executives and experts.' },
    { cardText: 'Company Visits', description: 'Industrial tours and visits to corporate headquarters and factories.' },
    { cardText: 'Professional Networking', description: 'Platforms to connect with alumni, industry mentors, and recruiters.' },
    { cardText: 'Career-Focused Training', description: 'Soft skills, resume building, mock interviews, and career coaching.' },
  ],
  campus_life: [
    { cardText: 'Campus Events', description: 'Vibrant flagship fests, academic conclaves, and management summits.' },
    { cardText: 'Clubs & Communities', description: 'Active interest clubs for marketing, finance, analytics, and leadership.' },
    { cardText: 'Cultural Activities', description: 'Music, dance, drama, and multicultural celebrations across the year.' },
    { cardText: 'Cafeteria & Social Spaces', description: 'Hygienic dining areas, lounge zones, and comfortable food courts.' },
    { cardText: 'Campus Environment', description: 'Green, peaceful, safe, and inspiring campus surroundings.' },
    { cardText: 'Celebrations & Festivals', description: 'Joyful festival celebrations creating memorable campus experiences.' },
  ],
};

export const OFFICIAL_FACULTY_EXPERIENCE_CARDS = [
  { cardText: 'Mentorship & Guidance', description: 'Personalized academic and career guidance provided by the faculty.' },
  { cardText: 'Approachability', description: 'Ease of approaching the faculty for queries, feedback, or support.' },
  { cardText: 'Interactive Teaching', description: 'Ability to create an engaging, dialogical classroom atmosphere.' },
  { cardText: 'Practical Explanation', description: 'Breaking down complex concepts with clear real-world business examples.' },
  { cardText: 'Individual Attention', description: 'Recognizing individual learning needs and providing constructive feedback.' },
  { cardText: 'Motivation & Encouragement', description: 'Inspiring students to push boundaries and pursue excellence.' },
];

export async function fetchFeedbackCardsFromSupabase(categoryId, track) {
  let query = supabase
    .from('feedback_cards')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching feedback cards from Supabase:', error);
    throw new Error(`Failed to load feedback cards from Supabase: ${error.message}`);
  }

  const dbCards = data || [];

  // Map to the exact official cards for the requested category or all categories
  const targetCategories = categoryId ? [categoryId] : Object.keys(OFFICIAL_CATEGORY_CARDS);
  const resolvedCards = [];

  for (const catId of targetCategories) {
    let officialList = OFFICIAL_CATEGORY_CARDS[catId] || [];
    let catDbCards = dbCards.filter(c => c.category_id === catId);

    if (catId === 'pedagogy') {
      const selectedTrack = (track && track.includes('Train'))
        ? 'Training-Based Learning'
        : 'Project-Based Learning';
      officialList = OFFICIAL_PEDAGOGY_CARDS[selectedTrack];
      const targetDbTrack = selectedTrack === 'Training-Based Learning' ? 'training' : 'project';
      catDbCards = catDbCards.filter(c => c.track === targetDbTrack);
    }

    const usedDbCardIds = new Set();

    officialList.forEach((officialCard, idx) => {
      // 1. Direct match by verified DB UUID
      let match = null;
      if (officialCard.dbId) {
        match = catDbCards.find(c => c.id === officialCard.dbId);
      }

      // 2. Direct match by card text within the track
      if (!match) {
        match = catDbCards.find(c => {
          if (usedDbCardIds.has(c.id) || !c.card_text) return false;
          const dbText = c.card_text.toLowerCase().trim();
          const offText = officialCard.cardText.toLowerCase().trim();
          return (
            dbText === offText ||
            (offText === 'interactive classes' && (dbText === 'interactive classes' || dbText === 'training-based learning'))
          );
        });
      }

      // 3. Fallback within the SAME track
      if (!match) {
        match = catDbCards.find(c => !usedDbCardIds.has(c.id));
      }

      const cardId = match?.id || officialCard.dbId || `${catId}-${idx + 1}`;
      if (match) {
        usedDbCardIds.add(match.id);
      } else if (officialCard.dbId) {
        usedDbCardIds.add(officialCard.dbId);
      }

      resolvedCards.push({
        id: cardId,
        categoryId: catId,
        track: catId === 'pedagogy' ? ((track && track.includes('Train')) ? 'Training-Based Learning' : 'Project-Based Learning') : 'general',
        cardText: officialCard.cardText,
        description: officialCard.description,
        displayOrder: idx + 1,
      });
    });
  }

  return resolvedCards;
}

export function normalizeFacultyName(name, displayOrder = 1) {
  if (!name) return displayOrder === 1 ? 'Jenipriya' : 'Karanalingesh';
  const lower = name.toLowerCase().trim();
  if (lower.includes('jeni')) return 'Jenipriya';
  if (lower.includes('karan') || lower.includes('karn')) return 'Karanalingesh';
  return displayOrder === 1 ? 'Jenipriya' : 'Karanalingesh';
}

export async function fetchFacultyFromSupabase(programme, year) {
  let query = supabase
    .from('faculty')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (programme) {
    query = query.eq('programme', programme);
  }
  if (year) {
    query = query.eq('year', year);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching faculty from Supabase:', error);
    throw new Error(`Failed to load faculty from Supabase: ${error.message}`);
  }

  // Strictly cap at the 2 current eligible faculty for this cohort
  const eligibleData = (data || []).slice(0, 2);

  return eligibleData.map((f, idx) => ({
    id: f.id,
    facultyName: normalizeFacultyName(f.faculty_name, f.display_order || idx + 1),
    programme: f.programme,
    year: f.year,
    active: f.active,
    displayOrder: f.display_order || idx + 1,
  }));
}

export async function fetchFacultyCardsFromSupabase() {
  const { data, error } = await supabase
    .from('faculty_feedback_cards')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching faculty cards from Supabase:', error);
    throw new Error(`Failed to load faculty experience cards from Supabase: ${error.message}`);
  }

  const dbCards = data || [];
  const usedFacultyCardIds = new Set();

  // Return the exact 6 official faculty experience cards, resolving unique DB UUIDs
  return OFFICIAL_FACULTY_EXPERIENCE_CARDS.map((fc, idx) => {
    let match = dbCards.find(
      c => !usedFacultyCardIds.has(c.id) && c.card_text && c.card_text.toLowerCase().trim() === fc.cardText.toLowerCase().trim()
    );

    if (!match) {
      match = dbCards.find(c => !usedFacultyCardIds.has(c.id));
    }

    if (match) {
      usedFacultyCardIds.add(match.id);
    }

    return {
      id: match?.id || `fac-card-${idx + 1}`,
      cardText: fc.cardText,
      description: fc.description,
      displayOrder: idx + 1,
    };
  });
}

// --------------------------------------------------------------------
// SUPABASE RESPONSES WRITE & READ
// --------------------------------------------------------------------

export async function saveResponseToSupabase(payload) {
  if (payload.categoryId === 'faculty') {
    if (!payload.facultyId) {
      console.error('saveResponseToSupabase: Rejected faculty response with missing facultyId:', payload);
      throw new Error('Faculty response rejected: facultyId is required.');
    }
    if (!payload.facultyCardId) {
      console.error('saveResponseToSupabase: Rejected faculty response with missing facultyCardId:', payload);
      throw new Error('Faculty response rejected: facultyCardId is required.');
    }
  }

  const record = {
    id: crypto.randomUUID(),
    session_id: payload.sessionId,
    category_id: payload.categoryId,
    response: payload.response,
    score: payload.response === 'positive' ? 1 : 0,
    answered_at: new Date().toISOString(),
  };

  let cardId = payload.categoryId === 'faculty' ? null : payload.cardId;
  if (payload.categoryId === 'pedagogy' && (!cardId || cardId.startsWith('ped-'))) {
    for (const trackList of Object.values(OFFICIAL_PEDAGOGY_CARDS)) {
      const match = trackList.find(c => c.cardText.toLowerCase().trim() === (payload.cardText || '').toLowerCase().trim());
      if (match?.dbId) {
        cardId = match.dbId;
        break;
      }
    }
  }

  if (cardId) record.feedback_card_id = cardId;
  if (payload.categoryId === 'faculty' && payload.facultyId) record.faculty_id = payload.facultyId;
  if (payload.categoryId === 'faculty' && payload.facultyCardId) record.faculty_card_id = payload.facultyCardId;

  // Use insert with ignoreDuplicates — the NULLS NOT DISTINCT unique constraint
  // means two rows with the same (session_id, category_id, card_id, NULL, NULL)
  // are duplicates. ignoreDuplicates silently skips conflicts instead of 409-ing.
  const { data, error } = await supabase
    .from('feedback_responses')
    .insert(record, { ignoreDuplicates: false })
    .select()
    .single();

  if (error) {
    // If it's a duplicate, fetch the existing row and return it (idempotent)
    if (error.code === '23505') {
      console.warn('Duplicate response detected — fetching existing row.');
      let existingQuery = supabase
        .from('feedback_responses')
        .select('*')
        .eq('session_id', record.session_id)
        .eq('category_id', record.category_id);

      if (record.feedback_card_id) {
        existingQuery = existingQuery.eq('feedback_card_id', record.feedback_card_id);
      } else {
        existingQuery = existingQuery.is('feedback_card_id', null);
      }
      if (record.faculty_id) {
        existingQuery = existingQuery.eq('faculty_id', record.faculty_id);
      } else {
        existingQuery = existingQuery.is('faculty_id', null);
      }
      if (record.faculty_card_id) {
        existingQuery = existingQuery.eq('faculty_card_id', record.faculty_card_id);
      } else {
        existingQuery = existingQuery.is('faculty_card_id', null);
      }

      const { data: existing, error: fetchErr } = await existingQuery.maybeSingle();

      if (fetchErr || !existing) {
        console.error('Supabase fetch existing error:', fetchErr);
        throw new Error(`Failed to save response: ${error.message}`);
      }

      return {
        id: existing.id,
        sessionId: existing.session_id,
        categoryId: existing.category_id,
        cardId: existing.feedback_card_id,
        facultyId: existing.faculty_id,
        facultyCardId: existing.faculty_card_id,
        cardText: payload.cardText,
        response: existing.response,
        score: existing.score,
        answeredAt: existing.answered_at,
      };
    }

    // Any other error — surface it clearly
    console.error('Supabase INSERT error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Failed to save response to Supabase: ${error.message}`);
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    categoryId: data.category_id,
    cardId: data.feedback_card_id,
    facultyId: data.faculty_id,
    facultyCardId: data.faculty_card_id,
    cardText: payload.cardText,
    response: data.response,
    score: data.score,
    answeredAt: data.answered_at,
  };
}


export async function fetchResponsesFromSupabase(sessionId) {
  if (!sessionId) return [];

  const { data, error } = await supabase
    .from('feedback_responses')
    .select('*')
    .eq('session_id', sessionId);

  if (error || !data) {
    console.warn('Error fetching responses from Supabase:', error);
    return [];
  }

  return data.map(r => ({
    id: r.id,
    sessionId: r.session_id,
    categoryId: r.category_id,
    cardId: r.feedback_card_id,
    facultyId: r.faculty_id,
    facultyCardId: r.faculty_card_id,
    response: r.response,
    score: r.score,
    answeredAt: r.answered_at,
  }));
}

export async function completeSessionInSupabase(sessionId) {
  clearStoredSessionId();
  const { error } = await supabase
    .from('anonymous_sessions')
    .update({
      completed_at: new Date().toISOString(),
      status: 'completed',
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error completing session in Supabase:', error);
  }
}
