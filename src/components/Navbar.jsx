import React from 'react';

export default function Navbar({ session, overallProgress, totalCards, onResetSession }) {
  if (!session || !onResetSession) return null;

  const isRguSession = session?.programme?.includes('RGU');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100/80 px-4 sm:px-8 py-2.5 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {isRguSession ? (
          <>
            {/* RGU MBA: RTC logo is REMOVED. Left: RAISE SMART, Right: RGU Logo + Controls */}
            <div className="flex items-center justify-start flex-1">
              <img
                src="/logos/raisesmart-logo.png?v=2"
                alt="RAISE SMART School of Technology - Upskilling Partner"
                className="h-7 sm:h-9 md:h-10 w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1">
              <img
                src="/logos/rgu-logo.png"
                alt="Rathinam Global University - NAAC A++"
                className="h-7 sm:h-9 md:h-10 w-auto object-contain"
              />
              <button
                onClick={onResetSession}
                className="text-xs font-bold text-slate-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-200 transition-all shadow-sm flex-shrink-0"
                title="Start a new anonymous session"
              >
                New Session
              </button>
            </div>
          </>
        ) : (
          <>
            {/* RTC MBA: RGU logo is REMOVED. Left: RAISE SMART Logo, Right: RTC Logo + Controls */}
            <div className="flex items-center justify-start flex-1">
              <img
                src="/logos/raisesmart-logo.png?v=2"
                alt="RAISE SMART School of Technology - Upskilling Partner"
                className="h-7 sm:h-9 md:h-10 w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1">
              <img
                src="/logos/rtc-logo.png"
                alt="Rathinam Technical Campus"
                className="h-7 sm:h-9 md:h-10 w-auto object-contain"
              />
              <button
                onClick={onResetSession}
                className="text-xs font-bold text-slate-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-200 transition-all shadow-sm flex-shrink-0"
                title="Start a new anonymous session"
              >
                New Session
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
