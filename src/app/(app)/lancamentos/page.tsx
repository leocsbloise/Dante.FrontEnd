import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { LedgerScreen } from "@/components/ledger-screen";
import { loadLedger } from "@/lib/api/ledger";
import { SESSION_COOKIE, usernameFromToken } from "@/lib/auth/session";
import { filtersFromSearch } from "@/lib/ledger/screen";

type Search = {
  debit?: string | string[];
  credit?: string | string[];
  from?: string | string[];
  to?: string | string[];
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LedgerPage({ searchParams }: { searchParams: Promise<Search> }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/entrar");
  }

  const search = await searchParams;
  await connection();
  const filters = filtersFromSearch(
    {
      debit: one(search.debit),
      credit: one(search.credit),
      from: one(search.from),
      to: one(search.to),
    },
    new Date(),
  );
  const ledger = await loadLedger(token, filters);
  if (!ledger.ok && !ledger.accounts) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-sm text-ink">{ledger.message}</p>
      </div>
    );
  }

  return (
    <LedgerScreen
      username={usernameFromToken(token)}
      accounts={ledger.accounts ?? []}
      entries={ledger.ok ? ledger.entries : []}
      filters={filters}
      notice={ledger.ok ? null : ledger.message}
    />
  );
}
