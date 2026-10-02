/**
 * Habit Categories Configuration
 * Standardized categories for habit tracking across health, finance, work, skill, personal, fitness, and mindfulness.
 */

export const HABIT_CATEGORIES = [
  'Health',
  'Fitness',
  'Finance',
  'Work',
  'Skill',
  'Personal',
  'Mind'
];

export const HABIT_FILTER_CATEGORIES = ['All', ...HABIT_CATEGORIES];

export const CATEGORY_ICON_MAP = {
  Health: 'Heart',
  Fitness: 'Dumbbell',
  Finance: 'Wallet',
  Work: 'Briefcase',
  Career: 'Briefcase',
  Skill: 'BookOpen',
  Personal: 'Sparkles',
  Mind: 'Brain'
};

export const getHabitIconForCategory = (category) => {
  if (!category) return 'Smile';
  const norm = String(category).trim().toLowerCase();
  const matchKey = Object.keys(CATEGORY_ICON_MAP).find(k => k.toLowerCase() === norm);
  return matchKey ? CATEGORY_ICON_MAP[matchKey] : 'Smile';
};

export const resolveHabitIcon = (habit) => {
  if (!habit) return 'Smile';
  if (habit.icon && habit.icon !== 'Smile') {
    return habit.icon;
  }
  return getHabitIconForCategory(habit.category);
};
