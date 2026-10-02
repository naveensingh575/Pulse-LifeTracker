import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { createGoogleCalendarUrl } from '../components/routines/RoutineWidget';
import { getISTDateString } from '../utils/dateUtils';
import { TaskModal } from '../components/tasks/TaskModal';
import {
  CheckSquare,
  Calendar,
  Trash2,
  Check,
  ShoppingBag,
  Briefcase,
  Zap,
  Plus,
  User,
  Edit2,
  Download,
  RotateCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { exportTasksToCSV } from '../utils/exportUtils';
import { extractRepeat, cleanNotes, RECURRENCE_OPTIONS } from '../utils/taskUtils';

export const TasksPage = () => {
  const { tasks, toggleTaskComplete, deleteTask, addTask, updateTask, quotaStatus, openPricingModal } = useDashboard();
  const [activeContext, setActiveContext] = useState('All'); // 'All' | 'Urgent' | 'Work' | 'Personal'
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all' | 'pending' | 'completed'

  const todayStr = getISTDateString();
  const completedTodayCount = tasks.filter(t => t.completed && t.completedAt && t.completedAt.slice(0, 10) === todayStr).length;

  // Task Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalCategory, setModalCategory] = useState('Work');

  const openAddModal = (cat = 'Work') => {
    setEditingTask(null);
    setModalCategory(cat === 'All' ? 'Work' : cat);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalCategory(task.category || 'Work');
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter(t => {
    // Context filter
    if (activeContext === 'Personal' && (t.category !== 'Personal' && t.category !== 'Shopping' && t.category !== 'Health')) return false;
    if (activeContext === 'Work' && (t.category !== 'Work' && t.category !== 'Tech' && t.category !== 'Finance')) return false;
    if (activeContext === 'Urgent' && t.priority !== 'high') return false;

    // Status filter
    if (statusFilter === 'pending') return !t.completed;
    if (statusFilter === 'completed') return t.completed;
    return true;
  });

  const contextTabs = [
    { key: 'All', label: 'All Actions', icon: CheckSquare, defaultCat: 'Work' },
    { key: 'Urgent', label: 'Urgent', icon: Zap, defaultCat: 'Urgent' },
    { key: 'Work', label: 'Work & Office', icon: Briefcase, defaultCat: 'Work' },
    { key: 'Personal', label: 'Personal & Life', icon: User, defaultCat: 'Personal' },
  ];

  // Helper for date badge styling
  const getDateBadge = (task) => {
    if (task.completed) {
      if (task.completedAt && task.completedAt.slice(0, 10) === todayStr) {
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            ✓ Done Today
          </span>
        );
      }
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
          Done {task.completedAt ? task.completedAt.slice(0, 10) : 'earlier'}
        </span>
      );
    }

    if (!task.dueDate) return null;

    if (task.dueDate < todayStr) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Overdue ({task.dueDate})</span>
        </span>
      );
    }
    if (task.dueDate === todayStr) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Today</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        <span>{task.dueDate}</span>
      </span>
    );
  };

  const getRepeatBadge = (task) => {
    const repeatRule = extractRepeat(task);
    if (!repeatRule || repeatRule === 'none') return null;

    const opt = RECURRENCE_OPTIONS.find(o => o.key === repeatRule);
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
        <RotateCw className="w-3 h-3" />
        <span>{opt ? opt.short : repeatRule}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-12">
      
      {/* 1. Header Banner */}
      <div className="glass-panel-dark rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-md shrink-0">
            <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              To-Do List
            </h2>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => openAddModal(activeContext)}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition transform hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>

          <button
            onClick={() => {
              if (!quotaStatus?.isPremium) {
                openPricingModal();
                return;
              }
              const label = `${statusFilter}_${activeContext}`;
              exportTasksToCSV(filteredTasks, label);
            }}
            className="flex items-center space-x-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-800 transition cursor-pointer"
            title={quotaStatus?.isPremium ? `Download ${statusFilter} (${activeContext}) tasks report` : "👑 Upgrade to Export CSV"}
            aria-label="Download Report"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 2. Sleek Segmented Context Control Bar (Replaces bulky 4-card grid) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar">
        {contextTabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeContext === tab.key;
          const count = tasks.filter(t => {
            if (tab.key === 'Urgent') return t.priority === 'high' && !t.completed;
            if (tab.key === 'Work') return (t.category === 'Work' || t.category === 'Tech' || t.category === 'Finance') && !t.completed;
            if (tab.key === 'Personal') return (t.category === 'Personal' || t.category === 'Shopping' || t.category === 'Health') && !t.completed;
            return !t.completed;
          }).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveContext(tab.key)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex-1 justify-center ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <TabIcon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-cyan-400'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Tasks List Container */}
      <div className="glass-panel-dark rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        
        {/* Status Sub-bar: Pending | Completed | All */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 shrink-0">
              {activeContext === 'All' ? 'Action Feed' : `${activeContext} Tasks`} ({filteredTasks.length})
            </h3>
            {completedTodayCount > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {completedTodayCount} done today
              </span>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            {[
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'all', label: 'All' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Items List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <CheckSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {statusFilter === 'completed' ? 'No completed tasks yet.' : 'All clear! No tasks pending in this board.'}
              </p>
              <button
                onClick={() => openAddModal(activeContext)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task Now</span>
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const repeatBadge = getRepeatBadge(task);
              const dateBadge = getDateBadge(task);
              const cleanedNotes = cleanNotes(task.notes);

              return (
                <div
                  key={task.id}
                  className={`group flex items-start sm:items-center justify-between p-3.5 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-900 opacity-75'
                      : 'bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800/90 shadow-sm'
                  }`}
                >
                  <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
                    {/* Checkbox button */}
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 mt-0.5 sm:mt-0 ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-indigo-500'
                      }`}
                      aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-xs sm:text-sm font-semibold break-words ${
                          task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {task.title}
                        </span>

                        {/* Recurrence Badge */}
                        {repeatBadge}
                      </div>

                      {/* Metadata Chips Row */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                        {/* Category */}
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-medium">
                          {task.category}
                        </span>

                        {/* Priority Badge */}
                        {task.priority === 'high' && (
                          <span className="px-1.5 py-0.5 rounded font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Urgent
                          </span>
                        )}

                        {/* Due Date / Done status badge */}
                        {dateBadge}

                        {/* Cleaned Notes Excerpt */}
                        {cleanedNotes && (
                          <span className="italic text-indigo-500 dark:text-indigo-400 truncate max-w-[200px] sm:max-w-xs">
                            "{cleanedNotes}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit, Calendar, Delete */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Task"
                      aria-label="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {!task.completed && (
                      <a
                        href={createGoogleCalendarUrl({
                          title: task.title,
                          details: `PULSE Task (${task.category}) - ${cleanedNotes || ''}`,
                          date: task.dueDate
                        })}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Add to Google Calendar"
                        aria-label="Add to Google Calendar"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Delete Task"
                      aria-label="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        initialTask={editingTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        initialCategory={modalCategory}
        onSave={(taskPayload) => {
          if (editingTask) {
            updateTask(editingTask.id, taskPayload);
          } else {
            addTask(taskPayload);
          }
        }}
      />

    </div>
  );
};
