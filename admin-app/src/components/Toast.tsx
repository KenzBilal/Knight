import { useState, useEffect, useCallback } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  body?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  timestamp: number;
}

let _addToast: ((toast: Omit<Toast, 'id' | 'timestamp'>) => void) | null = null;

export function notify(title: string, body?: string, type: Toast['type'] = 'info') {
  _addToast?.({ title, body, type });
  // Also trigger native notification
  window.electronAPI?.showNotification?.(title, body || '');
}

const ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertOctagon,
};

const COLORS = {
  info: { bg: 'bg-[#0a0a0a]', border: 'border-[#222]', icon: 'text-[#666]', bar: 'bg-[#333]' },
  success: { bg: 'bg-[#0a1a0a]', border: 'border-[#1a3a1a]', icon: 'text-[#4ade80]', bar: 'bg-[#4ade80]' },
  warning: { bg: 'bg-[#1a1a0a]', border: 'border-[#3a3a1a]', icon: 'text-[#facc15]', bar: 'bg-[#facc15]' },
  error: { bg: 'bg-[#1a0a0a]', border: 'border-[#3a1a1a]', icon: 'text-[#f87171]', bar: 'bg-[#f87171]' },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 5000;
  const Icon = ICONS[toast.type];
  const colors = COLORS[toast.type];

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-lg overflow-hidden shadow-2xl pointer-events-auto w-80 animate-slide-in`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <div className="p-3 flex items-start gap-3">
        <Icon size={16} className={`${colors.icon} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#e0e0e0] leading-tight">{toast.title}</p>
          {toast.body && (
            <p className="text-[11px] text-[#666] mt-1 leading-relaxed">{toast.body}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-[#444] hover:text-[#aaa] transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 bg-[#1a1a1a]">
        <div
          className={`h-full ${colors.bar} opacity-40 transition-all duration-100`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev.slice(-4), { ...toast, id, timestamp: Date.now() }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  return (
    <div className="fixed top-12 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
