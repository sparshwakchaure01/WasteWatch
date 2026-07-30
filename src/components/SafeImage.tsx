import React, { useState, useEffect } from 'react';
import { Camera, ImageOff } from 'lucide-react';

interface SafeImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  placeholderText?: string;
}

// Global session memory cache for base64 / URL strings to prevent re-decoding lag or flicker
const imageSessionCache = new Set<string>();

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Complaint Image Evidence',
  className = 'w-full h-full object-cover',
  placeholderText = 'No image evidence',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(() => (src ? imageSessionCache.has(src) : false));

  useEffect(() => {
    setHasError(false);
    if (src) {
      if (imageSessionCache.has(src)) {
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
    }
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={`bg-stone-200 border border-stone-300 flex flex-col items-center justify-center p-4 text-stone-500 text-center ${className}`}>
        <ImageOff className="w-8 h-8 mb-1.5 text-stone-400" />
        <span className="text-[11px] font-semibold text-stone-600 truncate max-w-full">
          {placeholderText}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-stone-900 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
          <Camera className="w-6 h-6 text-stone-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => {
          if (src) imageSessionCache.add(src);
          setIsLoaded(true);
        }}
        onError={() => {
          setHasError(true);
          setIsLoaded(false);
        }}
      />
    </div>
  );
};
