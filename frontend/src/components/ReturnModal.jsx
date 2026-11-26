import React, { useState } from 'react';
import { X, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

export function ReturnModal({ isOpen, onClose, onConfirm, record }) {
  if (!isOpen || !record) return null;

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onConfirm(record.id, notes.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Process Book Return</h3>
              <p className="text-xs text-slate-500">Restore copy back to library inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Card */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 text-xs space-y-1.5">
          <p className="font-semibold text-sm text-slate-900">{record.book?.title}</p>
          <p className="text-slate-500">ISBN: <span className="font-mono text-slate-700">{record.book?.isbn}</span></p>
          <p className="text-slate-500">Borrower: <strong className="text-slate-800">{record.member?.name}</strong> ({record.member?.membershipNumber})</p>
          <div className="flex gap-4 pt-1 text-slate-500">
            <span>Issued: <strong>{record.issueDate}</strong></span>
            <span>Due Date: <strong>{record.dueDate}</strong></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Return Inspection Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Returned in good condition, spine intact"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Available stock will automatically increment by 1 and an inventory return transaction will be logged.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Processing...' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
