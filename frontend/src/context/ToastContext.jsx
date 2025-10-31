import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, variant = 'info') => {
    setToast({ id: Date.now(), message, variant });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && createPortal(<Toast {...toast} />, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function Toast({ message, variant }) {
  return (
    <div className="fixed inset-x-0 top-4 flex justify-center z-50 px-4">
      <div
        className={clsx(
          'max-w-sm w-full rounded-2xl px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/80 dark:bg-slate-800/80 border',
          {
            'border-emerald-300 text-emerald-900 dark:text-emerald-100': variant === 'success',
            'border-rose-300 text-rose-900 dark:text-rose-100': variant === 'error',
            'border-slate-300 text-slate-900 dark:text-slate-100': variant === 'info'
          }
        )}
      >
        {message}
      </div>
    </div>
  );
}
