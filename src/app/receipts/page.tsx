"use client";

import ReceiptCard from "@/components/ReceiptCard";
import SearchBar from "@/components/SearchBar";
import { Receipt } from "@/interfaces/interfaces";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, LogOut, Receipt as ReceiptIcon, Search, Filter, Calendar } from "lucide-react";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filtered, setFiltered] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const sortedReceipts = filtered.sort(
    (a: Receipt, b: Receipt) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ReceiptIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Twoje paragony</h1>
                  <p className="text-blue-100">Zarządzaj swoimi zakupami i gwarancjami</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/receipts/new")}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform"
                >
                  <Plus className="w-5 h-5" />
                  Dodaj paragon
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Wyloguj się
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col">
            {/* Search and Filter Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Wyszukaj i filtruj</h2>
                </div>
              </div>
              <div className="p-6">
                <SearchBar receipts={receipts} onFilter={setFiltered} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex-1 flex flex-col">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Wyniki {filtered.length !== receipts.length && `(${filtered.length} z ${receipts.length})`}
                    </h2>
                  </div>
                  {filtered.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Sortowanie: od najnowszych
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 flex-1">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Ładowanie paragonów...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {receipts.length === 0 ? "Brak paragonów" : "Brak wyników"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {receipts.length === 0
                        ? "Nie masz jeszcze żadnych paragonów. Dodaj pierwszy!"
                        : "Spróbuj zmienić kryteria wyszukiwania."}
                    </p>
                    {receipts.length === 0 && (
                      <button
                        onClick={() => router.push("/receipts/new")}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Dodaj pierwszy paragon
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                    {sortedReceipts.map((receipt) => (
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
