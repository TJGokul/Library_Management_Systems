import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  BookOpen,
  Edit2,
  Trash2,
  Layers,
  ArrowRightCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export function BooksView({
  books,
  genres,
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  availableOnly,
  setAvailableOnly,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onAddBook,
  onEditBook,
  onDeleteBook,
  onAdjustStock,
  onQuickIssue,
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Book Catalog & Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain book catalog, search titles, manage inventory limits, and view borrowing status.
          </p>
        </div>
        <button
          onClick={onAddBook}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Book
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Title, Author, ISBN, or Genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Genre Dropdown */}
          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
            >
              <option value="ALL">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
            >
              <option value="title">Sort: Title</option>
              <option value="author">Sort: Author</option>
              <option value="publishedYear">Sort: Published Year</option>
              <option value="availableCopies">Sort: Available Stock</option>
              <option value="totalCopies">Sort: Total Copies</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sorting ${sortOrder.toUpperCase()}`}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips & Availability Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setSelectedGenre('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedGenre === 'ALL'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedGenre === g
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span>In-Stock Only</span>
          </label>
        </div>
      </div>

      {/* Book Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {books.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No books found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or genre filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-700" onClick={() => toggleSort('title')}>
                    <div className="flex items-center gap-1">
                      <span>Book Information</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-700" onClick={() => toggleSort('author')}>
                    <div className="flex items-center gap-1">
                      <span>Author</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Genre / Year</th>
                  <th className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-700" onClick={() => toggleSort('availableCopies')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Stock Status</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {books.map((book) => {
                  const isOutOfStock = book.availableCopies === 0;
                  const isDeleting = deleteConfirmId === book.id;

                  return (
                    <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Title & ISBN */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{book.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ISBN: {book.isbn}
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {book.author}
                      </td>

                      {/* Genre & Year */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {book.genre}
                        </span>
                        {book.publishedYear && (
                          <span className="text-[11px] text-slate-400 block mt-1">
                            Year: {book.publishedYear}
                          </span>
                        )}
                      </td>

                      {/* Stock Status Badges */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isOutOfStock
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : book.availableCopies <= 2
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {book.availableCopies} / {book.totalCopies} Available
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {book.issuedCopies} copy/copies on loan
                          </span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        {isDeleting ? (
                          <div className="inline-flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-fade-in">
                            <span className="text-[11px] text-rose-700 font-medium pl-1">Confirm?</span>
                            <button
                              onClick={() => {
                                onDeleteBook(book.id);
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
                            {/* Quick Issue */}
                            <button
                              onClick={() => onQuickIssue(book)}
                              disabled={isOutOfStock}
                              title={isOutOfStock ? 'Cannot issue: Out of stock' : 'Quick Issue to Member'}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isOutOfStock
                                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                                  : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-sm'
                              }`}
                            >
                              <ArrowRightCircle className="w-4 h-4" />
                            </button>

                            {/* Adjust Stock */}
                            <button
                              onClick={() => onAdjustStock(book)}
                              title="Adjust Stock (+/- copies)"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Layers className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => onEditBook(book)}
                              title="Edit Details"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteConfirmId(book.id)}
                              title="Delete Book"
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
