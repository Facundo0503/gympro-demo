import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  } catch {
    // Si Supabase no está configurado, mostrar el login igual
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Image
          src="/logo.jpg"
          alt="GymPro Demo"
          width={100}
          height={100}
          className="rounded-full object-cover"
          priority
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            GymPro Demo
          </h1>
          <p className="text-sm text-zinc-400">Panel de administración</p>
        </div>
      </div>

      <LoginForm />
    </main>
  );
}
