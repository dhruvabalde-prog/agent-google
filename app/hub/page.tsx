'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface HubTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
}

interface RoutineStep {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
}

interface HubRoutine {
  id: string;
  name: string;
  timing: string;
  frequency: 'Daily' | 'Weekdays' | 'Weekly';
  totalDurationMinutes: number;
  steps: RoutineStep[];
}

interface GoalMilestone {
  milestoneNum: number;
  title: string;
  targetDate: string;
  metric: string;
  status: 'Pending' | 'In Progress' | 'Achieved';
}

interface HubGoal {
  id: string;
  outcome: string;
  targetDate: string;
  northStar: string;
  frequency: 'Weekly' | 'Bi-Weekly' | 'Monthly';
  progressPercent: number;
  sheetUrl?: string;
  milestones: GoalMilestone[];
  createdAt: string;
}

export default function HubPage() {
  const [tasks, setTasks] = useState<HubTask[]>([]);
  const [routines, setRoutines] = useState<HubRoutine[]>([]);
  const [goals, setGoals] = useState<HubGoal[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  // Quick Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalOutcome, setGoalOutcome] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalNorthStar, setGoalNorthStar] = useState('');
  const [goalFrequency, setGoalFrequency] = useState<'Weekly' | 'Bi-Weekly' | 'Monthly'>('Weekly');
  const [goalMilestoneCount, setGoalMilestoneCount] = useState<number>(5);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  // Mobile Active Tab (tasks | routines | goals)
  const [mobileTab, setMobileTab] = useState<'tasks' | 'routines' | 'goals'>('tasks');

  // Load data from /api/hub
  async function loadHubData() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/hub');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setRoutines(data.routines || []);
        setGoals(data.goals || []);
        setIsAuthenticated(data.authenticated || false);
        setUser(data.user || null);
        setLastSyncedAt(data.lastSyncedAt || new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Failed to load hub data:', e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHubData();
  }, []);

  // Toggle Task Completion
  async function handleToggleTask(taskId: string) {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: t.status === 'completed' ? 'needsAction' : 'completed' };
      }
      return t;
    }));

    try {
      await fetch('/api/hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_task', taskId }),
      });
    } catch (e) {
      console.error('Error toggling task:', e);
    }
  }

  // Quick Add Task
  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsAddingTask(true);
    try {
      const res = await fetch('/api/hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_task', title: newTaskTitle.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tasks) setTasks(data.tasks);
        setNewTaskTitle('');
      }
    } catch (e) {
      console.error('Error creating task:', e);
    } finally {
      setIsAddingTask(false);
    }
  }

  // Toggle Routine Step
  async function handleToggleRoutineStep(routineId: string, stepId: string) {
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          steps: r.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s),
        };
      }
      return r;
    }));

    try {
      await fetch('/api/hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_routine_step', routineId, stepId }),
      });
    } catch (e) {
      console.error('Error toggling routine step:', e);
    }
  }

  // Create Goal with Suchi planning & Google Sheets Project Tracker
  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!goalOutcome.trim() || !goalTargetDate) return;
    setIsCreatingGoal(true);
    try {
      const res = await fetch('/api/hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_goal',
          outcome: goalOutcome.trim(),
          targetDate: goalTargetDate,
          northStar: goalNorthStar.trim(),
          frequency: goalFrequency,
          milestoneCount: goalMilestoneCount,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.goals) setGoals(data.goals);
        setIsGoalModalOpen(false);
        setGoalOutcome('');
        setGoalTargetDate('');
        setGoalNorthStar('');
      }
    } catch (e) {
      console.error('Error creating goal:', e);
    } finally {
      setIsCreatingGoal(false);
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden select-none transition-colors">
      {/* HEADER */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 flex items-center justify-between z-20 flex-shrink-0 backdrop-blur-md">
        {/* Left: Brand & Page Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="18" height="18">
                <circle cx="16" cy="16" r="12" fill="none" stroke="#475569" strokeWidth="2"/>
                <polygon points="16,6.5 19,16 16,14.5" fill="#38bdf8"/>
                <polygon points="16,25.5 19,16 16,17.5" fill="#94a3b8"/>
                <circle cx="16" cy="16" r="2.5" fill="#ffffff"/>
              </svg>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Suchi</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                Life OS Hub
              </span>
            </div>
          </Link>

          <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tasks (Google Tasks) • Routines • Goals & North Stars (Google Sheets)
          </span>
        </div>

        {/* Right: Sync Status & Back Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{isAuthenticated ? 'Synced with Google Cloud' : 'Local Workspace Mode'}</span>
            {lastSyncedAt && <span className="text-slate-400 dark:text-slate-500">({lastSyncedAt})</span>}
          </div>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Chat</span>
          </Link>
        </div>
      </header>

      {/* MOBILE SEGMENTED TABS SWITCHER */}
      <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 p-2 flex gap-1">
        {[
          { id: 'tasks', label: `Tasks (${tasks.length})` },
          { id: 'routines', label: `Routines (${routines.length})` },
          { id: 'goals', label: `Goals & North Stars (${goals.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id as any)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mobileTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN SINGLE-PAGE CONTENT (3 Panels fitting in one viewport) */}
      <main className="flex-1 overflow-hidden p-3 sm:p-5">
        <div className="h-full w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* COLUMN 1: TASKS (Google Tasks in Backend) */}
          <section className={`flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-xl overflow-hidden ${
            mobileTab === 'tasks' ? 'flex' : 'hidden sm:flex'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daily Tasks</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Google Tasks live sync</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {tasks.filter(t => t.status === 'needsAction').length} pending
              </span>
            </div>

            {/* Quick Add Input */}
            <form onSubmit={handleAddTask} className="my-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-blue-500 transition-colors">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add quick task (press Enter)..."
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                  disabled={isAddingTask}
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim() || isAddingTask}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold disabled:opacity-40"
                >
                  + Add
                </button>
              </div>
            </form>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No active tasks. Add your first task above.
                </div>
              ) : (
                tasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isCompleted
                          ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-snug ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                          {task.title}
                        </p>
                        {task.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{task.notes}</p>
                        )}
                        {task.due && (
                          <span className="text-[9px] text-blue-600 dark:text-blue-400 font-medium block mt-1">
                            Due: {new Date(task.due).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* COLUMN 2: ROUTINES (Timed Step-by-Step Recurring Tasks) */}
          <section className={`flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-xl overflow-hidden ${
            mobileTab === 'routines' ? 'flex' : 'hidden sm:flex'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Timed Routines</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Step-by-step recurring cadences</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                {routines.length} Active
              </span>
            </div>

            {/* Routines List */}
            <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1">
              {routines.map((routine) => {
                const completedSteps = routine.steps.filter(s => s.completed).length;
                const percent = Math.round((completedSteps / routine.steps.length) * 100);

                return (
                  <div key={routine.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded">
                            {routine.frequency}
                          </span>
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{routine.timing}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{routine.name}</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                        {routine.totalDurationMinutes}m
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Progress ({completedSteps}/{routine.steps.length} steps)</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Timed Steps Checklist */}
                    <div className="space-y-1.5 pt-1">
                      {routine.steps.map((step) => (
                        <div
                          key={step.id}
                          onClick={() => handleToggleRoutineStep(routine.id, step.id)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            step.completed
                              ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-100/40 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 line-through'
                              : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={step.completed}
                              onChange={() => {}}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="leading-tight">{step.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                            {step.durationMinutes}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* COLUMN 3: GOALS & NORTH STARS (Suchi Planned + Google Sheets Trackers) */}
          <section className={`flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xl overflow-hidden ${
            mobileTab === 'goals' ? 'flex' : 'hidden sm:flex'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Goals & North Stars</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Google Sheets project trackers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
              >
                <span>+ Plan Goal</span>
              </button>
            </div>

            {/* Goals List */}
            <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1">
              {goals.map((goal) => (
                <div key={goal.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/80 px-2 py-0.5 rounded">
                        Target: {goal.targetDate}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{goal.frequency} Sprints</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">{goal.outcome}</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium flex items-center gap-1">
                      <span className="text-amber-500 dark:text-amber-400">★ North Star:</span>
                      <span className="truncate">{goal.northStar}</span>
                    </p>
                  </div>

                  {/* Progress Bar & Sheets Link */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Overall Progress</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{goal.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Direct Google Sheets Link */}
                  {goal.sheetUrl && (
                    <div className="pt-1">
                      <a
                        href={goal.sheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 px-3 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4h2v4zm0-6h-2V7h2v4zm4 6h-2v-2h2v2zm0-4h-2V9h2v4zm0-6h-2V7h2v2z"/>
                          </svg>
                          Open Google Sheets Tracker
                        </span>
                        <span>↗</span>
                      </a>
                    </div>
                  )}

                  {/* Planned Milestones Timeline */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Suchi Planned Milestones:
                    </span>
                    {goal.milestones.map((m) => (
                      <div
                        key={m.milestoneNum}
                        className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 text-[11px] space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-800 dark:text-slate-300">#{m.milestoneNum}: {m.title}</span>
                          <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                            m.status === 'Achieved'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                              : m.status === 'In Progress'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Target: {m.metric} ({m.targetDate})</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* MODAL: PLAN NEW GOAL WITH SUCHI */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Plan Goal & North Star with Suchi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Suchi will auto-generate milestones and initialize a Google Sheet Project Tracker in your Drive.
                </p>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Target Outcome</label>
                <input
                  type="text"
                  required
                  value={goalOutcome}
                  onChange={(e) => setGoalOutcome(e.target.value)}
                  placeholder="e.g. Build ₹50 Lakh Sovereign Wealth Reserve"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Sprint Frequency</label>
                  <select
                    value={goalFrequency}
                    onChange={(e) => setGoalFrequency(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Weekly">Weekly Sprints</option>
                    <option value="Bi-Weekly">Bi-Weekly Sprints</option>
                    <option value="Monthly">Monthly Reviews</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">North Star Metric Target</label>
                <input
                  type="text"
                  value={goalNorthStar}
                  onChange={(e) => setGoalNorthStar(e.target.value)}
                  placeholder="e.g. Total Liquid Fund: ₹50,00,000 / MRR: $20,000"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Milestones Roadmap Granularity</label>
                <div className="flex gap-2">
                  {[3, 5, 8].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setGoalMilestoneCount(count)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        goalMilestoneCount === count
                          ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {count} Milestones
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGoal}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md disabled:opacity-50"
                >
                  {isCreatingGoal ? 'Suchi Planning & Creating Sheets...' : 'Plan Goal & Initialize Sheets'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
