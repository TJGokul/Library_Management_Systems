import React, { useState } from 'react';
import {
  ArrowLeftRight,
  UserCheck,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  Filter,
} from 'lucide-react';

export function IssuesView({
  borrowRecords,
  books,
  members,
  preselectedBook,
  onClearPreselectedBook,
  onIssueBook,
  onInitiateReturn,
}) {
  const [selectedBookId, setSelectedBookId] = useState(preselectedBook ? preselectedBook.id : '');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState('');

  // Find currently selected member to show borrowing limit status
  const currentMember = members.find((m) => m.id === Number(selectedMemberId));
  const currentBook = books.find((b) => b.id === Number(selectedBookId));

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setIssueError('');

    if (!selectedBookId || !selectedMemberId) {
      setIssueError('Please select both a book and a registered member');
      return;
    }

    if (currentMember && currentMember.activeLoansCount >= 3) {
      setIssueError(`Cannot issue: ${currentMember.name} has already reached the maximum limit of 3 borrowed books.`);
      return;
    }

    if (currentBook && currentBook.availableCopies <= 0) {
      setIssueError(`Cannot issue: '${currentBook.title}' is out of stock.`);
      return;
    }

    setIssuing(true);
    try {
      await onIssueBook({
        bookId: Number(selectedBookId),
        memberId: Number(selectedMemberId),
        notes: notes.trim(),
      });
      setSelectedBookId('');
      setSelectedMemberId('');
      setNotes('');
      if (onClearPreselectedBook) onClearPreselectedBook();
    } catch (err) {
      setIssueError(err.message || 'Failed to issue book');
    } finally {
      setIssuing(false);
    }
  };

  const filteredRecords = borrowRecords.filter((rec) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ISSUED') return rec.status === 'ISSUED';
    if (statusFilter === 'OVERDUE') return rec.status === 'OVERDUE';
    if (statusFilter === 'RETURNED') return rec.status === 'RETURNED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Issue & Return Operations Desk</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Process book checkouts with strict 3-book limit enforcement, automatic 14-day duration, and check-in returns.
        </p>
      </div>

      {/* Issue Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Issue Book to Registered Member</h3>
            <p className="text-xs text-slate-400">14-day standard borrowing period is automatically assigned</p>
          </div>
        </div>

        <form onSubmit={handleIssueSubmit} className="space-y-4">
          {issueError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{issueError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Library Member <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="">-- Choose Member --</option>
                {members.map((m) => {
                  const isMaxReached = m.activeLoansCount >= 3;
                  const isSuspended = m.status === 'SUSPENDED';
                  return (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={isMaxReached || isSuspended}
                    >
                      {m.name} ({m.membershipNumber}) • {m.activeLoansCount}/3 borrowed {isMaxReached ? '⛔ (Limit Reached)' : isSuspended ? '⛔ (Suspended)' : ''}
                    </option>
                  );
                })}
              </select>

              {currentMember && (
                <div className="mt-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Member Active Loans:</span>
                    <span className="font-bold text-slate-800">
                      {currentMember.activeLoansCount} of 3 maximum allowed
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((slot) => (
                      <div
                        key={slot}
                        className={`w-3 h-3 rounded-full ${
                          slot <= currentMember.activeLoansCount
                            ? currentMember.activeLoansCount >= 3 ? 'bg-rose-500' : 'bg-amber-500'
                            : 'bg-emerald-200'
                        }`}
                        title={slot <= currentMember.activeLoansCount ? 'Occupied slot' : 'Available slot'}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Book Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Available Book <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="">-- Choose Book --</option>
                {books.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    disabled={b.availableCopies <= 0}
                  >
                    {b.title} • {b.availableCopies > 0 ? `${b.availableCopies} available` : '⛔ (Out of Stock)'}
                  </option>
                ))}
              </select>

              {currentBook && (
                <div className="mt-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Available Copies:</span>
                    <span className={`font-bold ${currentBook.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {currentBook.availableCopies} available ({currentBook.totalCopies} total stock)
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">ISBN: {currentBook.isbn}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Standard 14-day checkout"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={issuing}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 transition-colors disabled:opacity-50"
            >
              {issuing ? 'Processing Issue...' : 'Confirm Book Issue'}
            </button>
          </div>
        </form>
      </div>

      {/* Borrowing Records Table with Status Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Borrowing Records Ledger</h3>
            <p className="text-xs text-slate-400">All issued and returned book transactions</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {['ALL', 'ISSUED', 'OVERDUE', 'RETURNED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  statusFilter === filter
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filter === 'ALL' ? 'All Loans' : filter === 'ISSUED' ? 'Active Loans' : filter === 'OVERDUE' ? 'Overdue' : 'Returned'}
              </button>
            ))}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No borrowing records found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Book Title & ISBN</th>
                  <th className="py-3.5 px-4">Borrowing Member</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((record) => {
                  const isReturned = record.status === 'RETURNED';
                  const isOverdue = record.status === 'OVERDUE';

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{record.book?.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ISBN: {record.book?.isbn}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{record.member?.name}</div>
                        <div className="text-[11px] text-slate-400">{record.member?.membershipNumber}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">{record.issueDate}</td>

                      <td className="py-3.5 px-4">
                        <span className={isOverdue ? 'font-bold text-rose-600' : 'text-slate-600'}>
                          {record.dueDate}
                        </span>
                        {isOverdue && (
                          <span className="block text-[10px] text-rose-500 font-medium">Overdue</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isReturned ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Returned
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">{record.returnDate}</span>
                          </div>
                        ) : isOverdue ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Overdue
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Active Loan
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => onInitiateReturn(record)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs flex items-center gap-1.5 ml-auto transition-colors shadow-sm"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            Return Book
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
