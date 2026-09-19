import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * DeleteAccountModal
 * Requires the user to type "DELETE" before allowing account deletion.
 * Calls the secure `deleteAccount()` from AuthContext which triggers a
 * Postgres SECURITY DEFINER RPC — no service_role key is ever exposed.
 */
export const DeleteAccountModal = ({ onClose }) => {
  const { deleteAccount, user } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setError('');
    try {
      await deleteAccount();
      // After deletion, AuthContext's logout() is called internally
      // which clears the user session and redirects to login
    } catch (err) {
      setError(err?.message || 'Failed to delete account. Please try again or contact support.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-500/30 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 z-10">

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-40"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">Delete Account Permanently</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Logged in as <span className="font-bold text-slate-700 dark:text-slate-300">{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Warning message */}
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 text-xs text-rose-700 dark:text-rose-300 space-y-1.5 leading-relaxed">
          <p className="font-bold">This action is permanent and cannot be undone.</p>
          <p>All of your data will be permanently deleted, including:</p>
          <ul className="list-disc list-inside space-y-0.5 text-rose-600 dark:text-rose-400">
            <li>All habits and completion history</li>
            <li>All tasks and deadlines</li>
            <li>All financial transactions and allocations</li>
            <li>All goals and milestones</li>
            <li>All journal entries</li>
            <li>All activity and fitness logs</li>
          </ul>
        </div>

        {/* Confirmation input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Type <span className="text-rose-600 dark:text-rose-400 font-mono">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (error) setError('');
            }}
            disabled={isDeleting}
            placeholder="Type DELETE"
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 transition placeholder-slate-400 disabled:opacity-50"
            autoComplete="off"
            autoCapitalize="characters"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete My Account</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
