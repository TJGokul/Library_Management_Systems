import React, { useState, useEffect, useMemo } from 'react';
import { X, BookPlus, Edit3, AlertCircle, CheckCircle } from 'lucide-react';

export function normalizeIsbn(raw) {
  if (!raw) return '';
  return raw.replace(/^isbn[:\s]*/i, '').trim();
}

export function BookModal({ isOpen, onClose, onSubmit, book = null, genres = [], existingBooks = [] }) {
  const isEdit = !!book;
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    genre: '',
    publishedYear: new Date().getFullYear(),
    totalCopies: 1,
  });
  const [customGenre, setCustomGenre] = useState('');
  const [isCustomGenre, setIsCustomGenre] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        isbn: book.isbn || '',
        title: book.title || '',
        author: book.author || '',
        genre: book.genre || '',
        publishedYear: book.publishedYear || new Date().getFullYear(),
        totalCopies: book.totalCopies || 1,
      });
      setIsCustomGenre(false);
      setCustomGenre('');
    } else {
      setFormData({
        isbn: '',
        title: '',
        author: '',
        genre: genres.length > 0 ? genres[0] : 'Fiction',
        publishedYear: new Date().getFullYear(),
        totalCopies: 1,
      });
      setIsCustomGenre(false);
      setCustomGenre('');
    }
    setError('');
  }, [book, isOpen, genres]);

  // Real-time unique ISBN validation
  const normalizedInputIsbn = useMemo(() => normalizeIsbn(formData.isbn), [formData.isbn]);

  const duplicateBook = useMemo(() => {
    if (!normalizedInputIsbn) return null;
    return existingBooks.find(
      (b) => normalizeIsbn(b.isbn).toLowerCase() === normalizedInputIsbn.toLowerCase() && b.id !== book?.id
    );
  }, [normalizedInputIsbn, existingBooks, book]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalGenre = isCustomGenre ? customGenre.trim() : formData.genre.trim();
    if (!finalGenre) {
      setError('Please provide or select a genre');
      return;
    }

    const cleanIsbn = normalizeIsbn(formData.isbn);
    if (!cleanIsbn) {
      setError('A valid ISBN is required');
      return;
    }

    if (duplicateBook) {
      setError(`Cannot add: ISBN '${cleanIsbn}' already exists for '${duplicateBook.title}'.`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        isbn: cleanIsbn,
        genre: finalGenre,
        publishedYear: parseInt(formData.publishedYear) || null,
        totalCopies: parseInt(formData.totalCopies) || 1,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              {isEdit ? <Edit3 className="w-5 h-5" /> : <BookPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEdit ? 'Edit Book Details' : 'Add New Book to Catalog'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update metadata (Title, Author, Genre, Year)' : 'Register a new title into library inventory'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ISBN Field with Live Uniqueness Check */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                ISBN (Unique Identifier) <span className="text-rose-500">*</span>
              </label>
              {normalizedInputIsbn && (
                duplicateBook ? (
                  <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Already in catalog
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> ISBN available
                  </span>
                )
              )}
            </div>

            <input
              type="text"
              required
              placeholder="e.g. 978-0132350884"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none font-mono transition-colors ${
                duplicateBook
                  ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500/20'
                  : normalizedInputIsbn
                  ? 'border-emerald-400 bg-emerald-50/20 text-slate-900 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />

            {duplicateBook && (
              <div className="mt-1.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Duplicate ISBN Detected:</span> This ISBN is already assigned to{' '}
                  <strong>"{duplicateBook.title}"</strong> ({duplicateBook.author}). Every book must have a unique ISBN.
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Book Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Clean Code"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Author(s) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Robert C. Martin"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Genre / Category <span className="text-rose-500">*</span>
              </label>
              {!isCustomGenre ? (
                <div className="flex gap-2">
                  <select
                    value={formData.genre}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsCustomGenre(true);
                      } else {
                        setFormData({ ...formData, genre: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="__NEW__">+ Custom Genre...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter genre"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomGenre(false)}
                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Published Year
              </label>
              <input
                type="number"
                min="1000"
                max={new Date().getFullYear() + 1}
                value={formData.publishedYear}
                onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Stock Copies <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Creates an initial inventory transaction audit record automatically.
              </p>
            </div>
          )}

          {isEdit && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800">
              💡 <strong>Stock Adjustment Note:</strong> To add or reduce physical copies for this title, please use the <strong>Adjust Stock</strong> action button so an audited inventory transaction is recorded.
            </div>
          )}

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
              disabled={loading || !!duplicateBook}
              className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                duplicateBook
                  ? 'bg-rose-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
