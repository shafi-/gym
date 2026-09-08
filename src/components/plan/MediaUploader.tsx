import { useRef } from 'react';

interface MediaUploaderProps {
  onFileSelect: (file: File) => void;
  currentPreview?: string | null;
  onReplay?: () => void;
}

export function MediaUploader({ onFileSelect, currentPreview, onReplay }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
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
          <img
            src={currentPreview}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 rounded-lg">
            <button
              type="button"
              onClick={onReplay}
              className="px-3 py-1.5 bg-white/90 rounded-lg text-sm font-medium"
            >
              ▶ Replay
            </button>
            <button
              type="button"
              onClick={handleClick}
              className="px-3 py-1.5 bg-white/90 rounded-lg text-sm font-medium"
            >
              Replace
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
        >
          <span className="text-2xl">📷</span>
          <span className="text-sm">Tap to upload photo or video</span>
        </button>
      )}
    </div>
  );
}
