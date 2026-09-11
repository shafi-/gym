import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  tone?: ToastTone;
  onDismiss: () => void;
  duration?: number;
}

const toneIcons: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const toneColors: Record<ToastTone, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-rest',
};

export function Toast({ message, tone = 'info', onDismiss, duration = 3000 }: ToastProps) {
  // Restart the dismiss timer only when the message changes. Parent screens
  // (e.g. the live session) re-render many times per second; a naive
  // [duration, onDismiss] dep list would reset the timer every render and the
  // toast would never dismiss.
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, duration]);

  const Icon = toneIcons[tone];

  return (
    <div
      className={`fixed bottom-6 safe-bottom left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lift text-sm font-medium bg-ink text-base animate-slide-up`}
      role="status"
      aria-live="polite"
    >
      <Icon size={16} className={`shrink-0 ${toneColors[tone]}`} aria-hidden />
      <span>{message}</span>
    </div>
  );
}
