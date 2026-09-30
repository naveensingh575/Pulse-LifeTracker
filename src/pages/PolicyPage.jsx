import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  FileText,
  CreditCard,
  Lock,
  AlertTriangle,
  Scale,
  Sparkles,
  CheckCircle2,
  Mail,
  Activity,
  DollarSign,
  Heart,
  Server,
  RefreshCw,
  Ban
} from "lucide-react";

export const PolicyPage = ({ defaultTab }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on route or prop or state
  const getInitialTab = () => {
    if (defaultTab) return defaultTab;
    if (location.pathname === "/terms") return "terms";
    if (location.pathname === "/refund-policy") return "refund";
    if (location.pathname === "/privacy") return "privacy";
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["terms", "privacy", "refund"].includes(tabParam)) {
      return tabParam;
    }
    return "terms";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location.pathname === "/terms") {
      setActiveTab("terms");
    } else if (location.pathname === "/refund-policy") {
      setActiveTab("refund");
    } else if (location.pathname === "/privacy") {
      setActiveTab("privacy");
    }
  }, [location.pathname, defaultTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto pb-16">

      {/* Header Bar */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Policies & Legal Center</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Pulse Life Tracker · Effective Date: September 2026
            </p>
          </div>
        </div>
        <Link
          to="/"
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-800 transition shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Segmented Policy Tabs */}
      <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 gap-1.5 overflow-x-auto">
        <button
          onClick={() => handleTabChange("terms")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "terms"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Terms of Service</span>
        </button>

        <button
          onClick={() => handleTabChange("privacy")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "privacy"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => handleTabChange("refund")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "refund"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4 shrink-0" />
          <span>Cancellation & Refunds</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TERMS OF SERVICE */}
      {/* ========================================================================= */}
      {activeTab === "terms" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          
          {/* Summary Box */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 rounded-2xl p-5 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-900 dark:text-indigo-300">
              <Scale className="w-4 h-4" />
              <span>Terms of Service Overview</span>
            </div>
            <p>
              These Terms of Service govern your access to and use of Pulse Life Tracker (“Pulse”). By creating an account or accessing Pulse, you signify your agreement to these Terms. If you do not agree, please discontinue use immediately.
            </p>
          </div>

          {/* 1. Acceptance & Eligibility */}
          <PolicySection icon={<CheckCircle2 className="w-4 h-4" />} title="1. Acceptance of Terms & Eligibility" color="indigo">
            <p>
              By accessing or using Pulse, you represent and warrant that you are at least 18 years of age (or the age of legal majority in your jurisdiction) and have the full legal capacity to enter into a binding agreement. You agree to use the Service in compliance with all applicable local, national, and international laws, regulations, and statutes.
            </p>
          </PolicySection>

          {/* 2. Nature of the Software */}
          <PolicySection icon={<FileText className="w-4 h-4" />} title="2. Description of Service" color="indigo">
            <p>
              Pulse provides an integrated digital personal organization environment designed to assist users in planning, self-logging daily habits, athletic workouts, task lists, personal budget entries, and private reflections. The Service is provided solely for personal organizational and self-tracking purposes.
            </p>
          </PolicySection>

          {/* 3. CRUCIAL DISCLAIMER: Physical Fitness & Exercise */}
          <PolicySection icon={<Activity className="w-4 h-4" />} title="3. Physical Fitness, Health & Athletic Activity Disclaimer" color="rose">
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-900 dark:text-rose-200 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Important Medical and Physical Activity Notice</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Pulse is strictly a digital logging utility. Pulse does NOT provide medical advice, diagnosis, physiological evaluation, or certified athletic coaching.
                </p>
              </div>
              <p>
                Any workout routines, resistance training targets, distance goals, or performance records recorded in Pulse reflect solely user-entered data and standardized mathematical counters.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs pl-1 text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Consultation Required:</strong> You should consult a licensed physician, certified personal trainer, or healthcare professional before beginning any new training program, attempting heavy resistance lifting, or altering physical activity levels.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Voluntary Assumption of Risk:</strong> Physical exercise carries inherent risks of injury, strains, fractures, cardiovascular stress, or death. You voluntarily assume full responsibility and all associated risks for any physical activities or training routines you log or undertake.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Release of Liability:</strong> Under no circumstances shall Pulse, its creators, directors, or affiliates be liable for any physical injury, illness, muscle damage, or adverse health outcome arising from your athletic training or use of the application.
                </li>
              </ul>
            </div>
          </PolicySection>

          {/* 4. CRUCIAL DISCLAIMER: Financial & Investment Advisory */}
          <PolicySection icon={<DollarSign className="w-4 h-4" />} title="4. Personal Budgeting & Financial Information Disclaimer" color="amber">
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Not Financial, Tax, or Investment Advice</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Pulse is NOT a registered investment advisor, certified financial planner, broker-dealer, or tax advisory service under any jurisdiction.
                </p>
              </div>
              <p>
                The financial management tools within Pulse provide personal expense ledgering and basic mathematical calculations based exclusively on user inputs.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs pl-1 text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Self-Directed Logging:</strong> All calculations, category breakdowns, savings rates, and budget indicators are descriptive representations of self-logged historical transactions.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">No Professional Fiduciary Duty:</strong> No fiduciary, financial advisory, or wealth-management relationship is formed through your use of the Service.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Sole User Responsibility:</strong> You are solely responsible for verifying the accuracy of any personal finances, taxes, investment strategies, or financial commitments. Pulse disclaims all liability for financial losses, investment underperformance, or regulatory non-compliance resulting from your personal records.
                </li>
              </ul>
            </div>
          </PolicySection>

          {/* 5. CRUCIAL DISCLAIMER: Mental Well-being & Reflective Journaling */}
          <PolicySection icon={<Heart className="w-4 h-4" />} title="5. Mental Well-being & Reflective Journaling Disclaimer" color="purple">
            <div className="space-y-2">
              <p>
                The Journal module in Pulse is designed strictly as a private, self-directed reflective workspace. Pulse does not offer psychological counseling, psychotherapy, psychiatric diagnosis, or emergency mental health crisis services.
              </p>
              <p className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200">
                <strong>Emergency Helpline Notice:</strong> If you or someone you know is in acute emotional distress, experiencing mental health crisis, or having thoughts of self-harm, please contact emergency medical services or a licensed suicide prevention hotline immediately (such as 988 in the United States/Canada, 112 in the European Union, or Tele-MANAS 14416 in India).
              </p>
            </div>
          </PolicySection>

          {/* 6. Intellectual Property & Anti-Scraping / Anti-Reverse Engineering */}
          <PolicySection icon={<Lock className="w-4 h-4" />} title="6. Proprietary Rights & Acceptable Use Restrictions" color="indigo">
            <div className="space-y-2">
              <p>
                All rights, title, and interest in and to Pulse Life Tracker—including but not limited to visual interfaces, proprietary algorithms, design, icons, and software code—are the exclusive intellectual property of Pulse Life Tracker.
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">You explicitly agree that you shall NOT:</p>
              <ul className="list-disc list-inside space-y-1 text-xs pl-1 text-slate-600 dark:text-slate-400">
                <li>Reverse-engineer, decompile, disassemble, or attempt to derive the underlying software architecture or algorithms of the Service.</li>
                <li>Deploy automated scrapers, crawlers, robots, or extraction scripts against any part of the Service.</li>
                <li>Circumvent, disable, or tamper with security protocols, user quotas, or subscription feature gating mechanisms.</li>
                <li>Rent, lease, sublicense, resell, or distribute access to Pulse or its premium passes to third parties.</li>
              </ul>
            </div>
          </PolicySection>

          {/* 7. Limitation of Liability */}
          <PolicySection icon={<Scale className="w-4 h-4" />} title="7. Limitation of Liability & 'AS IS' Warranty" color="slate">
            <div className="space-y-3">
              <p>
                Pulse is provided strictly on an <strong>“as is”</strong> and <strong>“as available”</strong> basis without warranties of any kind, whether express, statutory, or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or uninterrupted availability.
              </p>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  To the maximum extent permitted by applicable law:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs pl-1 text-slate-600 dark:text-slate-400">
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Exclusion of Consequential Damages:</strong> In no event shall Pulse, its creators, directors, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages—including loss of data, profits, revenue, or business interruption—arising from your use or inability to use the application.
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Cap on Total Aggregate Liability:</strong> Under all circumstances, Pulse’s total cumulative liability for any and all claims related to the service shall be strictly limited to the actual amount paid by you to Pulse in the twelve (12) months preceding the claim, or fifty United States dollars ($50.00 USD / equivalent in INR), whichever is lower.
                  </li>
                </ul>
              </div>
            </div>
          </PolicySection>

          {/* 8. Governing Law & Dispute Resolution */}
          <PolicySection icon={<Server className="w-4 h-4" />} title="8. Governing Law & Jurisdiction" color="indigo">
            <p>
              These Terms and any dispute or claim arising out of or related to them shall be governed by and construed in accordance with the substantive laws of India, without regard to its conflict of law principles. You agree that any legal suit, action, or proceeding arising out of these Terms shall be instituted exclusively in the competent courts located in Bengaluru, Karnataka, India.
            </p>
          </PolicySection>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRIVACY POLICY */}
      {/* ========================================================================= */}
      {activeTab === "privacy" && (
        <div className="space-y-4 animate-in fade-in duration-150">

          {/* Summary Box */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-5 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-300">
              <Shield className="w-4 h-4" />
              <span>Privacy Policy Overview</span>
            </div>
            <p>
              At Pulse, we believe your personal life metrics belong strictly to you. We do not sell your personal records, we do not monetize your habits or reflections, and we do not use your personal information for targeted behavioral advertising.
            </p>
          </div>

          {/* 1. Information Collected */}
          <PolicySection icon={<FileText className="w-4 h-4" />} title="1. Information We Collect" color="emerald">
            <div className="space-y-3">
              <p>
                We collect only the minimum information necessary to maintain your account and deliver your personal operating dashboard:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs pl-1 text-slate-600 dark:text-slate-400">
                <li><strong className="text-slate-800 dark:text-slate-200">Authentication Data:</strong> Your email address and cryptographically managed authentication tokens required to securely verify your identity.</li>
                <li><strong className="text-slate-800 dark:text-slate-200">User-Logged Life Records:</strong> Habits, task completions, athletic training entries, personal budgeting transactions, goal milestones, and journal reflections that you intentionally input into the application.</li>
                <li><strong className="text-slate-800 dark:text-slate-200">Transactional Billing Records:</strong> For paid subscriptions or lifetime passes, payment reference IDs and subscription lifecycle status provided by authorized global payment partners. We do not store raw credit card numbers or banking passwords on our servers.</li>
              </ul>
            </div>
          </PolicySection>

          {/* 2. How Information is Used */}
          <PolicySection icon={<CheckCircle2 className="w-4 h-4" />} title="2. Purpose of Processing" color="emerald">
            <p>
              Your data is processed strictly to provide the core functionality of Pulse:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs pl-1 text-slate-600 dark:text-slate-400 mt-2">
              <li>Rendering your daily cockpit, progress heatmaps, and habit consistency calendars.</li>
              <li>Computing personal cross-domain correlation trends and goal feasibility metrics.</li>
              <li>Syncing your encrypted records across your authorized desktop and mobile devices.</li>
              <li>Managing your active subscription status and quota enforcement.</li>
            </ul>
          </PolicySection>

          {/* 3. Security & Infrastructure Protection */}
          <PolicySection icon={<Lock className="w-4 h-4" />} title="3. Data Security & Storage Safeguards" color="indigo">
            <div className="space-y-2">
              <p>
                We employ enterprise-grade technical and organizational safeguards designed to protect your personal metrics against unauthorized access, loss, or disclosure:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs pl-1 text-slate-600 dark:text-slate-400">
                <li><strong className="text-slate-800 dark:text-slate-200">Encryption in Transit:</strong> All communications between your client device and our servers are encrypted using modern Transport Layer Security (TLS/HTTPS).</li>
                <li><strong className="text-slate-800 dark:text-slate-200">Encryption at Rest:</strong> Cloud databases store your metrics using industry-standard AES-256 storage encryption.</li>
                <li><strong className="text-slate-800 dark:text-slate-200">Granular Row-Level Access Controls:</strong> Database policies ensure that user accounts can strictly read and write only their own records, preventing cross-tenant data leakage.</li>
              </ul>
            </div>
          </PolicySection>

          {/* 4. Data Ownership & Self-Serve Account Deletion (GDPR / DPDP) */}
          <PolicySection icon={<Scale className="w-4 h-4" />} title="4. Your Rights & Permanent Account Deletion" color="emerald">
            <div className="space-y-2.5">
              <p>
                In compliance with global data protection principles (including the EU General Data Protection Regulation and India's Digital Personal Data Protection Act):
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs pl-1 text-slate-600 dark:text-slate-400">
                <li><strong className="text-slate-800 dark:text-slate-200">Right to Portability:</strong> Pro users can export their data directly in standard portable formats (CSV and Markdown).</li>
                <li><strong className="text-slate-800 dark:text-slate-200">Right to Rectification:</strong> You can edit or delete any logged habit, activity, financial record, or journal note at any time within the interface.</li>
                <li><strong className="text-slate-800 dark:text-slate-200">Right to Erasure (Permanent Account Deletion):</strong> You may permanently delete your account and wipe all associated personal data directly via the self-serve <em>Delete Account</em> action located in your user profile menu. Upon confirmation, all your personal entries are permanently purged from active production databases.</li>
              </ul>
            </div>
          </PolicySection>

          {/* 5. Zero Third-Party Advertising */}
          <PolicySection icon={<Ban className="w-4 h-4" />} title="5. Zero Advertising & No Data Selling" color="rose">
            <p>
              We firmly reject the advertising-driven business model. We do not sell, rent, monetize, or trade your personal records, athletic performance, financial entries, or reflections to data brokers, advertising networks, or commercial analytics conglomerates.
            </p>
          </PolicySection>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CANCELLATION & REFUND POLICY */}
      {/* ========================================================================= */}
      {activeTab === "refund" && (
        <div className="space-y-4 animate-in fade-in duration-150">

          {/* Summary Box */}
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl p-5 text-xs text-amber-950 dark:text-amber-200 leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-300">
              <CreditCard className="w-4 h-4" />
              <span>Subscription, Cancellation & Refund Policy</span>
            </div>
            <p>
              Pulse Life Tracker delivers immediate digital access upon activation. This Policy outlines how cancellations operate and sets forth our terms regarding fees and refunds.
            </p>
          </div>

          {/* 1. Nature of Digital Goods */}
          <PolicySection icon={<Sparkles className="w-4 h-4" />} title="1. Immediate Digital Delivery" color="amber">
            <p>
              Pulse is software-as-a-service (SaaS) and digital intelligence tooling. Upon successful payment verification, access to unlimited tracking, multi-pillar analytics, and advanced modules is activated immediately on your account. Because digital services cannot be returned once delivered, payments are subject to the terms set forth below.
            </p>
          </PolicySection>

          {/* 2. Cancel Anytime for Subscriptions */}
          <PolicySection icon={<RefreshCw className="w-4 h-4" />} title="2. Cancel Anytime (Monthly & Yearly Plans)" color="emerald">
            <div className="space-y-2">
              <p>
                We believe in complete transparency and straightforward account management:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs pl-1 text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Self-Serve Cancellation:</strong> You may cancel an active recurring Pro Monthly or Pro Yearly plan at any time directly through the application by opening the <em>Subscription</em> modal and clicking <em>Cancel Subscription</em>.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Retain Access Until Period Ends:</strong> When you cancel, your subscription will not renew for subsequent billing cycles. You will retain full access to all Pro features until the conclusion of your current paid billing period.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">No Cancellation Penalties:</strong> There are no cancellation penalties or early termination fees.
                </li>
              </ul>
            </div>
          </PolicySection>

          {/* 3. No-Refund Policy */}
          <PolicySection icon={<Ban className="w-4 h-4" />} title="3. No Refund Policy" color="rose">
            <div className="space-y-2">
              <p>
                Except where strictly required by applicable mandatory consumer laws, <strong>all payments made to Pulse are final and non-refundable</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs pl-1 text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">No Partial or Prorated Refunds:</strong> We do not offer prorated refunds, partial credits, or reimbursement for unused days within an active monthly or yearly billing cycle.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Non-Usage Does Not Entitle Refunds:</strong> Failure to log in, track habits, or utilize the Service during an active paid term does not constitute grounds for a refund.
                </li>
              </ul>
            </div>
          </PolicySection>

          {/* 4. Founder Lifetime Pass Terms */}
          <PolicySection icon={<Lock className="w-4 h-4" />} title="4. Founder Lifetime Pass Specific Terms" color="amber">
            <div className="space-y-2">
              <p>
                The Founder Lifetime Pass is a special, one-time payment tier providing permanent personal access to Pulse Pro features and future core intelligence updates:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs pl-1 text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Strictly Non-Refundable:</strong> Due to the heavy promotional discount (70% off regular lifetime value) and limited allocation, Founder Lifetime purchases are 100% final and non-refundable upon checkout completion.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Permanent and Non-Transferable:</strong> Founder Lifetime passes are tied to the specific verified account used at checkout and cannot be transferred, resold, or re-assigned to other individuals.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Strict Capacity Quota:</strong> The paid Founder Lifetime tier is strictly capped at 500 paid members. Once filled, the cohort is permanently closed to new members.
                </li>
              </ul>
            </div>
          </PolicySection>

          {/* 5. Billing Disputes & Inquiries */}
          <PolicySection icon={<Mail className="w-4 h-4" />} title="5. Billing Inquiries & Chargeback Resolution" color="indigo">
            <p>
              If you believe an incorrect charge occurred, or if you encounter any billing anomalies, please contact our support team before initiating a chargeback or payment dispute with your bank or card issuer. We are committed to investigating any legitimate billing discrepancies promptly:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mt-2 text-xs space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">Billing Support Contact:</p>
              <p className="text-slate-600 dark:text-slate-400">
                Email:{" "}
                <a href="mailto:navisingh2100@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  navisingh2100@gmail.com
                </a>
              </p>
              <p className="text-[11px] text-slate-500">
                Please include your registered account email and payment reference transaction ID for prompt resolution.
              </p>
            </div>
          </PolicySection>

        </div>
      )}

      {/* Global Commitment Banner */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 text-center space-y-2 shadow-lg mt-8">
        <div className="inline-flex items-center justify-center p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-1">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Pulse Operating Standard
        </h3>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          Total User Privacy · Clear Legal Standards
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          We maintain transparent policies and legal safeguards to protect both your personal data privacy and the integrity of the Pulse ecosystem.
        </p>
      </div>

      {/* Discreet Footer */}
      <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-600">
        Pulse Life Tracker · Policies & Legal Center · Last Updated September 2026
      </div>

    </div>
  );
};

const colorMap = {
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
};

const PolicySection = ({ icon, color, title, children }) => (
  <div className="glass-panel-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
    <div className={`flex items-center space-x-2.5 px-5 py-3 border-b border-slate-200 dark:border-slate-800 ${colorMap[color]?.split(" ").filter(c => c.startsWith("bg-")).join(" ")}`}>
      <div className={colorMap[color]?.split(" ").filter(c => !c.startsWith("bg-")).join(" ")}>
        {icon}
      </div>
      <h2 className={`font-bold text-sm ${colorMap[color]?.split(" ").filter(c => c.startsWith("text-")).join(" ")}`}>
        {title}
      </h2>
    </div>
    <div className="p-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{children}</div>
  </div>
);
