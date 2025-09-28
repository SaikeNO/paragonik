import { clearSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await clearSession();

  return new NextResponse(null, { status: 204 });
}
