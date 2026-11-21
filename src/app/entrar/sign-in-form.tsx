"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TextField } from "@/components/text-field";
import { safeNext } from "@/lib/auth/session";

type FieldErrors = Partial<Record<"username" | "password", string>>;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [banner, setBanner] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = String(data.get("username") ?? "");
    const password = String(data.get("password") ?? "");
    const nextFields: FieldErrors = {};

    if (username.trim().length === 0) {
      nextFields.username = "Informe o usuário.";
    }
    if (password.length === 0) {
      nextFields.password = "Informe a senha.";
    }
    if (nextFields.username || nextFields.password) {
      setFields(nextFields);
      setBanner(null);
      return;
    }

    setPending(true);
    setBanner(null);
    setFields({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        banner?: string;
        fields?: FieldErrors;
      } | null;

      if (!response.ok || !body?.ok) {
        setBanner(body?.banner ?? "Não foi possível entrar. Tente de novo.");
        setFields(body?.fields ?? {});
        return;
      }

      router.push(safeNext(searchParams.get("next")));
      router.refresh();
    } catch {
      setBanner("Não foi possível entrar. Tente de novo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {banner ? (
        <p
          role="alert"
          className="rounded-[14px] border border-alert/45 bg-alert-wash px-3.5 py-3 text-sm font-semibold text-alert"
        >
          {banner}
        </p>
      ) : null}

      <TextField
        label="Usuário"
        name="username"
        autoComplete="username"
        error={fields.username}
      />
      <TextField
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        error={fields.password}
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-1 h-[52px] cursor-pointer rounded-full bg-ink text-[15px] font-semibold text-white disabled:opacity-60"
      >
        Entrar
      </button>
    </form>
  );
}
