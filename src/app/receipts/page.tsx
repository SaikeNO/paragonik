"use client";

import ReceiptCard from "@/components/ReceiptCard";
import SearchBar from "@/components/SearchBar";
import { Receipt } from "@/interfaces/interfaces";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Receipt as Search, Filter, Menu, X } from "lucide-react";
import Header from "@/components/Header";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filtered, setFiltered] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/receipts/search");
      const data = await res.json();
      setReceipts(data.receipts);
      setFiltered(data.receipts);
    } catch (error) {
      console.error("Błąd podczas pobierania paragonów:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Header />

        {/* Mobile Filter Toggle Button */}
        <div className="block lg:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-700 font-medium"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-600" />
              <span>Wyszukaj i filtruj</span>
            </div>
            {isFilterOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Search and Filter Section - responsive */}
          <div
            className={`
            lg:col-span-1 flex flex-col
            ${isFilterOpen ? "block" : "hidden lg:flex"}
          `}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mb-4 sm:mb-8 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">Wyszukaj i filtruj</h2>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <SearchBar receipts={receipts} onFilter={setFiltered} />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex-1 flex flex-col">
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                      Wyniki &nbsp;
                      {filtered.length !== receipts.length && (
                        <span className="text-sm sm:text-base">
                          ({filtered.length} z {receipts.length})
                        </span>
                      )}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 flex-1">
                {isLoading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium text-sm sm:text-base">Ładowanie paragonów...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                      {receipts.length === 0 ? "Brak paragonów" : "Brak wyników"}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                      {receipts.length === 0
                        ? "Nie masz jeszcze żadnych paragonów. Dodaj pierwszy!"
                        : "Spróbuj zmienić kryteria wyszukiwania."}
                    </p>
                    {receipts.length === 0 && (
                      <button
                        onClick={() => router.push("/receipts/new")}
                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Dodaj pierwszy paragon
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
                    {filtered.map((receipt) => (
                      <ReceiptCard key={receipt.id} receipt={receipt} onDelete={fetchReceipts} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
