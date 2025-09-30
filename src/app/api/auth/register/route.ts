import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { login, password, email } = await req.json();

    // Walidacja danych wejściowych
    if (!login || !password || !email) {
      return NextResponse.json({ error: "Login, hasło i email są wymagane" }, { status: 400 });
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

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json({ error: "Ten adres e-mail jest już zajęty" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generowanie tokena weryfikacyjnego
    const verificationToken = randomBytes(32).toString("hex");

    // Utworzenie użytkownika z tokenem weryfikacyjnym
    const user = await prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        email,
        emailVerified: false,
        verificationToken,
      },
      select: {
        id: true,
        login: true,
        email: true,
        createdAt: true,
      },
    });

    // Konfiguracja NodeMailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;

    // Wysyłka maila weryfikacyjnego
    await transporter.sendMail({
      from: '"Paragonik"',
      to: user.email,
      subject: "[Paragonik] Potwierdź swój adres e-mail",
      html: `<p>Witaj ${user.login},</p>
             <p>Kliknij poniższy link, aby zweryfikować swoje konto:</p>
             <a href="${verificationUrl}">${verificationUrl}</a>`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Konto zostało utworzone. Sprawdź maila, aby je zweryfikować.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas rejestracji" }, { status: 500 });
  }
}
