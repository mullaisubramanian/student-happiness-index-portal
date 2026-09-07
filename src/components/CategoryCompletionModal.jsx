import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function CategoryCompletionModal({
  categoryName,
  cardsCount,
  onContinueNext,
}) {
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7C3AED', '#4F46E5', '#10B981', '#F59E0B'],
      });
    } catch (e) {
      // Fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 text-center border border-purple-100 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-100 rounded-full blur-2xl pointer-events-none" />

        {/* Top Check Circle */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-md">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-200">
          Section Complete
        </span>

        <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
          {categoryName} Complete ✓
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
          All {cardsCount} cards in this category have been recorded anonymously.
        </p>

        <button
          onClick={onContinueNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 active:scale-95"
        >
          <span>Continue to next category</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
