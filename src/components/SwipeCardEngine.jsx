import React, { useState, useEffect, useRef, useCallback } from 'react';

// Category Rich Full-Card Gradient Maps
const CATEGORY_GRADIENTS = {
  institution: 'bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-900',
  pedagogy: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950',
  faculty: 'bg-gradient-to-br from-orange-500 via-amber-600 to-rose-700',
  career: 'bg-gradient-to-br from-blue-600 via-sky-700 to-indigo-950',
  campus_life: 'bg-gradient-to-br from-pink-600 via-rose-600 to-purple-900',
};

const CATEGORY_ICONS = {
  institution: (
    <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  pedagogy: (
    <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  faculty: (
    <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  career: (
    <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  campus_life: (
    <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const SWIPE_THRESHOLD = 95; // px to trigger a swipe

export default function SwipeCardEngine({
  cards,
  currentIndex,
  categoryTitle,
  trackTitle,
  onSwipe,             // async fn — must resolve/reject after Supabase write
  onBackToCategories,
  isSavingExternal,    // optional: external saving lock (e.g. from FacultySelectionFlow)
}) {
  const cardRef = useRef(null);
  const dragState = useRef({ active: false, startX: 0, startY: 0, currentX: 0 });

  // Visual state during drag
  const [dragX, setDragX] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(null); // 'left' | 'right' | null
  const [isSaving, setIsSaving] = useState(false);
  const [isSnappingBack, setIsSnappingBack] = useState(false);

  // Particles
  const [heartParticles, setHeartParticles] = useState([]);
  const [xParticles, setXParticles] = useState([]);

  const currentCard = cards[currentIndex];
  const nextCard = cards[currentIndex + 1];
  const thirdCard = cards[currentIndex + 2];

  const totalFormatted = String(cards.length).padStart(2, '0');
  const currentFormatted = String(currentIndex + 1).padStart(2, '0');

  // Match category gradient key safely
  const rawCatKey = (categoryTitle || '').toLowerCase();
  const matchedKey =
    rawCatKey.includes('pedagogy') ? 'pedagogy' :
    rawCatKey.includes('faculty') ? 'faculty' :
    rawCatKey.includes('career') ? 'career' :
    rawCatKey.includes('campus') ? 'campus_life' :
    'institution';

  const cardGradientClass = CATEGORY_GRADIENTS[matchedKey] || CATEGORY_GRADIENTS.institution;
  const categoryIcon = CATEGORY_ICONS[matchedKey] || CATEGORY_ICONS.institution;

  const formattedCategoryName = (
    categoryTitle?.includes(':') ? categoryTitle.split(':')[0] :
    matchedKey === 'pedagogy' ? 'PEDAGOGY' :
    matchedKey === 'faculty' ? 'FACULTY' :
    matchedKey === 'career' ? 'CAREER & INDUSTRY' :
    matchedKey === 'campus_life' ? 'CAMPUS LIFE' :
    'INSTITUTION'
  );

  // Explicit directional opacities — no sign ambiguity
  // RIGHT drag (dragX > 0) → positive / green
  // LEFT drag (dragX < 0) → negative / red
  const rightAmount = Math.min(1, Math.max(0, dragX / SWIPE_THRESHOLD));
  const leftAmount = Math.min(1, Math.max(0, -dragX / SWIPE_THRESHOLD));

  // Card transform & rotation
  const rotation = dragX * 0.08;
  const cardTransform = isAnimatingOut
    ? isAnimatingOut === 'right'
      ? 'translateX(160vw) rotate(30deg)'
      : 'translateX(-160vw) rotate(-30deg)'
    : `translateX(${dragX}px) rotate(${rotation}deg)`;

  const cardTransition = isAnimatingOut
    ? 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease-out'
    : isSnappingBack
    ? 'transform 0.22s ease-out'
    : 'none';

// Category Heart Colors Palette
const CATEGORY_HEART_COLORS = {
  institution: ['#9333EA', '#A855F7', '#C084FC', '#7E22CE'],
  pedagogy: ['#10B981', '#34D399', '#059669', '#6EE7B7'],
  faculty: ['#F97316', '#FB923C', '#EA580C', '#FDBA74'],
  career: ['#3B82F6', '#60A5FA', '#2563EB', '#93C5FD'],
  campus_life: ['#EC4899', '#F472B6', '#DB2777', '#F43F5E'],
};

  // Spawn Heart Particle Celebration (Right Swipe)
  const spawnHearts = useCallback(() => {
    const palette = CATEGORY_HEART_COLORS[matchedKey] || CATEGORY_HEART_COLORS.institution;
    const particles = Array.from({ length: 18 }).map((_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      tx: `${(Math.random() - 0.3) * 200}px`,
      ty: `-${70 + Math.random() * 140}px`,
      rot: `${(Math.random() - 0.5) * 70}deg`,
      size: 14 + Math.random() * 16,
      duration: 0.65 + Math.random() * 0.45,
      color: palette[Math.floor(Math.random() * palette.length)],
      left: `${50 + (Math.random() - 0.3) * 30}%`,
      top: `${45 + (Math.random() - 0.3) * 20}%`,
    }));
    setHeartParticles(particles);
    setTimeout(() => setHeartParticles([]), 1100);
  }, [matchedKey]);

  // Spawn X Particle Burst (Left Swipe)
  const spawnXParticles = useCallback(() => {
    const particles = Array.from({ length: 12 }).map((_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      tx: `${-(50 + Math.random() * 150)}px`,
      ty: `${(Math.random() - 0.5) * 140}px`,
      rot: `${(Math.random() - 0.5) * 120}deg`,
      size: 14 + Math.random() * 14,
      duration: 0.55 + Math.random() * 0.4,
      color: Math.random() > 0.3 ? '#F43F5E' : '#FB7185',
      left: `${40 + (Math.random() - 0.5) * 30}%`,
      top: `${45 + (Math.random() - 0.3) * 20}%`,
    }));
    setXParticles(particles);
    setTimeout(() => setXParticles([]), 1000);
  }, []);

  const isTransitioningRef = useRef(false);

  // ── Trigger swipe — immediate smooth flyout, then commit advance ───
  const triggerSwipe = useCallback((direction) => {
    if (isTransitioningRef.current || isAnimatingOut || !currentCard) return;
    isTransitioningRef.current = true;

    if (direction === 'right') {
      spawnHearts();
    } else {
      spawnXParticles();
    }

    const response = direction === 'right' ? 'positive' : 'negative';

    // 1. Immediately launch flyout animation
    setIsAnimatingOut(direction);

    // 2. After 260ms (card has exited viewport), commit response and advance
    setTimeout(async () => {
      try {
        await onSwipe(response, currentCard);
      } catch (err) {
        console.error('Swipe save error:', err);
      } finally {
        isTransitioningRef.current = false;
      }
    }, 260);
  }, [currentCard, isAnimatingOut, onSwipe, spawnHearts, spawnXParticles]);

  // Reset when card changes
  useEffect(() => {
    setDragX(0);
    setIsAnimatingOut(null);
    setIsSaving(false);
    isTransitioningRef.current = false;
    dragState.current = { active: false, startX: 0, startY: 0, currentX: 0 };
  }, [currentIndex]);

  // Keyboard fallback
  useEffect(() => {
    const onKey = (e) => {
      if (isTransitioningRef.current || isAnimatingOut) return;
      if (e.key === 'ArrowRight') triggerSwipe('right');
      if (e.key === 'ArrowLeft') triggerSwipe('left');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [triggerSwipe, isAnimatingOut]);

  // Pointer event handlers
  const onPointerDown = useCallback((e) => {
    if (isTransitioningRef.current || isAnimatingOut) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: 0,
    };
  }, [isAnimatingOut]);

  const onPointerMove = useCallback((e) => {
    if (!dragState.current.active) return;
    const dx = e.clientX - dragState.current.startX;
    dragState.current.currentX = dx;
    setDragX(dx);
  }, []);

  const onPointerUp = useCallback((e) => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    const dx = dragState.current.currentX;

    if (dx > SWIPE_THRESHOLD) {
      triggerSwipe('right');
    } else if (dx < -SWIPE_THRESHOLD) {
      triggerSwipe('left');
    } else {
      // Snap back smoothly
      setDragX(0);
    }
  }, [triggerSwipe]);

  const onPointerCancel = useCallback(() => {
    dragState.current.active = false;
    setDragX(0);
  }, []);

  if (!currentCard) return null;

  return (
    <div className="max-w-md mx-auto px-4 py-2 flex flex-col items-center select-none relative" style={{ minHeight: '82vh' }}>
      {/* Dynamic Particle Bursts */}
      {heartParticles.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none fixed z-50 animate-particle"
          style={{
            left: p.left,
            top: p.top,
            '--tx': p.tx,
            '--ty': p.ty,
            '--rot': p.rot,
            animationDuration: `${p.duration}s`,
          }}
        >
          <svg
            style={{ width: `${p.size}px`, height: `${p.size}px`, color: p.color }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}

      {xParticles.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none fixed z-50 animate-particle"
          style={{
            left: p.left,
            top: p.top,
            '--tx': p.tx,
            '--ty': p.ty,
            '--rot': p.rot,
            animationDuration: `${p.duration}s`,
          }}
        >
          <svg
            style={{ width: `${p.size}px`, height: `${p.size}px`, color: p.color }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ))}

      {/* Top Category Controls Row */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBackToCategories}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-700 bg-white/90 border border-slate-200/80 px-3.5 py-1.5 rounded-xl shadow-sm transition-all hover:bg-purple-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Categories</span>
        </button>
        {trackTitle && (
          <span className="text-xs font-bold text-slate-700 bg-white/90 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-sm">
            {trackTitle}
          </span>
        )}
        <span className="text-xs font-bold text-slate-500 bg-white/90 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-sm">
          {currentFormatted} / {totalFormatted}
        </span>
      </div>

      {/* Card Stack Area */}
      <div className="w-full relative flex items-center justify-center" style={{ height: '480px' }}>
        
        {/* 3rd Background Depth Card */}
        {thirdCard && (
          <div
            className={`absolute w-full rounded-[2.5rem] shadow-md pointer-events-none ${cardGradientClass}`}
            style={{
              height: '450px',
              top: '28px',
              transform: 'scale(0.88)',
              opacity: 0.35,
              filter: 'blur(0.5px)',
            }}
          />
        )}

        {/* 2nd Background Depth Card (Real Upcoming Card Preview) */}
        {nextCard && (
          <div
            className={`absolute top-0 w-full rounded-[2.5rem] border border-white/20 text-white flex flex-col justify-between overflow-hidden shadow-xl pointer-events-none ${cardGradientClass}`}
            style={{
              height: '470px',
              transform: isAnimatingOut
                ? 'scale(1) translateY(0)'
                : `scale(${0.94 + Math.min(0.06, Math.abs(dragX) * 0.0006)}) translateY(${Math.max(0, 14 - Math.abs(dragX) * 0.1)}px)`,
              opacity: isAnimatingOut ? 1 : 0.85 + Math.min(0.15, Math.abs(dragX) * 0.0015),
              transition: isAnimatingOut
                ? 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s'
                : 'transform 0.1s ease-out, opacity 0.1s ease-out',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent pointer-events-none z-0" />

            <div className="relative z-10 p-7 pb-2 flex items-center justify-center">
              <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-[14px] px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
                {formattedCategoryName}
              </span>
            </div>

            <div className="relative z-10 px-7 py-3 text-center my-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-4 shadow-inner">
                {categoryIcon}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-2 drop-shadow-md">
                {nextCard.cardText}
              </h2>

              <div className="mt-2 max-w-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 block mb-1">
                  {formattedCategoryName}
                </span>
                <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed drop-shadow-sm">
                  {nextCard.description}
                </p>
              </div>
            </div>

            <div className="relative z-10 p-6 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white/70">
              <span className="flex items-center gap-1.5">← I don't like it</span>
              <span className="flex items-center gap-1.5">I like it →</span>
            </div>
          </div>
        )}

        {/* ── Active Draggable Card ── */}
        <div
          key={currentCard?.id}
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          className={`absolute top-0 w-full rounded-[2.5rem] border border-white/20 text-white flex flex-col justify-between overflow-hidden ${cardGradientClass}`}
          style={{
            height: '470px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            transform: cardTransform,
            transition: cardTransition,
            opacity: isAnimatingOut ? 0 : 1,
            cursor: dragState.current.active ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            willChange: 'transform, opacity',
          }}
        >
          {/* Subtle dark bottom gradient overlay for readable text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent pointer-events-none z-0" />

          {/* ── RIGHT drag → GREEN "I LIKE IT" STAMP (ONLY when dragX > 0) ── */}
          <div
            className="absolute top-8 right-6 z-30 pointer-events-none flex flex-col items-center gap-1.5"
            style={{
              opacity: rightAmount,
              transform: `scale(${0.8 + rightAmount * 0.3}) rotate(12deg)`,
              transition: 'opacity 0.05s',
            }}
          >
            <div className="bg-emerald-500 text-white text-xs sm:text-sm font-black px-4 py-2 rounded-2xl shadow-2xl border-2 border-emerald-300 tracking-wider flex items-center gap-2">
              <svg className="w-5 h-5 text-white animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>I LIKE IT</span>
            </div>
          </div>

          {/* ── LEFT drag → RED "I DON'T LIKE IT" STAMP (ONLY when dragX < 0) ── */}
          <div
            className="absolute top-8 left-6 z-30 pointer-events-none flex flex-col items-center gap-1.5"
            style={{
              opacity: leftAmount,
              transform: `scale(${0.8 + leftAmount * 0.3}) rotate(-12deg)`,
              transition: 'opacity 0.05s',
            }}
          >
            <div className="bg-rose-500 text-white text-xs sm:text-sm font-black px-4 py-2 rounded-2xl shadow-2xl border-2 border-rose-300 tracking-wider flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>I DON'T LIKE IT</span>
            </div>
          </div>

          {/* Saving Overlay */}
          {isSaving && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 rounded-[2.5rem]">
              <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-purple-900 font-extrabold text-sm">
                <svg className="w-5 h-5 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Recording response...</span>
              </div>
            </div>
          )}

          {/* Card Top: Category Glass Label Centered */}
          <div className="relative z-10 p-7 pb-2 flex items-center justify-center">
            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-[14px] px-4 py-2 rounded-full uppercase tracking-wider shadow-sm min-h-[32px] inline-flex items-center justify-center">
              {formattedCategoryName}
            </span>
          </div>

          {/* Card Center: Icon & Question Title */}
          <div className="relative z-10 px-7 py-3 text-center my-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-4 shadow-inner">
              {categoryIcon}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-2 drop-shadow-md">
              {currentCard.cardText}
            </h2>

            {/* Near bottom: Category name & description */}
            <div className="mt-2 max-w-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 block mb-1">
                {formattedCategoryName}
              </span>
              <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed drop-shadow-sm">
                {currentCard.description}
              </p>
            </div>
          </div>

          {/* Card Bottom: Visual Hints (NOT buttons) */}
          <div className="relative z-10 p-6 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white/70">
            <span className="flex items-center gap-1.5">
              <span>←</span>
              <span>I don't like it</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>I like it</span>
              <span>→</span>
            </span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Buttons (RED X & GREEN HEART) */}
      <div className="flex items-center justify-center gap-8 mt-5 z-20">
        {/* RED X BUTTON (I don't like it) */}
        <button
          type="button"
          onClick={() => triggerSwipe('left')}
          disabled={isSaving || isSavingExternal}
          className="group w-14 h-14 bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 rounded-full shadow-xl shadow-rose-500/10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
          title="I don't like it (Swipe Left)"
        >
          <svg className="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* GREEN HEART BUTTON (I like it) */}
        <button
          type="button"
          onClick={() => triggerSwipe('right')}
          disabled={isSaving || isSavingExternal}
          className="group w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-500/25 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
          title="I like it (Swipe Right)"
        >
          <svg className="w-7 h-7 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
