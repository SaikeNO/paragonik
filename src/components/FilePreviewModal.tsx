import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, X, ZoomIn, ZoomOut, RotateCw, Download, Share2 } from "lucide-react";
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
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  function getFileType(fileUrl: string) {
    const extension = fileUrl.split(".").pop()?.toLowerCase();
    return extension === "pdf" ? "pdf" : "image";
  }

  function handleZoomIn() {
    setImageScale((prev) => Math.min(prev + 0.25, 4));
  }

  function handleZoomOut() {
    setImageScale((prev) => Math.max(prev - 0.25, 0.25));
  }

  function handleRotate() {
    setImageRotation((prev) => (prev + 90) % 360);
  }

  function resetImageControls() {
    setImageScale(1);
    setImageRotation(0);
    setImagePosition({ x: 0, y: 0 });
  }

  // Detect mobile viewport
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

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
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);

  // Handle download
  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Use title if provided, otherwise fallback to original filename or "file"
      const extension = fileUrl.split(".").pop();
      const safeTitle = title ? title.replace(/[^a-z0-9_\-\.]/gi, "_") : undefined;
      a.download = safeTitle ? `${safeTitle}.${extension}` : fileUrl.split("/").pop() || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Handle share (Web Share API)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Podgląd paragonu",
          url: window.location.origin + fileUrl,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    }
  };

  if (!isOpen) return null;

  const fileType = getFileType(fileUrl);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-6xl max-h-[100vh] sm:max-h-[95vh] w-full flex flex-col overflow-hidden sm:m-4">
        {/* Header modala */}
        <div
          className={`flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50 transition-all duration-300 ${
            !isMobile ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">{title || "Podgląd pliku"}</h3>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {fileType === "image" && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                  title="Pomniejsz"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs sm:text-sm text-gray-600 px-1 sm:px-2 hidden sm:block">
                  {Math.round(imageScale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                  title="Powiększ"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                  title="Obróć"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Mobile action buttons */}
            <div className="flex sm:hidden gap-1">
              <button
                onClick={handleDownload}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                title="Pobierz"
              >
                <Download className="w-4 h-4" />
              </button>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={handleShare}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                  title="Udostępnij"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
              title="Zamknij"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Zawartość pliku */}
        <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center relative">
          {fileType === "pdf" ? (
            <iframe src={fileUrl} className="w-full h-full min-h-[400px] sm:min-h-[600px]" title="Podgląd PDF" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ touchAction: imageScale > 1 ? "none" : "auto" }}
            >
              <Image
                ref={imageRef}
                src={fileUrl}
                alt="Podgląd paragonu"
                width={800}
                height={600}
                className="max-w-none transition-transform duration-200 select-none"
                style={{
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale}) rotate(${imageRotation}deg)`,
                  maxWidth: imageScale <= 1 ? "100%" : "none",
                  maxHeight: imageScale <= 1 ? "100%" : "none",
                }}
                draggable={false}
                priority
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-3 sm:p-4 bg-gray-50 border-t transition-all duration-300 ${
            !isMobile ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Typ: {fileType.toUpperCase()}</span>
              {fileType === "image" && <span className="sm:hidden">{Math.round(imageScale * 100)}%</span>}
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Pobierz
                </button>
              </div>
              <span className="hidden sm:inline">Naciśnij ESC aby zamknąć</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
