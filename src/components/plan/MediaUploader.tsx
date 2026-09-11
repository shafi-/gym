import { useRef } from 'react';
import { ImagePlus, Play, RefreshCw } from 'lucide-react';

interface MediaUploaderProps {
  onFileSelect: (file: File) => void;
  currentPreview?: string | null;
  currentMediaType?: 'image' | 'video' | null;
  onReplay?: () => void;
}

export function MediaUploader({
  onFileSelect,
  currentPreview,
  currentMediaType,
  onReplay,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Allow re-selecting the same file after a Replace.
    e.target.value = '';
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentPreview ? (
        <div className="relative">
          {currentMediaType === 'video' ? (
            <video
              src={currentPreview}
              className="w-full h-32 object-cover rounded-xl bg-night"
              muted
              playsInline
            />
          ) : (
            <img
              src={currentPreview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-xl"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 rounded-xl">
            {currentMediaType === 'video' && onReplay && (
              <button
                type="button"
                aria-label="Replay preview"
                onClick={onReplay}
                className="inline-flex items-center gap-1.5 min-h-10 px-3 bg-surface rounded-lg text-sm font-medium text-ink"
              >
                <Play size={14} aria-hidden />
                Replay
              </button>
            )}
            <button
              type="button"
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 min-h-10 px-3 bg-surface rounded-lg text-sm font-medium text-ink"
            >
              <RefreshCw size={14} aria-hidden />
              Replace
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="w-full h-32 border-2 border-dashed border-line rounded-xl flex flex-col items-center justify-center gap-2 text-ink-3 hover:border-brand hover:text-brand transition-colors"
        >
          <ImagePlus size={24} aria-hidden />
          <span className="text-sm">Tap to upload photo or video</span>
        </button>
      )}
    </div>
  );
}
