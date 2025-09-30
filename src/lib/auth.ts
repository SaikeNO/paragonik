import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const SESSION_EXTENSION_THRESHOLD = 1000 * 60 * 60 * 24; // np. 1 dzień przed końcem

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  const now = new Date();
  if (session.expiresAt.getTime() - now.getTime() < SESSION_EXTENSION_THRESHOLD) {
    console.log("Extending session for user:", session.userId);
    await extendSession(session.token, session.userId, cookieStore);
  }

  return session.user.id;
}

async function extendSession(token: string, userId: string, cookieStore: ReadonlyRequestCookies) {
  const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // przedłuż o 7 dni
  await prisma.session.update({
    where: { token },
    data: { expiresAt: newExpiresAt },
  });

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dni
  });
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
