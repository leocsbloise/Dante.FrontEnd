import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SESSION_COOKIE, usernameFromToken } from "@/lib/auth/session";

export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-full flex-1" />}>
      <SignedInHome />
    </Suspense>
  );
}

async function SignedInHome() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/entrar");
  }

  const username = usernameFromToken(token);

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <section className="w-full max-w-[390px] rounded-[28px] bg-white px-6 py-10">
        <h1 className="text-[22px] font-bold">
          {username ? `Olá, ${username}` : "Olá"}
        </h1>
        <p className="mt-2 text-sm text-muted">Você entrou.</p>
        <form action="/api/auth/logout" method="post" className="mt-8">
          <button
            type="submit"
            className="h-12 w-full rounded-full bg-ink text-[15px] font-semibold text-white"
          >
            Sair
          </button>
        </form>
      </section>
    </main>
  );
}
