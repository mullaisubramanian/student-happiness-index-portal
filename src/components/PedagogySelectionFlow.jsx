import React, { useState, useMemo } from 'react';
import SwipeCardEngine from './SwipeCardEngine';
import { OFFICIAL_PEDAGOGY_CARDS } from '../lib/seedData';

export default function PedagogySelectionFlow({
  session,
  responses = [],
  onPedagogySwipe,
  onPedagogyCategoryComplete,
  onBackToCategories,
  allFeedbackCards = [],
}) {
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [currentSwipingTrack, setCurrentSwipingTrack] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Resolve 6 cards for each track, mapping DB IDs if available from allFeedbackCards
  const projectCards = useMemo(() => {
    const list = OFFICIAL_PEDAGOGY_CARDS['Project-Based Learning'];
    return list.map((card, idx) => {
      const dbMatch = allFeedbackCards.find(
        (c) => c.categoryId === 'pedagogy' && c.cardText?.toLowerCase().trim() === card.cardText.toLowerCase().trim()
      );
      return {
        ...card,
        id: dbMatch?.id || `ped-proj-${idx + 1}`,
      };
    });
  }, [allFeedbackCards]);

  const trainingCards = useMemo(() => {
    const list = OFFICIAL_PEDAGOGY_CARDS['Training-Based Learning'];
    return list.map((card, idx) => {
      const dbMatch = allFeedbackCards.find(
        (c) => c.categoryId === 'pedagogy' && (
          c.cardText?.toLowerCase().trim() === card.cardText.toLowerCase().trim() ||
          (card.cardText.toLowerCase().includes('engagement') && c.cardText?.toLowerCase().includes('interactive'))
        )
      );
      return {
        ...card,
        id: dbMatch?.id || `ped-train-${idx + 1}`,
      };
    });
  }, [allFeedbackCards]);

  // Check progress per track
  const getTrackProgress = (cardsList) => {
    const trackResponses = responses.filter(
      (r) => r.categoryId === 'pedagogy' && cardsList.some((c) => c.cardText === r.cardText || c.id === r.cardId)
    );
    const isDone = trackResponses.length >= cardsList.length && cardsList.length > 0;
    return { count: trackResponses.length, isDone };
  };

  const projectProgress = getTrackProgress(projectCards);
  const trainingProgress = getTrackProgress(trainingCards);

  const tracks = [
    {
      id: 'Project-Based Learning',
      name: 'Project-Based Learning',
      tagline: 'Practical Applications & Industry Work',
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      description: 'Hands-on practical projects, Harvard cases, business simulations, and live problem solving.',
      cards: projectCards,
      progress: projectProgress,
    },
    {
      id: 'Training-Based Learning',
      name: 'Training-Based Learning',
      tagline: 'Core Pedagogy & Classroom Excellence',
      icon: (
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: 'Teaching quality, doubt clarity, practical corporate examples, assessments, and classroom engagement.',
      cards: trainingCards,
      progress: trainingProgress,
    },
  ];

  // Start evaluating chosen track
  const handleStartTrackSwiping = (track) => {
    setSelectedTrackId(track.id);
    setCurrentSwipingTrack(track);
    setCurrentCardIndex(0);
  };

  // Card Swipe Handler
  const handleCardSwipe = async (responseVal, cardObj) => {
    if (isSaving || !currentSwipingTrack) return;
    setSaveError(null);
    setIsSaving(true);

    try {
      if (onPedagogySwipe) {
        await onPedagogySwipe(responseVal, cardObj, currentSwipingTrack.id);
      }

      if (currentCardIndex + 1 < currentSwipingTrack.cards.length) {
        setCurrentCardIndex((prev) => prev + 1);
      } else {
        // Track completed
        setCurrentSwipingTrack(null);
        setSelectedTrackId(null);
        if (onPedagogyCategoryComplete) {
          onPedagogyCategoryComplete();
        }
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save response. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================================
  // VIEW 2: SWIPING THROUGH STRICTLY 6 CHILD CARDS
  // =========================================================================
  if (currentSwipingTrack) {
    return (
      <div className="animate-fadeIn">
        {saveError && (
          <div className="max-w-md mx-auto mb-3 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
            <span>{saveError}</span>
            <button
              onClick={() => setSaveError(null)}
              className="text-[11px] font-bold text-rose-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <SwipeCardEngine
          cards={currentSwipingTrack.cards}
          currentIndex={currentCardIndex}
          categoryTitle={`PEDAGOGY: ${currentSwipingTrack.name}`}
          trackTitle={currentSwipingTrack.name}
          onSwipe={handleCardSwipe}
          onBackToCategories={() => {
            setCurrentSwipingTrack(null);
            setSelectedTrackId(null);
          }}
          isSavingExternal={isSaving}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: FIRST PAGE OF PEDAGOGY (ONLY TWO PARENT CARDS)
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-2.5 border border-emerald-200 shadow-sm">
          Category 02 • Pedagogy
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Pedagogy Learning Tracks
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
          Select or swipe a track below to evaluate its 6 focus areas. Under each track, you will review 6 dedicated cards.
        </p>
      </div>

      {/* DISPLAY ONLY THESE TWO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {tracks.map((tr) => {
          const isSelected = selectedTrackId === tr.id;
          const isDone = tr.progress.isDone;

          return (
            <div
              key={tr.id}
              onClick={() => handleStartTrackSwiping(tr)}
              className={`p-6 sm:p-7 rounded-[2rem] border text-left transition-all relative overflow-hidden group cursor-pointer flex flex-col justify-between select-none ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-500 shadow-sm'
                  : isSelected
                  ? 'bg-indigo-50/80 border-2 border-indigo-600 shadow-xl ring-4 ring-indigo-500/10'
                  : 'bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <div>
                {/* Top Row: Icon + Badge */}
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-slate-100 rounded-2xl group-hover:scale-105 transition-transform shadow-inner">
                    {tr.icon}
                  </div>
                  {isDone ? (
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-200">
                      <span>✓</span> Completed (6/6)
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
                      6 Focus Cards
                    </span>
                  )}
                </div>

                {/* Title & Tagline */}
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                  {tr.name}
                </h3>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 mb-3">
                  {tr.tagline}
                </div>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed font-medium">
                  {tr.description}
                </p>

                {/* 6 Preview Cards Checklist */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
                    6 Cards in this Track:
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {tr.cards.map((c, idx) => (
                      <div key={c.id || c.cardText} className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold w-4">{idx + 1}.</span>
                        <span>{c.cardText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartTrackSwiping(tr);
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isDone
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-indigo-200'
                  }`}
                >
                  <span>{isDone ? 'Review Again (6 Cards)' : 'Select & Start Evaluating (6 Cards)'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToCategories}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 py-2 px-4 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200"
        >
          <span>←</span>
          <span>Back to All Categories</span>
        </button>
      </div>
    </div>
  );
}
