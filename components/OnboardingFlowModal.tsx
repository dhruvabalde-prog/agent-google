'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, UserType, WorkingProfessionalCategory } from '@/lib/types';

interface OnboardingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
  isDarkMode?: boolean;
}

// Compass Needle SVG Component
export function CompassNeedleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <polygon points="12,3 15,12 12,10 9,12" fill="#3b82f6" />
      <polygon points="12,21 15,12 12,14 9,12" fill="#ef4444" opacity="0.85" />
    </svg>
  );
}

const SUB_CATEGORIES_MAP: { [key: string]: string[] } = {
  salaried: [
    'Software Engineer / Tech Lead',
    'Product / Project Manager',
    'Growth & Marketing Specialist',
    'Financial Analyst / Controller',
    'HR & Talent Operations',
  ],
  self_employed: [
    'Stock Trader / Market Analyst',
    'Chartered Accountant (CA) & Tax Consultant',
    'Advocate / Legal Practitioner',
    'Doctor / Medical Practitioner',
    'Architect & Spatial Designer',
  ],
  entrepreneur: [
    'Pre-School & Academy Owner',
    'D2C / E-Commerce Brand Founder',
    'Tech Startup Founder',
    'Retail & Franchise Store Owner',
    'Manufacturing & Agency Director',
  ],
  freelancer: [
    'Content Creator & Influencer',
    'UI/UX & Brand Designer',
    'Independent Strategic Consultant',
    'Copywriter & Technical Writer',
    'Full-Stack Developer & Contractor',
  ],
  student: [
    'High School / Board Exams',
    'Undergraduate Degree',
    'Post-graduate / Masters',
    'Competitive Exam Prep (UPSC, JEE, etc.)'
  ],
  seniors: [
    'Retired Professional',
    'Homemaker',
    'Part-time Consultant'
  ]
};

function getQuestions(userType: UserType, category?: WorkingProfessionalCategory) {
  const common = [
    { id: 'q_goal', title: 'What are your primary goals for joining Life OS?', options: ['Automating daily repetitive tasks', 'Organizing my chaotic schedule', 'Accelerating career & business growth', 'Delegating work to an executive AI partner', 'Maintaining strict personal & work life balance'] },
    { id: 'q_comm', title: 'How do you prefer to interact with Life OS?', options: ['Text & Chat mostly', 'Voice Commands & Daily Briefings', 'Automated Background Workflows', 'Direct 1-Tap WhatsApp Actions'] },
  ];
  let specific: { id: string, title: string, options: string[] }[] = [];
  
  if (userType === 'working_professional' || userType === 'WORKING_PROFESSIONAL') {
    const c = category?.toLowerCase();
    if (c === 'entrepreneur') {
      specific = [
        { id: 'q_e1', title: 'What are your biggest operational priorities?', options: ['Client Acquisition & B2B Outreach', 'Vendor & Supply Chain Negotiations', 'Cashflow & Revenue Tracking in Sheets', 'Team Delegation & Executive Alignment'] },
        { id: 'q_e2', title: 'What is the current scale of your organization?', options: ['Solopreneur / Founder', '1 - 10 Team Members', '11 - 50 Employees', '50+ Enterprise Team'] }
      ];
    } else if (c === 'freelancer') {
      specific = [
        { id: 'q_f1', title: 'Where do you lose the most administrative time?', options: ['Finding & qualifying client leads', 'Invoicing & payment follow-ups', 'Managing deadlines & contracts', 'Drafting executive proposals & emails'] },
        { id: 'q_f2', title: 'How do you track deliverables and milestones currently?', options: ['Google Sheets & Docs', 'Task & Project Management tools', 'Scattered across notes & chat apps', 'Mental tracking'] }
      ];
    } else {
      specific = [
        { id: 'q_s1', title: 'What describes your current strategic career focus?', options: ['Pushing for promotion & executive appraisal', 'Leading a high-performance team', 'Protecting work-life boundary & health', 'Exploring strategic career transition'] },
        { id: 'q_s2', title: 'What takes up the majority of your cognitive energy?', options: ['Back-to-back calendar meetings', 'Inbox triage & drafting executive responses', 'Creating presentation decks & spreadsheets', 'Reviewing vendor & project proposals'] }
      ];
    }
  } else if (userType === 'student' || userType === 'STUDENT') {
    specific = [
       { id: 'q_st1', title: 'What are your key academic bottlenecks?', options: ['Procrastination & daily routine discipline', 'Synthesizing dense material into notes', 'Tracking project submissions & deadlines', 'Structured research & bibliography'] },
       { id: 'q_st2', title: 'How do you prefer to consume knowledge?', options: ['Structured notes & Google Docs', 'Interactive Q&A and practice problems', 'Audio/Voice summaries & briefings', 'Collaborative group study'] }
    ];
  } else {
    specific = [
      { id: 'q_gen1', title: 'What areas of your daily routine need the most organization?', options: ['Preventive health & diagnostic schedules', 'Personal financial budgets & SIP tracking', 'Domestic chores & household checklists', 'Family travel & event itineraries'] }
    ];
  }
  
  return [...common, ...specific];
}

export default function OnboardingFlowModal({
  isOpen,
  onClose,
  onSaveProfile,
  initialProfile,
  isDarkMode = false,
}: OnboardingFlowModalProps) {
  // --- Flow Steps ---
  // 0: Identity (Name, Mobile +91, Gender)
  // 1: Dual Account Identities (Personal Gmail OAuth & Work Workspace OAuth)
  // 2: Primary Role Persona
  // 3: Sub-Category
  // 4 to (4 + questions.length - 1): Dynamic Multi-Select Questions
  // N (4 + questions.length): Integrations Summary
  // N+1: Building Dashboard Screen
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // --- Profile State ---
  const [name, setName] = useState(initialProfile?.name || '');
  const [phoneDigits, setPhoneDigits] = useState(
    initialProfile?.phoneNumber ? initialProfile.phoneNumber.replace(/\D/g, '').slice(-10) : ''
  );
  const [phone, setPhone] = useState(initialProfile?.phoneNumber || '');
  const [personalEmail, setPersonalEmail] = useState(initialProfile?.primaryEmail || initialProfile?.email || '');
  const [workEmail, setWorkEmail] = useState(initialProfile?.workEmail || '');
  const [gender, setGender] = useState<'female' | 'male' | 'non_binary' | 'prefer_not_to_say'>(initialProfile?.gender || 'prefer_not_to_say');
  const [userType, setUserType] = useState<UserType>(initialProfile?.userType || 'working_professional');
  const [workingCategory, setWorkingCategory] = useState<WorkingProfessionalCategory>(initialProfile?.workingCategory || 'salaried');
  const [subCategory, setSubCategory] = useState<string>('');
  
  // Multi-select answers
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  // Auth / Google Status
  const [googleUser, setGoogleUser] = useState<{ email: string; name?: string; picture?: string } | null>(null);
  const [personalOauthConnected, setPersonalOauthConnected] = useState(false);
  const [workOauthConnected, setWorkOauthConnected] = useState(false);
  const [buildingStage, setBuildingStage] = useState(0);

  // Dynamic questions based on selected type
  const questions = useMemo(() => getQuestions(userType, workingCategory), [userType, workingCategory]);

  const DUAL_ACCOUNT_STEP = 1;
  const PERSONA_STEP = 2;
  const CATEGORY_STEP = 3;
  const QUESTIONS_START_STEP = 4;
  const OAUTH_STEP = 4 + questions.length;
  const BUILDING_STEP = OAUTH_STEP + 1;

  // Restore draft and check OAuth session
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('lifeos_onboarding_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.name) setName(parsed.name);
        if (parsed.phoneDigits) setPhoneDigits(parsed.phoneDigits);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.personalEmail) setPersonalEmail(parsed.personalEmail);
        if (parsed.workEmail) setWorkEmail(parsed.workEmail);
        if (parsed.userType) setUserType(parsed.userType);
        if (parsed.workingCategory) setWorkingCategory(parsed.workingCategory);
        if (parsed.subCategory) setSubCategory(parsed.subCategory);
        if (parsed.answers) setAnswers(parsed.answers);
        if (typeof parsed.currentStep === 'number') setCurrentStep(parsed.currentStep);
        localStorage.removeItem('lifeos_onboarding_draft');
      }
    } catch {}

    async function checkAuthSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setGoogleUser(data.user);
            // Check if returning from personal or work oauth
            const searchParams = new URLSearchParams(window.location.search);
            const accountType = searchParams.get('account');
            if (accountType === 'work') {
              setWorkEmail(data.user.email);
              setWorkOauthConnected(true);
            } else {
              setPersonalEmail(data.user.email);
              setPersonalOauthConnected(true);
            }
          }
        }
      } catch {}
    }
    checkAuthSession();
  }, []);

  const goToNext = () => {
    setSlideDirection('right');
    setCurrentStep(prev => prev + 1);
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setSlideDirection('left');
      setCurrentStep(prev => prev - 1);
    }
  };

  // Multi-option toggle
  const handleToggleOption = (questionId: string, option: string) => {
    setAnswers(prev => {
      const list = prev[questionId] || [];
      const exists = list.includes(option);
      const updated = exists ? list.filter(o => o !== option) : [...list, option];
      return { ...prev, [questionId]: updated };
    });
  };

  // Google OAuth initiation for Personal vs Work
  const handleTriggerOAuth = (accountType: 'personal' | 'work') => {
    try {
      const draft = {
        currentStep: DUAL_ACCOUNT_STEP,
        name,
        phoneDigits,
        phone,
        gender,
        personalEmail,
        workEmail,
        userType,
        workingCategory,
        subCategory,
        answers,
      };
      localStorage.setItem('lifeos_onboarding_draft', JSON.stringify(draft));
    } catch {}
    window.location.href = `/api/auth/login?account=${accountType}&redirect=/?onboarding=resume%26account=${accountType}`;
  };

  const finalizeOnboarding = (overrideProfile?: Partial<UserProfile>) => {
    const finalPhone = phoneDigits.trim() ? `+91 ${phoneDigits.trim()}` : phone.trim();
    const updated: UserProfile = {
      name: name.trim() || 'Life OS Member',
      phoneNumber: finalPhone,
      email: personalEmail.trim() || googleUser?.email || '',
      primaryEmail: personalEmail.trim() || googleUser?.email || '',
      workEmail: workEmail.trim() || '',
      gender,
      userType,
      workingCategory: userType === 'working_professional' ? workingCategory : undefined,
      professionalSubCategory: subCategory,
      familyMembers: [],
      teamMembers: [],
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
      ...overrideProfile,
    };
    try {
      localStorage.setItem('lifeos_onboarding_v2_completed', 'true');
      localStorage.setItem('lifeos_user_profile', JSON.stringify(updated));
      localStorage.setItem('agent_google_user_profile', JSON.stringify(updated));
    } catch {}
    onSaveProfile(updated);
    onClose();
  };

  useEffect(() => {
    if (currentStep === BUILDING_STEP) {
      const timer1 = setTimeout(() => setBuildingStage(1), 1500);
      const timer2 = setTimeout(() => setBuildingStage(2), 3000);
      const timer3 = setTimeout(() => finalizeOnboarding(), 4500);
      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    }
  }, [currentStep, BUILDING_STEP]);

  const slideClass = slideDirection === 'right' ? 'animate-[slideInRight_0.3s_ease-out]' : 'animate-[slideInLeft_0.3s_ease-out]';

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 w-full h-full min-h-screen overflow-y-auto flex flex-col ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-zinc-900'
    }`}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(24px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-24px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      {/* Top Header - Mobile-first sticky navigation */}
      {currentStep < BUILDING_STEP && (
        <header className={`w-full px-4 sm:px-6 py-3.5 border-b sticky top-0 z-30 flex items-center justify-between backdrop-blur-md ${
          isDarkMode ? 'bg-zinc-950/90 border-zinc-800/80' : 'bg-white/90 border-slate-200/80'
        }`}>
          <div className="flex items-center gap-3">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={goToPrev}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Previous Step"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 text-white shadow-sm">
                <CompassNeedleIcon className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-bold tracking-tight">Life OS Onboarding</h2>
              <p className="text-[11px] text-zinc-500">Step {currentStep + 1} of {OAUTH_STEP + 1}</p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: OAUTH_STEP + 1 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-5 bg-blue-600'
                    : i < currentStep
                    ? 'w-2 bg-blue-400 dark:bg-blue-700'
                    : 'w-1.5 bg-zinc-200 dark:bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </header>
      )}

      {/* Main Full-Page Responsive Container */}
      <main className={`flex-1 w-full max-w-lg mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-between ${slideClass}`}>
          
          {/* STEP 0: IDENTITY BASICS */}
          {currentStep === 0 && (
            <div className="flex flex-col h-full justify-center space-y-6 max-w-sm mx-auto w-full">
              <div className="text-center mb-2">
                <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl mx-auto flex items-center justify-center p-2 mb-4 shadow-xl">
                  <CompassNeedleIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Welcome to Life OS</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Let's set up your sovereign workspace.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Mobile Number</label>
                    <span className="text-[11px] text-zinc-400">For WhatsApp & Direct Calls</span>
                  </div>
                  {/* Locked +91 prefix badge */}
                  <div className={`flex items-center rounded-xl border focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}>
                    <div className="flex items-center gap-1.5 px-3.5 py-3 bg-zinc-200/70 dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 font-bold text-xs text-zinc-700 dark:text-zinc-200 select-none flex-shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={phoneDigits}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneDigits(digits);
                        setPhone(digits ? `+91 ${digits}` : '');
                      }}
                      placeholder="10-digit mobile number"
                      className="flex-1 px-3.5 py-3 bg-transparent text-sm focus:outline-none placeholder:text-zinc-400 font-mono tracking-wider"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Gender (Tailors health, biometric & daily routines)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'female', label: 'Female ♀' },
                      { id: 'male', label: 'Male ♂' },
                      { id: 'prefer_not_to_say', label: 'Other / Skip' },
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGender(g.id as any)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          gender === g.id
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={!name.trim()}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold rounded-xl transition-all shadow-lg"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: DUAL ACCOUNT IDENTITIES (PERSONAL ID & WORK ID) WITH DUAL OAUTH */}
          {currentStep === 1 && (
            <div className="flex flex-col h-full justify-center max-w-md mx-auto w-full space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold mb-3 shadow-md">
                  🛡️
                </div>
                <h3 className="text-2xl font-bold">Dual Identity Partitioning</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  Life OS cryptographically air-gaps your Personal life from your Professional work. Connect both accounts for seamless execution.
                </p>
              </div>

              <div className="space-y-4">
                {/* Personal ID & OAuth */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} shadow-xs space-y-2.5`}>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <span>🏠</span> Personal ID (Home Mode)
                    </label>
                    {personalOauthConnected ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                        <span>✓</span> OAuth Connected
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Personal Gmail</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      placeholder="your.personal@gmail.com"
                      className={`flex-1 px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleTriggerOAuth('personal')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                        personalOauthConnected
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      }`}
                    >
                      {personalOauthConnected ? '✓ Reconnect' : 'Connect OAuth'}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Powers personal health records, domestic checklists & family routines.
                  </p>
                </div>

                {/* Work ID & OAuth */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} shadow-xs space-y-2.5`}>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <span>💼</span> Work ID (Work Mode)
                    </label>
                    {workOauthConnected ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1">
                        <span>✓</span> OAuth Connected
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Google Workspace Email</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      placeholder="your.name@company.com"
                      className={`flex-1 px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleTriggerOAuth('work')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                        workOauthConnected
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                      }`}
                    >
                      {workOauthConnected ? '✓ Reconnect' : 'Connect OAuth'}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Powers client communications, RFQs, vendor ledgers & executive decks.
                  </p>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <span className="text-sm">🔒</span>
                  <span>
                    <strong>Air-Gap Guarantee:</strong> Personal notes and family health records never cross-contaminate into work communications.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={goToNext}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg text-sm"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PRIMARY ROLE PERSONA */}
          {currentStep === 2 && (
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">What best describes you?</h3>
                <p className="text-xs text-zinc-500">Life OS configures dedicated capabilities and intelligence profiles based on your role.</p>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: 'working_professional', icon: '💼', title: 'Working Professional', desc: 'Corporate, Tech, Consulting & Salaried' },
                  { id: 'entrepreneur', icon: '🚀', title: 'Entrepreneur & Founder', desc: 'Startups, Agency Owners & Growth Leaders' },
                  { id: 'student', icon: '🎓', title: 'Student', desc: 'School, University & Competitive Exams' },
                  { id: 'seniors', icon: '🌱', title: 'Senior / Retired / Homemaker', desc: 'Wellness, Family Logistics & Estate Management' },
                  { id: 'other', icon: '⚡', title: 'General Executive', desc: 'Autonomous High-Leverage Life Operations' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setUserType(p.id as UserType);
                      goToNext();
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      userType === p.id
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 shadow-xs'
                        : isDarkMode ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700' : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{p.title}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{p.desc}</p>
                      </div>
                    </div>
                    <span className="text-zinc-400 font-bold">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SUB-CATEGORY */}
          {currentStep === 3 && (
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">Select your focus domain</h3>
                <p className="text-xs text-zinc-500">Fine-tunes the workflows and automation blueprints for your routine.</p>
              </div>

              {userType === 'working_professional' && (
                <div className="flex p-1 bg-zinc-200/60 dark:bg-zinc-800/80 rounded-xl mb-4 text-xs font-bold">
                  {(['salaried', 'entrepreneur', 'freelancer', 'self_employed'] as WorkingProfessionalCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setWorkingCategory(cat)}
                      className={`flex-1 py-1.5 rounded-lg transition-all capitalize ${
                        workingCategory === cat
                          ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-xs'
                          : 'text-zinc-500'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                {(SUB_CATEGORIES_MAP[userType === 'working_professional' ? (workingCategory || 'salaried') : userType] || SUB_CATEGORIES_MAP.salaried).map((sub, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSubCategory(sub);
                      goToNext();
                    }}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      subCategory === sub
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300'
                        : isDarkMode ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700' : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <span>{sub}</span>
                    <span className="text-zinc-400 font-bold">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4+: DYNAMIC MULTI-SELECT QUESTIONS */}
          {currentStep >= QUESTIONS_START_STEP && currentStep < OAUTH_STEP && (() => {
            const qIdx = currentStep - QUESTIONS_START_STEP;
            const currentQ = questions[qIdx];
            if (!currentQ) return null;
            const qId = currentQ.id;
            const selectedList = answers[qId] || [];

            return (
              <div className="flex flex-col h-full justify-between max-w-md mx-auto w-full">
                <div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Question {qIdx + 1} of {questions.length}</span>
                      <span className="text-[10px] text-zinc-400 font-semibold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Select all that apply</span>
                    </div>
                    <h3 className="text-2xl font-bold leading-tight">{currentQ.title}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedList.includes(opt);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleToggleOption(qId, opt)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30'
                              : isDarkMode ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700' : 'border-zinc-200 bg-white hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                              isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400'
                            }`}>
                              {isSelected && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                  <path d="M20 6L9 17l-5-5"/>
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300 font-semibold' : ''}`}>{opt}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`}>
                            {isSelected ? '✓ Selected' : '+ Select'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <p className="text-xs text-zinc-500">
                    {selectedList.length > 0 ? `${selectedList.length} chosen` : 'Choose 1 or more options'}
                  </p>
                  <button
                    type="button"
                    onClick={goToNext}
                    disabled={selectedList.length === 0}
                    className="py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
                  >
                    <span>Continue</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* OAUTH INTEGRATIONS & LAUNCH */}
          {currentStep === OAUTH_STEP && (
            <div className="flex flex-col h-full justify-center max-w-md mx-auto w-full">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 shadow-md">
                  ⚡
                </div>
                <h3 className="text-2xl font-bold mb-1.5">Connect Integrations</h3>
                <p className="text-xs text-zinc-500">Life OS orchestrates your tools securely. Verify your connected accounts.</p>
              </div>

              <div className="space-y-4">
                {/* Google Workspace */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700' : 'bg-white border-zinc-200'} shadow-xs`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                      G
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm">Google Workspace</p>
                        {(personalEmail || workEmail || googleUser) && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">Connected</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {personalEmail || workEmail || googleUser?.email || 'Gmail, Calendar, Docs, Sheets, Drive'}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0">
                    <span>✓</span> Ready
                  </span>
                </div>

                {/* WhatsApp Business - LOCKED */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between opacity-80 ${isDarkMode ? 'bg-zinc-800/20 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-green-100/70 text-green-700 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                      W
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">WhatsApp Business</p>
                        <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.2 rounded font-bold">🔒 Later</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {phoneDigits ? `Direct WhatsApp active via +91 ${phoneDigits}` : 'Direct mobile WhatsApp active. Cloud API later.'}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-[11px] font-bold text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800 border border-zinc-300/60 dark:border-zinc-700 cursor-not-allowed select-none flex-shrink-0 flex items-center gap-1">
                    <span>🔒</span> Locked
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={goToNext}
                  className="w-full py-4 bg-black dark:bg-white dark:text-black hover:scale-[1.01] text-white font-bold rounded-2xl transition-all shadow-lg text-base flex items-center justify-center gap-2"
                >
                  <span>Launch My Life OS</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* BUILDING SCREEN */}
          {currentStep === BUILDING_STEP && (
            <div className="flex flex-col h-full justify-center items-center text-center max-w-sm mx-auto my-auto animate-pulse">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CompassNeedleIcon className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Building your Life OS...</h3>
              
              <div className="space-y-3 w-full text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <p className={buildingStage >= 0 ? 'text-blue-600 dark:text-blue-400' : ''}>✓ Analyzing your role and strategic priorities</p>
                <p className={`transition-opacity ${buildingStage >= 1 ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-30'}`}>✓ Generating custom trackers in Google Sheets</p>
                <p className={`transition-opacity ${buildingStage >= 2 ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-30'}`}>✓ Initializing autonomous execution engine</p>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
