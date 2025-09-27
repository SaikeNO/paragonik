import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const login = cookieStore.get("login")?.value;
  return login || null;
}

export async function setSession(login: string) {
  const cookieStore = await cookies();
  cookieStore.set("login", login);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("login");
}
