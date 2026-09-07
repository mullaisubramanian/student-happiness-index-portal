import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function FinalScreen({
  session,
  categories,
  onResetSession,
}) {
  useEffect(() => {
    try {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#7C3AED', '#4F46E5', '#10B981', '#F59E0B'],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#7C3AED', '#4F46E5', '#10B981', '#F59E0B'],
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {
      // Fallback
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-8 text-center animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-2xl relative overflow-hidden">
        {/* Glow accents */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />


        {/* Big Check Circle */}
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider mb-3 border border-emerald-200">
          Feedback Completed
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Thank You!
        </h1>

        <p className="text-base font-bold text-slate-700 mb-2">
          Your feedback has been recorded anonymously.
        </p>

        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm mx-auto mb-8">
          Your insights are crucial to shaping a better campus and learning experience for the SMART / Intellect cohort.
        </p>

        {/* Category Completion Status List */}
        <div className="space-y-2.5 mb-8 text-left">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 text-center">
            Completed Feedback Sections
          </h4>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 font-bold text-sm text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{cat.name}</span>
              </div>
              <span className="text-xs text-emerald-700 font-black bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Completed ✓
              </span>
            </div>
          ))}
        </div>

        {/* Anonymous Footnote */}
        <div className="text-xs text-slate-400 font-medium mb-6">
          🔒 Zero personal identification stored. Anonymous session ID: <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-[11px]">{session?.id?.slice(0, 8)}...</code>
        </div>

        <button
          onClick={onResetSession}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-sm transition-all shadow-lg shadow-purple-900/20 active:scale-95"
        >
          Submit Another Anonymous Response
        </button>
      </div>
    </div>
  );
}
