// ====================================================================
// INSTITUTIONAL FEEDBACK SOURCE OF TRUTH (SMART / Intellect Cohort)
// ====================================================================

export const OFFICIAL_CATEGORIES = [
  {
    id: 'institution',
    name: 'INSTITUTION',
    description: 'Campus and academic environment',
    icon: 'Building2',
    displayOrder: 1,
  },
  {
    id: 'pedagogy',
    name: 'PEDAGOGY',
    description: 'How learning happens',
    icon: 'BookOpenCheck',
    displayOrder: 2,
  },
  {
    id: 'faculty',
    name: 'FACULTY',
    description: 'Your faculty experience',
    icon: 'Users',
    displayOrder: 3,
  },
  {
    id: 'career',
    name: 'CAREER & INDUSTRY',
    description: 'Industry and career exposure',
    icon: 'Briefcase',
    displayOrder: 4,
  },
  {
    id: 'campus_life',
    name: 'CAMPUS LIFE',
    description: 'Your experience beyond the classroom',
    icon: 'Sparkles',
    displayOrder: 5,
  },
];

export const OFFICIAL_PEDAGOGY_CARDS = {
  'Project-Based Learning': [
    { id: '521be268-043e-48d1-b376-ec3ce1879dab', categoryId: 'pedagogy', track: 'Project-Based Learning', cardText: 'Case Study Learning', description: 'Analyzing Harvard & real corporate case studies to build strategic thinking.' },
    { id: '2dda8518-f4e8-49ca-a98f-00c05f9aab3e', categoryId: 'pedagogy', track: 'Project-Based Learning', cardText: 'Business Simulation', description: 'Engaging in gamified business decision-making and market simulations.' },
    { id: 'd01fc985-0bc4-4586-a58b-bb7bf86a2f29', categoryId: 'pedagogy', track: 'Project-Based Learning', cardText: 'Hands-on Activities', description: 'Practical workshops, prototyping sessions, and live business experiments.' },
    { id: 'dc9d6beb-5e0c-4f29-b8d1-23477ed493c9', categoryId: 'pedagogy', track: 'Project-Based Learning', cardText: 'Industry-Based Assignments', description: 'Assignments directly linked with current corporate models and market trends.' },
    { id: '07829f8f-4fda-4838-bb02-11db0b79cbb0', categoryId: 'pedagogy', track: 'Project-Based Learning', cardText: 'Real-World Problem Solving', description: 'Tackling authentic organizational challenges using analytical frameworks.' },
    { id: 'eb7007d9-9d22-4eb2-8deb-dd753d019d60', categoryId: 'pedagogy', track: 'Project-Based Learning', cardText: 'Presentation & Discussion', description: 'Presenting solutions to peers and faculty to refine communication skills.' },
  ],
  'Training-Based Learning': [
    { id: 'e46757e7-b603-4449-ab59-33ff9b03b0ab', categoryId: 'pedagogy', track: 'Training-Based Learning', cardText: 'Teaching Quality', description: 'Clear, structured lectures delivered with deep domain expertise.' },
    { id: 'e68fe72f-2705-4608-aab7-bb36b2e8c414', categoryId: 'pedagogy', track: 'Training-Based Learning', cardText: 'Doubt Clarity', description: 'Prompt and clear resolution of concepts during and after lectures.' },
    { id: 'cd034b49-67c5-4f96-b200-77be873c494e', categoryId: 'pedagogy', track: 'Training-Based Learning', cardText: 'Practical Examples', description: 'Illustrating complex theoretical topics using clear corporate examples.' },
    { id: '40abcbd0-7794-423c-97cd-d0fe2144e2ec', categoryId: 'pedagogy', track: 'Training-Based Learning', cardText: 'Test & Assessment', description: 'Fair, constructive evaluations that test actual subject mastery.' },
    { id: '28145b63-8738-496f-97cd-c2bd916d3cd3', categoryId: 'pedagogy', track: 'Training-Based Learning', cardText: 'Interactive Classes', description: 'Interactive sessions encouraging active participation and discussion.' },
    { id: '04568a3d-a719-4eb8-b97b-81085918b109', categoryId: 'pedagogy', track: 'Training-Based Learning', cardText: 'Classroom Engagement', description: 'Active student participation, vibrant peer dialogue, and engaging learning atmosphere.' },
  ],
};

export const OFFICIAL_FEEDBACK_CARDS = {
  institution: [
    { id: 'inst-1', categoryId: 'institution', track: 'general', cardText: 'Campus Facilities', description: 'Modern infrastructure, clean classrooms, and comfortable study areas.' },
    { id: 'inst-2', categoryId: 'institution', track: 'general', cardText: 'Classroom Environment', description: 'Interactive smart rooms with air conditioning and modern AV technology.' },
    { id: 'inst-3', categoryId: 'institution', track: 'general', cardText: 'Learning Infrastructure', description: 'High-speed Wi-Fi, computer labs, and digital learning management tools.' },
    { id: 'inst-4', categoryId: 'institution', track: 'general', cardText: 'Academic Support', description: 'Remedial sessions, mentoring programs, and academic guidance.' },
    { id: 'inst-5', categoryId: 'institution', track: 'general', cardText: 'Student-Friendly Services', description: 'Empathetic campus policies, transparent feedback mechanisms, and welfare.' },
    { id: 'inst-6', categoryId: 'institution', track: 'general', cardText: 'Research Resources', description: 'Support for academic papers, case studies, and research publications.' },
  ],
  pedagogy: [
    ...OFFICIAL_PEDAGOGY_CARDS['Project-Based Learning'],
    ...OFFICIAL_PEDAGOGY_CARDS['Training-Based Learning'],
  ],
  career: [
    { id: 'car-1', categoryId: 'career', track: 'general', cardText: 'Live Industry Projects', description: 'Working directly on live consulting or operational briefs for companies.' },
    { id: 'car-2', categoryId: 'career', track: 'general', cardText: 'Internship Opportunities', description: 'Quality summer internship placements with leading organizations.' },
    { id: 'car-3', categoryId: 'career', track: 'general', cardText: 'Industry Expert Sessions', description: 'Deep-dive masterclasses delivered by C-suite executives and experts.' },
    { id: 'car-4', categoryId: 'career', track: 'general', cardText: 'Company Visits', description: 'Industrial tours and visits to corporate headquarters and factories.' },
    { id: 'car-5', categoryId: 'career', track: 'general', cardText: 'Professional Networking', description: 'Platforms to connect with alumni, industry mentors, and recruiters.' },
    { id: 'car-6', categoryId: 'career', track: 'general', cardText: 'Career-Focused Training', description: 'Soft skills, resume building, mock interviews, and career coaching.' },
  ],
  campus_life: [
    { id: 'camp-1', categoryId: 'campus_life', track: 'general', cardText: 'Campus Events', description: 'Vibrant flagship fests, academic conclaves, and management summits.' },
    { id: 'camp-2', categoryId: 'campus_life', track: 'general', cardText: 'Clubs & Communities', description: 'Active interest clubs for marketing, finance, analytics, and leadership.' },
    { id: 'camp-3', categoryId: 'campus_life', track: 'general', cardText: 'Cultural Activities', description: 'Music, dance, drama, and multicultural celebrations across the year.' },
    { id: 'camp-4', categoryId: 'campus_life', track: 'general', cardText: 'Cafeteria & Social Spaces', description: 'Hygienic dining areas, lounge zones, and comfortable food courts.' },
    { id: 'camp-5', categoryId: 'campus_life', track: 'general', cardText: 'Campus Environment', description: 'Green, peaceful, safe, and inspiring campus surroundings.' },
    { id: 'camp-6', categoryId: 'campus_life', track: 'general', cardText: 'Celebrations & Festivals', description: 'Joyful festival celebrations creating memorable campus experiences.' },
  ],
};

OFFICIAL_FEEDBACK_CARDS.pedagogy['Project-Based Learning'] = OFFICIAL_PEDAGOGY_CARDS['Project-Based Learning'];
OFFICIAL_FEEDBACK_CARDS.pedagogy['Training-Based Learning'] = OFFICIAL_PEDAGOGY_CARDS['Training-Based Learning'];

export const OFFICIAL_FACULTY_CARDS = [
  { id: 'fac-card-1', cardText: 'Mentorship & Guidance', description: 'Personalized academic and career guidance provided by the faculty.' },
  { id: 'fac-card-2', cardText: 'Approachability', description: 'Ease of approaching the faculty for queries, feedback, or support.' },
  { id: 'fac-card-3', cardText: 'Interactive Teaching', description: 'Ability to create an engaging, dialogical classroom atmosphere.' },
  { id: 'fac-card-4', cardText: 'Practical Explanation', description: 'Breaking down complex concepts with clear real-world business examples.' },
  { id: 'fac-card-5', cardText: 'Individual Attention', description: 'Recognizing individual learning needs and providing constructive feedback.' },
  { id: 'fac-card-6', cardText: 'Motivation & Encouragement', description: 'Inspiring students to push boundaries and pursue excellence.' },
];

export const INITIAL_FACULTY_LIST = [
  { id: 'fac-1', facultyName: 'Jenipriya', programme: 'RTC - RSMART MBA', year: 'First Year', active: true, displayOrder: 1 },
  { id: 'fac-2', facultyName: 'Karanalingesh', programme: 'RTC - RSMART MBA', year: 'First Year', active: true, displayOrder: 2 },
  { id: 'fac-3', facultyName: 'Jenipriya', programme: 'RTC - RSMART MBA', year: 'Second Year', active: true, displayOrder: 1 },
  { id: 'fac-4', facultyName: 'Karanalingesh', programme: 'RTC - RSMART MBA', year: 'Second Year', active: true, displayOrder: 2 },
  { id: 'fac-5', facultyName: 'Jenipriya', programme: 'RGU - RSMART MBA', year: 'First Year', active: true, displayOrder: 1 },
  { id: 'fac-6', facultyName: 'Karanalingesh', programme: 'RGU - RSMART MBA', year: 'First Year', active: true, displayOrder: 2 },
  { id: 'fac-7', facultyName: 'Jenipriya', programme: 'RGU - RSMART MBA', year: 'Second Year', active: true, displayOrder: 1 },
  { id: 'fac-8', facultyName: 'Karanalingesh', programme: 'RGU - RSMART MBA', year: 'Second Year', active: true, displayOrder: 2 },
];
