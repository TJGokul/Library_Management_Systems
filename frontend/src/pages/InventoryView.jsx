import React, { useState } from 'react';
import {
  History,
  Layers,
  PlusCircle,
  MinusCircle,
  ArrowRightCircle,
  ArrowDownLeft,
  Search,
  Filter,
} from 'lucide-react';

export function InventoryView({ transactions, books, onAdjustStockClick }) {
  const [selectedBookFilter, setSelectedBookFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedBookFilter !== 'ALL' && tx.book?.id !== Number(selectedBookFilter)) {
      return false;
    }
    if (selectedTypeFilter !== 'ALL' && tx.changeType !== selectedTypeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Audit & History Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full transaction history tracking all additions, reductions, issues, and returns with quantity deltas.
          </p>
        </div>
        <button
          onClick={onAdjustStockClick}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-100 transition-all flex items-center gap-2"
        >
          <Layers className="w-4 h-4" />
          Adjust Book Stock
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        {/* Book Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-slate-500 font-semibold mb-1">Filter by Book:</label>
          <select
            value={selectedBookFilter}
            onChange={(e) => setSelectedBookFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="ALL">All Books & Titles</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} (ISBN: {b.isbn})
              </option>
            ))}
          </select>
        </div>

        {/* Change Type Filter */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-slate-500 font-semibold mb-1">Filter by Transaction Type:</label>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="INITIAL">INITIAL (Initial Catalog Intake)</option>
            <option value="ADDITION">ADDITION (+ Restock / Purchase)</option>
            <option value="REDUCTION">REDUCTION (- Damaged / Lost)</option>
            <option value="ISSUE">ISSUE (Circulation Checkout)</option>
            <option value="RETURN">RETURN (Circulation Check-in)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No inventory transactions match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Book Title & ISBN</th>
                  <th className="py-3.5 px-4 text-center">Type</th>
                  <th className="py-3.5 px-4 text-center">Quantity Delta</th>
                  <th className="py-3.5 px-4 text-center">Available Stock (Before $\rightarrow$ After)</th>
                  <th className="py-3.5 px-4 text-center">Total Stock (Before $\rightarrow$ After)</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransactions.map((tx) => {
                  const isAddition = tx.changeType === 'ADDITION' || tx.changeType === 'INITIAL' || tx.changeType === 'RETURN';
                  const isIssue = tx.changeType === 'ISSUE';
                  const isReduction = tx.changeType === 'REDUCTION';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                      </td>

                      {/* Book */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{tx.book?.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">ISBN: {tx.book?.isbn}</div>
                      </td>

                      {/* Change Type Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            tx.changeType === 'INITIAL'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : tx.changeType === 'ADDITION'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : tx.changeType === 'REDUCTION'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : tx.changeType === 'ISSUE'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}
                        >
                          {tx.changeType}
                        </span>
                      </td>

                      {/* Delta */}
                      <td className="py-3.5 px-4 text-center font-bold font-mono">
                        <span className={tx.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                        </span>
                      </td>

                      {/* Available Before -> After */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                        {tx.previousAvailable} $\rightarrow$ <strong className="text-slate-900">{tx.newAvailable}</strong>
                      </td>

                      {/* Total Before -> After */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                        {tx.previousTotal} $\rightarrow$ <strong className="text-slate-900">{tx.newTotal}</strong>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-slate-600 italic max-w-xs">
                        {tx.reason}
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
