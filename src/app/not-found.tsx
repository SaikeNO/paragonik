import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NotFound() {
  const token = await getSession();

  if (token) {
    redirect("/receipts");
  } else {
    redirect("/login");
  }
}
