import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token weryfikacyjny jest wymagany" }, { status: 400 });
    }

    // Szukamy użytkownika z podanym tokenem
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: "Nieprawidłowy token weryfikacyjny" }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email został już zweryfikowany" }, { status: 200 });
    }

    // Aktualizacja użytkownika: ustawienie emailVerified na true i usunięcie tokena
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    return NextResponse.json({ success: true, message: "Email został pomyślnie zweryfikowany" }, { status: 200 });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas weryfikacji emaila" }, { status: 500 });
  }
}
