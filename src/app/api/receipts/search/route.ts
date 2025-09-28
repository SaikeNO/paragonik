import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const login = await getSession();
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
