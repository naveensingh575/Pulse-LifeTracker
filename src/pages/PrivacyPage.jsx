import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Trash2, Mail, Database } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl mx-auto">

      {/* Header */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Last updated: September 2026</p>
          </div>
        </div>
        <Link
          to="/"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-800 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Intro Card */}
      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-5 text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
        <p>
          Pulse Life Tracker is built on a foundation of <strong>privacy and user trust</strong>.
          This policy explains what data we collect, how it is stored, and your full rights over it.
          We do not sell your data, share it with advertisers, or use it for any purpose other than making Pulse work for you.
        </p>
      </div>

      <div className="space-y-4">

        {/* Section 1 */}
        <Section icon={<Database className="w-5 h-5" />} color="indigo" title="Data We Collect">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><strong className="text-slate-800 dark:text-slate-200">Account:</strong> Your email address and display name, used solely for authentication.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">User Content:</strong> Habits, tasks, goals, journal entries, financial transactions, and activity logs that you create inside the app.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Session Data:</strong> Standard browser session tokens managed by Supabase Auth. Stored in <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">localStorage</code>.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">No Tracking:</strong> We do not use analytics trackers, advertising SDKs, or third-party pixels of any kind.</li>
          </ul>
        </Section>

        {/* Section 2 */}
        <Section icon={<Lock className="w-5 h-5" />} color="emerald" title="How We Protect Your Data">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><strong className="text-slate-800 dark:text-slate-200">Encryption in Transit:</strong> All data between your device and our servers is encrypted with TLS 1.3 / HTTPS.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Encryption at Rest:</strong> Your data is stored on Supabase (hosted on AWS) with AES-256 encryption at the storage layer.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Row-Level Security (RLS):</strong> Every database table is protected by PostgreSQL Row-Level Security policies. It is technically impossible for one user's data to be accessed by another user — enforced at the database engine level.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">No Plain-Text Passwords:</strong> Passwords are never stored. Supabase Auth uses bcrypt hashing with salts.</li>
          </ul>
        </Section>

        {/* Section 3 */}
        <Section icon={<Eye className="w-5 h-5" />} color="amber" title="Who Can See Your Data">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><strong className="text-slate-800 dark:text-slate-200">You:</strong> Only you can read or modify your data through the app.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">App Developer:</strong> The developer may access anonymized or aggregated data via Supabase Studio for the purpose of debugging reported issues, running migrations, or providing account recovery support. Developer access is never used to read private journal or financial entries unless you explicitly share them for support purposes.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Third Parties:</strong> We never sell, share, rent, or disclose your personal data to any third party for any commercial purpose.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Legal:</strong> We may disclose data if required by law or a valid legal process.</li>
          </ul>
        </Section>

        {/* Section 4 */}
        <Section icon={<Trash2 className="w-5 h-5" />} color="rose" title="Your Rights: Data Deletion & Export">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><strong className="text-slate-800 dark:text-slate-200">Delete Your Account:</strong> You can permanently delete your account and all associated data at any time from the profile menu (top-right corner → Delete Account). This action is irreversible.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Export Your Data:</strong> You can export your habits, tasks, goals, activities, and financial records as CSV files from each module using the Download Report button.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Data Portability:</strong> All exported files are standard CSV format compatible with Excel, Google Sheets, and other tools.</li>
          </ul>
        </Section>

        {/* Section 5 */}
        <Section icon={<Mail className="w-5 h-5" />} color="cyan" title="Contact">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>If you have any questions about this Privacy Policy or wish to request data deletion manually, please contact us at:</p>
            <p>
              <a
                href="mailto:naveensingh575@gmail.com"
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                naveensingh575@gmail.com
              </a>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 pt-1">
              We aim to respond to all privacy-related requests within 5 business days.
            </p>
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-600">
        Pulse Life Tracker · Privacy Policy · v1.0 · September 2026
      </div>
    </div>
  );
};

const colorMap = {
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30',
};

const Section = ({ icon, color, title, children }) => (
  <div className="glass-panel-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className={`flex items-center space-x-2.5 px-5 py-3 border-b border-slate-200 dark:border-slate-800 ${colorMap[color]?.split(' ').filter(c => c.startsWith('bg-')).join(' ')}`}>
      <div className={colorMap[color]?.split(' ').filter(c => !c.startsWith('bg-')).join(' ')}>
        {icon}
      </div>
      <h2 className={`font-bold text-sm ${colorMap[color]?.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);
