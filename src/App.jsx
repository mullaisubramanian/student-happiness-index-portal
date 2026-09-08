import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from './components/Navbar';
import ProgressBar from './components/ProgressBar';
import OnboardingModal from './components/OnboardingModal';
import CategorySelection from './components/CategorySelection';
import SwipeCardEngine from './components/SwipeCardEngine';
import FacultySelectionFlow from './components/FacultySelectionFlow';
import CategoryCompletionModal from './components/CategoryCompletionModal';
import FinalScreen from './components/FinalScreen';

import { 
  getStoredSessionId,
  clearStoredSessionId,
  createAnonymousSessionInSupabase,
  fetchSessionFromSupabase,
  fetchResponsesFromSupabase,
  fetchCategoriesFromSupabase,
  fetchFeedbackCardsFromSupabase,
  fetchFacultyFromSupabase,
  fetchFacultyCardsFromSupabase,
  saveResponseToSupabase,
  completeSessionInSupabase,
  OFFICIAL_PEDAGOGY_CARDS
} from './lib/supabase';

// Strict 5-Category Sequential Order
const ORDERED_CATEGORIES = ['institution', 'pedagogy', 'faculty', 'career', 'campus_life'];

export default function App() {
  const [session, setSession] = useState(null);
  const [responses, setResponses] = useState([]);
  const [currentView, setCurrentView] = useState('onboarding');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Dynamic Data Loaded ONLY from Supabase
  const [categories, setCategories] = useState([]);
  const [allFeedbackCards, setAllFeedbackCards] = useState([]);
  const [activeCategoryCards, setActiveCategoryCards] = useState([]);
  const [dynamicFacultyList, setDynamicFacultyList] = useState([]);
  const [facultyCards, setFacultyCards] = useState([]);

  // Persist card totals per category
  const categoryCardTotalsRef = useRef({});

  // Network & Supabase Saving States
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [pendingSwipe, setPendingSwipe] = useState(null);

  const [completedCategoryJustNow, setCompletedCategoryJustNow] = useState(null);
  const [onboardingProgramme, setOnboardingProgramme] = useState('');

  // Helper to load all category cards & populate totals
  const loadAllDataForSession = async (sess) => {
    const cats = await fetchCategoriesFromSupabase();
    setCategories(cats);

    const facList = await fetchFacultyFromSupabase(sess.programme, sess.year);
    setDynamicFacultyList(facList);

    const fCards = await fetchFacultyCardsFromSupabase();
    setFacultyCards(fCards);

    // Fetch all cards for the session's learning track
    const allCards = await fetchFeedbackCardsFromSupabase(null, sess.learningTrack);
    setAllFeedbackCards(allCards);

    // Map card counts per category
    const totals = {};
    allCards.forEach((c) => {
      totals[c.categoryId] = (totals[c.categoryId] || 0) + 1;
    });
    totals['pedagogy'] = 6; // 6 cards per track

    // Faculty total is faculty count * criteria count (strictly 2 faculty * 6 cards = 12 cards)
    const applicableFaculty = facList.filter(
      (f) => f.programme === sess.programme && f.year === sess.year && f.active !== false
    ).slice(0, 2);
    totals['faculty'] = applicableFaculty.length * fCards.length;

    categoryCardTotalsRef.current = totals;
    return { cats, allCards, facList, fCards };
  };

  // Restore existing anonymous session from Supabase on load
  useEffect(() => {
    async function restoreSession() {
      const storedId = getStoredSessionId();
      if (storedId) {
        try {
          const fetchedSession = await fetchSessionFromSupabase(storedId);
          if (fetchedSession) {
            // If the session was already completed, do NOT trap user on final screen
            if (fetchedSession.status === 'completed') {
              clearStoredSessionId();
              setSession(null);
              setCurrentView('onboarding');
              return;
            }

            setSession(fetchedSession);
            const fetchedResponses = await fetchResponsesFromSupabase(storedId);
            setResponses(fetchedResponses);

            await loadAllDataForSession(fetchedSession);
            setCurrentView('categories');
          } else {
            clearStoredSessionId();
            setCurrentView('onboarding');
          }
        } catch (e) {
          console.warn('Unable to restore session from Supabase:', e);
          clearStoredSessionId();
          setCurrentView('onboarding');
        }
      }
    }
    restoreSession();
  }, []);

  // Start new anonymous session strictly in Supabase
  const handleStartSession = async (sessionData) => {
    setSaveError(null);
    setIsSaving(true);
    try {
      const newSession = await createAnonymousSessionInSupabase(sessionData);
      setSession(newSession);
      setResponses([]);

      const { allCards } = await loadAllDataForSession(newSession);

      // Automatically launch the first category (Institution)
      const firstCatCards = allCards.filter((c) => c.categoryId === 'institution');
      setActiveCategoryCards(firstCatCards);
      setSelectedCategory('institution');
      setCurrentCardIndex(0);
      setCurrentView('swiping');
    } catch (err) {
      setSaveError(err.message || 'Unable to connect to Supabase. Please check your internet connection.');
    } finally {
      setIsSaving(false);
    }
  };

  // Select Category and fetch/filter cards
  const handleSelectCategory = async (catId) => {
    setSelectedCategory(catId);
    setCurrentCardIndex(0);
    setSaveError(null);

    if (catId === 'faculty') {
      setCurrentView('faculty_swiping');
    } else if (catId === 'pedagogy') {
      setIsSaving(true);
      try {
        const studentTrack = (session?.learningTrack && session.learningTrack.includes('Train'))
          ? 'Training-Based Learning'
          : 'Project-Based Learning';

        // Filter cards strictly matching the student's selected learningTrack from Question 4
        let cards = (allFeedbackCards || []).filter(
          (c) => c.categoryId === 'pedagogy' && (c.track === studentTrack || c.track === 'general')
        );

        if (cards.length !== 6) {
          cards = await fetchFeedbackCardsFromSupabase('pedagogy', studentTrack);
        }

        if (!cards.length) {
          const fallback = OFFICIAL_PEDAGOGY_CARDS[studentTrack] || [];
          cards = fallback.map((c, i) => ({
            id: c.dbId || c.id,
            categoryId: 'pedagogy',
            track: studentTrack,
            cardText: c.cardText,
            description: c.description,
            displayOrder: i + 1,
          }));
        }

        setActiveCategoryCards(cards);
        categoryCardTotalsRef.current['pedagogy'] = cards.length;
        setCurrentView('swiping');
      } catch (err) {
        setSaveError('Unable to fetch pedagogy cards.');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
      try {
        let cards = allFeedbackCards.filter((c) => c.categoryId === catId);
        if (!cards.length) {
          cards = await fetchFeedbackCardsFromSupabase(catId, session?.learningTrack);
        }
        setActiveCategoryCards(cards);
        categoryCardTotalsRef.current[catId] = cards.length;
        setCurrentView('swiping');
      } catch (err) {
        setSaveError('Unable to fetch cards from Supabase database.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Calculate category completion status from Supabase-confirmed response records.
  const categoryStats = useMemo(() => {
    const stats = {};

    categories.forEach((cat) => {
      if (cat.id === 'faculty') {
        const applicableFaculty = dynamicFacultyList.filter(
          (f) => f.programme === session?.programme && f.year === session?.year && f.active !== false
        ).slice(0, 2);
        const totalFacultyCards = applicableFaculty.length * facultyCards.length;
        const facResponses = responses.filter((r) => r.categoryId === 'faculty');
        const completed = Math.min(facResponses.length, totalFacultyCards || facResponses.length);
        const isComplete = totalFacultyCards > 0 && completed >= totalFacultyCards;

        stats[cat.id] = { completed, total: totalFacultyCards, isComplete };
      } else {
        const persistedTotal = categoryCardTotalsRef.current[cat.id] || 0;
        const resolvedTotal = cat.id === 'pedagogy'
          ? 6
          : ((selectedCategory === cat.id && activeCategoryCards.length > 0)
              ? activeCategoryCards.length
              : persistedTotal);

        const catResponses = responses.filter((r) => r.categoryId === cat.id);
        const completed = resolvedTotal > 0
          ? Math.min(catResponses.length, resolvedTotal)
          : catResponses.length;
        const isComplete = (resolvedTotal > 0 && completed >= resolvedTotal) || (completedCategoryJustNow === cat.id);

        stats[cat.id] = { completed, total: resolvedTotal, isComplete };
      }
    });

    return stats;
  }, [categories, responses, dynamicFacultyList, facultyCards, activeCategoryCards, selectedCategory, session, completedCategoryJustNow]);

  // Overall totals across all 5 categories
  const overallTotals = useMemo(() => {
    let totalCards = 0;
    let completedCards = 0;

    Object.values(categoryStats).forEach((st) => {
      totalCards += st.total;
      completedCards += st.completed;
    });

    const isAllFinished = totalCards > 0 && completedCards >= totalCards;

    return {
      totalCards,
      completedCards,
      isAllFinished,
    };
  }, [categoryStats]);

  const categoryProgressList = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      completed: categoryStats[c.id]?.completed || 0,
      total: categoryStats[c.id]?.total || 0,
      isComplete: categoryStats[c.id]?.isComplete || false,
    }));
  }, [categories, categoryStats]);

  // Handle Standard Card Swipe (Immediate smooth transition + background Supabase sync)
  const handleSwipeCard = async (responseValue, cardObj) => {
    if (!session || !selectedCategory) return;

    const payload = {
      sessionId: session.id,
      categoryId: selectedCategory,
      cardId: cardObj.id,
      cardText: cardObj.cardText,
      response: responseValue,
    };

    const tempRecord = {
      id: 'resp_' + Date.now(),
      sessionId: session.id,
      categoryId: selectedCategory,
      cardId: cardObj.id,
      cardText: cardObj.cardText,
      response: responseValue,
      score: responseValue === 'positive' ? 1 : 0,
      answeredAt: new Date().toISOString()
    };

    setResponses((prev) => {
      const filtered = prev.filter((r) => !(r.categoryId === selectedCategory && r.cardId === cardObj.id));
      return [...filtered, tempRecord];
    });

    if (currentCardIndex + 1 < activeCategoryCards.length) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCompletedCategoryJustNow(selectedCategory);
      setCurrentView('completion');
    }

    // Sync to Supabase in background
    try {
      const savedRecord = await saveResponseToSupabase(payload);
      if (savedRecord) {
        setResponses((prev) => {
          const filtered = prev.filter((r) => !(r.categoryId === selectedCategory && r.cardId === cardObj.id));
          return [...filtered, savedRecord];
        });
      }
    } catch (err) {
      console.warn('Supabase response recorded locally; sync notice:', err);
    }
  };

  // Handle Faculty Card Swipe
  const handleFacultySwipe = async (responseValue, cardObj, facultyId) => {
    if (!session) throw new Error('No active session.');

    // Security & Eligibility Guard:
    // Only allow writes for faculty presented and eligible in this session
    const isEligible = dynamicFacultyList.some((f) => f.id === facultyId);
    if (!isEligible) {
      console.error(`Blocked attempt to write response for ineligible faculty ID: ${facultyId}`);
      throw new Error('Faculty member is not eligible for this session.');
    }

    if (!cardObj?.id) {
      throw new Error('Faculty feedback card ID is missing.');
    }

    const payload = {
      sessionId: session.id,
      categoryId: 'faculty',
      cardId: null,
      facultyCardId: cardObj.id,
      facultyId: facultyId,
      cardText: cardObj.cardText,
      response: responseValue,
    };

    const savedRecord = await saveResponseToSupabase(payload);

    setResponses((prev) => {
      const filtered = prev.filter(
        (r) => !(r.categoryId === 'faculty' && r.facultyId === facultyId && r.facultyCardId === cardObj.id)
      );
      return [...filtered, savedRecord];
    });
  };

  // Retry saving pending swipe if write failed
  const handleRetrySwipe = () => {
    if (!pendingSwipe) return;
    if (pendingSwipe.type === 'faculty') {
      handleFacultySwipe(pendingSwipe.payload.response, pendingSwipe.cardObj, pendingSwipe.facultyId);
    } else {
      handleSwipeCard(pendingSwipe.payload.response, pendingSwipe.cardObj);
    }
  };

  const handleFacultyCategoryComplete = () => {
    setCompletedCategoryJustNow('faculty');
    setCurrentView('completion');
  };

  // ── FIX: Seamless Progression across all 5 categories in order ──
  const handleContinueAfterCompletion = () => {
    // Check if all 5 categories are complete
    const allDone = ORDERED_CATEGORIES.every((catId) => {
      return catId === completedCategoryJustNow || categoryStats[catId]?.isComplete;
    });

    if (allDone) {
      completeSessionInSupabase(session?.id);
      setCurrentView('final');
      return;
    }

    // Find next uncompleted category in sequence after the one just completed
    const currentIndex = ORDERED_CATEGORIES.indexOf(completedCategoryJustNow);
    let nextCat = null;
    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < ORDERED_CATEGORIES.length; i++) {
        const nextId = ORDERED_CATEGORIES[i];
        if (!categoryStats[nextId]?.isComplete && nextId !== completedCategoryJustNow) {
          nextCat = nextId;
          break;
        }
      }
    }

    // Fallback to any uncompleted category (excluding the one just finished)
    if (!nextCat) {
      nextCat = ORDERED_CATEGORIES.find((catId) => !categoryStats[catId]?.isComplete && catId !== completedCategoryJustNow);
    }

    if (nextCat) {
      handleSelectCategory(nextCat);
    } else {
      completeSessionInSupabase(session?.id);
      setCurrentView('final');
    }
  };

  const handleResetSession = () => {
    clearStoredSessionId();
    setSession(null);
    setOnboardingProgramme('');
    setResponses([]);
    setActiveCategoryCards([]);
    setSelectedCategory(null);
    setCurrentCardIndex(0);
    setCurrentView('onboarding');
  };

  const currentProg = session?.programme || onboardingProgramme;
  const isRguProgrammeSelected = currentProg?.includes('RGU');
  const isRtcProgrammeSelected = currentProg?.includes('RTC');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-purple-500 selection:text-white relative">
      {/* Top Header Logos (Onboarding) */}
      {currentView === 'onboarding' && (
        <header className="w-full absolute top-0 left-0 right-0 z-30 px-4 sm:px-8 md:px-12 py-3.5 sm:py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {isRguProgrammeSelected ? (
              <>
                {/* RGU MBA: RTC is REMOVED. Left: RAISE SMART, Right: RGU */}
                <div className="flex-1 flex items-center justify-start">
                  <img
                    src="/logos/raisesmart-logo.png?v=2"
                    alt="RAISE SMART School of Technology - Upskilling Partner"
                    className="h-8 sm:h-11 md:h-13 w-auto object-contain drop-shadow-sm"
                  />
                </div>
                <div className="flex-1 flex items-center justify-end">
                  <img
                    src="/logos/rgu-logo.png"
                    alt="Rathinam Global University - NAAC A++"
                    className="h-8 sm:h-11 md:h-13 w-auto object-contain drop-shadow-sm"
                  />
                </div>
              </>
            ) : isRtcProgrammeSelected ? (
              <>
                {/* RTC MBA: RGU is REMOVED. Left: RAISE SMART Logo, Right: RTC Logo */}
                <div className="flex-1 flex items-center justify-start">
                  <img
                    src="/logos/raisesmart-logo.png?v=2"
                    alt="RAISE SMART School of Technology - Upskilling Partner"
                    className="h-8 sm:h-11 md:h-13 w-auto object-contain drop-shadow-sm"
                  />
                </div>
                <div className="flex-1 flex items-center justify-end">
                  <img
                    src="/logos/rtc-logo.png"
                    alt="Rathinam Technical Campus"
                    className="h-8 sm:h-11 md:h-13 w-auto object-contain drop-shadow-sm"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Initial Step before selection: RTC (Left), RAISE SMART (Center), RGU (Right) */}
                <div className="flex-1 flex items-center justify-start">
                  <img
                    src="/logos/rtc-logo.png"
                    alt="Rathinam Technical Campus"
                    className="h-8 sm:h-11 md:h-13 w-auto object-contain drop-shadow-sm"
                  />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src="/logos/raisesmart-logo.png?v=2"
                    alt="RAISE SMART School of Technology - Upskilling Partner"
                    className="h-8 sm:h-11 md:h-13 w-auto object-contain drop-shadow-sm"
                  />
                </div>
                <div className="flex-1 flex items-center justify-end">
                  <img
                    src="/logos/rgu-logo.png"
                    alt="Rathinam Global University - NAAC A++"
                    className="h-8 sm:h-11 md:h-13 w-auto object-contain drop-shadow-sm"
                  />
                </div>
              </>
            )}
          </div>
        </header>
      )}

      {/* Global Header (shown once on feedback dashboard/cards) */}
      {currentView !== 'onboarding' && (
        <Navbar
          session={session}
          overallProgress={overallTotals.completedCards}
          totalCards={overallTotals.totalCards}
          onResetSession={handleResetSession}
        />
      )}

      {/* Global Supabase Connection Error / Saving Banner */}
      {(isSaving || saveError) && (
        <div className="sticky top-14 z-50 max-w-xl mx-auto px-4 mt-2">
          {isSaving && (
            <div className="bg-purple-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 animate-pulse">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Saving your response to Supabase...</span>
            </div>
          )}

          {saveError && (
            <div className="bg-rose-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{saveError}</span>
              </div>
              <button
                onClick={handleRetrySwipe}
                className="bg-white text-rose-700 font-extrabold px-3 py-1 rounded-xl hover:bg-rose-50 text-[11px] shadow-sm flex-shrink-0"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main App Canvas */}
      <main className="flex-1 pb-10">
        {session && currentView !== 'onboarding' && currentView !== 'final' && (
          <div>
            {/* Header Block at the left edge of the page */}
            <div className="w-full px-4 sm:px-8 pt-5 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl leading-none">
                  HAPPINESS INDEX
                </h1>
                <span className="bg-purple-50 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-200">
                  RSMART / Intellect
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Anonymous Student Feedback Platform
              </p>
            </div>

            <ProgressBar
              overallProgress={overallTotals.completedCards}
              totalCards={overallTotals.totalCards}
              categoryProgresses={categoryProgressList}
              activeCategoryId={selectedCategory}
            />
          </div>
        )}

        {/* 1. Onboarding Screen */}
        {currentView === 'onboarding' && (
          <OnboardingModal
            onStartSession={handleStartSession}
            onProgrammeChange={setOnboardingProgramme}
          />
        )}

        {/* 2. Category Selection Screen */}
        {currentView === 'categories' && (
          <CategorySelection
            categories={categories}
            categoryStats={categoryStats}
            onSelectCategory={handleSelectCategory}
            session={session}
          />
        )}

        {/* 3. Tinder Swipe Card Engine */}
        {currentView === 'swiping' && selectedCategory && (
          <SwipeCardEngine
            cards={activeCategoryCards}
            currentIndex={currentCardIndex}
            categoryTitle={categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
            trackTitle={selectedCategory === 'pedagogy' ? session?.learningTrack : null}
            onSwipe={handleSwipeCard}
            onBackToCategories={() => setCurrentView('categories')}
          />
        )}



        {/* 4. Moderated Faculty Selection Flow */}
        {currentView === 'faculty_swiping' && (
          <FacultySelectionFlow
            facultyList={dynamicFacultyList}
            facultyCards={facultyCards}
            session={session}
            responses={responses}
            onFacultySwipe={handleFacultySwipe}
            onFacultyCategoryComplete={handleFacultyCategoryComplete}
            onBackToCategories={() => setCurrentView('categories')}
          />
        )}

        {/* 5. Category Completion Modal */}
        {currentView === 'completion' && completedCategoryJustNow && (
          <CategoryCompletionModal
            categoryName={categories.find((c) => c.id === completedCategoryJustNow)?.name}
            cardsCount={categoryStats[completedCategoryJustNow]?.total || 0}
            onContinueNext={handleContinueAfterCompletion}
          />
        )}

        {/* 6. Final Thank-You Screen */}
        {currentView === 'final' && (
          <FinalScreen
            session={session}
            categories={categories}
            onResetSession={handleResetSession}
          />
        )}
      </main>
    </div>
  );
}
