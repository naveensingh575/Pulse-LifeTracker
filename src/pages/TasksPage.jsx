import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { createGoogleCalendarUrl } from '../components/routines/RoutineWidget';
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
  Send,
  User,
  ListTodo,
  Edit2,
  Download
} from 'lucide-react';
import { exportTasksToCSV } from '../utils/exportUtils';

export const TasksPage = () => {
  const { tasks, toggleTaskComplete, deleteTask, addTask, updateTask } = useDashboard();
  const [activeContext, setActiveContext] = useState('All'); // 'All' | 'Personal' | 'Work' | 'Urgent'
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all' | 'pending' | 'completed'

  // Task Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalCategory, setModalCategory] = useState('Work');

  // Quick Inline Add state
  const [quickInput, setQuickInput] = useState('');

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const categoryMap = {
      All: 'Work',
      Work: 'Work',
      Personal: 'Personal',
      Urgent: 'Urgent'
    };

    addTask({
      title: quickInput.trim(),
      category: categoryMap[activeContext] || 'Work',
      priority: activeContext === 'Urgent' ? 'high' : 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      notes: ''
    });

    setQuickInput('');
  };

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
    if (activeContext === 'Personal' && (t.category !== 'Personal' && t.category !== 'Shopping')) return false;
    if (activeContext === 'Work' && (t.category !== 'Work' && t.category !== 'Tech' && t.category !== 'Finance')) return false;
    if (activeContext === 'Urgent' && t.priority !== 'high') return false;

    // Status filter
    if (statusFilter === 'pending') return !t.completed;
    if (statusFilter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-panel-dark rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10 shrink-0">
            <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              To-Do List
            </h2>
          </div>
        </div>

        {/* Right Header Actions: Export CSV + New Task */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            onClick={() => exportTasksToCSV(tasks)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-800 transition cursor-pointer"
            title="Export all tasks to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => openAddModal(activeContext)}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition transform hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Quick Add Inline Input Bar */}
      <form
        onSubmit={handleQuickAdd}
        className="glass-panel-dark rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-md focus-within:border-indigo-500 transition"
      >
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
          <ListTodo className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder={`Add a new task to ${activeContext === 'All' ? 'Action Boards' : activeContext}... Press Enter`}
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!quickInput.trim()}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center space-x-1 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </form>

      {/* Context Category Boards Grid with Quick Add Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { key: 'All', label: 'All Actions', icon: CheckSquare, catName: 'Work' },
          { key: 'Urgent', label: 'Urgent (Do Today)', icon: Zap, catName: 'Urgent' },
          { key: 'Work', label: 'Work & Office', icon: Briefcase, catName: 'Work' },
          { key: 'Personal', label: 'Personal & Shopping', icon: ShoppingBag, catName: 'Personal' },
        ].map(item => {
          const IconC = item.icon;
          const isActive = activeContext === item.key;
          const boardCount = tasks.filter(t => {
            if (item.key === 'Urgent') return t.priority === 'high' && !t.completed;
            if (item.key === 'Work') return (t.category === 'Work' || t.category === 'Tech' || t.category === 'Finance') && !t.completed;
            if (item.key === 'Personal') return (t.category === 'Personal' || t.category === 'Shopping') && !t.completed;
            return !t.completed;
          }).length;

          return (
            <div
              key={item.key}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-slate-900 border-indigo-500 shadow-md text-indigo-600 dark:text-cyan-400 scale-[1.01]'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div
                onClick={() => setActiveContext(item.key)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2 text-xs font-bold">
                  <IconC className="w-4 h-4" />
                  {item.label}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold">
                  {boardCount}
                </span>
              </div>

              {/* Board Quick-Add Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAddModal(item.catName);
                }}
                className="w-full text-left text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60"
              >
                <span>+ Add to this board</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Task List Table / Cards with Calendar Export */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 shrink-0">
            {activeContext === 'All' ? 'Action Feed' : `${activeContext} Tasks`} ({filteredTasks.length})
          </h3>

          {/* Status Filter Buttons: Pending | Completed | All */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            {[
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'all', label: 'All' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>


        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center p-8 space-y-3">
              <p className="text-xs text-slate-500 italic">No tasks match the selected filter.</p>
              <button
                onClick={() => openAddModal(activeContext)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task Now</span>
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 transition"
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-center hover:border-emerald-500 transition"
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>

                  <div>
                    <h4 className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      <span className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        {task.category}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{task.priority} Priority</span>
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span>Due: {task.dueDate}</span>
                        </>
                      )}
                      {task.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-indigo-500">"{task.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calendar Export, Edit & Delete Buttons */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openEditModal(task)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {!task.completed && (
                    <a
                      href={createGoogleCalendarUrl({
                        title: task.title,
                        details: `PULSE Task (${task.category}) - ${task.notes || ''}`,
                        date: task.dueDate
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      title="Add to Google Calendar"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
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
