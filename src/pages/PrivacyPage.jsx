import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Trash2, Mail, ShieldCheck } from 'lucide-react';

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
          Pulse Life Tracker is built on a non-negotiable foundation of <strong>privacy, discretion, and user trust</strong>.
          This policy explains what information is processed, how it is safeguarded, and your total control over it.
          We never sell your personal information, share it with advertisers, or use it for commercial profiling. Pulse works exclusively for you.
        </p>
      </div>

      <div className="space-y-4">

        {/* Section 1 */}
        <Section icon={<ShieldCheck className="w-5 h-5" />} color="indigo" title="Information You Provide">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><strong className="text-slate-800 dark:text-slate-200">Account Credentials:</strong> Your email address and profile name, used strictly to authenticate your account and protect your personal sign-in.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Personal Growth Records:</strong> The habits, tasks, goals, reflective notes, physical activities, and personal finance entries you choose to track in your private dashboard.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Secure Device Sign-in:</strong> Encrypted authentication tokens stored on your device to keep your personal session securely active without requiring frequent re-authentication.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Zero Advertising Trackers:</strong> We do not track you across other apps or websites. We do not use advertising SDKs, behavioral analytics trackers, or commercial data broker services.</li>
          </ul>
        </Section>

        {/* Section 2 */}
        <Section icon={<Lock className="w-5 h-5" />} color="emerald" title="How Your Information Is Protected">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><strong className="text-slate-800 dark:text-slate-200">End-to-End Transport Security:</strong> All information transmitted between your device and our cloud servers is encrypted using modern industry-standard TLS encryption, shielding your communications from interception.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Encrypted Cloud Storage:</strong> All user records are stored within hardened, enterprise-grade cloud facilities with comprehensive storage-level encryption at rest.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Strict Account-Level Isolation:</strong> Automated access rules enforce strict isolation between accounts. It is structurally impossible for any other user to view, search, or access your personal records.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">One-Way Credential Protection:</strong> Your account passwords are cryptographically hashed and salted before storage and are never stored in readable format anywhere on our systems.</li>
          </ul>
        </Section>

        {/* Section 3 */}
        <Section icon={<Eye className="w-5 h-5" />} color="amber" title="Who Can Access Your Information">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><strong className="text-slate-800 dark:text-slate-200">You:</strong> You maintain exclusive visibility, control, and ownership over your personal dashboard and all logged data.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">No Commercial Sharing:</strong> We do not sell, rent, monetize, or disclose your personal records to any third party, broker, or advertising platform.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Infrastructure Providers:</strong> We utilize secure, certified cloud infrastructure solely to host and operate the application services securely and reliably.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Legal Compliance:</strong> We will only disclose information if strictly required by applicable legal obligations, court orders, or enforceable lawful government requests.</li>
          </ul>
        </Section>

        {/* Section 4 */}
        <Section icon={<Trash2 className="w-5 h-5" />} color="rose" title="Your Rights: Complete Control & Deletion">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li><strong className="text-slate-800 dark:text-slate-200">Permanent Account Deletion:</strong> You have the permanent, unconditional right to delete your account and all associated data at any time from your profile menu (top-right corner → Delete Account). Deletion is immediate and irreversible.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Data Portability & Export:</strong> You can download comprehensive reports of your habits, tasks, goals, activities, and financial records as standard spreadsheet files (CSV) at any time.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Account Sovereignty:</strong> You own your data. You can export it or permanently remove it whenever you choose with no lock-in or retention hurdles.</li>
          </ul>
        </Section>

        {/* Section 5 */}
        <Section icon={<Mail className="w-5 h-5" />} color="cyan" title="Contact Us">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>If you have any questions about this Privacy Policy or wish to make an inquiry regarding your data, please contact our support team at:</p>
            <p>
              <a
                href="mailto:naveensingh575@gmail.com"
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                naveensingh575@gmail.com
              </a>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 pt-1">
              We aim to respond to all privacy-related inquiries within 5 business days.
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
