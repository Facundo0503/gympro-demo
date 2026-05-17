"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard/error]", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm text-zinc-400">
        Ocurrió un error al cargar el dashboard.
        {error.digest && (
          <span className="ml-1 font-mono text-xs text-zinc-500">
            (digest: {error.digest})
          </span>
        )}
      </p>
      <p className="max-w-sm text-xs text-zinc-600">{error.message}</p>
      <Button
        onClick={reset}
        variant="outline"
        size="sm"
        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
      >
        Reintentar
      </Button>
    </div>
  );
}
