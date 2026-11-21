import Link from "next/link";
import { AuthScreen } from "@/components/auth-screen";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <AuthScreen
      title="Criar conta"
      footer={
        <Link href="/entrar" className="cursor-pointer">
          Entrar
        </Link>
      }
    >
      <RegisterForm />
    </AuthScreen>
  );
}
