import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 max-w-md p-4 rounded-xl shadow-2xl transition-all duration-300 animate-slide-up border bg-white text-slate-800">
      {isError && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
      {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
      {!isError && !isSuccess && <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />}

      <div className="flex-1 pr-2">
        <p className={`font-semibold text-sm ${isError ? 'text-rose-700' : isSuccess ? 'text-emerald-700' : 'text-indigo-700'}`}>
          {isError ? 'Action Failed' : isSuccess ? 'Success' : 'Notice'}
        </p>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
