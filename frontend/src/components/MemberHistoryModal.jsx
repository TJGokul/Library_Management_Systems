import React, { useState, useEffect } from 'react';
import { X, History, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export function MemberHistoryModal({ isOpen, onClose, member }) {
  if (!isOpen || !member) return null;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchHistory() {
      setLoading(true);
      setError('');
      try {
        const data = await api.getMemberHistory(member.id);
        if (isMounted) setHistory(data || []);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load borrowing history');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchHistory();
    return () => { isMounted = false; };
  }, [member]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Borrowing History</h3>
              <p className="text-xs text-slate-500">
                {member.name} ({member.membershipNumber}) • {member.email}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading history...</div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No borrowing activity recorded for this member yet.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => {
                const isReturned = record.status === 'RETURNED';
                const isOverdue = record.status === 'OVERDUE' || (!isReturned && new Date(record.dueDate) < new Date());

                return (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800">{record.book?.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ISBN: {record.book?.isbn} • Author: {record.book?.author}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>Issued: <strong>{record.issueDate}</strong></span>
                        <span>Due: <strong className={isOverdue ? 'text-rose-600' : ''}>{record.dueDate}</strong></span>
                        {isReturned && (
                          <span>Returned: <strong className="text-emerald-600">{record.returnDate}</strong></span>
                        )}
                      </div>
                      {record.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          Note: {record.notes}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isReturned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Returned
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          Active Loan
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
