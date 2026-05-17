"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-800/80 px-1 font-mono text-[10px] font-medium text-zinc-400 shadow-[inset_0_-1px_0_rgba(0,0,0,0.4)]">
      {children}
    </kbd>
  );
}

interface Props {
  onOpen: () => void;
}

export function CommandTrigger({ onOpen }: Props) {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes("mac"));
  }, []);

  return (
    <>
      <button
        onClick={onOpen}
        className="hidden md:flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
      >
        <Search className="h-3.5 w-3.5 text-zinc-500" />
        <span>Buscar o ejecutar…</span>
        <span className="ml-2 flex items-center gap-0.5">
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <button
        onClick={onOpen}
        className="flex md:hidden items-center justify-center h-8 w-8 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
      >
        <Search className="h-4 w-4" />
      </button>
    </>
  );
}
