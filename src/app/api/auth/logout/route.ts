import { NextResponse } from "next/server";

export async function POST() {
  // Usuwa ciasteczko 'login'
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": "login=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
      },
    }
  );
}
