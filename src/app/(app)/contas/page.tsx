import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountsScreen } from "@/components/accounts-screen";
import { loadAccountsHome } from "@/lib/api/accounts";
import { SESSION_COOKIE, usernameFromToken } from "@/lib/auth/session";

export default async function AccountsPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/entrar");
  }

  const home = await loadAccountsHome(token);
  if (!home) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-sm text-ink">Não foi possível carregar as contas.</p>
      </div>
    );
  }

  return (
    <AccountsScreen username={usernameFromToken(token)} accounts={home.accounts} banks={home.banks} />
  );
}
