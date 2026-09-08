import React, { useState, useMemo } from 'react';
import SwipeCardEngine from './SwipeCardEngine';

export default function FacultySelectionFlow({
  facultyList = [],
  facultyCards = [],
  session,
  responses = [],
  onFacultySwipe,
  onFacultyCategoryComplete,
  onBackToCategories,
}) {
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [currentSwipingFaculty, setCurrentSwipingFaculty] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const getFacultyDisplayName = (faculty, index = 0) => {
    if (!faculty) return '';
    return faculty.facultyName || ((faculty.displayOrder || faculty.display_order) === 1 || index === 0 ? 'Jenipriya' : 'Karanalingesh');
  };

  // Only show faculty that match the student's programme + year, or active universal faculty, strictly capped at the 2 eligible faculty
  const applicableFaculty = useMemo(() => {
    const cohortMatches = facultyList.filter(
      (f) => f.programme === session?.programme && f.year === session?.year && f.active !== false
    );
    const list = cohortMatches.length >= 2 ? cohortMatches : facultyList.filter((f) => f.active !== false);
    return list
      .slice(0, 2)
      .map((f, idx) => ({
        ...f,
        facultyName: getFacultyDisplayName(f, idx),
      }));
  }, [facultyList, session?.programme, session?.year]);

  // Bind faculty feedback cards strictly to the selected faculty being evaluated
  const activeFacultyCards = useMemo(() => {
    if (!currentSwipingFaculty) return [];
    return facultyCards.map((card) => ({
      ...card,
      facultyId: currentSwipingFaculty.id,
      facultyName: currentSwipingFaculty.facultyName,
    }));
  }, [facultyCards, currentSwipingFaculty]);

  // Check how many cards completed for each faculty
  const getFacultyProgress = (facultyId) => {
    const facResponses = responses.filter(
      (r) => r.categoryId === 'faculty' && r.facultyId === facultyId
    );
    const isDone = facResponses.length >= facultyCards.length && facultyCards.length > 0;
    return { count: facResponses.length, isDone };
  };

  const completedFacultyCount = applicableFaculty.filter((f) => getFacultyProgress(f.id).isDone).length;
  const allFacultyDone = applicableFaculty.length > 0 && completedFacultyCount >= applicableFaculty.length;

  if (applicableFaculty.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-purple-100 shadow-xl">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">Faculty Feedback Unavailable</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">
            Faculty feedback is currently unavailable for your cohort ({session?.programme} • {session?.year}).
          </p>
          <button
            onClick={onBackToCategories}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-purple-600/20"
          >
            Return to Categories
          </button>
        </div>
      </div>
    );
  }

  // Handle Start Evaluation (State 2 -> State 3)
  const handleContinueToEvaluation = () => {
    if (!selectedFacultyId) return;
    const fac = applicableFaculty.find((f) => f.id === selectedFacultyId);
    if (!fac) return;

    const { count, isDone } = getFacultyProgress(fac.id);
    if (isDone) return; // Locked

    setCurrentSwipingFaculty(fac);
    setCurrentCardIndex(count < facultyCards.length ? count : 0);
  };

  // Handle Card Swipe during State 3
  const handleCardSwipe = async (response, card) => {
    if (isSaving || !currentSwipingFaculty) return;

    // Runtime Guard 1: Verify currentSwipingFaculty is in the active session's eligible cohort list
    if (!applicableFaculty.some((f) => f.id === currentSwipingFaculty.id)) {
      setSaveError('Unauthorized faculty selection.');
      return;
    }

    // Runtime Guard 2: Verify the card belongs to the selected faculty being swiped
    if (card.facultyId && card.facultyId !== currentSwipingFaculty.id) {
      setSaveError('Card does not belong to the selected faculty.');
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      await onFacultySwipe(response, card, currentSwipingFaculty);

      if (currentCardIndex + 1 < activeFacultyCards.length) {
        setCurrentCardIndex((prev) => prev + 1);
      } else {
        // STATE 4: Faculty completed -> Return to Faculty Selection
        setCurrentSwipingFaculty(null);
        setSelectedFacultyId(null);
        setCurrentCardIndex(0);
      }
    } catch (err) {
      console.error('Faculty save error:', err);
      setSaveError(err?.message || 'Unable to save faculty feedback. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── STATE 3: FACULTY FEEDBACK SWIPING VIEW ──
  if (currentSwipingFaculty) {
    const facultyIndex = applicableFaculty.findIndex((f) => f.id === currentSwipingFaculty.id);

    return (
      <div className="w-full animate-fadeIn">
        {/* Faculty Top Info Header */}
        <div className="max-w-md mx-auto px-4 mb-3 text-center">
          <div className="bg-orange-50/90 border border-orange-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 block">
                Faculty Member {facultyIndex + 1} of {applicableFaculty.length}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {currentSwipingFaculty.facultyName}
              </h3>
            </div>
            <div className="text-xs font-bold text-orange-800 bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-sm">
              {currentSwipingFaculty.department || currentSwipingFaculty.programme?.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Save Error Notice */}
        {saveError && (
          <div className="max-w-md mx-auto px-4 mb-2">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
              <p className="text-xs font-semibold text-rose-700 flex-1">{saveError}</p>
              <button
                onClick={() => setSaveError(null)}
                className="text-xs font-bold text-rose-700 bg-white border border-rose-200 px-3 py-1.5 rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tinder Swipe Engine */}
        <SwipeCardEngine
          cards={activeFacultyCards}
          currentIndex={currentCardIndex}
          categoryTitle={`FACULTY: ${currentSwipingFaculty.facultyName.toUpperCase()}`}
          trackTitle={`Faculty ${facultyIndex + 1} of ${applicableFaculty.length}`}
          onSwipe={handleCardSwipe}
          onBackToCategories={() => {
            setCurrentSwipingFaculty(null);
            setSelectedFacultyId(null);
          }}
          isSavingExternal={isSaving}
        />
      </div>
    );
  }

  // ── STATE 1, 2, 4, 5, 6: FACULTY SELECTION VIEW ──
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header Overview */}
      <div className="text-center mb-8">
        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
          Faculty Feedback
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
          {allFacultyDone ? 'All Faculty Evaluated!' : 'Select Faculty Member'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 max-w-md mx-auto">
          {allFacultyDone
            ? 'You have completed evaluations for all faculty mentors. Click continue to proceed.'
            : 'Select a faculty mentor below to give anonymous feedback across 6 key evaluation criteria.'}
        </p>

        {/* Progress Tracker Badge */}
        <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-extrabold text-slate-700">
          <span>👨‍🏫</span>
          <span>{completedFacultyCount} of {applicableFaculty.length} Faculty Completed</span>
          <span className="text-slate-400">•</span>
          <span className={allFacultyDone ? 'text-emerald-600' : 'text-indigo-600'}>
            {Math.round((completedFacultyCount / applicableFaculty.length) * 100)}%
          </span>
        </div>
      </div>

      {/* STATE 6: ALL FACULTY COMPLETED NOTIFICATION BANNER */}
      {allFacultyDone && (
        <div className="mb-6 bg-emerald-50 border border-emerald-300 rounded-3xl p-6 text-center shadow-sm animate-scaleUp">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 font-black">
            ✓
          </div>
          <h3 className="text-lg font-black text-emerald-950 mb-1">
            All Faculty Evaluations Completed!
          </h3>
          <p className="text-xs text-emerald-700 font-medium">
            Thank you for reviewing each faculty mentor. You can now move on to the next category.
          </p>
        </div>
      )}

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5 mb-8">
        {applicableFaculty.map((fac) => {
          const { count, isDone } = getFacultyProgress(fac.id);
          const isSelected = selectedFacultyId === fac.id && !isDone;

          return (
            <div
              key={fac.id}
              onClick={() => {
                if (!isDone) {
                  setSelectedFacultyId(fac.id);
                }
              }}
              className={`p-5 rounded-3xl border transition-all select-none flex items-center justify-between ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200/90 opacity-90 cursor-not-allowed'
                  : isSelected
                  ? 'bg-indigo-50/90 border-2 border-indigo-600 shadow-md shadow-indigo-100 ring-4 ring-indigo-500/15 cursor-pointer'
                  : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer group'
              }`}
            >
              <div>
                <h3
                  className={`text-base font-black transition-colors ${
                    isDone
                      ? 'text-slate-800'
                      : isSelected
                      ? 'text-indigo-950'
                      : 'text-slate-900 group-hover:text-indigo-600'
                  }`}
                >
                  {fac.facultyName}
                </h3>
              </div>

              {/* Right: Status / Selection Indicator */}
              <div>
                {isDone ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200">
                    <span>✓</span> Completed
                  </span>
                ) : isSelected ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-700 uppercase tracking-wider hidden sm:inline">
                      Selected
                    </span>
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-400 transition-colors" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Area */}
      <div className="space-y-3 pt-2">
        {allFacultyDone ? (
          /* STATE 6: Continue to next category */
          <button
            onClick={onFacultyCategoryComplete}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            Continue to Next Category →
          </button>
        ) : (
          /* STATE 1 & STATE 2: Continue button (Disabled when no faculty selected, Enabled when selected) */
          <button
            onClick={handleContinueToEvaluation}
            disabled={!selectedFacultyId}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
              selectedFacultyId
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 active:scale-98 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60'
            }`}
          >
            {selectedFacultyId ? 'Continue to Evaluation →' : 'Select a Faculty Member to Continue'}
          </button>
        )}

        <div className="text-center pt-2">
          <button
            onClick={onBackToCategories}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Return to Categories Menu
          </button>
        </div>
      </div>
    </div>
  );
}
