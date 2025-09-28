import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const login = await getSession();
    if (!login) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { login } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tags = await prisma.tag?.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Błąd podczas pobierania tagów:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
