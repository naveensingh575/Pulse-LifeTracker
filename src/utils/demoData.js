/**
 * demoData.js
 * Pre-populated rich demonstration dataset for Pulse Life Tracker.
 * Powers the "Interactive Guest Demo Sandbox" so visitors can experience
 * 100% of the platform's multi-pillar intelligence before creating an account.
 */
import { getISTDateString } from './dateUtils.js';

export function getGuestDemoData() {
  const today = new Date();
  
  const formatDateOffset = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offsetDays);
    return getISTDateString(d);
  };

  const todayStr = formatDateOffset(0);
  const yesterdayStr = formatDateOffset(1);
  const d2 = formatDateOffset(2);
  const d3 = formatDateOffset(3);
  const d4 = formatDateOffset(4);
  const d5 = formatDateOffset(5);
  const d6 = formatDateOffset(6);
  const d7 = formatDateOffset(7);
  const d8 = formatDateOffset(8);
  const d9 = formatDateOffset(9);
  const d10 = formatDateOffset(10);
  const d11 = formatDateOffset(11);
  const d12 = formatDateOffset(12);
  const d13 = formatDateOffset(13);

  const currentMonthKey = todayStr.substring(0, 7);

  // 1. Habits with realistic unbroken streaks and realistic history
  const habits = [
    {
      id: 'demo-h1',
      name: '🧘 Morning Mindfulness / Walk',
      category: 'Mind',
      color: 'amber',
      icon: 'Smile',
      frequency: 'daily',
      target: 15,
      unit: 'mins',
      createdAt: d13,
      completions: {
        [todayStr]: true,
        [yesterdayStr]: true,
        [d2]: true,
        [d3]: true,
        [d4]: true,
        [d5]: true,
        [d6]: true,
        [d7]: true,
        [d8]: true,
        [d9]: true,
        [d10]: true,
        [d11]: true
      }
    },
    {
      id: 'demo-h2',
      name: '🎯 90m Deep Work Block',
      category: 'Work',
      color: 'indigo',
      icon: 'Code',
      frequency: 'daily',
      target: 90,
      unit: 'mins',
      createdAt: d13,
      completions: {
        [todayStr]: true,
        [yesterdayStr]: true,
        [d2]: true,
        [d3]: true,
        [d4]: true,
        [d5]: true,
        [d7]: true,
        [d8]: true,
        [d9]: true
      }
    },
    {
      id: 'demo-h3',
      name: '💧 Drink 2.5L Water',
      category: 'Health',
      color: 'cyan',
      icon: 'Droplets',
      frequency: 'daily',
      target: 1,
      unit: 'daily',
      createdAt: d13,
      completions: {
        [todayStr]: true,
        [yesterdayStr]: true,
        [d2]: true,
        [d3]: true,
        [d4]: true,
        [d5]: true,
        [d6]: true,
        [d7]: true,
        [d8]: true
      }
    },
    {
      id: 'demo-h4',
      name: '🏋️‍♂️ Strength & Conditioning',
      category: 'Fitness',
      color: 'rose',
      icon: 'Dumbbell',
      frequency: 'daily',
      target: 45,
      unit: 'mins',
      createdAt: d13,
      completions: {
        [yesterdayStr]: true,
        [d2]: true,
        [d4]: true,
        [d5]: true,
        [d6]: true,
        [d8]: true,
        [d9]: true
      }
    },
    {
      id: 'demo-h5',
      name: '📖 Read 20 Pages',
      category: 'Mind',
      color: 'emerald',
      icon: 'BookOpen',
      frequency: 'daily',
      target: 20,
      unit: 'pages',
      createdAt: d13,
      completions: {
        [yesterdayStr]: true,
        [d2]: true,
        [d3]: true,
        [d4]: true,
        [d5]: true,
        [d7]: true
      }
    }
  ];

  // 2. Goals with sub-goals
  const goals = [
    {
      id: 'demo-g1',
      title: 'Ship SaaS MVP & 100 Paying Users',
      description: 'Validate market product-market fit, reach $1k MRR, and close first 100 subscribers.',
      targetDate: formatDateOffset(-30),
      deadline: formatDateOffset(-30),
      category: 'Career',
      color: 'indigo',
      icon: 'Target',
      unit: '%',
      targetAmount: 100,
      currentAmount: 50,
      subGoals: [
        { id: 'demo-sg1', title: 'Finalize Pricing & Stripe/Razorpay checkout', isCompleted: true },
        { id: 'demo-sg2', title: 'Complete 30-Day Retention standup engine', isCompleted: true },
        { id: 'demo-sg3', title: 'Product Hunt Launch & 25 Customer Demos', isCompleted: false },
        { id: 'demo-sg4', title: 'Reach first 100 Founder cohort members', isCompleted: false }
      ]
    },
    {
      id: 'demo-g2',
      title: 'Sub-50min 10km Endurance Run',
      description: 'Build aerobic engine and achieve peak 10k race pace under 5:00 min/km.',
      targetDate: formatDateOffset(-45),
      deadline: formatDateOffset(-45),
      category: 'Fitness',
      color: 'cyan',
      icon: 'Dumbbell',
      unit: 'km',
      targetAmount: 10,
      currentAmount: 6,
      subGoals: [
        { id: 'demo-sg5', title: '3x weekly tempo training', isCompleted: true },
        { id: 'demo-sg6', title: 'Hit 8km long run benchmark', isCompleted: true },
        { id: 'demo-sg7', title: 'Official race day timing execution', isCompleted: false }
      ]
    }
  ];

  // 3. Tasks
  const tasks = [
    {
      id: 'demo-t1',
      title: 'Review weekly operating metrics & budget runway',
      priority: 'high',
      category: 'Finance',
      dueDate: todayStr,
      repeat: 'weekly',
      completed: true,
      completedAt: new Date().toISOString(),
      linkedGoalTitle: 'Ship SaaS MVP & 100 Paying Users',
      notes: 'Runway is 18+ months with current burn rate.'
    },
    {
      id: 'demo-t2',
      title: 'Ship Morning Standup Cockpit feature',
      priority: 'high',
      category: 'Work',
      dueDate: todayStr,
      repeat: 'none',
      completed: true,
      completedAt: new Date().toISOString(),
      linkedGoalTitle: 'Ship SaaS MVP & 100 Paying Users',
      notes: 'Completed with Web Audio chimes and confetti celebration.'
    },
    {
      id: 'demo-t3',
      title: 'Complete 45-min tempo run & mobility',
      priority: 'medium',
      category: 'Health',
      dueDate: todayStr,
      repeat: 'daily',
      completed: false,
      completedAt: null,
      linkedGoalTitle: 'Sub-50min 10km Endurance Run',
      notes: 'Keep average pace below 5:10/km.'
    },
    {
      id: 'demo-t4',
      title: 'Write Product Hunt community launch maker comment',
      priority: 'high',
      category: 'Work',
      dueDate: formatDateOffset(-1),
      repeat: 'none',
      completed: false,
      completedAt: null,
      linkedGoalTitle: 'Ship SaaS MVP & 100 Paying Users',
      notes: 'Focus on 100% data sovereignty & 30s morning standup.'
    }
  ];

  // 4. Financial Ledger (Income, Expense, Investment)
  const transactions = [
    {
      id: 'demo-tx1',
      type: 'income',
      amount: 145000,
      category: 'Salary',
      description: 'Monthly Engineering & Consulting Retainer',
      assetName: '',
      date: formatDateOffset(2),
      notes: 'Direct client payment'
    },
    {
      id: 'demo-tx2',
      type: 'investment',
      amount: 40000,
      category: 'Index Funds',
      description: 'Nifty 50 & Global Tech Index SIP',
      assetName: 'Index Fund SIP',
      date: formatDateOffset(4),
      notes: 'Automated wealth allocation'
    },
    {
      id: 'demo-tx3',
      type: 'expense',
      amount: 28000,
      category: 'Rent',
      description: 'Apartment Lease Payment',
      assetName: '',
      date: formatDateOffset(5),
      notes: 'Monthly fixed housing'
    },
    {
      id: 'demo-tx4',
      type: 'expense',
      amount: 4200,
      category: 'Food',
      description: 'Weekly organic groceries & protein fuel',
      assetName: '',
      date: yesterdayStr,
      notes: 'Health & nutrition'
    }
  ];

  // 5. Physical Activities & PRs
  const activities = [
    {
      id: 'demo-act1',
      type: 'strength',
      title: 'Upper Body Heavy Push & Bench PR',
      date: yesterdayStr,
      durationMins: 55,
      sessionFocus: 'Strength',
      totalVolumeKg: 4250,
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 6, weight: 100, isPr: true },
        { name: 'Overhead Press', sets: 3, reps: 8, weight: 60, isPr: false },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 32, isPr: false }
      ],
      notes: 'Felt strong, hit new 100kg PR for 6 clean reps.'
    },
    {
      id: 'demo-act2',
      type: 'running',
      title: 'Morning 6km Aerobic Tempo Run',
      date: d3,
      durationMins: 31,
      distance: 6.2,
      pace: '5:00 /km',
      heartRateZone: 'Zone 3',
      notes: 'Breezy conditions, comfortable breathing rhythm.'
    }
  ];

  // 6. Mindful Journal Entries
  const journalEntries = [
    {
      id: 'demo-j1',
      date: yesterdayStr,
      accomplished: 'Bench press PR (100kg) and finalized client proposal.',
      notes: 'Energy stayed high all afternoon. Taking 10 minutes to plan tomorrow in the evening reduces so much morning friction.',
      gratitude: 'Grateful for morning sunlight, good health, and supportive peers.',
      mood: 'productive'
    },
    {
      id: 'demo-j2',
      date: d3,
      accomplished: 'Completed 6km run and cleared inbox to zero.',
      notes: 'Maintaining consistency across habits is compounding noticeably.',
      gratitude: 'Quiet morning focus and deep sleep.',
      mood: 'energized'
    }
  ];

  // 7. Deadlines
  const deadlines = [
    {
      id: 'demo-d1',
      title: 'Product Hunt Launch Live Date',
      date: formatDateOffset(-12),
      category: 'Career',
      tag: 'Launch',
      priority: 'high',
      isCompleted: false
    }
  ];

  const monthlyAllocations = {
    [currentMonthKey]: {
      expenseBudget: 45000,
      investmentGoal: 40000
    }
  };

  return {
    habits,
    goals,
    tasks,
    transactions,
    activities,
    journalEntries,
    deadlines,
    monthlyAllocations,
    preferences: {
      theme: 'dark',
      currency: '₹'
    }
  };
}
