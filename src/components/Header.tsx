"use client";

import { useRouter } from "next/navigation";
import { Plus, LogOut, Receipt as ReceiptIcon } from "lucide-react";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mb-4 sm:mb-8 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
              <ReceiptIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white">Twoje paragony</h1>
              <p className="text-sm sm:text-base text-blue-100 hidden sm:block">
                Zarządzaj swoimi zakupami i gwarancjami
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => router.push("/receipts/new")}
              className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 font-semibold rounded-lg sm:rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base flex-1 sm:flex-none justify-center"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Dodaj paragon</span>
              <span className="sm:hidden">Dodaj</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white/20 text-white rounded-lg sm:rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Wyloguj się</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
