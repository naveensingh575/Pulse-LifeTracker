import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { TaskModal } from './TaskModal';
import {
  CheckSquare,
  Plus,
  Trash2,
  Check,
  Archive,
  Calendar,
  Edit2
} from 'lucide-react';

const priorityConfig = {
  high: {
    label: 'High Priority (Do Today)',
    icon: '🔴',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    border: 'border-rose-500/20'
  },
  medium: {
    label: 'Medium Priority (This Week)',
    icon: '🟡',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    border: 'border-amber-500/20'
  },
  low: {
    label: 'Low Priority (Backlog)',
    icon: '🔵',
    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    border: 'border-cyan-500/20'
  }
};

export const TodoList = () => {
  const { tasks, addTask, updateTask, updateTaskPriority, toggleTaskComplete, deleteTask } = useDashboard();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('high');
  const [newTaskCategory, setNewTaskCategory] = useState('Work');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  const activeTasks = tasks.filter(t => !t.completed);
  const archivedTasks = tasks.filter(t => t.completed);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle,
      priority: newTaskPriority,
      category: newTaskCategory,
      dueDate: newTaskDueDate
    });
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
      
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Prioritized Action Board</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              showArchived
                ? 'bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive ({archivedTasks.length})</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Quick Task Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="p-3 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
          <input
            type="text"
            required
            placeholder="Action Task Title..."
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
          />

          <div className="grid grid-cols-3 gap-2">
            <select
              value={newTaskPriority}
              onChange={e => setNewTaskPriority(e.target.value)}
              className="px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="high">🔴 High (Do Today)</option>
              <option value="medium">🟡 Medium (This Week)</option>
              <option value="low">🔵 Low (Backlog)</option>
            </select>

            <select
              value={newTaskCategory}
              onChange={e => setNewTaskCategory(e.target.value)}
              className="px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="Work">Work</option>
              <option value="Finance">Finance</option>
              <option value="Health">Health</option>
              <option value="Personal">Personal</option>
              <option value="Tech">Tech</option>
            </select>

            <input
              type="date"
              value={newTaskDueDate}
              onChange={e => setNewTaskDueDate(e.target.value)}
              className="px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Archived View Toggle */}
      {showArchived ? (
        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5 text-indigo-500" /> Archived Completed Tasks
          </h4>
          {archivedTasks.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No completed tasks archived yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {archivedTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900/50 text-xs line-through text-slate-400">
                  <span className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    {t.title}
                  </span>
                  <button onClick={() => toggleTaskComplete(t.id)} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 3-Tier Priority Board */
        <div className="space-y-4">
          {['high', 'medium', 'low'].map((pKey) => {
            const config = priorityConfig[pKey];
            const pTasks = activeTasks.filter(t => t.priority === pKey);

            return (
              <div key={pKey} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${config.badge}`}>
                    {config.icon} {config.label} ({pTasks.length})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {pTasks.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic pl-2">No pending tasks in this tier.</p>
                  ) : (
                    pTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-center hover:border-emerald-500 transition"
                          >
                            {task.completed && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                          </button>

                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{task.title}</h4>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                              <span className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                                {task.category}
                              </span>
                              {task.linkedGoalTitle && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-semibold">
                                  🎯 {task.linkedGoalTitle}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5 text-slate-400" />
                                  {task.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <select
                            value={task.priority}
                            onChange={e => updateTaskPriority(task.id, e.target.value)}
                            className="text-[10px] bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-800 rounded px-1.5 py-1 focus:outline-none focus:border-cyan-500 font-medium"
                          >
                            <option value="high">🔴 High</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🔵 Low</option>
                          </select>

                          <button
                            onClick={() => setEditingTask(task)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer"
                            title="Edit Task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

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
            );
          })}
        </div>
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <TaskModal
          isOpen={!!editingTask}
          initialTask={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(taskPayload) => {
            updateTask(editingTask.id, taskPayload);
            setEditingTask(null);
          }}
        />
      )}

    </div>
  );
};
