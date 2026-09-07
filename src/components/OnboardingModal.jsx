import React, { useState } from 'react';

export default function OnboardingModal({ onStartSession, onProgrammeChange }) {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('');
  const [programme, setProgramme] = useState('');
  const [year, setYear] = useState('');
  const [learningTrack, setLearningTrack] = useState('');

  const totalSteps = 4;

  const handleGenderSelect = (val) => {
    setGender(val);
    setTimeout(() => {
      setStep(2);
    }, 180);
  };

  const handleProgrammeSelect = (val) => {
    setProgramme(val);
    if (onProgrammeChange) {
      onProgrammeChange(val);
    }
    setTimeout(() => {
      setStep(3);
    }, 180);
  };

  const handleYearSelect = (val) => {
    setYear(val);
    setTimeout(() => {
      setStep(4);
    }, 180);
  };

  const handleTrackSelect = (val) => {
    setLearningTrack(val);
    setTimeout(() => {
      onStartSession({
        gender,
        programme,
        year,
        learningTrack: val,
      });
    }, 220);
  };

  const handleBack = () => {
    if (step > 1) {
      if (step === 3 && onProgrammeChange) {
        onProgrammeChange('');
      }
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center p-4 sm:p-6 pt-16 sm:pt-24 pb-8 relative">
      {/* Soft Purple Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/35 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl px-6 pt-8 pb-6 sm:px-10 sm:pt-12 sm:pb-10 border border-purple-100/90 shadow-2xl shadow-purple-900/5 relative z-10 mt-4 sm:mt-8">
        

        {/* Header Block: Title, Badge, Subtitle */}
        <div className="mb-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg leading-none">
              HAPPINESS INDEX
            </h1>
            <span className="bg-purple-50 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-200">
              RSMART / Intellect
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1">
            Anonymous Student Feedback Platform
          </p>
        </div>

        {/* Thin Horizontal Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="text-purple-700 font-extrabold">{step} of {totalSteps}</span>
            <span>Step {step}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: GENDER */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                How do you identify?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Select your gender to continue.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {['Male', 'Female'].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleGenderSelect(opt)}
                  className={`py-5 px-6 rounded-2xl border-2 font-extrabold text-base transition-all duration-200 text-center ${
                    gender === opt
                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20 scale-[1.02]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: PROGRAMME / CLASS */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Class / Programme
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Choose your enrolled degree programme.
              </p>
            </div>

            <div className="space-y-3.5 mb-6">
              {[
                { label: 'RTC - RSMART MBA' },
                { label: 'RGU - RSMART MBA' },
              ].map((prog) => (
                <button
                  type="button"
                  key={prog.label}
                  onClick={() => handleProgrammeSelect(prog.label)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between ${
                    programme === prog.label
                      ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-md shadow-purple-600/10'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50/40'
                  }`}
                >
                  <div className="font-extrabold text-base text-slate-900">{prog.label}</div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      programme === prog.label
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {programme === prog.label && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: YEAR */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Which year are you in?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Select your current academic year.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {['First Year', 'Second Year'].map((yr) => (
                <button
                  type="button"
                  key={yr}
                  onClick={() => handleYearSelect(yr)}
                  className={`py-5 px-6 rounded-2xl border-2 font-extrabold text-base transition-all duration-200 text-center ${
                    year === yr
                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20 scale-[1.02]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/40'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: LEARNING TRACK */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Learning Track / Pedagogy
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Select your designated pedagogy track.
              </p>
            </div>

            <div className="space-y-3.5 mb-6">
              {[
                {
                  title: 'Project-Based Learning',
                  badge: 'PROJECT TRACK',
                },
                {
                  title: 'Training-Based Learning',
                  badge: 'TRAINING TRACK',
                },
              ].map((track) => (
                <button
                  type="button"
                  key={track.title}
                  onClick={() => handleTrackSelect(track.title)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden ${
                    learningTrack === track.title
                      ? 'bg-gradient-to-br from-purple-50 to-indigo-50/80 border-purple-600 shadow-md shadow-purple-600/10'
                      : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/40'
                  }`}
                >
                  <span
                    className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-2 tracking-wider ${
                      learningTrack === track.title
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {track.badge}
                  </span>
                  <div className="font-extrabold text-base text-slate-900">{track.title}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Back Button from Step 2 Onward */}
        {step > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBack}
              className="py-2.5 px-4 rounded-xl font-bold text-xs text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <span className="text-[11px] text-slate-400 font-medium">Select an option to continue</span>
          </div>
        )}
      </div>
    </div>
  );
}
