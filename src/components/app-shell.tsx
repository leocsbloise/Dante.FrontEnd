"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Mark } from "@/components/mark";

export type ShellSection = "home" | "accounts" | "ledger";

const sections: { id: ShellSection | "settings"; href: string | null; label: string }[] = [
  { id: "home", href: "/", label: "Início" },
  { id: "accounts", href: "/contas", label: "Contas" },
  { id: "ledger", href: "/lancamentos", label: "Lançamentos" },
  { id: "settings", href: null, label: "Ajustes" },
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active: ShellSection = pathname.startsWith("/contas")
    ? "accounts"
    : pathname.startsWith("/lancamentos")
      ? "ledger"
      : "home";

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1240px] min-[1100px]:gap-4 min-[1100px]:p-6">
        <aside className="material sticky top-6 hidden h-[calc(100dvh-3rem)] w-[220px] shrink-0 flex-col rounded-[28px] p-4 shadow-[0_12px_32px_rgb(18_20_26/10%)] min-[1100px]:flex">
          <div className="mb-8 flex items-center gap-2 px-2">
            <Mark className="h-8 w-8" />
            <span className="text-[20px] font-bold leading-6">Dante</span>
          </div>
          <div className="flex flex-col gap-1">
            {sections.map((section) => (
              <NavItem key={section.label} section={section} active={section.id === active} labeled />
            ))}
          </div>
        </aside>

        <div className="flex min-h-dvh min-w-0 flex-1 flex-col min-[1100px]:min-h-[calc(100dvh-3rem)] min-[1100px]:rounded-[28px] min-[1100px]:bg-white/70 min-[1100px]:p-6 min-[1100px]:shadow-[0_12px_32px_rgb(18_20_26/6%)] min-[1100px]:backdrop-blur-[28px]">
          {children}
        </div>
      </div>

      <nav className="material fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 min-[1100px]:hidden">
        {sections.map((section) => (
          <NavItem key={section.label} section={section} active={section.id === active} />
        ))}
      </nav>
    </div>
  );
}

export function AppShell({
  heading,
  username,
  actions,
  children,
}: {
  heading: string;
  username: string | null;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
          <header className="material sticky top-0 z-10 flex items-center justify-between overflow-hidden rounded-b-[20px] px-4 py-3 min-[1100px]:static min-[1100px]:rounded-2xl min-[1100px]:bg-transparent min-[1100px]:px-8 min-[1100px]:py-1 min-[1100px]:backdrop-blur-none">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white min-[1100px]:hidden">
                <Mark className="h-6 w-6" />
              </span>
              <h1 className="text-[22px] font-bold leading-7">{heading}</h1>
            </div>
            <div className="flex items-center gap-3">
              {actions}
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  aria-label="Sair"
                  className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-semibold text-white"
                >
                  {(username ?? "D").slice(0, 1).toUpperCase()}
                </button>
              </form>
            </div>
          </header>
          <div className="px-4 pb-28 pt-4 min-[1100px]:px-1 min-[1100px]:pb-2">{children}</div>
    </>
  );
}

function NavItem({
  section,
  active,
  labeled = false,
}: {
  section: (typeof sections)[number];
  active: boolean;
  labeled?: boolean;
}) {
  const className = labeled
    ? `flex h-11 items-center gap-3 rounded-full px-3 text-[15px] font-semibold ${active ? "bg-ink text-white" : "text-muted"}`
    : `flex flex-col items-center gap-1 py-1 text-[11px] font-medium ${active ? "text-ink" : "text-muted"}`;
  const content = (
    <>
      <SectionIcon id={section.id} />
      {section.label}
    </>
  );

  if (!section.href) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Link href={section.href} aria-current={active ? "page" : undefined} className={className}>
      {content}
    </Link>
  );
}

function SectionIcon({ id }: { id: (typeof sections)[number]["id"] }) {
  if (id === "home") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" fill="currentColor" />
      </svg>
    );
  }
  if (id === "accounts") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (id === "ledger") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M7 7h10M7 12h10M7 17h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
