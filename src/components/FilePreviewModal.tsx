import { useState, useEffect, useCallback } from "react";
import { Eye, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import Image from "next/image";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title?: string;
}

export default function FilePreviewModal({ isOpen, onClose, fileUrl, title }: FilePreviewModalProps) {
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  function getFileType(fileUrl: string) {
    const extension = fileUrl.split(".").pop()?.toLowerCase();
    return extension === "pdf" ? "pdf" : "image";
  }

  function handleZoomIn() {
    setImageScale((prev) => Math.min(prev + 0.25, 3));
  }

  function handleZoomOut() {
    setImageScale((prev) => Math.max(prev - 0.25, 0.5));
  }

  function handleRotate() {
    setImageRotation((prev) => (prev + 90) % 360);
  }

  function resetImageControls() {
    setImageScale(1);
    setImageRotation(0);
  }

  const handleClose = useCallback(() => {
    onClose();
    resetImageControls();
  }, [onClose]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[95vh] w-full flex flex-col overflow-hidden">
        {/* Header modala */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">{title || "Podgląd pliku"}</h3>
          </div>

          <div className="flex items-center gap-2">
            {getFileType(fileUrl) === "image" && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Pomniejsz"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 px-2">{Math.round(imageScale * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Powiększ"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Obróć"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Zawartość pliku */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
          {getFileType(fileUrl) === "pdf" ? (
            <iframe src={fileUrl} className="w-full h-full min-h-[600px]" title="Podgląd PDF" />
          ) : (
            <Image
              src={fileUrl}
              alt="Podgląd paragonu"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
              }}
            />
          )}
        </div>

        {/* Footer z informacjami */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Typ pliku: {getFileType(fileUrl).toUpperCase()}</span>
            <span>Naciśnij ESC aby zamknąć</span>
          </div>
        </div>
      </div>
    </div>
  );
}
