import { Dumbbell } from 'lucide-react';

interface MediaViewerProps {
  src: string | null;
  type: 'image' | 'video' | null;
  alt: string;
}

export function MediaViewer({ src, type, alt }: MediaViewerProps) {
  if (!src) {
    return (
      <div className="w-full aspect-video max-h-[50vh] bg-night-surface rounded-2xl flex items-center justify-center">
        <Dumbbell size={56} className="text-night-ink-2 opacity-30" aria-hidden />
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="w-full aspect-video max-h-[50vh] bg-night-surface rounded-2xl overflow-hidden flex items-center justify-center">
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-video max-h-[50vh] bg-night-surface rounded-2xl overflow-hidden flex items-center justify-center">
      <img src={src} alt={alt} className="max-w-full max-h-full object-contain" />
    </div>
  );
}
