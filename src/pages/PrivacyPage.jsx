import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Lock,
  Mail,
  FileText,
  CheckCircle2,
  Share2,
  Clock,
  Users,
  Server,
  RefreshCw,
  Sparkles,
  Cookie
} from "lucide-react";

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
              Last updated: September 23, 2026
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
          At Pulse Life Tracker (“Pulse,” “we,” “us,” or “our”), privacy is an important part of how we build our product.
        </p>
        <p>
          Pulse is designed to help you organize and understand your personal life—including your habits, goals, tasks, activities, journal entries, and finances—while keeping your information private and under your control.
        </p>
        <p className="font-semibold text-indigo-700 dark:text-indigo-300">
          This Privacy Policy explains what information we collect, how we use it, and the choices you have.
        </p>
      </div>

      <div className="space-y-4">

        {/* 1. Information You Provide */}
        <Section icon={<FileText className="w-5 h-5" />} color="indigo" title="1. Information You Provide">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
            <p>
              When you use Pulse, you may choose to provide the following information:
            </p>

            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Account Information</p>
              <ul className="list-disc list-inside space-y-1 text-xs pl-1">
                <li>Email address</li>
                <li>Profile name</li>
                <li>Information required to authenticate and secure your account</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Personal Information You Choose to Track</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Pulse allows you to record information such as:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  • Habits
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  • Goals
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  • Tasks and to-do items
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  • Activities
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  • Journal and reflection entries
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  • Personal finance records
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                • Progress and other information you choose to add
              </p>
            </div>

            <p className="text-xs italic text-slate-700 dark:text-slate-300 font-medium">
              You decide what information you want to store in Pulse.
            </p>
          </div>
        </Section>

        {/* 2. How We Use Your Information */}
        <Section icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" title="2. How We Use Your Information">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
            <p>
              We use your information to provide and operate Pulse, including to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs pl-1">
              <li>Create and manage your account</li>
              <li>Store and display your personal records</li>
              <li>Provide tracking, planning, and productivity features</li>
              <li>Keep your account securely signed in</li>
              <li>Maintain and improve the reliability of the service</li>
              <li>Provide customer support</li>
              <li>Protect the service from misuse and unauthorized activity</li>
              <li>Comply with applicable legal requirements</li>
            </ul>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium pt-1">
              Your personal records are used to provide the Pulse experience to you.
            </p>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              We do not sell your personal information or use your personal records for targeted advertising.
            </div>
          </div>
        </Section>

        {/* 3. Privacy and Security */}
        <Section icon={<Lock className="w-5 h-5" />} color="amber" title="3. Privacy and Security">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
            <p>
              We use industry-standard technical and organizational measures to protect information stored and transmitted through Pulse.
            </p>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
              These measures include:
            </p>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2 bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                <span className="font-bold text-slate-900 dark:text-white shrink-0">• Encrypted connections:</span>
                <span>Information transmitted between your device and our services is protected using HTTPS/TLS.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                <span className="font-bold text-slate-900 dark:text-white shrink-0">• Secure storage:</span>
                <span>Data stored by Pulse is protected using security controls provided by our cloud infrastructure.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                <span className="font-bold text-slate-900 dark:text-white shrink-0">• Account protection:</span>
                <span>Authentication and access controls are used to protect your account and personal records.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                <span className="font-bold text-slate-900 dark:text-white shrink-0">• Limited access:</span>
                <span>Access to information is restricted to what is necessary to operate and maintain the service.</span>
              </li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
              We continuously work to maintain appropriate security practices as Pulse evolves.
            </p>
          </div>
        </Section>

        {/* 4. Information Sharing */}
        <Section icon={<Share2 className="w-5 h-5" />} color="rose" title="4. Information Sharing">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
            <div>
              <p className="font-bold text-rose-600 dark:text-rose-400 mb-1">We Don't Sell Your Information</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                We do not sell, rent, or trade your personal information to advertisers or data brokers.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                We do not use your personal records to build advertising profiles.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">Service Providers</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Pulse may use trusted technology providers to operate the service, such as providers for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs pl-1">
                <li>Cloud hosting</li>
                <li>Database infrastructure</li>
                <li>Authentication</li>
                <li>Email delivery</li>
                <li>Security and application services</li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                These providers process information as necessary to provide their services to Pulse.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Legal Requirements</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                We may disclose information when required to comply with applicable law or valid legal processes, or when reasonably necessary to protect the security and rights of Pulse, our users, or others.
              </p>
            </div>
          </div>
        </Section>

        {/* 5. Cookies and Similar Technologies */}
        <Section icon={<Cookie className="w-5 h-5" />} color="cyan" title="5. Cookies and Similar Technologies">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
            <p>
              Pulse may use cookies, local storage, or similar technologies necessary to provide core functionality such as:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs pl-1">
              <li>Account authentication</li>
              <li>Maintaining your session</li>
              <li>Security</li>
              <li>Remembering preferences</li>
              <li>Application functionality</li>
            </ul>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
              We do not use these technologies for cross-site behavioral advertising.
            </p>
          </div>
        </Section>

        {/* 6. Your Data and Your Choices */}
        <Section icon={<Users className="w-5 h-5" />} color="purple" title="6. Your Data and Your Choices">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
            <p>
              Pulse is designed to give you control over your information.
            </p>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Depending on the features available in your account, you can:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs pl-1">
                <li>View your information</li>
                <li>Update your information</li>
                <li>Edit or delete personal records</li>
                <li>Export your data</li>
                <li>Delete your account</li>
              </ul>
            </div>

            <div className="bg-slate-100 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
              <p className="font-bold text-xs text-slate-900 dark:text-white">Data Export</p>
              <p className="text-xs">
                Where available, Pulse allows you to export your personal records in commonly usable formats such as CSV.
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
              <p className="font-bold text-xs text-slate-900 dark:text-white">Account Deletion</p>
              <p className="text-xs">
                You can delete your Pulse account through the account settings or profile menu where the feature is available.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                When you delete your account, we take reasonable steps to remove your associated personal information from our active systems.
              </p>
            </div>
          </div>
        </Section>

        {/* 7. Data Retention */}
        <Section icon={<Clock className="w-5 h-5" />} color="slate" title="7. Data Retention">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              We retain your information while your account is active or for as long as reasonably necessary to provide the Pulse service.
            </p>
            <p>
              When you delete your account, information associated with your account is removed from our active systems in accordance with our deletion processes.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Certain information may be retained where necessary to meet legal, security, or operational requirements.
            </p>
          </div>
        </Section>

        {/* 8. Children's Privacy */}
        <Section icon={<Shield className="w-5 h-5" />} color="amber" title="8. Children's Privacy">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              Pulse is not intended for children below the minimum age permitted under applicable law.
            </p>
            <p>
              We do not knowingly collect personal information from children where doing so would violate applicable law.
            </p>
          </div>
        </Section>

        {/* 9. Third-Party Services */}
        <Section icon={<Server className="w-5 h-5" />} color="indigo" title="9. Third-Party Services">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              Pulse may use third-party services necessary to operate and maintain the application.
            </p>
            <p>
              These services may include cloud infrastructure, authentication, email, security, and other technology services.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Third-party services operate under their own privacy policies and terms.
            </p>
          </div>
        </Section>

        {/* 10. Changes to This Privacy Policy */}
        <Section icon={<RefreshCw className="w-5 h-5" />} color="emerald" title="10. Changes to This Privacy Policy">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              We may update this Privacy Policy from time to time as Pulse evolves or as applicable requirements change.
            </p>
            <p>
              When we make significant changes, we will update the “Last updated” date and provide additional notice where appropriate.
            </p>
          </div>
        </Section>

        {/* 11. Contact Us */}
        <Section icon={<Mail className="w-5 h-5" />} color="cyan" title="11. Contact Us">
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              If you have questions about this Privacy Policy or your information, please contact us:
            </p>
            <p>
              <a
                href="mailto:naveensingh575@gmail.com"
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Email: naveensingh575@gmail.com
              </a>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 pt-1">
              We aim to respond to privacy-related inquiries within 5 business days.
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
          We do not sell your personal information or use your personal records for targeted advertising.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-600">
        Pulse Life Tracker · Privacy Policy · September 2026
      </div>
    </div>
  );
};

const colorMap = {
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
};

const Section = ({ icon, color, title, children }) => (
  <div className="glass-panel-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className={`flex items-center space-x-2.5 px-5 py-3 border-b border-slate-200 dark:border-slate-800 ${colorMap[color]?.split(" ").filter(c => c.startsWith("bg-")).join(" ")}`}>
      <div className={colorMap[color]?.split(" ").filter(c => !c.startsWith("bg-")).join(" ")}>
        {icon}
      </div>
      <h2 className={`font-bold text-sm ${colorMap[color]?.split(" ").filter(c => c.startsWith("text-")).join(" ")}`}>{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);
