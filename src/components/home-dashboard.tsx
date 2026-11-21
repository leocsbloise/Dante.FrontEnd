"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  balances,
  chartBuckets,
  formatBalance,
  formatPeriod,
  formatSigned,
  movements,
  periodCopy,
  periodNet,
  type DashboardAccount,
  type DashboardEntry,
  type Period,
} from "@/lib/dashboard/home";

const periods: Period[] = ["day", "week", "month"];
const periodName: Record<Period, string> = {
  day: "Dia",
  week: "Semana",
  month: "Mês",
  year: "Ano",
};

export function HomeDashboard({
  username,
  accounts,
  entries,
  now,
}: {
  username: string | null;
  accounts: DashboardAccount[];
  entries: DashboardEntry[];
  now: string;
}) {
  const [period, setPeriod] = useState<Period>("month");
  const clock = new Date(now);
  const focus = accounts[0] ?? null;
  const totals = balances(accounts, entries);
  const net = focus ? periodNet(entries, focus.id, period, clock) : 0;
  const bars = focus ? chartBuckets(entries, focus.id, period, clock) : [];
  const peak = Math.max(...bars.map((value) => Math.abs(value)), 1);
  const rows = focus ? movements(accounts, entries, focus.id, period, clock) : [];
  const greeting = username ? `Olá, ${username}` : "Olá";

  return (
    <AppShell
      heading={greeting}
      username={username}
      actions={<span className="hidden text-[13px] font-medium text-muted min-[1100px]:inline">PT</span>}
    >
      <div className="flex flex-col gap-6 min-[1100px]:grid min-[1100px]:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.9fr)] min-[1100px]:gap-x-4">
            <section className="order-1 min-[1100px]:col-start-1">
              {focus ? (
                <div className="flex flex-col gap-3 min-[1100px]:flex-row">
                  <AccountCard account={focus} cents={totals.get(focus.id) ?? 0} hero />
                  <div className="flex snap-x gap-3 overflow-x-auto pb-1 min-[1100px]:min-w-0 min-[1100px]:flex-1">
                    {accounts.slice(1).map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        cents={totals.get(account.id) ?? 0}
                      />
                    ))}
                    <AddTile />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-[13px] text-muted">Nenhuma conta ainda.</p>
                  <AddTile />
                </div>
              )}
            </section>

            <section className="order-2 rounded-[20px] bg-surface p-4 min-[1100px]:col-start-2 min-[1100px]:row-start-1">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">{periodCopy[period]}</h2>
                  {focus ? <p className="truncate text-xs text-muted">{focus.shortName}</p> : null}
                </div>
                <p className="text-[22px] font-bold tabular-nums">{formatPeriod(net)}</p>
              </div>
              <div className="flex gap-4 text-[13px] font-medium">
                {periods.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={item === period}
                    onClick={() => setPeriod(item)}
                    className={item === period ? "text-ink" : "text-muted"}
                  >
                    {periodName[item]}
                  </button>
                ))}
              </div>
              <div className="mt-4 overflow-x-auto rounded-[14px] bg-sunken px-3 py-3">
                <div className="flex h-32 min-w-full items-end gap-1">
                  {bars.map((value, index) => (
                    <Bar key={index} value={value} peak={peak} />
                  ))}
                </div>
              </div>
            </section>

            <section className="order-3 min-[1100px]:col-start-1">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold">Lançamentos</h2>
                <Link href="/lancamentos" className="inline-flex items-center gap-1 text-[13px] text-muted">
                  Ver tudo
                  <Chevron />
                </Link>
              </div>
              {rows.length === 0 ? (
                <p className="text-[13px] text-muted">Nenhum lançamento neste período.</p>
              ) : (
                <ul className="overflow-hidden rounded-[20px] bg-surface">
                  {rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex min-h-16 items-center gap-3 border-t border-line px-4 first:border-t-0"
                    >
                      <BankMark name={row.title.split(" → ")[0] ?? ""} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold leading-5">{row.title}</p>
                        <p className="text-xs leading-4 text-muted">{row.when}</p>
                      </div>
                      <p className="text-[15px] font-semibold tabular-nums">{formatSigned(row.cents)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
      </div>
    </AppShell>
  );
}

function AccountCard({
  account,
  cents,
  hero = false,
}: {
  account: DashboardAccount;
  cents: number;
  hero?: boolean;
}) {
  return (
    <article
      className={
        hero
          ? "flex min-h-[148px] flex-col justify-between rounded-[20px] bg-inverse p-4 text-white min-[1100px]:min-w-[240px] min-[1100px]:flex-1"
          : "flex min-h-[132px] w-[148px] shrink-0 snap-start flex-col justify-between rounded-[20px] bg-surface p-4 min-[1100px]:w-auto min-[1100px]:min-w-[140px] min-[1100px]:flex-1"
      }
    >
      <div className="flex items-center gap-3">
        <BankMark name={account.shortName} logoUrl={account.logoUrl} inverse={hero} />
        <div className="min-w-0">
          <p className={`truncate text-[15px] font-semibold ${hero ? "text-white" : "text-ink"}`}>
            {account.shortName}
          </p>
          <p className={`truncate text-xs ${hero ? "text-inverse-muted" : "text-muted"}`}>
            {account.name}
          </p>
        </div>
      </div>
      <p
        className={
          hero
            ? "text-[28px] font-bold leading-[34px] tabular-nums"
            : "text-[22px] font-bold leading-7 tabular-nums"
        }
      >
        {formatBalance(cents)}
      </p>
    </article>
  );
}

function AddTile() {
  return (
    <Link
      href="/contas"
      className="flex min-h-[132px] w-[148px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-line text-muted transition-colors hover:border-ink hover:text-ink min-[1100px]:w-auto min-[1100px]:min-w-[120px] min-[1100px]:flex-1"
    >
      <span aria-hidden="true" className="text-2xl leading-none">+</span>
      <span className="text-[13px]">Adicionar</span>
    </Link>
  );
}

function BankMark({
  name,
  logoUrl = null,
  inverse = false,
}: {
  name: string;
  logoUrl?: string | null;
  inverse?: boolean;
}) {
  const letters = name.replace(/[^A-Za-zÀ-ÿ]/g, "").slice(0, 2) || "D";
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-semibold ${inverse ? "bg-white/15 text-white" : "bg-surface-muted text-ink"}`}
    >
      {logoUrl ? (
        // Bank logos come from the catalog host, which is not a Next image source.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        letters
      )}
    </span>
  );
}

function formatBarAmount(cents: number) {
  const number = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(Math.abs(cents) / 100);
  if (cents > 0) {
    return `+${number}`;
  }
  if (cents < 0) {
    return `-${number}`;
  }
  return number;
}

function Bar({ value, peak }: { value: number; peak: number }) {
  const height = value === 0 ? 2 : Math.max(8, Math.round((Math.abs(value) / peak) * 72));
  if (value === 0) {
    return (
      <span className="flex min-w-[3px] flex-1 flex-col justify-end">
        <span className="w-full rounded-t-[3px] bg-line" style={{ height }} />
      </span>
    );
  }

  return (
    <span className="flex w-max min-w-11 shrink-0 flex-col items-center justify-end gap-1" title={formatBalance(value)}>
      <span className="px-0.5 text-[10px] leading-none tabular-nums text-ink">{formatBarAmount(value)}</span>
      <span className="w-full rounded-t-[3px] bg-ink" style={{ height }} />
    </span>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
