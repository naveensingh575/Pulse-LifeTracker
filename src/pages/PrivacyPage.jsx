import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Lock,
  EyeOff,
  Trash2,
  Mail,
  FileText,
  CheckCircle2,
  BookOpen,
  Share2,
  Clock,
  Users,
  Server,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl mx-auto pb-12">

      {/* Header */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Effective Date: September 23, 2026
            </p>
          </div>
        </div>
        <Link
          to="/"
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-800 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Intro Card */}
      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-5 text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed space-y-2">
        <p>
          Pulse Life Tracker (“Pulse,” “we,” “our,” or “us”) respects your privacy and is committed to protecting the information you entrust to us.
        </p>
        <p>
          This Privacy Policy explains what information Pulse collects, how we use and protect it, when it may be shared, and the choices and rights available to you.
        </p>
        <p className="font-bold text-indigo-700 dark:text-indigo-300">
          We do not sell your personal information, use it for advertising, or share it with advertisers.
        </p>
      </div>

      <div className="space-y-4">

        {/* 1. Information We Collect */}
        <Section icon={<FileText className="w-5 h-5" />} color="indigo" title="1. Information We Collect">
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Account Information</h3>
              <p className="mb-1">When you create an account, we may collect:</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Your email address</li>
                <li>Your display name</li>
                <li>Authentication information needed to maintain your account</li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1.5">
                Your password is handled by our authentication provider and is not stored by Pulse in plain text.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Content You Create</h3>
              <p className="mb-1">Pulse stores information that you choose to enter into the app, including:</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Habits and habit records</li>
                <li>Tasks and to-do items</li>
                <li>Goals</li>
                <li>Journal entries</li>
                <li>Financial transactions and related records</li>
                <li>Activity logs and other information you choose to save in Pulse</li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                This information is used to provide the features you request and to maintain your personal Pulse account.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Technical and Session Information</h3>
              <p>
                Pulse may process limited technical information that is necessary to operate, secure, and maintain the service, such as authentication and session information.
              </p>
              <p className="font-medium text-slate-700 dark:text-slate-300 mt-1">
                Pulse does not use advertising trackers, advertising SDKs, or third-party tracking pixels.
              </p>
            </div>
          </div>
        </Section>

        {/* 2. How We Use Your Information */}
        <Section icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" title="2. How We Use Your Information">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>We use your information only for purposes related to operating and supporting Pulse, including to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>Create and maintain your account</li>
              <li>Authenticate you securely</li>
              <li>Store and display the information you enter</li>
              <li>Provide habit, goal, task, journal, financial, and activity features</li>
              <li>Protect the service against unauthorized access, abuse, or security incidents</li>
              <li>Respond to support requests</li>
              <li>Maintain, troubleshoot, and improve the reliability of the application</li>
              <li>Comply with applicable legal obligations</li>
            </ul>
            <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-1">
              We do not sell your information or use your personal information for targeted advertising.
            </p>
          </div>
        </Section>

        {/* 3. Your Journal and Financial Information */}
        <Section icon={<BookOpen className="w-5 h-5" />} color="purple" title="3. Your Journal and Financial Information">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>We understand that journal entries and financial records can be highly personal.</p>
            <p>
              Your private journal entries and financial information are intended to remain private to your account. We do not sell, rent, or use this information for advertising.
            </p>
            <p>
              Authorized personnel may access limited account information when reasonably necessary to provide support, investigate a technical issue, maintain the service, or comply with a legal obligation.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              We do not intentionally access private journal or financial content for support unless you explicitly provide or authorize access for that purpose, except where access is required by law or necessary to protect the security and integrity of the service.
            </p>
          </div>
        </Section>

        {/* 4. How We Share Information */}
        <Section icon={<Share2 className="w-5 h-5" />} color="amber" title="4. How We Share Information">
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              We do not sell, rent, or trade your personal information.
            </p>
            <p>We may share or allow access to information only in limited circumstances necessary to operate Pulse, such as:</p>

            <div className="space-y-2.5 pl-1">
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">Service Providers</strong>
                <p>
                  We use trusted third-party service providers to provide essential services such as authentication, hosting, and data storage.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  For example, Pulse uses Supabase as a service provider for authentication and data storage. These providers process information on our behalf and are expected to protect it appropriately.
                </p>
              </div>

              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">Legal Requirements</strong>
                <p>
                  We may disclose information when required to do so by applicable law, regulation, court order, subpoena, or other valid legal process.
                </p>
              </div>

              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">Security and Protection</strong>
                <p>
                  We may disclose information where reasonably necessary to prevent fraud, abuse, security threats, or other harm to Pulse, our users, or others.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* 5. Data Security */}
        <Section icon={<Lock className="w-5 h-5" />} color="cyan" title="5. Data Security">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>
              We take reasonable technical and organizational measures to protect your information against unauthorized access, loss, misuse, alteration, or disclosure.
            </p>
            <p className="font-medium text-slate-700 dark:text-slate-300">These measures include:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Encryption of data transmitted between your device and our services</li>
              <li>Encryption of stored data</li>
              <li>Access controls designed to limit access to authorized users and personnel</li>
              <li>Security measures provided by our infrastructure and service providers</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
              No method of storing or transmitting information over the internet can be guaranteed to be completely secure. We therefore cannot guarantee absolute security, but we continuously take reasonable steps to protect your information.
            </p>
          </div>
        </Section>

        {/* 6. Data Retention */}
        <Section icon={<Clock className="w-5 h-5" />} color="slate" title="6. Data Retention">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>
              We retain your information for as long as reasonably necessary to provide Pulse and fulfill the purposes described in this Privacy Policy.
            </p>
            <p>
              When you delete your account, we initiate deletion of your account and associated personal data, subject to information that may need to be retained for legal, security, fraud-prevention, or other legitimate business requirements.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              Where applicable, information remaining in backup systems may take additional time to be removed through normal backup and retention processes.
            </p>
          </div>
        </Section>

        {/* 7. Your Rights and Choices */}
        <Section icon={<Trash2 className="w-5 h-5" />} color="rose" title="7. Your Rights and Choices">
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>You have control over the information stored in your Pulse account.</p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-800 dark:text-slate-200 block mb-1">Delete Your Account</strong>
                <p className="text-xs mb-1">You can permanently delete your account from the profile menu:</p>
                <code className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 inline-block mb-1">
                  Profile → Delete Account
                </code>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Account deletion is intended to remove your Pulse account and associated data and cannot be undone.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-800 dark:text-slate-200 block mb-1">Export Your Data</strong>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You can export your information from supported Pulse modules using the Download Report feature. Exports are provided in standard CSV format and can be opened using applications such as Microsoft Excel or Google Sheets.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-800 dark:text-slate-200 block mb-1">Update Your Information</strong>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Where available, you may update or correct information associated with your account directly within the application. For additional privacy requests, you may contact us using the details below.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* 8. Tracking and Advertising */}
        <Section icon={<EyeOff className="w-5 h-5" />} color="indigo" title="8. Tracking and Advertising">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>Pulse does not use:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Advertising networks</li>
              <li>Advertising SDKs</li>
              <li>Third-party advertising pixels</li>
              <li>Cross-site advertising trackers</li>
            </ul>
            <p className="font-bold text-indigo-700 dark:text-indigo-400 pt-1">
              We do not sell your personal information to advertisers.
            </p>
          </div>
        </Section>

        {/* 9. Children's Privacy */}
        <Section icon={<Users className="w-5 h-5" />} color="amber" title="9. Children's Privacy">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Pulse is not intended for children who are not legally permitted to use the service under applicable law.
            </p>
            <p>
              We do not knowingly collect personal information from children in violation of applicable privacy laws. If you believe a child has provided personal information to us improperly, please contact us so that we can review and take appropriate action.
            </p>
          </div>
        </Section>

        {/* 10. Third-Party Services */}
        <Section icon={<Server className="w-5 h-5" />} color="cyan" title="10. Third-Party Services">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Pulse may rely on third-party service providers to operate parts of the application.
            </p>
            <p>
              These providers may process information on our behalf as necessary to provide services such as authentication, hosting, infrastructure, or data storage.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              Their handling of information may also be subject to their own privacy policies and terms.
            </p>
          </div>
        </Section>

        {/* 11. Changes to This Privacy Policy */}
        <Section icon={<RefreshCw className="w-5 h-5" />} color="emerald" title="11. Changes to This Privacy Policy">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              We may update this Privacy Policy from time to time to reflect changes to Pulse, our practices, or applicable legal requirements.
            </p>
            <p>
              When we make material changes, we will take reasonable steps to notify users through the application or other appropriate means.
            </p>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
              The updated policy will include a revised Effective Date at the top of this page.
            </p>
          </div>
        </Section>

        {/* 12. Contact Us */}
        <Section icon={<Mail className="w-5 h-5" />} color="indigo" title="12. Contact Us">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              If you have questions about this Privacy Policy, want to make a privacy request, or need assistance with account deletion, please contact:
            </p>
            <p>
              <a
                href="mailto:naveensingh575@gmail.com"
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                naveensingh575@gmail.com
              </a>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 pt-1">
              We aim to respond to privacy-related requests within a reasonable period.
            </p>
          </div>
        </Section>

      </div>

      {/* Our Privacy Commitment Callout */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-2 shadow-lg">
        <div className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Our Privacy Commitment
        </h3>
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Pulse is designed with a simple principle: Your personal information belongs to you.
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          We do not sell your data, use it for advertising, or share it for commercial purposes unrelated to operating Pulse.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-600">
        Pulse Life Tracker · Privacy Policy · Effective September 23, 2026
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
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
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
