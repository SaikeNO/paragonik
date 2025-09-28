import { setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { login } = await req.json();
  if (!login) return NextResponse.json({ error: "Login required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { login } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await setSession(login);
  return NextResponse.json({ success: true });
}
