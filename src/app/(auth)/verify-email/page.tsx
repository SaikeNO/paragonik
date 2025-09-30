import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, XCircle, Mail, Receipt, Eye, UserPlus, ArrowRight } from "lucide-react";

interface PageProps {
  searchParams: {
    token?: string;
  };
}

async function verifyEmail(token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return { success: false, error: "Nieprawidłowy token weryfikacyjny" };
    }

    if (user.emailVerified) {
      return { success: true, alreadyVerified: true, message: "Email został już zweryfikowany" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    return { success: true, alreadyVerified: false, message: "Email został pomyślnie zweryfikowany" };
  } catch (error) {
    console.error("Email verification error:", error);
    return { success: false, error: "Wystąpił błąd podczas weryfikacji emaila" };
  }
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const token = searchParams.token;

  if (!token) {
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

          {/* Error Card */}
          <div className="w-full max-w-md lg:flex-shrink-0">
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Paragonik</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Brak tokenu</h2>
                    <p className="text-red-100 text-sm">Nie można zweryfikować</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-gray-700 text-center">Token weryfikacyjny jest wymagany</p>
                </div>

                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Przejdź do logowania
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const result = await verifyEmail(token);

  if (result.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl flex gap-8 items-center">
          <div className="hidden lg:flex flex-1 flex-col justify-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-lg mb-6">
                <Receipt className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                Email{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  zweryfikowany
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Twoje konto zostało aktywowane. Możesz teraz w pełni korzystać z aplikacji Paragonik.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Konto aktywne</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Pełny dostęp do funkcji</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Email potwierdzony</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md lg:flex-shrink-0">
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Sukces!</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {result.alreadyVerified ? "Email już zweryfikowany" : "Email zweryfikowany!"}
                    </h2>
                    <p className="text-green-100 text-sm">Konto gotowe do użycia</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-gray-700 text-center">{result.message}</p>
                </div>

                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Zaloguj się teraz
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 lg:hidden">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100 text-center">
                <Receipt className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700 font-medium">Zacznij zarządzać paragonami</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex gap-8 items-center">
        <div className="hidden lg:flex flex-1 flex-col justify-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-lg mb-6">
              <Receipt className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Wystąpił{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">problem</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Nie udało się zweryfikować Twojego adresu email. Sprawdź link lub spróbuj ponownie.
            </p>
          </div>
        </div>

        <div className="w-full max-w-md lg:flex-shrink-0">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-lg mb-4">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Błąd weryfikacji</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Błąd weryfikacji</h2>
                  <p className="text-red-100 text-sm">Nie można potwierdzić emaila</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-gray-700 text-center">{result.error}</p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Przejdź do logowania
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/register"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Utwórz nowe konto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
