import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { login } = await req.json();
  if (!login) return NextResponse.json({ error: "Login required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { login } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  (await cookies()).set("login", login);
  return NextResponse.json({ success: true });
}
