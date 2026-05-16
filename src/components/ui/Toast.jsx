import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const Toast = ({ visible, title, message, variant = 'success', onDismiss }) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [visible, title, message, onDismiss]);

  if (!visible) return null;

  const isSuccess = variant === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3.5 shadow-xl shadow-black/40 min-w-[300px] max-w-sm animate-fade-in">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
            isSuccess
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-amber-500/10 border border-amber-500/20'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={11} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={11} className="text-amber-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-100">{title}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-neutral-600 hover:text-neutral-300 transition-colors shrink-0 mt-0.5"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
