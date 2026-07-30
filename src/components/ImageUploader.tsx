import React, { useState, useRef } from 'react';
import { Camera, X, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { SafeImage } from './SafeImage';

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

    // Format validation: JPG, JPEG, PNG only
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');

    if (!validMimeTypes.includes(file.type) && !hasValidExt) {
      setErrorMsg('Only JPG, JPEG, and PNG images are supported.');
      return;
    }

    // Size validation: Max 1 MB (1048576 bytes)
    if (file.size > 1 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 1 MB. Please choose a smaller image.');
      return;
    }

    setIsCompressing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // Resize to maximum 800px while maintaining aspect ratio

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
          if (!ctx) {
            setErrorMsg('Failed to process image canvas context.');
            setIsCompressing(false);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with 70–75% quality, reducing iteratively if needed to fit under 300 KB Base64 length
          let quality = 0.73;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // ~400,000 characters in Base64 string corresponds to ~300 KB binary size
          const maxBase64Length = 400 * 1024;
          while (compressedDataUrl.length > maxBase64Length && quality > 0.3) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          onImageSelected(compressedDataUrl);
          setIsCompressing(false);
        } catch (err) {
          setErrorMsg('Error compressing image for storage.');
          setIsCompressing(false);
        }
      };
      img.onerror = () => {
        setErrorMsg('Failed to load image file.');
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
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#9A8C98]/40 group bg-stone-900 shadow-md h-56">
          <SafeImage
            src={selectedImage}
            alt="Complaint evidence preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <span className="bg-emerald-600 text-white text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Compressed for Firestore (&lt;300 KB)
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
            accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
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
              {isCompressing ? 'Compressing Image for Firestore...' : 'Click to Upload or Drag & Drop'}
            </p>
            <p className="text-xs text-[#4A4E69] mt-0.5 font-medium">
              Upload a JPG, JPEG or PNG image (maximum 1 MB).
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-[#4A4E69] bg-[#F2E9E4] px-3 py-1 rounded-full">
            <ImageIcon className="w-3.5 h-3.5" />
            Auto-resized to 800px JPEG Base64
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
