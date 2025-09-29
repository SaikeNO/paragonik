import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      receipts: {
        include: { items: true, tags: true },
      },
    },
  });

  return NextResponse.json({ receipts: user?.receipts || [] });
}
