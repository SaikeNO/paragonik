import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const login = cookieStore.get("login")?.value;
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { login },
    include: {
      receipts: {
        include: { items: true, tags: true },
      },
    },
  });

  return NextResponse.json({ receipts: user?.receipts || [] });
}
