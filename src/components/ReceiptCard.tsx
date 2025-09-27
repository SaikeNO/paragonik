import { Receipt } from "@/interfaces/interfaces";
import { Calendar, FileText, Shield, ShieldX, Tag, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import FilePreviewModal from "./FilePreviewModal";

export default function ReceiptCard({ receipt, onDelete }: { receipt: Receipt; onDelete: () => void }) {
  const [showPreview, setShowPreview] = useState(false);

  const isExpired =
    receipt.date && new Date(receipt.date) < new Date(new Date().setFullYear(new Date().getFullYear() - 2));

  async function handleDelete() {
    if (!confirm("Czy na pewno chcesz usunąć ten paragon?")) return;
    const res = await fetch(`/api/receipts/${receipt.id}`, { method: "DELETE" });
    if (res.ok) {
      onDelete();
    }
  }

  return (
    <>
      <div className="flex flex-col flex-column bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden">
        {/* Header z datą i statusem gwarancji */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Data zakupu</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(receipt.date).toLocaleDateString("pl-PL")}
                </p>
              </div>
            </div>

            {/* Status gwarancji */}
            <div className="flex items-center gap-2">
              {isExpired ? (
                <>
                  <ShieldX className="w-5 h-5 text-red-500" />
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    Bez gwarancji
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Na gwarancji
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 grow flex flex-col">
          <div className="grow">
            {/* Tagi */}
            {receipt.tags && receipt.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Tagi</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {receipt.tags.map((tag) => (
                    <span key={tag.id} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lista produktów */}
            {receipt.items && receipt.items.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Produkty ({receipt.items.length})
                </h3>
                <div className="space-y-2">
                  {receipt.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-800 font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brak produktów */}
            {(!receipt.items || receipt.items.length === 0) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Brak dodanych produktów</p>
              </div>
            )}
          </div>

          {/* Akcje */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {receipt.fileUrl ? (
              <button
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Podgląd
              </button>
            ) : (
              <div className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg">Brak pliku</div>
            )}

            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors hover:shadow-md"
            >
              <Trash2 className="w-4 h-4" />
              Usuń
            </button>
          </div>
        </div>

        {/* Dekoracyjny akcent */}
        <div
          className={`h-1 w-full ${
            isExpired ? "bg-gradient-to-r from-red-400 to-red-600" : "bg-gradient-to-r from-green-400 to-blue-500"
          }`}
        ></div>
      </div>

      {/* Modal z podglądem pliku */}
      <FilePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        fileUrl={receipt.fileUrl || ""}
        title={`Podgląd paragonu z ${new Date(receipt.date).toLocaleDateString("pl-PL")}`}
      />
    </>
  );
}
