"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Spinner } from "@/components/spinner";
import { BankLogo, BankSelect } from "@/components/bank-select";
import { createAccountAction } from "@/app/contas/actions";
import type { AccountRow, BankOption } from "@/lib/api/accounts";
import { accountPage } from "@/lib/accounts/page";

export function AccountsScreen({
  username,
  accounts,
  banks,
}: {
  username: string | null;
  accounts: AccountRow[];
  banks: BankOption[];
}) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [bankId, setBankId] = useState("");
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ bankId?: string; name?: string }>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const openRef = useRef(false);
  const current = accountPage(accounts, page);

  function resetForm() {
    setBankId("");
    setName("");
    setFieldErrors({});
    setBanner(null);
  }

  function toggleForm() {
    if (openRef.current) {
      resetForm();
    }
    openRef.current = !openRef.current;
    setOpen(openRef.current);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: { bankId?: string; name?: string } = {};
    if (!bankId) {
      nextErrors.bankId = "Escolha um banco.";
    }
    if (name.trim().length === 0) {
      nextErrors.name = "Informe o nome.";
    }
    setFieldErrors(nextErrors);
    setBanner(null);
    if (nextErrors.bankId || nextErrors.name) {
      return;
    }

    setPending(true);
    const created = await createAccountAction(bankId, name.trim());
    setPending(false);
    if (!openRef.current) {
      return;
    }
    if (!created.ok) {
      if (created.kind === "fields") {
        setFieldErrors(created.fields);
      } else {
        setBanner(created.message);
      }
      return;
    }

    openRef.current = false;
    setOpen(false);
    resetForm();
    setPage(1);
    router.refresh();
  }

  return (
    <AppShell
      heading="Contas"
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
          {open ? "Fechar" : "Criar"}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {open ? (
          <form onSubmit={submit} className="flex flex-col gap-4 rounded-[20px] bg-surface p-4">
            <div>
              <BankSelect
                banks={banks}
                value={bankId}
                onChange={setBankId}
                invalid={Boolean(fieldErrors.bankId)}
              />
              {fieldErrors.bankId ? (
                <span className="mt-2 block text-xs font-medium text-alert">{fieldErrors.bankId}</span>
              ) : null}
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-muted">Nome</span>
              <input
                aria-label="Nome"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={fieldErrors.name ? true : undefined}
                className="h-12 rounded-2xl bg-surface-muted px-3 text-[15px]"
              />
              {fieldErrors.name ? (
                <span className="text-xs font-medium text-alert">{fieldErrors.name}</span>
              ) : null}
            </label>
            {banner ? <p className="text-xs font-medium text-alert">{banner}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-white"
            >
              {pending ? <Spinner /> : null}
              Adicionar conta
            </button>
          </form>
        ) : null}

        {current.items.length === 0 ? (
          <p className="text-[13px] text-muted">Nenhuma conta ainda.</p>
        ) : (
          <ul className="overflow-hidden rounded-[20px] bg-surface">
            {current.items.map((account) => (
              <li
                key={account.id}
                className="flex min-h-16 items-center gap-3 border-t border-line px-4 first:border-t-0"
              >
                <BankLogo shortName={account.shortName} logoUrl={account.logoUrl} />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold leading-5">{account.name}</p>
                  <p className="truncate text-xs leading-4 text-muted">{account.shortName}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {current.pages > 1 ? (
          <div className="flex items-center justify-between text-[13px] font-medium">
            <button
              type="button"
              onClick={() => setPage((value) => value - 1)}
              disabled={current.page === 1}
              className="text-ink disabled:text-muted"
            >
              Anterior
            </button>
            <span className="text-muted">
              {current.page} / {current.pages}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => value + 1)}
              disabled={current.page === current.pages}
              className="text-ink disabled:text-muted"
            >
              Próxima
            </button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
