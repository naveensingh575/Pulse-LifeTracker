# 💓 PULSE — Personal Life Operating & Tracking System

> *"Your Life, in Rhythm."*

**PULSE** is an executive-grade personal operating system built to unify your daily habits, physical and learning activities, monthly finances & cashflow allocations, strategic multi-tier goals, actionable tasks, daily journal reflections, and AI-powered executive analytics into one seamless, reactive cockpit.

---

## 🚀 Key Modules & Capabilities

- 🎯 **Executive Command Center (`/`):**
  - Proactive **"Where to Focus" Smart Directives** for today's highest-leverage actions.
  - **Habit Rhythm Snapshot** with 1-tap completion pills and active discipline streaks.
  - **Cash Flow & Burn-Rate Gauge** with safe daily burn allowances and 1-click quick expense logger.
  - **Prioritized Action Board** for urgent daily execution.
  - **Nightly Review & Day-End Recap** with Google Calendar & `.ics` export.

- 📅 **Habits Hub (`/habits`):**
  - Date-keyed completion engine strictly respecting Indian Standard Time (IST).
  - 7-day adherence grids, multi-category filtering, and 30-day consistency heatmaps.

- 🏋️ **Activity Pulse (`/activity`):**
  - Multi-exercise strength training builder (exercises, sets, reps, load in kg, and total tonnage volume lifted).
  - Cardio endurance tracking with continuous pace (`min/km`) calculation.
  - Swimming laps and sports match duration metrics.
  - Dedicated **Reading & Learning** sub-type separation (📖 Book Pages vs. 🧠 Deep Skill Topic Study).

- 💰 **Financial Pulse (`/finance`):**
  - Income-first monthly cash flow model: $\text{Total Income} = \text{Expense Budget} + \text{Investment Goal} + \text{Leftover Surplus}$.
  - Strict month-by-month budget isolation ($0 defaults, zero cross-month contamination).
  - Investments treated strictly as wealth creation (separate from living expense budget).

- 🎯 **Goal Pulse (`/goals`):**
  - Customizable card color themes and 10 iconic goal logos.
  - Multi-tier horizons: ⚡ Short-Term ($< 3\text{ months}$) vs. 🏔️ Long-Term ($> 3\text{ months}$).
  - Nested milestone sub-goals checklist with checkable progress.
  - Predictive Feasibility & Velocity Engine with 1-click `+ Add to Tasks`.

- 📊 **Executive Analytics Hub (`/analytics`):**
  - Unified 3-header timeframe toggle: `[ Today | This Week | Month ]` with interactive Month/Year calendar selectors.
  - Dynamic multi-scale charts (hourly intervals for Today, discrete weekday dates for Week, 5-day intervals for Month).
  - Self-explanatory normalized metric cards (Financial Velocity, Habit Discipline Score, Physical Output Ratio, Goal Health).
  - Smart Contextual Diagnostics identifying primary expense drivers, habit nudges, and physical/cognitive synergy.

- 📓 **Journal Pulse (`/journal`):**
  - Daily reflection prompts, mood tracking, and accomplishments archive.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS
- **Routing:** React Router v7 (`HashRouter` for zero-configuration GitHub Pages hosting)
- **Charts & Visualizations:** Recharts
- **Icons & UI Elements:** Lucide React, Framer Motion
- **State & Storage:** Context API + 100% LocalStorage persistence engine
- **Timezone Engine:** Strict Indian Standard Time (IST / Asia/Kolkata / UTC+05:30)

---

## 📦 Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/naveensingh575/Pulse-LifeTracker.git
   cd Pulse-LifeTracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🌐 Deploying to GitHub Pages

This repository is pre-configured with automated GitHub Actions deployment.

1. Go to your repository settings on GitHub: `https://github.com/naveensingh575/Pulse-LifeTracker/settings/pages`
2. Under **Build and deployment** $\rightarrow$ **Source**, select **GitHub Actions**.
3. Push to `main` branch:
   ```bash
   git push origin main
   ```
4. GitHub Actions will automatically build and deploy your site to `https://naveensingh575.github.io/Pulse-LifeTracker/`.

---

## 📄 License

MIT License. Designed with focus for high-performance daily execution.
