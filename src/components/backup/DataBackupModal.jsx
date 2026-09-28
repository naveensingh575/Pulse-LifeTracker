import React, { useState, useRef } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  generateBackupPayload,
  downloadBackupFile,
  validateBackupFile,
  encryptBackupPayload,
  decryptBackupPayload
} from '../../utils/backupUtils';
import { playNotificationChime } from '../../utils/notificationUtils';
import { triggerHaptic } from '../../utils/hapticUtils';
import { triggerConfetti } from '../../utils/celebrationUtils';
import {
  Shield,
  Download,
  Upload,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  X,
  HardDrive,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  Crown
} from 'lucide-react';

export const DataBackupModal = ({ isOpen, onClose }) => {
  const {
    getBackupData,
    restoreBackupData,
    subscriptionTier,
    canExportData,
    trialInfo,
    openPricingModal,
    habits = [],
    goals = [],
    tasks = [],
    transactions = [],
    activities = [],
    journalEntries = [],
    deadlines = []
  } = useDashboard();

  const hasProAccess = subscriptionTier !== 'free' || Boolean(trialInfo?.isTrialActive) || Boolean(canExportData);

  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'

  // Export states
  const [encryptExport, setEncryptExport] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Import states
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileValidation, setFileValidation] = useState(null); // { valid, isEncrypted, data, counts, ... }
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'
  const [importError, setImportError] = useState('');
  const [importSuccessResult, setImportSuccessResult] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle Export
  const handleExport = async () => {
    setExportError('');
    setExportSuccess(false);

    if (!hasProAccess) {
      onClose();
      openPricingModal();
      return;
    }

    if (encryptExport) {
      if (!passphrase || passphrase.length < 6) {
        setExportError('Encryption passphrase must be at least 6 characters.');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setExportError('Passphrases do not match.');
        return;
      }
    }

    try {
      setIsExporting(true);
      const rawData = getBackupData();
      const payload = generateBackupPayload(rawData);

      let finalPayload = payload;
      if (encryptExport) {
        finalPayload = await encryptBackupPayload(payload, passphrase);
      }

      downloadBackupFile(finalPayload);
      setExportSuccess(true);
      triggerHaptic('light');
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('[Backup Export Error]:', err);
      setExportError(err.message || 'Failed to generate backup.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportError('');
    setImportSuccessResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = validateBackupFile(content);
      if (!res.valid) {
        setImportError(res.error || 'Failed to parse backup file.');
        setFileValidation(null);
      } else {
        setFileValidation(res);
      }
    };
    reader.onerror = () => {
      setImportError('Error reading file.');
      setFileValidation(null);
    };
    reader.readAsText(file);
  };

  // Handle Decryption of Encrypted File
  const handleDecryptFile = async () => {
    if (!decryptPassphrase) {
      setImportError('Please enter the decryption passphrase.');
      return;
    }
    setImportError('');

    try {
      setIsImporting(true);
      const decrypted = await decryptBackupPayload(fileValidation.rawPayload, decryptPassphrase);
      const res = validateBackupFile(decrypted);
      if (!res.valid) {
        setImportError(res.error || 'Decrypted file structure is invalid.');
      } else {
        setFileValidation(res);
      }
    } catch (err) {
      setImportError(err.message || 'Decryption failed.');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle Restore Execution
  const handleRestore = async () => {
    if (!fileValidation || !fileValidation.data) {
      setImportError('No valid backup data loaded.');
      return;
    }

    try {
      setIsImporting(true);
      setImportError('');

      const result = await restoreBackupData(fileValidation.data, importMode);
      setImportSuccessResult(result);

      // Play victory sound & confetti
      playNotificationChime();
      triggerConfetti(0.4);
      triggerHaptic('heavy');
    } catch (err) {
      console.error('[Restore Error]:', err);
      setImportError(err.message || 'Failed to restore backup.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Data Backup & Restore</span>
              {hasProAccess ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Pro Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>Pro Feature</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export or restore your personal data snapshot safely at any time.
            </p>
          </div>
        </div>

        {/* Tabs: Export vs Restore */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTab('export');
              setImportError('');
              setExportError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click Backup (Export)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('import');
              setImportError('');
              setExportError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore from File (Import)</span>
          </button>
        </div>

        {/* TAB 1: EXPORT / BACKUP */}
        {activeTab === 'export' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Pro Upgrade Banner for Free Users */}
            {!hasProAccess && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Pro Feature
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Downloading complete JSON backups requires an active Pro plan.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    openPricingModal();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-white text-xs font-bold shrink-0 transition shadow-sm cursor-pointer"
                >
                  Upgrade
                </button>
              </div>
            )}
            {/* Live Data Summary Pills */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Data Included in Snapshot:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-base font-black text-slate-800 dark:text-slate-200">{habits.length}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Habits & Logs</div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-base font-black text-slate-800 dark:text-slate-200">{tasks.length}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Tasks</div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-base font-black text-slate-800 dark:text-slate-200">{transactions.length}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Finances</div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-base font-black text-slate-800 dark:text-slate-200">{journalEntries.length}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Journals</div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-base font-black text-slate-800 dark:text-slate-200">{goals.length}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Goals</div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-base font-black text-slate-800 dark:text-slate-200">{activities.length + deadlines.length}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Acts & Deadlines</div>
                </div>
              </div>
            </div>

            {/* Optional Passphrase Encryption */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={encryptExport}
                  onChange={(e) => setEncryptExport(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Encrypt backup file with Passphrase (AES-256)</span>
                </span>
              </label>

              {encryptExport && (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <div>
                    <input
                      type="password"
                      placeholder="Enter strong passphrase (min. 6 chars)"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Confirm passphrase"
                      value={confirmPassphrase}
                      onChange={(e) => setConfirmPassphrase(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Keep this passphrase safe. If forgotten, encrypted backups cannot be recovered.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {exportError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{exportError}</span>
              </div>
            )}

            {/* Success Message */}
            {exportSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Backup file generated and downloaded successfully!</span>
              </div>
            )}

            {/* Download Button */}
            {hasProAccess ? (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:brightness-110 text-white text-xs font-black transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating Snapshot...' : 'Download Pulse Backup (.json)'}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  openPricingModal();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:brightness-110 text-white text-xs font-black transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-200" />
                <span>Upgrade to Pro to Download Backup (.json)</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: IMPORT / RESTORE */}
        {activeTab === 'import' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* File Selector */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/40"
            >
              <FileJson className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {selectedFile ? selectedFile.name : 'Click to select pulse_backup.json'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : 'Supports unencrypted or AES-encrypted Pulse backups'}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* If Encrypted, Ask for Passphrase */}
            {fileValidation?.isEncrypted && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <Lock className="w-4 h-4" />
                  <span>This backup is encrypted with a passphrase</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter decryption passphrase"
                    value={decryptPassphrase}
                    onChange={(e) => setDecryptPassphrase(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={handleDecryptFile}
                    disabled={isImporting}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Decrypt</span>
                  </button>
                </div>
              </div>
            )}

            {/* Validated Backup Inspection Details */}
            {fileValidation && !fileValidation.isEncrypted && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Valid Pulse Backup Verified</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {fileValidation.exportedAt ? new Date(fileValidation.exportedAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>• <strong>{fileValidation.counts?.habits || 0}</strong> habits with full completion streaks</div>
                  <div>• <strong>{fileValidation.counts?.tasks || 0}</strong> tasks</div>
                  <div>• <strong>{fileValidation.counts?.transactions || 0}</strong> financial transactions</div>
                  <div>• <strong>{fileValidation.counts?.journalEntries || 0}</strong> journal reflections</div>
                  <div>• <strong>{fileValidation.counts?.goals || 0}</strong> goals & milestones</div>
                </div>

                {/* Import Mode Selection */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Select Restore Strategy:
                  </div>

                  <label className="flex items-center space-x-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        🟢 Merge with Current Data (Recommended)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Adds new records and updates existing ones without deleting current logs.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        ⚠️ Full Overwrite & Restore
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Replaces current in-app data entirely with the contents of this backup file.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Error Message */}
            {importError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Success Result */}
            {importSuccessResult && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Restore Completed Successfully! 🎉</span>
                </div>
                <div className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 pl-6">
                  Synchronized {importSuccessResult.counts?.habits} habits, {importSuccessResult.counts?.tasks} tasks, and {importSuccessResult.counts?.transactions} transactions.
                </div>
              </div>
            )}

            {/* Restore Confirmation Button */}
            {fileValidation && !fileValidation.isEncrypted && !importSuccessResult && (
              <button
                onClick={handleRestore}
                disabled={isImporting}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
                <span>{isImporting ? 'Restoring Data...' : 'Confirm & Restore Data'}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
