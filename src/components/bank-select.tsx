"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { BankOption } from "@/lib/api/accounts";

export function BankSelect({
  banks,
  value,
  onChange,
  invalid = false,
}: {
  banks: BankOption[];
  value: string;
  onChange: (bankId: string) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const listId = useId();
  const selected = banks.find((bank) => bank.id === value) ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative flex flex-col gap-2">
      <span id={labelId} className="text-[13px] font-medium text-muted">
        Banco
      </span>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-expanded={open}
        aria-labelledby={labelId}
        aria-invalid={invalid ? true : undefined}
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 items-center gap-3 rounded-2xl bg-surface-muted px-3 text-left text-[15px] font-semibold"
      >
        {selected ? <BankLogo shortName={selected.shortName} logoUrl={selected.logoUrl} /> : null}
        <span className={selected ? "text-ink" : "text-muted"}>{selected?.shortName ?? "Escolha"}</span>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute top-full z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-[20px] bg-surface py-2 shadow-[0_12px_32px_rgb(18_20_26/10%)]"
        >
          {banks.map((bank) => (
            <li key={bank.id}>
              <button
                type="button"
                role="option"
                aria-selected={bank.id === value}
                onClick={() => {
                  onChange(bank.id);
                  setOpen(false);
                }}
                className="flex min-h-11 w-full items-center gap-3 px-3 text-left text-[15px] font-semibold"
              >
                <BankLogo shortName={bank.shortName} logoUrl={bank.logoUrl} />
                {bank.shortName}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function BankLogo({ shortName, logoUrl }: { shortName: string; logoUrl: string | null }) {
  const letters = shortName.replace(/[^A-Za-zÀ-ÿ]/g, "").slice(0, 2) || "B";
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white text-[11px] font-semibold text-ink">
      {logoUrl ? (
        // Catalog logos are hosted outside this app.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="h-full w-full object-contain" />
      ) : (
        letters
      )}
    </span>
  );
}
