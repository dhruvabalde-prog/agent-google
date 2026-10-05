'use client';

import React, { useState } from 'react';
import { UserProfile, UserType, StudentSubType, WorkingProfessionalCategory, WorkingProfessionalSubCategory, FamilyMember, TeamMember } from '@/lib/types';

interface OnboardingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
  isDarkMode?: boolean;
}

export default function OnboardingFlowModal({
  isOpen,
  onClose,
  onSaveProfile,
  initialProfile,
  isDarkMode = false,
}: OnboardingFlowModalProps) {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(initialProfile?.name || '');
  const [personalEmail, setPersonalEmail] = useState(initialProfile?.email || '');
  const [workEmail, setWorkEmail] = useState(initialProfile?.workEmail || '');
  const [userType, setUserType] = useState<UserType>(initialProfile?.userType || 'working_professional');
  
  // Student fields
  const [studentSubType, setStudentSubType] = useState<StudentSubType>(initialProfile?.studentSubType || 'competitive_exam');
  const [studentAccountType, setStudentAccountType] = useState<'personal' | 'institute'>('personal');
  const [instituteCode, setInstituteCode] = useState('');

  // Working professional fields
  const [workingCategory, setWorkingCategory] = useState<WorkingProfessionalCategory>(initialProfile?.workingCategory || 'salaried');
  const [workingSubCategory, setWorkingSubCategory] = useState<WorkingProfessionalSubCategory>(initialProfile?.workingSubCategory || 'Software Engineer / Tech Lead');
  const [orgAccountType, setOrgAccountType] = useState<'personal' | 'organization'>('personal');
  const [orgCode, setOrgCode] = useState('');

  // Enterprise industry
  const [enterpriseIndustry, setEnterpriseIndustry] = useState('Banking & FinTech');

  // Family Members (up to 5, max 2 seniors, max 2 students)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialProfile?.familyMembers || []);
  const [newFamName, setNewFamName] = useState('');
  const [newFamEmail, setNewFamEmail] = useState('');
  const [newFamRelation, setNewFamRelation] = useState('Parent');
  const [newFamPersona, setNewFamPersona] = useState<'student' | 'senior' | 'other'>('senior');
  const [famError, setFamError] = useState('');

  // Team Members (up to 5)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialProfile?.teamMembers || []);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newTeamRole, setNewTeamRole] = useState('Contributor');
  const [teamError, setTeamError] = useState('');

  // Integrations state
  const [googleWorkspaceConnected, setGoogleWorkspaceConnected] = useState(true);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [whatsappPersonalConnected, setWhatsappPersonalConnected] = useState(true);
  const [whatsappBusinessConnected, setWhatsappBusinessConnected] = useState(false);

  if (!isOpen) return null;

  const seniorCount = familyMembers.filter(f => f.persona === 'senior').length;
  const studentCount = familyMembers.filter(f => f.persona === 'student').length;

  function handleAddFamilyMember() {
    setFamError('');
    if (!newFamEmail || !newFamEmail.includes('@') || !newFamName.trim()) {
      setFamError('Please provide a valid name and email address.');
      return;
    }
    if (familyMembers.length >= 5) {
      setFamError('Maximum 5 family members allowed.');
      return;
    }
    if (newFamPersona === 'senior' && seniorCount >= 2) {
      setFamError('Maximum 2 seniors can be added.');
      return;
    }
    if (newFamPersona === 'student' && studentCount >= 2) {
      setFamError('Maximum 2 students can be added.');
      return;
    }

    const newMember: FamilyMember = {
      id: `fam-${Date.now()}`,
      name: newFamName.trim(),
      email: newFamEmail.trim().toLowerCase(),
      relationship: newFamRelation,
      persona: newFamPersona,
      inviteStatus: 'invited',
    };

    setFamilyMembers(prev => [...prev, newMember]);
    setNewFamName('');
    setNewFamEmail('');
  }

  function handleAddTeamMember() {
    setTeamError('');
    if (!newTeamEmail || !newTeamEmail.includes('@') || !newTeamName.trim()) {
      setTeamError('Please provide a valid name and email address.');
      return;
    }
    if (teamMembers.length >= 5) {
      setTeamError('Maximum 5 team members allowed.');
      return;
    }

    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      email: newTeamEmail.trim().toLowerCase(),
      role: newTeamRole.trim(),
      inviteStatus: 'invited',
    };

    setTeamMembers(prev => [...prev, newMember]);
    setNewTeamName('');
    setNewTeamEmail('');
  }

  function handleCompleteOnboarding() {
    const updated: UserProfile = {
      name: name.trim() || 'Life OS Member',
      email: personalEmail.trim().toLowerCase(),
      workEmail: workEmail.trim().toLowerCase(),
      userType,
      studentSubType: userType === 'student' ? studentSubType : undefined,
      instituteCode: userType === 'student' && studentAccountType === 'institute' ? instituteCode : undefined,
      workingCategory: userType === 'working_professional' ? workingCategory : undefined,
      workingSubCategory: userType === 'working_professional' ? workingSubCategory : undefined,
      organizationCode: userType === 'working_professional' && orgAccountType === 'organization' ? orgCode : undefined,
      familyMembers,
      teamMembers,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    onSaveProfile(updated);
    onClose();
  }

  const SUB_CATEGORIES_MAP: { [key: string]: WorkingProfessionalSubCategory[] } = {
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
  };

  const MAINSTREAM_INDUSTRIES = [
    'Banking & FinTech', 'Healthcare & Pharma', 'IT & SaaS', 'Retail & E-Commerce', 'Manufacturing & Logistics',
    'Education & EdTech', 'Real Estate & Infrastructure', 'Telecommunications', 'Automotive & Mobility', 'Media & Entertainment'
  ];

  const NICHE_INDUSTRIES = [
    'Aerospace & Defense', 'DeepTech & Quantum', 'Clean Energy & ESG', 'Agritech & Cold Chains', 'BioTech & Genomics',
    'Maritime Shipping & Ports', 'Cyber Defense & Intelligence', 'Specialty Chemicals', 'Gaming & Metaverse', 'GovTech & Civic Infrastructure'
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className={`rounded-3xl max-w-2xl w-full my-auto border shadow-2xl overflow-hidden flex flex-col transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Top Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-blue-500/30">
              L
            </div>
            <div>
              <h2 className="text-lg font-bold">Personalize Your Life OS</h2>
              <p className="text-xs text-zinc-400">Step {step} of 4: Setup your sovereign workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-2 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* STEP 1: Basic Identity & User Persona Selection */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Select Your Profile Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Student */}
                  <div
                    onClick={() => setUserType('student')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      userType === 'student'
                        ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/40'
                        : isDarkMode
                        ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">🎓</div>
                    <div className="font-bold text-sm">Student</div>
                    <div className="text-xs text-zinc-500 mt-1">School, Competitive Exam (UPSC/JEE/NEET), University</div>
                  </div>

                  {/* Working Professional */}
                  <div
                    onClick={() => setUserType('working_professional')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      userType === 'working_professional'
                        ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/40'
                        : isDarkMode
                        ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">💼</div>
                    <div className="font-bold text-sm">Working Professional</div>
                    <div className="text-xs text-zinc-500 mt-1">Salaried, Self-Employed, Founder, Freelancer</div>
                  </div>

                  {/* Seniors */}
                  <div
                    onClick={() => setUserType('seniors')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      userType === 'seniors'
                        ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40'
                        : isDarkMode
                        ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌸</div>
                    <div className="font-bold text-sm">Seniors</div>
                    <div className="text-xs text-zinc-500 mt-1">Retired citizen — Minimalist, health & family focus</div>
                  </div>

                  {/* Enterprise (Locked) */}
                  <div
                    onClick={() => setUserType('enterprise')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                      userType === 'enterprise'
                        ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/40'
                        : isDarkMode
                        ? 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-700 text-white">
                      🔒 LOCKED
                    </span>
                    <div className="text-2xl mb-1">🏢</div>
                    <div className="font-bold text-sm">Enterprise</div>
                    <div className="text-xs text-zinc-500 mt-1">Mainstream & niche industries (Invitation only)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Persona Sub-Category Specialization & Work Mail */}
          {step === 2 && (
            <div className="space-y-5">
              {/* STUDENT DETAILS */}
              {userType === 'student' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Student Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'school', label: 'School Student' },
                        { id: 'competitive_exam', label: 'Competitive Exam' },
                        { id: 'university', label: 'University / College' },
                      ].map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStudentSubType(s.id as any)}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                            studentSubType === s.id
                              ? 'bg-blue-600 text-white border-blue-600'
                              : isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Account Setup</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStudentAccountType('personal')}
                        className={`p-3 rounded-xl text-xs font-bold border ${
                          studentAccountType === 'personal'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-zinc-800/40 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        Personal Account
                      </button>
                      <button
                        type="button"
                        disabled
                        className="p-3 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-800/20 text-zinc-500 relative cursor-not-allowed"
                      >
                        Institute Code 🔒 (Locked)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* WORKING PROFESSIONAL DETAILS */}
              {userType === 'working_professional' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">
                      Professional Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'salaried', label: 'Salaried Employee' },
                        { id: 'self_employed', label: 'Self-Employed (CA/Doc/Lawyer/Trader)' },
                        { id: 'entrepreneur', label: 'Entrepreneur / Business Owner' },
                        { id: 'freelancer', label: 'Freelancer / Gig Worker' },
                      ].map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setWorkingCategory(c.id as any);
                            setWorkingSubCategory(SUB_CATEGORIES_MAP[c.id as WorkingProfessionalCategory][0]);
                          }}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all text-left ${
                            workingCategory === c.id
                              ? 'bg-blue-600 text-white border-blue-600'
                              : isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">
                      Specific Sub-Category (5 Profiles)
                    </label>
                    <select
                      value={workingSubCategory}
                      onChange={(e) => setWorkingSubCategory(e.target.value as any)}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    >
                      {SUB_CATEGORIES_MAP[workingCategory].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                        Personal Gmail ID
                      </label>
                      <input
                        type="email"
                        value={personalEmail}
                        onChange={(e) => setPersonalEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className={`w-full px-3 py-2 rounded-xl text-xs border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                        Work Domain Mail (or 2nd Gmail)
                      </label>
                      <input
                        type="email"
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        placeholder="you@company.com"
                        className={`w-full px-3 py-2 rounded-xl text-xs border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>
                  </div>

                  {workingCategory === 'salaried' && (
                    <div>
                      <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Organization Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setOrgAccountType('personal')}
                          className={`p-2.5 rounded-xl text-xs font-bold border ${
                            orgAccountType === 'personal'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-zinc-800/40 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          Personal Account
                        </button>
                        <button
                          type="button"
                          disabled
                          className="p-2.5 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-800/20 text-zinc-500 relative cursor-not-allowed"
                        >
                          Organization SSO 🔒 (Locked)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SENIORS DETAILS */}
              {userType === 'seniors' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                  <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    Retired Senior Citizen Experience
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    High contrast text, large tap targets, and streamlined tools: medicine schedules, gentle daily walk reminders, and 1-tap WhatsApp check-ins with your children.
                  </p>
                </div>
              )}

              {/* ENTERPRISE DETAILS */}
              {userType === 'enterprise' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs">
                    <span className="font-bold text-purple-400">Enterprise Edition (Locked)</span>: Choose your industry. Enterprise tier includes dedicated tenant air-gapping, Spanner compliance ledgers, and unlimited automation cron heartbeats.
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Industry Sector</label>
                    <select
                      value={enterpriseIndustry}
                      onChange={(e) => setEnterpriseIndustry(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      }`}
                    >
                      <optgroup label="Mainstream Industries">
                        {MAINSTREAM_INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </optgroup>
                      <optgroup label="Niche Industries">
                        {NICHE_INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </optgroup>
                      <option value="Other">Other Custom Industry</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Family & Team Collaboration Hub Setup */}
          {step === 3 && (
            <div className="space-y-5">
              {userType !== 'student' ? (
                <>
                  {/* Family Members Section */}
                  <div className="p-4 rounded-2xl border border-inherit space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                        👨‍👩‍👧‍👦 Family Members (Max 5: 2 Seniors, 2 Students)
                      </h4>
                      <span className="text-[11px] text-zinc-400">{familyMembers.length}/5 added</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={newFamName}
                        onChange={(e) => setNewFamName(e.target.value)}
                        placeholder="Name"
                        className={`px-3 py-1.5 rounded-lg text-xs border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                      <input
                        type="email"
                        value={newFamEmail}
                        onChange={(e) => setNewFamEmail(e.target.value)}
                        placeholder="Gmail ID"
                        className={`px-3 py-1.5 rounded-lg text-xs border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                      <select
                        value={newFamPersona}
                        onChange={(e) => setNewFamPersona(e.target.value as any)}
                        className={`px-2 py-1.5 rounded-lg text-xs border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      >
                        <option value="senior">Senior ({seniorCount}/2)</option>
                        <option value="student">Student ({studentCount}/2)</option>
                        <option value="other">Other Relative</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddFamilyMember}
                        disabled={!newFamEmail.includes('@') || !newFamName.trim() || familyMembers.length >= 5}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
                      >
                        Send Invitation
                      </button>
                    </div>

                    {famError && <div className="text-[11px] text-red-500 font-semibold">{famError}</div>}

                    {/* Added Family Members Badges */}
                    {familyMembers.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {familyMembers.map((fm, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs">
                            <span className="font-semibold">{fm.name}</span>
                            <span className="text-[10px] text-zinc-400">({fm.persona})</span>
                            <span className="text-[9px] px-1.5 rounded-full bg-emerald-600 text-white font-bold">Invited ✓</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Team Members Section */}
                  <div className="p-4 rounded-2xl border border-inherit space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                        👥 Team Members (Max 5)
                      </h4>
                      <span className="text-[11px] text-zinc-400">{teamMembers.length}/5 added</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Name"
                        className={`px-3 py-1.5 rounded-lg text-xs border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                      <input
                        type="email"
                        value={newTeamEmail}
                        onChange={(e) => setNewTeamEmail(e.target.value)}
                        placeholder="Work / Gmail ID"
                        className={`px-3 py-1.5 rounded-lg text-xs border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                      <input
                        type="text"
                        value={newTeamRole}
                        onChange={(e) => setNewTeamRole(e.target.value)}
                        placeholder="Role / Dept"
                        className={`px-3 py-1.5 rounded-lg text-xs border ${
                          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleAddTeamMember}
                        disabled={!newTeamEmail.includes('@') || !newTeamName.trim() || teamMembers.length >= 5}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
                      >
                        Send Invite
                      </button>
                    </div>

                    {teamError && <div className="text-[11px] text-red-500 font-semibold">{teamError}</div>}

                    {/* Added Team Members Badges */}
                    {teamMembers.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {teamMembers.map((tm, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs">
                            <span className="font-semibold">{tm.name}</span>
                            <span className="text-[10px] text-zinc-400">({tm.role})</span>
                            <span className="text-[9px] px-1.5 rounded-full bg-indigo-600 text-white font-bold">Invited ✓</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-2">
                  <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                    Student Individual Focus Mode
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Students focus on personal syllabus tracking, active recall, and mock test analytics. Family & team management unlocks on Working Professional profiles.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Tool Permissions & Connectivity */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 mb-2">
                Connect your work and personal accounts. Life OS keeps credentials isolated between Home & Work.
              </div>

              <div className="space-y-2.5">
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                  isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌐</span>
                    <div>
                      <div className="font-bold">Google Workspace OAuth</div>
                      <div className="text-[11px] text-zinc-400">Docs, Sheets, Slides, Calendar, Tasks, Keep, Gmail</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGoogleWorkspaceConnected(!googleWorkspaceConnected)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      googleWorkspaceConnected ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {googleWorkspaceConnected ? 'Connected ✓' : 'Connect'}
                  </button>
                </div>

                <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                  isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💼</span>
                    <div>
                      <div className="font-bold">Microsoft 365 Bridge</div>
                      <div className="text-[11px] text-zinc-400">Outlook Calendar & Mail, OneDrive, Office Docs</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMicrosoftConnected(!microsoftConnected)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      microsoftConnected ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {microsoftConnected ? 'Connected ✓' : 'Connect'}
                  </button>
                </div>

                <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                  isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💬</span>
                    <div>
                      <div className="font-bold">WhatsApp Personal (Home Mode)</div>
                      <div className="text-[11px] text-zinc-400">Family check-ins, medical updates, 1-tap wa.me drafts</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWhatsappPersonalConnected(!whatsappPersonalConnected)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      whatsappPersonalConnected ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {whatsappPersonalConnected ? 'Active ✓' : 'Connect'}
                  </button>
                </div>

                <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                  isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏢</span>
                    <div>
                      <div className="font-bold">WhatsApp Business (Work Mode)</div>
                      <div className="text-[11px] text-zinc-400">Client outreach, RFQ inquiries, fee reminder notices</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWhatsappBusinessConnected(!whatsappBusinessConnected)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      whatsappBusinessConnected ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {whatsappBusinessConnected ? 'Active ✓' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50 border-zinc-200'
        }`}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              ← Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteOnboarding}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
            >
              Launch Life OS ✨
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
