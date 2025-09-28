"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogIn, AlertCircle, Receipt, UserPlus, Eye } from "lucide-react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ login }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        window.location.href = "/receipts";
      } else {
        const data = await res.json();
        setError(data.error || "Wystąpił błąd");
      }
    } catch {
      setError("Błąd połączenia z serwerem");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex gap-8 items-center">
        {/* Welcome Section - Hidden on mobile */}
        <div className="hidden lg:flex flex-1 flex-col justify-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-lg mb-6">
              <Receipt className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Witaj w{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Paragonik
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Zarządzaj swoimi paragonami, śledź gwarancje i organizuj zakupy w jednym miejscu.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Dodawaj i kategoryzuj paragony</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Przeglądaj pliki w aplikacji</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">Śledź terminy gwarancji</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md lg:flex-shrink-0">
          {/* Mobile Header */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Paragonik</h1>
            <p className="text-gray-600">Zaloguj się do swojego konta</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Logowanie</h2>
                  <p className="text-blue-100 text-sm">Wprowadź swoje dane</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwa użytkownika
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="login"
                      type="text"
                      placeholder="Wpisz swoją nazwę użytkownika"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !login.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logowanie...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Zaloguj się
                    </>
                  )}
                </button>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">Nie masz jeszcze konta?</p>
                  <button
                    onClick={() => router.push("/register")}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    Utwórz nowe konto
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Features */}
          <div className="mt-8 grid grid-cols-1 gap-3 lg:hidden">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100 text-center">
              <Receipt className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700 font-medium">Zarządzaj paragonami</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
