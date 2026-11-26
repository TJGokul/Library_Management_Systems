import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  BookOpen,
  History,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export function MembersView({
  members,
  onRegisterMember,
  onEditMember,
  onDeleteMember,
  onViewHistory,
}) {
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.membershipNumber?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Member Directory & Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register patrons, monitor active borrowing quotas (max 3 books), and inspect loan history.
          </p>
        </div>
        <button
          onClick={onRegisterMember}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-100 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Register Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-7.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search members by Name, Membership ID, Email, or Phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {/* Members Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No registered members match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Member Info</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Active Borrowing Quota</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMembers.map((member) => {
                  const isMax = member.activeLoansCount >= 3;
                  const isDeleting = deleteConfirmId === member.id;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{member.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {member.membershipNumber}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700">{member.email}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{member.phone}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {member.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            SUSPENDED
                          </span>
                        )}
                      </td>

                      {/* Active Borrowing Quota (Max 3) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isMax
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : member.activeLoansCount > 0
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {member.activeLoansCount} / 3 Books Borrowed
                          </span>

                          <div className="flex gap-1 mt-1.5">
                            {[1, 2, 3].map((slot) => (
                              <div
                                key={slot}
                                className={`w-2.5 h-2.5 rounded-full ${
                                  slot <= member.activeLoansCount
                                    ? isMax ? 'bg-rose-500' : 'bg-amber-500'
                                    : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isDeleting ? (
                          <div className="inline-flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-fade-in">
                            <span className="text-[11px] text-rose-700 font-medium pl-1">Confirm?</span>
                            <button
                              onClick={() => {
                                onDeleteMember(member.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            {/* View Loan History */}
                            <button
                              onClick={() => onViewHistory(member)}
                              title="View Loan History"
                              className="p-1.5 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            {/* Edit Member */}
                            <button
                              onClick={() => onEditMember(member)}
                              title="Edit Member Profile"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete Member */}
                            <button
                              onClick={() => setDeleteConfirmId(member.id)}
                              title="Delete Member"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
