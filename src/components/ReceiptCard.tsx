import { Receipt } from "@/interfaces/interfaces";
import { Calendar, FileText, Tag, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import FilePreviewModal from "./FilePreviewModal";
import WarrantyStatus from "./WarrantyStatus";
import api from "@/lib/axios";

export default function ReceiptCard({ receipt, onDelete }: { receipt: Receipt; onDelete: () => void }) {
  const [showPreview, setShowPreview] = useState(false);

  const isExpired = !!(
    receipt.date && new Date(receipt.date) < new Date(new Date().setFullYear(new Date().getFullYear() - 2))
  );

  async function handleDelete() {
    if (!confirm("Czy na pewno chcesz usunąć ten paragon?")) return;
    const res = await api.delete(`/receipts/${receipt.id}`);
    if (res.status === 200) {
      onDelete();
    }
  }

  return (
    <>
      <div className="flex flex-col bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Data zakupu</p>
                <p className="text-base sm:text-lg font-semibold text-gray-800">
                  {new Date(receipt.date).toLocaleDateString("pl-PL")}
                </p>
              </div>
            </div>

            <WarrantyStatus isExpired={isExpired} />
          </div>
        </div>

        <div className="p-4 sm:p-6 grow flex flex-col">
          <div className="grow">
            {receipt.tags && receipt.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Tagi ({receipt.tags.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {receipt.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {receipt.items && receipt.items.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Produkty ({receipt.items.length})
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {receipt.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span className="text-sm sm:text-base text-gray-800 font-medium truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!receipt.items || receipt.items.length === 0) && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-1 sm:mb-2" />
                <p className="text-gray-500 text-xs sm:text-sm">Brak dodanych produktów</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
            {receipt.fileUrl ? (
              <button
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
              >
                <Eye className="w-4 h-4" />
                <span>Podgląd pliku</span>
              </button>
            ) : (
              <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-100 text-gray-500 text-sm rounded-lg">
                <FileText className="w-4 h-4" />
                <span>Brak pliku</span>
              </div>
            )}

            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors hover:shadow-md touch-manipulation"
            >
              <Trash2 className="w-4 h-4" />
              <span>Usuń paragon</span>
            </button>
          </div>
        </div>

        <div
          className={`h-1 w-full ${
            isExpired ? "bg-gradient-to-r from-red-400 to-red-600" : "bg-gradient-to-r from-green-400 to-blue-500"
          }`}
        ></div>
      </div>

      <FilePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        fileUrl={receipt.fileUrl || ""}
        title={`Podgląd paragonu z ${new Date(receipt.date).toLocaleDateString("pl-PL")}`}
      />
    </>
  );
}
