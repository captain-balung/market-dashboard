import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (verifySessionToken(token).valid) redirect("/admin");

  return (
    <main className="mx-auto w-full max-w-sm px-6 py-20">
      <h1 className="mb-6 text-xl font-semibold">admin 登入</h1>
      <LoginForm />
    </main>
  );
}
