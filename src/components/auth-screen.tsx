import type { ReactNode } from "react";
import { Mark } from "@/components/mark";

export function AuthScreen({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-1 flex-col px-5 pb-10 pt-8">
      <div className="mb-8 flex items-center gap-3 text-ink">
        <Mark className="h-12 w-auto" />
        <span className="text-[28px] font-bold leading-none tracking-[-0.03em]">
          dante
        </span>
      </div>
      <h1 className="mb-7 text-[34px] font-bold leading-none tracking-tight">
        {title}
      </h1>
      {children}
      <div className="mt-4 text-[13px] font-medium text-muted">{footer}</div>
    </main>
  );
}
