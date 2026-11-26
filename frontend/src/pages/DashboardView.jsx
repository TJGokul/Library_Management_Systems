import React from 'react';
import { StatCards } from '../components/StatCards';
import { BookOpen, Users, ArrowLeftRight, History, AlertCircle, ArrowUpRight } from 'lucide-react';

export function DashboardView({ stats, books, recentLoans, onNavigate, onQuickIssue, onAdjustStock }) {
  const outOfStockBooks = books.filter((b) => b.availableCopies === 0);
  const lowStockBooks = books.filter((b) => b.availableCopies > 0 && b.availableCopies <= 2);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-3">
            Real-time Circulation Desk
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Library Operations Dashboard
          </h2>
          <p className="text-indigo-200 text-sm mt-1 max-w-xl">
            Monitor inventory quantities, enforce 3-book limits, issue 14-day borrowing periods, and audit stock history.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('issues')}
            className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-semibold text-xs shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
            Issue / Return Desk
          </button>
          <button
            onClick={() => onNavigate('books')}
            className="px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-500/40 transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Manage Books
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <StatCards stats={stats} />

      {/* Main Grid: Out of Stock Warnings & Recent Borrowings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Out of Stock & Low Stock Warnings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Stock Attention List</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {outOfStockBooks.length + lowStockBooks.length} items
            </span>
          </div>

          {outOfStockBooks.length === 0 && lowStockBooks.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              All books currently have healthy inventory levels.
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {outOfStockBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{book.title}</p>
                    <p className="text-rose-600 font-medium text-[11px]">
                      0 available of {book.totalCopies} total (Out of Stock)
                    </p>
                  </div>
                  <button
                    onClick={() => onAdjustStock(book)}
                    className="shrink-0 px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-700 rounded-lg text-xs font-semibold"
                  >
                    + Restock
                  </button>
                </div>
              ))}

              {lowStockBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{book.title}</p>
                    <p className="text-amber-700 font-medium text-[11px]">
                      Only {book.availableCopies} copy remaining ({book.totalCopies} total)
                    </p>
                  </div>
                  <button
                    onClick={() => onAdjustStock(book)}
                    className="shrink-0 px-2.5 py-1 bg-white border border-amber-200 hover:bg-amber-100/50 text-amber-700 rounded-lg text-xs font-semibold"
                  >
                    Adjust
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active & Recent Loans */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Active & Recent Loans</h3>
              <p className="text-xs text-slate-400">14-day default loan period tracking</p>
            </div>
            <button
              onClick={() => onNavigate('issues')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              View All Desk Loans <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentLoans.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No active loans recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-3">Book Title</th>
                    <th className="pb-3">Borrower</th>
                    <th className="pb-3">Issue Date</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentLoans.slice(0, 5).map((loan) => {
                    const isReturned = loan.status === 'RETURNED';
                    const isOverdue = loan.status === 'OVERDUE';
                    return (
                      <tr key={loan.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-slate-900 max-w-[200px] truncate">
                          {loan.book?.title}
                        </td>
                        <td className="py-3 text-slate-600">
                          {loan.member?.name}
                        </td>
                        <td className="py-3 text-slate-500">{loan.issueDate}</td>
                        <td className="py-3">
                          <span className={isOverdue ? 'font-bold text-rose-600' : 'text-slate-600'}>
                            {loan.dueDate}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {isReturned ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Returned
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Overdue
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              Active
                            </span>
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
    </div>
  );
}
