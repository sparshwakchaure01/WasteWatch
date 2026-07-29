import React, { useState, useRef } from 'react';
import { Upload, Camera, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (dataUrl: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedImage,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);

    // Format check
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Invalid format! Please upload JPG, PNG, or WEBP images.');
      return;
    }

    // Size check (max 10MB input limit)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File too large! Maximum image size is 10MB.');
      return;
    }

    setIsCompressing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress and scale down image for storage efficiency
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200; // max dimension 1200px

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onImageSelected(compressedDataUrl);
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        setErrorMsg('Failed to process image file.');
        setIsCompressing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-xs font-semibold text-[#22223B] uppercase tracking-wider">
        Complaint Photo Evidence *
      </label>

      {selectedImage ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#9A8C98]/40 group bg-stone-900 shadow-md">
          <img
            src={selectedImage}
            alt="Complaint evidence preview"
            className="w-full h-56 object-cover"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified & Compressed
            </span>
            <button
              type="button"
              onClick={onClear}
              className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-[#22223B] bg-[#9A8C98]/10'
              : 'border-[#9A8C98]/40 hover:border-[#4A4E69] bg-white/60 hover:bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-12 h-12 rounded-full bg-[#F2E9E4] flex items-center justify-center text-[#22223B] shadow-inner">
            {isCompressing ? (
              <div className="w-5 h-5 border-2 border-[#22223B] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-[#4A4E69]" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-[#22223B]">
              {isCompressing ? 'Processing Image...' : 'Click to Upload or Drag & Drop'}
            </p>
            <p className="text-xs text-[#4A4E69] mt-0.5">
              Supports JPG, PNG, WEBP (Auto-compressed for fast upload)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#4A4E69] bg-[#F2E9E4] px-3 py-1 rounded-full">
            <ImageIcon className="w-3.5 h-3.5" />
            Clear photo of dumping area required
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
          ⚠️ {errorMsg}
        </p>
      )}
    </div>
  );
};
