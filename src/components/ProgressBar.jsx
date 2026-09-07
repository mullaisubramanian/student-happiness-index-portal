import React from 'react';

// Standard 5 Categories in exact order
const ORDERED_CATEGORIES = [
  { id: 'institution', name: 'INSTITUTION' },
  { id: 'pedagogy', name: 'PEDAGOGY' },
  { id: 'faculty', name: 'FACULTY' },
  { id: 'career', name: 'CAREER & INDUSTRY' },
  { id: 'campus_life', name: 'CAMPUS LIFE' },
];

export default function ProgressBar({
  overallProgress,
  totalCards,
  categoryProgresses,
  activeCategoryId,
}) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-5">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-purple-100 shadow-sm">
        {/* Top Header: Platform Progress Summary */}
        <div className="flex items-center gap-2 mb-3 text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
          <span className="text-slate-800 font-extrabold uppercase tracking-wider text-[11px] sm:text-xs">
            Category Progress
          </span>
        </div>

        {/* 5 Horizontal Progress Segments (One for each Category) */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {ORDERED_CATEGORIES.map((catDef, idx) => {
            const catProgress = categoryProgresses?.find((c) => c.id === catDef.id) || {
              completed: 0,
              total: 0,
              isComplete: false,
            };

            const isCurrent = activeCategoryId === catDef.id;
            const isCompleted = catProgress.isComplete || (catProgress.total > 0 && catProgress.completed >= catProgress.total);
            const percentage =
              catProgress.total > 0
                ? Math.min(100, Math.round((catProgress.completed / catProgress.total) * 100))
                : isCompleted ? 100 : 0;

            return (
              <div
                key={catDef.id}
                className={`flex flex-col justify-between p-2 sm:p-2.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-purple-50/90 border-purple-500 shadow-sm ring-2 ring-purple-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50/80 border-slate-200/80 opacity-70'
                }`}
              >
                {/* Category Header Label + Status Icon */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[9px] sm:text-[11px] font-black uppercase tracking-wider truncate ${
                      isCurrent
                        ? 'text-purple-800'
                        : isCompleted
                        ? 'text-emerald-800'
                        : 'text-slate-500'
                    }`}
                    title={catDef.name}
                  >
                    {idx + 1}. {catDef.name.replace('& INDUSTRY', '& IND.')}
                  </span>

                  {isCompleted ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                      ✓
                    </span>
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping flex-shrink-0" />
                  ) : null}
                </div>

                {/* Individual Category Progress Segment Bar */}
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                        : catProgress.completed > 0
                        ? 'bg-purple-400'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
