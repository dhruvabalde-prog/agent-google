'use client';

import React, { useState } from 'react';
import RoutinePlayerModal, { RoutineItem } from './RoutinePlayerModal';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  hasMeet?: boolean;
  meetLink?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  due?: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  isOverdue?: boolean;
  isDueToday?: boolean;
}

export interface GoalItem {
  id: string;
  outcome: string;
  northStar: string;
  targetDate: string;
  progressPercent: number;
  sheetUrl?: string;
}

interface MyDayViewProps {
  tasks: TaskItem[];
  routines: RoutineItem[];
  goals: GoalItem[];
  events: CalendarEvent[];
  onToggleTask: (taskId: string, currentCompleted: boolean) => Promise<void>;
  onAddTask: (title: string, due?: string) => Promise<void>;
  onEditTask: (taskId: string, title: string, due?: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onToggleRoutineStep: (routineId: string, stepId: string, currentCompleted: boolean) => Promise<void>;
  onAddRoutine: (routine: Omit<RoutineItem, 'id'>) => Promise<void>;
  onEditRoutine: (routine: RoutineItem) => Promise<void>;
  onDeleteRoutine: (routineId: string) => Promise<void>;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onEditEvent: (event: CalendarEvent) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  onAddGoal: (goal: Omit<GoalItem, 'id'>) => Promise<void>;
  onEditGoal: (goal: GoalItem) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
  isDarkMode?: boolean;
}

export default function MyDayView({
  tasks,
  routines,
  goals,
  events,
  onToggleTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleRoutineStep,
  onAddRoutine,
  onEditRoutine,
  onDeleteRoutine,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onRefresh,
  isLoading = false,
  isDarkMode = false,
}: MyDayViewProps) {
  // Pill filters ordered strictly: Calendar -> Tasks -> Routines -> Goals -> All
  const [activeFilter, setActiveFilter] = useState<'calendar' | 'tasks' | 'routines' | 'goals' | 'all'>('all');

  // Routine Player State
  const [activeRoutineForPlayer, setActiveRoutineForPlayer] = useState<RoutineItem | null>(null);

  // Modals for Adding / Editing items
  const [modalType, setModalType] = useState<'add_task' | 'edit_task' | 'add_routine' | 'edit_routine' | 'add_event' | 'edit_event' | 'add_goal' | 'edit_goal' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDue, setFormDue] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formHasMeet, setFormHasMeet] = useState(false);
  const [formRoutineSteps, setFormRoutineSteps] = useState('');
  const [formRoutineDuration, setFormRoutineDuration] = useState('15');
  const [formRoutineFrequency, setFormRoutineFrequency] = useState('Daily');
  const [formGoalNorthStar, setFormGoalNorthStar] = useState('');
  const [formGoalTargetDate, setFormGoalTargetDate] = useState('');
  const [formGoalSheetUrl, setFormGoalSheetUrl] = useState('');

  // Counters
  const overdueTasks = tasks.filter(t => t.status === 'needsAction' && t.isOverdue);
  const dueTodayTasks = tasks.filter(t => t.status === 'needsAction' && (t.isDueToday || !t.isOverdue));

  function resetForm() {
    setModalType(null);
    setEditingItem(null);
    setFormTitle('');
    setFormDue('');
    setFormNotes('');
    setFormStartTime('');
    setFormEndTime('');
    setFormHasMeet(false);
    setFormRoutineSteps('');
    setFormRoutineDuration('15');
    setFormRoutineFrequency('Daily');
    setFormGoalNorthStar('');
    setFormGoalTargetDate('');
    setFormGoalSheetUrl('');
  }

  // Open Edit Modals
  function openEditTask(t: TaskItem) {
    setEditingItem(t);
    setFormTitle(t.title);
    setFormDue(t.due || '');
    setModalType('edit_task');
  }

  function openEditEvent(e: CalendarEvent) {
    setEditingItem(e);
    setFormTitle(e.summary);
    setFormStartTime(e.start);
    setFormEndTime(e.end);
    setFormHasMeet(Boolean(e.hasMeet || e.meetLink));
    setModalType('edit_event');
  }

  function openEditRoutine(r: RoutineItem) {
    setEditingItem(r);
    setFormTitle(r.title);
    setFormRoutineDuration(String(r.durationMinutes || 15));
    setFormRoutineFrequency(r.frequency || 'Daily');
    setFormRoutineSteps(r.steps.map(s => s.title).join('\n'));
    setModalType('edit_routine');
  }

  function openEditGoal(g: GoalItem) {
    setEditingItem(g);
    setFormTitle(g.outcome);
    setFormGoalNorthStar(g.northStar);
    setFormGoalTargetDate(g.targetDate);
    setFormGoalSheetUrl(g.sheetUrl || '');
    setModalType('edit_goal');
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 max-w-3xl w-full mx-auto space-y-5">
      {/* 1. Header & Pill Filters (Locked on Top below App Header) */}
      <div className={`sticky top-0 z-20 pb-3 pt-1 backdrop-blur-md border-b transition-colors ${
        isDarkMode ? 'bg-[#0b0f19]/95 border-zinc-800' : 'bg-slate-50/95 border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              My Day
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 shadow-2xs hover:bg-slate-100"
          >
            <span className={isLoading ? 'animate-spin' : ''}>↻</span>
            <span>{isLoading ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>

        {/* Locked Pill Filters in Order: Calendar -> Tasks -> Routines -> Goals -> All */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'calendar', label: 'Calendar', icon: '📅' },
            { id: 'tasks', label: 'Tasks', icon: '☑️' },
            { id: 'routines', label: 'Routines', icon: '▶' },
            { id: 'goals', label: 'Goals', icon: '🎯' },
            { id: 'all', label: 'All', icon: '⚡' },
          ].map(pill => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActiveFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                activeFilter === pill.id
                  ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                  : isDarkMode
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. ALL FILTER VIEW */}
      {activeFilter === 'all' && (
        <div className="space-y-6">
          {/* Overdue and Due Today Badges */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
              🚨 Overdue: {overdueTasks.length}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
              ⭐ Due Today: {dueTodayTasks.length}
            </span>
          </div>

          {/* Square Tiles Scrollable to the Left */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Tasks (Horizontal Tiles)
              </span>
              <span className="text-[11px] text-slate-400">← Scrollable</span>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id, task.status === 'completed')}
                  className={`w-36 h-36 shrink-0 p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all hover:scale-[1.02] shadow-2xs ${
                    task.status === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 line-through'
                      : task.isOverdue
                      ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                      : isDarkMode
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      task.isOverdue ? 'bg-rose-200 dark:bg-rose-900 text-rose-800' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}>
                      {task.isOverdue ? 'Overdue' : 'Today'}
                    </span>
                    <span className="text-xs font-bold">
                      {task.status === 'completed' ? '✓' : '○'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold leading-snug line-clamp-3">
                    {task.title}
                  </p>

                  <span className="text-[10px] text-slate-400">
                    {task.due || 'Google Task'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Agenda Preview */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-2">
              Today's Schedule & Meets
            </span>
            <div className="space-y-2">
              {events.slice(0, 3).map(ev => (
                <div key={ev.id} className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">📅</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100">{ev.summary}</h4>
                      <span className="text-[10px] text-slate-400">{ev.start} - {ev.end}</span>
                    </div>
                  </div>
                  {ev.meetLink && (
                    <a href={ev.meetLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold hover:underline">
                      Join Meet ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Routines Preview with Play Button */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-2">
              Focus Routines
            </span>
            <div className="space-y-2">
              {routines.map(routine => (
                <div key={routine.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100">{routine.title}</h4>
                    <p className="text-[11px] text-slate-400">{routine.durationMinutes || 15} mins • {routine.steps.length} steps</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveRoutineForPlayer(routine)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>▶</span>
                    <span>Play Focus</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CALENDAR SPECIFIC TAB (With Add, Edit, Delete) */}
      {activeFilter === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Google Calendar & Video Meets</h2>
            <button
              type="button"
              onClick={() => { resetForm(); setModalType('add_event'); }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
            >
              + Add Event / Meet
            </button>
          </div>

          <div className="space-y-2.5">
            {events.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center border rounded-2xl">No upcoming events scheduled.</p>
            ) : (
              events.map(ev => (
                <div key={ev.id} className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">{ev.summary}</span>
                      {ev.hasMeet && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 px-1.5 py-0.5 rounded font-bold">MEET</span>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{ev.start} – {ev.end}</p>
                    {ev.meetLink && (
                      <a href={ev.meetLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        Join Google Meet Call ↗
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditEvent(ev)} className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded">Edit</button>
                    <button onClick={() => onDeleteEvent(ev.id)} className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1 rounded">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. TASKS SPECIFIC TAB (With Add, Edit, Delete) */}
      {activeFilter === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Google Tasks Focus List</h2>
            <button
              type="button"
              onClick={() => { resetForm(); setModalType('add_task'); }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
            >
              + Add Task
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                <div
                  onClick={() => onToggleTask(task.id, task.status === 'completed')}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                    task.status === 'completed' ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                  }`}>
                    {task.status === 'completed' && '✓'}
                  </div>
                  <span className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-zinc-100'}`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditTask(task)} className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded">Edit</button>
                  <button onClick={() => onDeleteTask(task.id)} className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ROUTINES SPECIFIC TAB (With Play Button, Add, Edit, Delete) */}
      {activeFilter === 'routines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Recurring Google Task Routines</h2>
            <button
              type="button"
              onClick={() => { resetForm(); setModalType('add_routine'); }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs"
            >
              + Add Routine
            </button>
          </div>

          <div className="space-y-3">
            {routines.map(routine => (
              <div key={routine.id} className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">{routine.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {routine.frequency || 'Daily'} • {routine.durationMinutes || 15} min timer • {routine.steps.length} steps
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveRoutineForPlayer(routine)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <span>▶</span>
                      <span>Play Focus</span>
                    </button>
                    <button onClick={() => openEditRoutine(routine)} className="text-xs text-slate-500 px-2 py-1">Edit</button>
                    <button onClick={() => onDeleteRoutine(routine.id)} className="text-xs text-rose-500 px-2 py-1">Delete</button>
                  </div>
                </div>

                {/* Steps Preview */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  {routine.steps.map(step => (
                    <div
                      key={step.id}
                      onClick={() => onToggleRoutineStep(routine.id, step.id, step.completed)}
                      className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-zinc-300"
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                        step.completed ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                      }`}>
                        {step.completed && '✓'}
                      </span>
                      <span className={step.completed ? 'line-through text-slate-400' : ''}>{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. GOALS SPECIFIC TAB (With Add, Edit, Delete, Google Sheets link) */}
      {activeFilter === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200">North Star Goals & Google Sheets Trackers</h2>
            <button
              type="button"
              onClick={() => { resetForm(); setModalType('add_goal'); }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
            >
              + Add Goal
            </button>
          </div>

          <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      Target: {goal.targetDate}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-1">{goal.outcome}</h3>
                    <p className="text-xs text-slate-500">★ North Star: {goal.northStar}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditGoal(goal)} className="text-xs text-slate-500 px-2 py-1">Edit</button>
                    <button onClick={() => onDeleteGoal(goal.id)} className="text-xs text-rose-500 px-2 py-1">Delete</button>
                  </div>
                </div>

                {goal.sheetUrl && (
                  <a href={goal.sheetUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1">
                    <span>Open Live Project Tracker Sheet</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Player Full-Screen Modal */}
      <RoutinePlayerModal
        isOpen={Boolean(activeRoutineForPlayer)}
        onClose={() => setActiveRoutineForPlayer(null)}
        routine={activeRoutineForPlayer}
        onToggleStep={onToggleRoutineStep}
        isDarkMode={isDarkMode}
      />

      {/* Generic Item Add/Edit Modal Form */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl border p-5 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-[#0f1422] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm">
                {modalType.startsWith('add') ? 'Add New Item' : 'Edit Item'}
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Title / Outcome</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Weekly Strategy Sync"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Task Fields */}
              {(modalType === 'add_task' || modalType === 'edit_task') && (
                <div>
                  <label className="block font-semibold mb-1">Due Date</label>
                  <input
                    type="text"
                    value={formDue}
                    onChange={e => setFormDue(e.target.value)}
                    placeholder="e.g. Today 5:00 PM"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              )}

              {/* Event Fields */}
              {(modalType === 'add_event' || modalType === 'edit_event') && (
                <>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block font-semibold mb-1">Start Time</label>
                      <input
                        type="text"
                        value={formStartTime}
                        onChange={e => setFormStartTime(e.target.value)}
                        placeholder="e.g. 10:00 AM"
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-semibold mb-1">End Time</label>
                      <input
                        type="text"
                        value={formEndTime}
                        onChange={e => setFormEndTime(e.target.value)}
                        placeholder="e.g. 10:45 AM"
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formHasMeet}
                      onChange={e => setFormHasMeet(e.target.checked)}
                      className="rounded"
                    />
                    <span>Add Google Meet video conference link</span>
                  </label>
                </>
              )}

              {/* Routine Fields */}
              {(modalType === 'add_routine' || modalType === 'edit_routine') && (
                <>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block font-semibold mb-1">Timer (Minutes)</label>
                      <input
                        type="number"
                        value={formRoutineDuration}
                        onChange={e => setFormRoutineDuration(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-semibold mb-1">Frequency</label>
                      <input
                        type="text"
                        value={formRoutineFrequency}
                        onChange={e => setFormRoutineFrequency(e.target.value)}
                        placeholder="e.g. Daily / Weekly"
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Steps (1 per line)</label>
                    <textarea
                      rows={3}
                      value={formRoutineSteps}
                      onChange={e => setFormRoutineSteps(e.target.value)}
                      placeholder="Step 1: Check emails&#10;Step 2: Prioritize 3 tasks&#10;Step 3: Review metrics"
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                    />
                  </div>
                </>
              )}

              {/* Goal Fields */}
              {(modalType === 'add_goal' || modalType === 'edit_goal') && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">North Star Metric</label>
                    <input
                      type="text"
                      value={formGoalNorthStar}
                      onChange={e => setFormGoalNorthStar(e.target.value)}
                      placeholder="e.g. 100 Active Enterprise Users"
                      className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block font-semibold mb-1">Target Date</label>
                      <input
                        type="text"
                        value={formGoalTargetDate}
                        onChange={e => setFormGoalTargetDate(e.target.value)}
                        placeholder="e.g. Q4 2026"
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-semibold mb-1">Google Sheets URL</label>
                      <input
                        type="text"
                        value={formGoalSheetUrl}
                        onChange={e => setFormGoalSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/..."
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!formTitle.trim()) return;
                  if (modalType === 'add_task') {
                    await onAddTask(formTitle.trim(), formDue.trim());
                  } else if (modalType === 'edit_task' && editingItem) {
                    await onEditTask(editingItem.id, formTitle.trim(), formDue.trim());
                  } else if (modalType === 'add_event') {
                    await onAddEvent({
                      summary: formTitle.trim(),
                      start: formStartTime.trim() || '10:00 AM',
                      end: formEndTime.trim() || '11:00 AM',
                      hasMeet: formHasMeet,
                      meetLink: formHasMeet ? 'https://meet.google.com/suchi-room' : undefined,
                    });
                  } else if (modalType === 'edit_event' && editingItem) {
                    await onEditEvent({
                      id: editingItem.id,
                      summary: formTitle.trim(),
                      start: formStartTime.trim(),
                      end: formEndTime.trim(),
                      hasMeet: formHasMeet,
                      meetLink: formHasMeet ? (editingItem.meetLink || 'https://meet.google.com/suchi-room') : undefined,
                    });
                  } else if (modalType === 'add_routine') {
                    const stepsArr = formRoutineSteps.split('\n').filter(s => s.trim()).map((s, idx) => ({
                      id: `step-${Date.now()}-${idx}`,
                      title: s.trim(),
                      completed: false,
                    }));
                    await onAddRoutine({
                      title: formTitle.trim(),
                      durationMinutes: Number(formRoutineDuration) || 15,
                      frequency: formRoutineFrequency.trim() || 'Daily',
                      steps: stepsArr,
                    });
                  } else if (modalType === 'edit_routine' && editingItem) {
                    const stepsArr = formRoutineSteps.split('\n').filter(s => s.trim()).map((s, idx) => ({
                      id: `step-${Date.now()}-${idx}`,
                      title: s.trim(),
                      completed: false,
                    }));
                    await onEditRoutine({
                      id: editingItem.id,
                      title: formTitle.trim(),
                      durationMinutes: Number(formRoutineDuration) || 15,
                      frequency: formRoutineFrequency.trim() || 'Daily',
                      steps: stepsArr,
                    });
                  } else if (modalType === 'add_goal') {
                    await onAddGoal({
                      outcome: formTitle.trim(),
                      northStar: formGoalNorthStar.trim() || 'Key Objective',
                      targetDate: formGoalTargetDate.trim() || 'Q4',
                      progressPercent: 25,
                      sheetUrl: formGoalSheetUrl.trim() || undefined,
                    });
                  } else if (modalType === 'edit_goal' && editingItem) {
                    await onEditGoal({
                      id: editingItem.id,
                      outcome: formTitle.trim(),
                      northStar: formGoalNorthStar.trim(),
                      targetDate: formGoalTargetDate.trim(),
                      progressPercent: editingItem.progressPercent || 50,
                      sheetUrl: formGoalSheetUrl.trim() || undefined,
                    });
                  }
                  resetForm();
                }}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
