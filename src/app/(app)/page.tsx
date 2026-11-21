import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { HomeDashboard } from "@/components/home-dashboard";
import { loadHome } from "@/lib/api/dashboard";
import { SESSION_COOKIE, usernameFromToken } from "@/lib/auth/session";

export default async function Home() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/entrar");
  }

  const home = await loadHome(token);
  if (!home) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-sm text-ink">Não foi possível carregar o início.</p>
      </div>
    );
  }

  await connection();
  return (
    <HomeDashboard
      username={usernameFromToken(token)}
      accounts={home.accounts}
      entries={home.entries}
      now={new Date().toISOString()}
    />
  );
}
