interface MediaViewerProps {
  src: string | null;
  type: 'image' | 'video' | null;
  alt: string;
}

export function MediaViewer({ src, type, alt }: MediaViewerProps) {
  if (!src) {
    return (
      <div className="w-full h-56 bg-gray-800 rounded-xl flex items-center justify-center">
        <span className="text-7xl opacity-30">🏋️</span>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-56 object-contain rounded-xl"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-56 object-contain rounded-xl"
    />
  );
}
