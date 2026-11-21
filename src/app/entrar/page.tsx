import Link from "next/link";
import { Suspense } from "react";
import { AuthScreen } from "@/components/auth-screen";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <AuthScreen
      title="Entrar"
      footer={
        <Link href="/criar-conta" className="cursor-pointer">
          Criar conta
        </Link>
      }
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthScreen>
  );
}
