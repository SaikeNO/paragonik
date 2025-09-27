import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { login } = await req.json();
  if (!login) return NextResponse.json({ error: "Login required" }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { login } });
  if (exists) return NextResponse.json({ error: "Login taken" }, { status: 400 });

  const user = await prisma.user.create({ data: { login } });
  return NextResponse.json({ user });
}
