import React from 'react';

const CATEGORY_STYLE_MAP = {
  institution: {
    accent: 'text-purple-700 bg-purple-50 border-purple-200',
    bar: 'bg-purple-600',
    iconBg: 'bg-purple-100 text-purple-700',
  },
  pedagogy: {
    accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bar: 'bg-emerald-600',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  faculty: {
    accent: 'text-orange-700 bg-orange-50 border-orange-200',
    bar: 'bg-orange-600',
    iconBg: 'bg-orange-100 text-orange-700',
  },
  career: {
    accent: 'text-blue-700 bg-blue-50 border-blue-200',
    bar: 'bg-blue-600',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  campus_life: {
    accent: 'text-pink-700 bg-pink-50 border-pink-200',
    bar: 'bg-pink-600',
    iconBg: 'bg-pink-100 text-pink-700',
  },
};

export default function CategorySelection({ 
  categories, 
  categoryStats, 
  onSelectCategory,
  session
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 animate-fadeIn">
      {/* Category Selection Title */}
      <div className="text-center mb-7">
        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider mb-2 border border-purple-100 shadow-sm">
          Cohort: {session?.programme} • {session?.year}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Select Feedback Category
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
          Swipe through each category card to express your experience. Cards adapt to your selected <strong className="text-purple-700">{session?.learningTrack}</strong>.
        </p>
      </div>

      {/* 5 Main Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category, index) => {
          const stats = categoryStats[category.id] || { completed: 0, total: 0, isComplete: false };
          const progressPercent = stats.total > 0 ? Math.min(100, Math.round((stats.completed / stats.total) * 100)) : 0;
          const catNum = String(index + 1).padStart(2, '0');
          const style = CATEGORY_STYLE_MAP[category.id] || CATEGORY_STYLE_MAP.institution;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`group text-left p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[165px] ${
                stats.isComplete
                  ? 'bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10'
              }`}
            >
              {/* Top Row: Category Num & Badge */}
              <div className="flex items-center justify-between w-full mb-3">
                <span className={`text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider border ${
                  stats.isComplete
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : style.accent
                }`}>
                  {catNum} {category.name}
                </span>

                {stats.isComplete && (
                  <span className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Completed</span>
                  </span>
                )}
              </div>

              {/* Middle: Title & Description */}
              <div className="mb-4">
                <h3 className="text-lg font-extrabold text-slate-900 mb-1 group-hover:text-purple-700 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {category.description}
                </p>
              </div>

              {/* Bottom Progress Bar */}
              {stats.total > 0 && (
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stats.isComplete
                        ? 'bg-emerald-500'
                        : stats.completed > 0
                        ? style.bar
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
