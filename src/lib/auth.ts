import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  return session.user.id;
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  const token = randomBytes(32).toString("hex");

  // zapisz token w bazie
  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 dni
    },
  });

  // ustaw bezpieczne cookie
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookieStore.delete("session");
}
