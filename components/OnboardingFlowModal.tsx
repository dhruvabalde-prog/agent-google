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
    { id: 'q_goal', title: 'What is your primary goal for joining Life OS?', options: ['Automating daily repetitive tasks', 'Organizing my chaotic schedule', 'Accelerating career/business growth', 'Delegating work to an AI team'] },
    { id: 'q_comm', title: 'How do you prefer to interact with your AI?', options: ['Text & Chat mostly', 'Voice Commands & Calls', 'Background Automation', 'Mix of all approaches'] },
  ];
  let specific: { id: string, title: string, options: string[] }[] = [];
  
  if (userType === 'working_professional' || userType === 'WORKING_PROFESSIONAL') {
    const c = category?.toLowerCase();
    if (c === 'entrepreneur') {
      specific = [
        { id: 'q_e1', title: 'What is the biggest operational challenge in your business?', options: ['Client Acquisition & Sales', 'Vendor & Supply Chain Management', 'Financial Tracking & Cashflow', 'Team Delegation & Hiring'] },
        { id: 'q_e2', title: 'How big is your current team?', options: ['Just me (Solopreneur)', '1 - 10 employees', '11 - 50 employees', '50+ employees'] }
      ];
    } else if (c === 'freelancer') {
      specific = [
        { id: 'q_f1', title: 'What takes up most of your unbillable time?', options: ['Finding new clients', 'Invoicing & following up on payments', 'Managing projects & deadlines', 'Drafting proposals/emails'] },
        { id: 'q_f2', title: 'How do you track your projects currently?', options: ['Spreadsheets & Docs', 'Project Management tools (Notion, Trello)', 'Notebooks / Mental tracking', 'Scattered across multiple apps'] }
      ];
    } else {
      specific = [
        { id: 'q_s1', title: 'What describes your current career phase?', options: ['Pushing for a promotion', 'Managing a new team', 'Work-life balance focus', 'Looking for a switch'] },
        { id: 'q_s2', title: 'How much of your day is spent in meetings?', options: ['Less than 1 hour', '1-3 hours', '3-5 hours (Too many)', 'Most of my day'] }
      ];
    }
  } else if (userType === 'student' || userType === 'STUDENT') {
    specific = [
       { id: 'q_st1', title: 'What is your biggest bottleneck in studying?', options: ['Lack of focus/procrastination', 'Too much material to synthesize', 'Tracking assignments & deadlines', 'Finding good research resources'] },
       { id: 'q_st2', title: 'How do you prefer to consume study material?', options: ['Reading notes & docs', 'Watching videos & lectures', 'Solving practice questions', 'Group study & discussions'] }
    ];
  } else {
    specific = [
      { id: 'q_gen1', title: 'What areas of your life need the most organization?', options: ['Health & Wellness tracking', 'Financial planning & bills', 'Travel & Event planning', 'Daily routines & habits'] }
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
  // --- Flow State ---
  // 0: Identity (Name, Phone, OTP)
  // 1: Primary User Type
  // 2: Specific Sub-Type
  // 3 to (3 + questions.length - 1): Questions
  // N: OAuth Integrations
  // N+1: Building Dashboard...
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // --- Profile State ---
  const [name, setName] = useState(initialProfile?.name || '');
  const [phone, setPhone] = useState(initialProfile?.phoneNumber || '');
  const [gender, setGender] = useState<'female' | 'male' | 'non_binary' | 'prefer_not_to_say'>(initialProfile?.gender || 'prefer_not_to_say');
  const [userType, setUserType] = useState<UserType>(initialProfile?.userType || 'working_professional');
  const [workingCategory, setWorkingCategory] = useState<WorkingProfessionalCategory>(initialProfile?.workingCategory || 'salaried');
  const [subCategory, setSubCategory] = useState<string>('');
  
  // Admin Login Prompt
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');
  
  // Answers state
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Auth/Integrations State
  const [perms, setPerms] = useState({ gmail: false, calendar: false, whatsapp: false });
  const [buildingStage, setBuildingStage] = useState(0);

  // Dynamic questions based on selected type
  const questions = useMemo(() => getQuestions(userType, workingCategory), [userType, workingCategory]);

  const OAUTH_STEP = 3 + questions.length;
  const BUILDING_STEP = OAUTH_STEP + 1;

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

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    setTimeout(() => {
      goToNext();
    }, 350); // Slight delay so user sees selection
  };

  const finalizeOnboarding = (overrideProfile?: Partial<UserProfile>) => {
    const updated: UserProfile = {
      name: name.trim() || 'Life OS Member',
      phoneNumber: phone.trim(),
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

  // CSS for slide animation
  const slideClass = slideDirection === 'right' ? 'animate-[slideInRight_0.3s_ease-out]' : 'animate-[slideInLeft_0.3s_ease-out]';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      <div className={`w-full max-w-xl h-[600px] rounded-3xl border shadow-2xl flex flex-col relative overflow-hidden ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Header - Hidden on building step */}
        {currentStep < BUILDING_STEP && (
          <div className={`px-6 py-4 border-b flex items-center justify-between z-10 ${
            isDarkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-slate-50 border-zinc-200'
          }`}>
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button onClick={goToPrev} className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
              )}
              <h2 className="text-lg font-bold">Personalize Life OS</h2>
            </div>
            
            {/* Progress dots */}
            <div className="flex gap-1">
              {Array.from({ length: OAUTH_STEP + 1 }).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${
                  i === currentStep ? 'w-4 bg-blue-500' : i < currentStep ? 'w-1.5 bg-blue-300 dark:bg-blue-800' : 'w-1.5 bg-zinc-200 dark:bg-zinc-700'
                }`} />
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Content Area */}
        <div key={currentStep} className={`flex-1 overflow-y-auto p-6 flex flex-col ${slideClass}`}>
          
          {/* STEP 0: IDENTITY */}
          {currentStep === 0 && (
            <div className="flex flex-col h-full justify-center space-y-6 max-w-sm mx-auto w-full">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-3xl text-white font-bold mb-4 shadow-lg shadow-blue-500/30">L</div>
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
                    placeholder="e.g. Arjun Sharma"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Phone Number (Optional)</label>
                    <span className="text-[11px] text-zinc-400">For WhatsApp & Direct Calls</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Gender (Tailors health, biometric & routine skills)</label>
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
              <div className="mt-auto pt-8">
                <button
                  onClick={goToNext}
                  disabled={!name.trim()}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold rounded-xl transition-all shadow-lg"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: PRIMARY USER TYPE (5 Personas) */}
          {currentStep === 1 && (
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">What best describes you?</h3>
                <p className="text-xs text-zinc-500">Life OS configures distinct skill sets based on your role.</p>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: 'working_professional', icon: '💼', title: 'Working Professional', desc: 'Corporate, Tech, Consulting & Salaried' },
                  { id: 'entrepreneur', icon: '🚀', title: 'Entrepreneur & Founder', desc: 'Startups, Agency Owners & Growth Leaders' },
                  { id: 'student', icon: '🎓', title: 'Student', desc: 'School, University & Competitive Exams' },
                  { id: 'seniors', icon: '☕', title: 'Home & Personal', desc: 'Retirees, Homemakers & Family Managers' },
                  { id: 'admin', icon: '🛡️', title: 'Admin / System Commander', desc: 'Master credentials verification & sovereign unlock' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      if (type.id === 'admin') {
                        setIsAdminLoginOpen(true);
                      } else if (type.id === 'entrepreneur') {
                        setUserType('working_professional');
                        setWorkingCategory('entrepreneur');
                        setTimeout(goToNext, 300);
                      } else {
                        setUserType(type.id as UserType);
                        setTimeout(goToNext, 300);
                      }
                    }}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all text-left group ${
                      (userType === type.id || (type.id === 'admin' && isAdminLoginOpen))
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50'
                        : isDarkMode ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="text-2xl bg-zinc-100 dark:bg-zinc-900 w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0">{type.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm leading-tight">{type.title}</h4>
                      <p className="text-[11px] text-zinc-500 truncate">{type.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${userType === type.id ? 'border-blue-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                      {userType === type.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Inline Admin Verification Prompt */}
              {isAdminLoginOpen && (
                <div className="mt-4 p-4 rounded-2xl border border-blue-500/60 bg-blue-500/5 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                      <span>🛡️</span> Admin Credentials Verification
                    </h4>
                    <button type="button" onClick={() => setIsAdminLoginOpen(false)} className="text-xs text-zinc-400 hover:text-zinc-200">Cancel</button>
                  </div>
                  <input
                    type="email"
                    placeholder="Enter Admin Gmail (e.g. dhruvabalde@gmail.com)"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
                  />
                  <input
                    type="password"
                    placeholder="Enter 6-Digit PIN"
                    maxLength={6}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
                  />
                  {adminError && <p className="text-xs text-red-500 font-medium">{adminError}</p>}
                  <button
                    type="button"
                    onClick={() => {
                      const normEmail = (adminEmail || '').trim().toLowerCase();
                      const cleanPin = (adminPin || '').trim();
                      if (cleanPin === '111111' && (normEmail.includes('dhruva') || normEmail.includes('admin') || normEmail === 'dhruvabalde@gmail.com' || normEmail === 'ddhruva21balde@gmail.com')) {
                        finalizeOnboarding({
                          name: normEmail.split('@')[0],
                          email: normEmail,
                          userType: 'admin' as any,
                        });
                      } else {
                        setAdminError('Invalid Admin Gmail or PIN.');
                      }
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    Authorize & Launch Admin Life OS ↗
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SPECIFIC CATEGORY */}
          {currentStep === 2 && (
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Let's get more specific.</h3>
                <p className="text-sm text-zinc-500">Select your specific category so we can tailor your dashboards.</p>
              </div>
              
              {userType === 'working_professional' && (
                <div className="mb-6 grid grid-cols-2 gap-2">
                  {['salaried', 'entrepreneur', 'freelancer', 'self_employed'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setWorkingCategory(cat as any); setSubCategory(''); }}
                      className={`p-3 rounded-xl text-sm font-bold capitalize border text-center transition-all ${
                        workingCategory === cat ? 'bg-blue-600 border-blue-600 text-white' : isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-2">
                  {(SUB_CATEGORIES_MAP[userType === 'working_professional' ? workingCategory : userType] || SUB_CATEGORIES_MAP['student']).map(sub => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSubCategory(sub);
                        setTimeout(goToNext, 300);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium ${
                        subCategory === sub
                          ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : isDarkMode ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 to (3 + questions.length - 1): DYNAMIC QUESTIONS */}
          {currentStep >= 3 && currentStep < OAUTH_STEP && (
            <div className="flex flex-col h-full justify-center max-w-md mx-auto w-full">
              <div className="mb-8">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 block">Question {currentStep - 2} of {questions.length}</span>
                <h3 className="text-2xl font-bold leading-tight">{questions[currentStep - 3].title}</h3>
              </div>
              
              <div className="space-y-3">
                {questions[currentStep - 3].options.map((opt, idx) => {
                  const qId = questions[currentStep - 3].id;
                  const isSelected = answers[qId] === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(qId, opt)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : isDarkMode ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-600' : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <span className={`font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : ''}`}>{opt}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400'
                      }`}>
                        {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* OAUTH INTEGRATIONS */}
          {currentStep === OAUTH_STEP && (
            <div className="flex flex-col h-full justify-center max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full mx-auto flex items-center justify-center text-3xl mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Connect Your World</h3>
                <p className="text-sm text-zinc-500">Life OS needs access to securely automate your workflows. Grant permissions one by one.</p>
              </div>

              <div className="space-y-4">
                {/* Gmail & Calendar */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700' : 'bg-white border-zinc-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold">G</div>
                    <div>
                      <p className="font-bold text-sm">Google Workspace</p>
                      <p className="text-[10px] text-zinc-500">Gmail, Calendar, Docs & Drive</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPerms(p => ({...p, gmail: !p.gmail}))}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${perms.gmail ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {perms.gmail ? 'Connected ✓' : 'Connect'}
                  </button>
                </div>

                {/* WhatsApp */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-zinc-800/40 border-zinc-700' : 'bg-white border-zinc-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-bold">W</div>
                    <div>
                      <p className="font-bold text-sm">WhatsApp Business</p>
                      <p className="text-[10px] text-zinc-500">Cloud API Integration</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPerms(p => ({...p, whatsapp: !p.whatsapp}))}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${perms.whatsapp ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {perms.whatsapp ? 'Connected ✓' : 'Connect'}
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={goToNext}
                  className="w-full py-4 bg-black dark:bg-white dark:text-black hover:scale-[1.02] text-white font-bold rounded-2xl transition-all shadow-lg text-lg flex items-center justify-center gap-2"
                >
                  Generate My Life OS <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* BUILDING SCREEN */}
          {currentStep === BUILDING_STEP && (
            <div className="flex flex-col h-full justify-center items-center text-center max-w-sm mx-auto animate-pulse">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600 text-2xl">L</div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Building your Life OS...</h3>
              
              <div className="space-y-3 w-full text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <p className={buildingStage >= 0 ? 'text-blue-600 dark:text-blue-400' : ''}>✓ Analyzing your role and goals</p>
                <p className={`transition-opacity ${buildingStage >= 1 ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-30'}`}>✓ Generating custom trackers in Google Sheets</p>
                <p className={`transition-opacity ${buildingStage >= 2 ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-30'}`}>✓ Provisioning AI autonomous skill packs</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
