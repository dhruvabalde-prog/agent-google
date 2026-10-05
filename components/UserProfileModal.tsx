'use client';

import React, { useState } from 'react';
import { UserProfile, UserType, AppMode } from '@/lib/types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  isDarkMode?: boolean;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  isDarkMode = false,
}: UserProfileModalProps) {
  const [name, setName] = useState(profile?.name || '');
  const [phoneDigits, setPhoneDigits] = useState(
    profile?.phoneNumber ? profile.phoneNumber.replace(/\D/g, '').slice(-10) : ''
  );
  const [gender, setGender] = useState<'female' | 'male' | 'non_binary' | 'prefer_not_to_say'>(
    profile?.gender || 'prefer_not_to_say'
  );
  const [userType, setUserType] = useState<UserType>(profile?.userType || 'working_professional');
  const [subCategory, setSubCategory] = useState(profile?.professionalSubCategory || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const finalPhone = phoneDigits ? `+91 ${phoneDigits}` : '';
    onUpdateProfile({
      name: name.trim() || 'Life OS Member',
      phoneNumber: finalPhone,
      gender,
      userType,
      professionalSubCategory: subCategory,
      updatedAt: new Date().toISOString(),
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
              👤
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight">Profile & Preferences</h2>
              <p className="text-xs text-zinc-400">Configure identity, communication & daily routines</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Mobile Number (WhatsApp & Direct Calls)
            </label>
            <div className={`flex items-center rounded-xl border overflow-hidden ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
            }`}>
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-200/70 dark:bg-zinc-700/60 font-bold text-xs text-zinc-700 dark:text-zinc-200 border-r border-inherit select-none">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={phoneDigits}
                onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit number"
                className="flex-1 px-3.5 py-2.5 bg-transparent focus:outline-none font-mono text-sm tracking-wider"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Gender (Tailors health, biometric & routines)
            </label>
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
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
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

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Primary Role Persona
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
              className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              }`}
            >
              <option value="working_professional">Working Professional (Corporate, Tech, Salaried)</option>
              <option value="entrepreneur">Entrepreneur & Founder</option>
              <option value="student">Student (University, Exams)</option>
              <option value="seniors">Senior / Retired / Homemaker</option>
              <option value="other">General Executive</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Domain / Specialization
            </label>
            <input
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. Software Architect, Product Director, CA"
              className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              }`}
            />
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
              ✓ Profile preferences successfully saved!
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2 border-t border-inherit">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
