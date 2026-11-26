import React from 'react';
import { BookOpen, Layers, CheckCircle2, Clock, Users, AlertTriangle } from 'lucide-react';

export function StatCards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      title: 'Book Titles',
      value: stats.totalBooks || 0,
      subtext: 'Catalog entries',
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Total Stock Copies',
      value: stats.totalCopies || 0,
      subtext: `${stats.availableCopies || 0} currently available`,
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans || 0,
      subtext: `${stats.issuedCopies || 0} books in circulation`,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'Overdue Loans',
      value: stats.overdueLoans || 0,
      subtext: stats.overdueLoans > 0 ? 'Exceeded 14-day limit' : 'All loans in time',
      icon: AlertTriangle,
      color: stats.overdueLoans > 0 ? 'text-rose-600' : 'text-slate-400',
      bg: stats.overdueLoans > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200',
    },
    {
      title: 'Library Members',
      value: stats.totalMembers || 0,
      subtext: 'Registered patrons',
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${card.bg} transition-all duration-200 hover:shadow-md bg-white`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-medium">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
