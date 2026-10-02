'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface RoutineStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface RoutineItem {
  id: string;
  title: string;
  category?: string;
  frequency?: string;
  durationMinutes?: number;
  steps: RoutineStep[];
  googleTaskId?: string;
}

interface RoutinePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: RoutineItem | null;
  onToggleStep: (routineId: string, stepId: string, completed: boolean) => void;
  isDarkMode?: boolean;
}

export default function RoutinePlayerModal({
  isOpen,
  onClose,
  routine,
  onToggleStep,
  isDarkMode = false,
}: RoutinePlayerModalProps) {
  const initialDuration = (routine?.durationMinutes || 15) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompletedAlert, setIsCompletedAlert] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (routine) {
      setSecondsRemaining((routine.durationMinutes || 15) * 60);
      setIsRunning(false);
      setIsCompletedAlert(false);
    }
  }, [routine]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsCompletedAlert(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  if (!isOpen || !routine) return null;

  const totalSteps = routine.steps.length;
  const completedSteps = routine.steps.filter(s => s.completed).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  function handleResetTimer() {
    setIsRunning(false);
    setSecondsRemaining((routine?.durationMinutes || 15) * 60);
    setIsCompletedAlert(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-all ${
        isDarkMode ? 'bg-[#0f1422] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              ▶
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg leading-tight">{routine.title}</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {routine.frequency || 'Recurring'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Google Tasks Routine • {routine.durationMinutes || 15} min target
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Routine Player Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Big Timer Card */}
          <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center relative overflow-hidden ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
              Routine Focus Timer
            </span>
            <div className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-purple-600 dark:text-purple-400 my-2">
              {formattedTime}
            </div>

            {/* Timer Action Buttons */}
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                <span>{isRunning ? '⏸ Pause' : '▶ Start Timer'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetTimer}
                className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold text-xs text-slate-600 dark:text-slate-300 transition-colors"
              >
                Reset
              </button>
            </div>

            {isCompletedAlert && (
              <div className="mt-4 p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold animate-bounce flex items-center gap-2">
                <span>🎉</span>
                <span>Time complete! Great job maintaining your routine.</span>
              </div>
            )}
          </div>

          {/* Steps Progress */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-slate-300">
                Routine Steps ({completedSteps}/{totalSteps})
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-2">
              {routine.steps.map((step, idx) => (
                <div
                  key={step.id}
                  onClick={() => onToggleStep(routine.id, step.id, step.completed)}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    step.completed
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                      : isDarkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    step.completed
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 dark:border-slate-600 text-slate-400'
                  }`}>
                    {step.completed ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium flex-1 ${step.completed ? 'line-through opacity-75' : ''}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Natively synced to Google Tasks
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
          >
            Done & Save
          </button>
        </div>
      </div>
    </div>
  );
}
