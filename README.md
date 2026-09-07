# Student Happiness Index Portal

An interactive portal and survey application to measure, track, and improve student well-being and campus happiness metrics.

## Features

- **Interactive Survey / Feedback Flow**: Intuitive card-based sentiment evaluation across multiple categories.
- **Real-time Supabase Integration**: Cloud-backed feedback logging and analytical telemetry.
- **Standalone Mode Support**: Quick presentation and demo capabilities via self-contained builds.
- **Modern Responsive UI**: Built with React, Tailwind CSS, Lucide icons, and Framer Motion animations.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend / Database**: Supabase (PostgreSQL with Row Level Security)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/mullaisubramanian/student-happiness-index-portal.git
cd student-happiness-index-portal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```
Provide:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### 4. Run development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```
