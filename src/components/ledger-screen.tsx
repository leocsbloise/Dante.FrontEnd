"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Spinner } from "@/components/spinner";
import { createLedgerAction } from "@/app/lancamentos/actions";
import { formatBalance, formatSigned, formatWhen } from "@/lib/dashboard/home";
import {
  ANY_ACCOUNT,
  ledgerHref,
  movementCents,
  occurredAtWithOffset,
  parseAmount,
  type LedgerAccount,
  type LedgerFilters,
  type LedgerMovement,
} from "@/lib/ledger/screen";

export function LedgerScreen({
  username,
  accounts,
  entries,
  filters: initialFilters,
  notice = null,
}: {
  username: string | null;
  accounts: LedgerAccount[];
  entries: LedgerMovement[];
  filters: LedgerFilters;
  notice?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  if (
    applied.debitAccountId !== initialFilters.debitAccountId ||
    applied.creditAccountId !== initialFilters.creditAccountId ||
    applied.from !== initialFilters.from ||
    applied.to !== initialFilters.to
  ) {
    setApplied(initialFilters);
    setDraft(initialFilters);
  }
  const filters = initialFilters;
  const rows = entries;
  const [open, setOpen] = useState(false);
  const [debitAccountId, setDebitAccountId] = useState("");
  const [creditAccountId, setCreditAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    debitAccountId?: string;
    creditAccountId?: string;
    amount?: string;
    occurredAt?: string;
  }>({});
  const [formBanner, setFormBanner] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const names = new Map(accounts.map((account) => [account.id, account.name]));

  function resetDraft() {
    setDebitAccountId("");
    setCreditAccountId("");
    setAmount("");
    setOccurredAt("");
    setFieldErrors({});
    setFormBanner(null);
  }

  function toggleForm() {
    if (open) {
      resetDraft();
    }
    setOpen((current) => !current);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: {
      debitAccountId?: string;
      creditAccountId?: string;
      amount?: string;
      occurredAt?: string;
    } = {};
    if (!debitAccountId) {
      nextErrors.debitAccountId = "Escolha a conta de débito.";
    }
    if (!creditAccountId) {
      nextErrors.creditAccountId = "Escolha a conta de crédito.";
    }
    if (debitAccountId && debitAccountId === creditAccountId) {
      nextErrors.debitAccountId = "Débito e crédito precisam ser contas diferentes.";
      nextErrors.creditAccountId = "Débito e crédito precisam ser contas diferentes.";
    }
    if (parseAmount(amount) === null) {
      nextErrors.amount = "O valor precisa ser maior que zero.";
    }
    if (!occurredAtWithOffset(occurredAt)) {
      nextErrors.occurredAt = "Informe quando aconteceu.";
    }
    setFieldErrors(nextErrors);
    setFormBanner(null);
    if (nextErrors.debitAccountId || nextErrors.creditAccountId || nextErrors.amount || nextErrors.occurredAt) {
      return;
    }

    setCreating(true);
    const created = await createLedgerAction({ debitAccountId, creditAccountId, amount, occurredAt });
    setCreating(false);
    if (!created.ok) {
      if (created.kind === "fields") {
        setFieldErrors(created.fields);
      } else {
        setFormBanner(created.message);
      }
      return;
    }

    resetDraft();
    setOpen(false);
    router.refresh();
  }

  function setFilter(patch: Partial<LedgerFilters>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    startTransition(() => {
      router.replace(ledgerHref(next));
    });
  }

  return (
    <AppShell
      heading="Lançamentos"
      username={username}
      actions={
        <button
          type="button"
          aria-expanded={open}
          onClick={toggleForm}
          className={`inline-flex h-11 items-center rounded-full px-5 text-[15px] font-semibold transition-colors duration-300 ${
            open ? "bg-alert-wash text-alert" : "bg-ink text-white"
          }`}
        >
          {open ? "Fechar" : "Lançar"}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {open ? (
          <form
            aria-label="Novo lançamento"
            onSubmit={submit}
            className="flex flex-col gap-4 rounded-[20px] bg-surface p-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <AccountChoice
                label="Débito"
                accounts={accounts}
                value={debitAccountId}
                invalid={Boolean(fieldErrors.debitAccountId)}
                onChange={setDebitAccountId}
              />
              <AccountChoice
                label="Crédito"
                accounts={accounts}
                value={creditAccountId}
                invalid={Boolean(fieldErrors.creditAccountId)}
                onChange={setCreditAccountId}
              />
            </div>
            {fieldErrors.debitAccountId ? (
              <span className="text-xs font-medium text-alert">{fieldErrors.debitAccountId}</span>
            ) : null}
            {fieldErrors.creditAccountId && fieldErrors.creditAccountId !== fieldErrors.debitAccountId ? (
              <span className="text-xs font-medium text-alert">{fieldErrors.creditAccountId}</span>
            ) : null}
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-muted">Valor</span>
              <input
                aria-label="Valor"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-invalid={fieldErrors.amount ? true : undefined}
                className="h-12 rounded-2xl bg-surface-muted px-3 text-[15px]"
              />
              {fieldErrors.amount ? (
                <span className="text-xs font-medium text-alert">{fieldErrors.amount}</span>
              ) : null}
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-muted">Quando</span>
              <input
                aria-label="Quando"
                type="datetime-local"
                value={occurredAt}
                onChange={(event) => setOccurredAt(event.target.value)}
                aria-invalid={fieldErrors.occurredAt ? true : undefined}
                className="h-12 rounded-2xl bg-surface-muted px-3 text-[15px]"
              />
              {fieldErrors.occurredAt ? (
                <span className="text-xs font-medium text-alert">{fieldErrors.occurredAt}</span>
              ) : null}
            </label>
            {formBanner ? <p className="text-xs font-medium text-alert">{formBanner}</p> : null}
            <button
              type="submit"
              disabled={creating}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-white"
            >
              {creating ? <Spinner /> : null}
              Lançar
            </button>
          </form>
        ) : null}
        <section className="rounded-[20px] bg-surface p-4">
          <div className="grid grid-cols-2 gap-3">
            <AccountFilter
              label="Débito"
              accounts={accounts}
              value={draft.debitAccountId}
              onChange={(debitAccountId) => setFilter({ debitAccountId })}
            />
            <AccountFilter
              label="Crédito"
              accounts={accounts}
              value={draft.creditAccountId}
              onChange={(creditAccountId) => setFilter({ creditAccountId })}
            />
            <DateFilter label="De" value={draft.from} onChange={(from) => setFilter({ from })} />
            <DateFilter label="Até" value={draft.to} onChange={(to) => setFilter({ to })} />
          </div>
          <p className="mt-3 text-xs text-muted">São Paulo · o fim não entra</p>
        </section>
        {notice ? <p className="text-xs font-medium text-alert">{notice}</p> : null}
        {pending ? (
          <div role="status" className="flex justify-center py-2 text-ink">
            <Spinner className="h-5 w-5" />
            <span className="sr-only">Carregando</span>
          </div>
        ) : null}

        {rows.length === 0 ? (
          <p className="text-[13px] text-muted">Nenhum lançamento neste período.</p>
        ) : (
          <ul aria-busy={pending} className="overflow-hidden rounded-[20px] bg-surface">
            {rows.map((row) => {
              const cents = movementCents(row, filters);
              const title = `${names.get(row.debitAccountId) ?? "Conta"} → ${names.get(row.creditAccountId) ?? "Conta"}`;
              return (
                <li
                  key={row.id}
                  className="flex min-h-16 items-center gap-3 border-t border-line px-4 first:border-t-0"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-muted text-xs font-semibold">
                    {(accounts.find((account) => account.id === row.debitAccountId)?.shortName ?? "D")
                      .replace(/[^A-Za-zÀ-ÿ]/g, "")
                      .slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold leading-5">{title}</p>
                    <p suppressHydrationWarning className="text-xs leading-4 text-muted">
                      {formatWhen(row.occurredAt, row.timeZone)}
                    </p>
                  </div>
                  <p suppressHydrationWarning className="text-[15px] font-semibold tabular-nums">
                    {cents === null ? formatBalance(Math.round(row.amount * 100)) : formatSigned(cents)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function AccountChoice({
  label,
  value,
  accounts,
  invalid,
  onChange,
}: {
  label: string;
  value: string;
  accounts: LedgerAccount[];
  invalid: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <select
        aria-label={label}
        value={value}
        aria-invalid={invalid ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-12 w-full appearance-none rounded-2xl bg-surface-muted px-3 text-[15px] font-semibold"
      >
        <option value="">Escolha</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function AccountFilter({
  label,
  value,
  accounts,
  onChange,
}: {
  label: string;
  value: string;
  accounts: LedgerAccount[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-12 w-full appearance-none rounded-2xl bg-surface-muted px-3 text-[15px] font-semibold"
      >
        <option value={ANY_ACCOUNT}>Qualquer</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <input
        aria-label={label}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-12 w-full rounded-2xl bg-surface-muted px-3 text-[15px] font-semibold"
      />
    </label>
  );
}
