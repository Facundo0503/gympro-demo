"use client";

import { useTransition } from "react";
import { signIn } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl text-white">Iniciar sesión</CardTitle>
        <CardDescription className="text-zinc-400">
          Ingresá tus credenciales para acceder al panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="demo@gymproapp.com"
              required
              autoComplete="email"
              disabled={isPending}
              className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-zinc-300">
              Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={isPending}
              className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-400 border border-red-900">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-yellow-500 text-black font-semibold hover:bg-yellow-400 active:bg-yellow-600 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
