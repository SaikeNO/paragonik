import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json();

    // Walidacja danych wejściowych
    if (!login || !password) {
      return NextResponse.json({ error: "Login i hasło są wymagane" }, { status: 400 });
    }

    // Walidacja loginu
    if (login.length < 3 || login.length > 30) {
      return NextResponse.json({ error: "Login musi mieć od 3 do 30 znaków" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(login)) {
      return NextResponse.json({ error: "Login może zawierać tylko litery, cyfry, _ i -" }, { status: 400 });
    }

    // Walidacja hasła
    if (password.length < 8) {
      return NextResponse.json({ error: "Hasło musi mieć co najmniej 8 znaków" }, { status: 400 });
    }

    if (password.length > 100) {
      return NextResponse.json({ error: "Hasło jest zbyt długie" }, { status: 400 });
    }

    // Sprawdzenie siły hasła
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json({ error: "Hasło musi zawierać wielką literę, małą literę i cyfrę" }, { status: 400 });
    }

    // Sprawdzenie czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Ta nazwa użytkownika jest już zajęta" }, { status: 409 });
    }

    // Hashowanie hasła (bcrypt automatycznie generuje salt)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Utworzenie użytkownika
    const user = await prisma.user.create({
      data: {
        login,
        password: hashedPassword,
      },
      select: {
        id: true,
        login: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Konto zostało utworzone pomyślnie",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas rejestracji" }, { status: 500 });
  }
}
