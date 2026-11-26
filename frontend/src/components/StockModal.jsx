import React, { useState } from 'react';
import { X, Layers, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';

export function StockModal({ isOpen, onClose, onSubmit, book }) {
  if (!isOpen || !book) return null;

  const [changeType, setChangeType] = useState('ADDITION');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const issuedCopies = book.issuedCopies || Math.max(0, book.totalCopies - book.availableCopies);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setError('Please enter a valid quantity greater than zero');
      return;
    }

    if (!reason.trim()) {
      setError('A reason for the stock adjustment is required for audit history');
      return;
    }

    // Client-side pre-validation
    if (changeType === 'REDUCTION') {
      if (book.availableCopies - qty < 0) {
        setError(`Cannot reduce by ${qty}. Only ${book.availableCopies} copy/copies currently available in library.`);
        return;
      }
      if (book.totalCopies - qty < issuedCopies) {
        setError(`Cannot reduce total below ${issuedCopies} currently borrowed copies.`);
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit({
        bookId: book.id,
        changeType,
        quantity: qty,
        reason: reason.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Stock adjustment failed');
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
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Adjust Book Stock</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{book.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Info */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-medium">Total Stock</span>
            <span className="font-bold text-slate-800 text-sm">{book.totalCopies}</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-medium">Available</span>
            <span className="font-bold text-emerald-600 text-sm">{book.availableCopies}</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-medium">Borrowed</span>
            <span className="font-bold text-amber-600 text-sm">{issuedCopies}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Operation Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChangeType('ADDITION')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  changeType === 'ADDITION'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Add Copies (+)
              </button>
              <button
                type="button"
                onClick={() => setChangeType('REDUCTION')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  changeType === 'REDUCTION'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MinusCircle className="w-4 h-4 text-rose-600" />
                Reduce Copies (-)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity to {changeType === 'ADDITION' ? 'Add' : 'Reduce'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Justification <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={changeType === 'ADDITION' ? 'e.g. New publisher shipment arrived' : 'e.g. Damaged copies written off'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
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
              className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50 ${
                changeType === 'ADDITION'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
              }`}
            >
              {loading ? 'Processing...' : changeType === 'ADDITION' ? 'Confirm Addition' : 'Confirm Reduction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
