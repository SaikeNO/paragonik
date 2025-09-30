import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage({ searchParams }: { searchParams: { redirect?: string } }) {
  const session = await getSession();

  if (session) {
    const redirectTo = searchParams.redirect || "/receipts";
    redirect(redirectTo);
  } else {
    redirect("/login");
  }
}
