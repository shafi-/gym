import { useEffect } from 'react';

type ToastTone = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  tone?: ToastTone;
  onDismiss: () => void;
  duration?: number;
}

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

  const tones: Record<ToastTone, string> = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-gray-800',
  };

  return (
    <div
      className={`fixed bottom-6 safe-bottom left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${tones[tone]}`}
      role="status"
    >
      {message}
    </div>
  );
}