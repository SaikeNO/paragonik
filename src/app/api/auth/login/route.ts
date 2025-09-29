import { setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Rate limiting - prosta implementacja w pamięci
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(login: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(login);

  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(login, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 minut
    return true;
  }

  if (attempt.count >= 5) {
    return false;
  }

  attempt.count++;
  return true;
}

function clearRateLimit(login: string): void {
  loginAttempts.delete(login);
}

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json();

    // Walidacja podstawowa
    if (!login || !password) {
      return NextResponse.json({ error: "Login i hasło są wymagane" }, { status: 400 });
    }

    // Rate limiting
    if (!checkRateLimit(login)) {
      return NextResponse.json(
        { error: "Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za 15 minut" },
        { status: 429 }
      );
    }

    // Pobranie użytkownika z bazy
    const user = await prisma.user.findUnique({
      where: { login },
      select: {
        id: true,
        login: true,
        password: true,
        emailVerified: true,
      },
    });

    // Stała odpowiedź dla nieistniejącego użytkownika i błędnego hasła
    // (uniemożliwia enumeration attack)
    if (!user) {
      // Wykonanie fałszywego hashowania dla stałego czasu odpowiedzi
      await bcrypt.hash("dummy_password", 12);
      return NextResponse.json({ error: "Nieprawidłowy login lub hasło" }, { status: 401 });
    }

    // Weryfikacja hasła
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Nieprawidłowy login lub hasło" }, { status: 401 });
    }

    if (user.emailVerified === false) {
      return NextResponse.json(
        { error: "Email nie został zweryfikowany. Sprawdź swoją skrzynkę pocztową." },
        { status: 403 }
      );
    }

    // Wyczyszczenie rate limitu po udanym logowaniu
    clearRateLimit(login);

    // Ustawienie sesji
    await setSession(user.id);

    return NextResponse.json({
      success: true,
      message: "Zalogowano pomyślnie",
      user: {
        id: user.id,
        login: user.login,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas logowania" }, { status: 500 });
  }
}
