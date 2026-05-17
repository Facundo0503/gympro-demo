"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  BarChart3,
  MessageSquare,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/dashboard/estadisticas", label: "Stats", icon: BarChart3 },
  { href: "/dashboard/gastos", label: "Gastos", icon: ShoppingBag },
  { href: "/dashboard/conversaciones", label: "Mensajes", icon: MessageSquare },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

export function Sidebar() {
  const isActive = useIsActive();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="flex flex-col items-center gap-2 border-b border-zinc-800 px-4 py-6">
        <Image
          src="/logo.svg"
          alt="GymPro Demo"
          width={64}
          height={64}
          className="rounded-full object-cover ring-2 ring-yellow-500/40"
          unoptimized
          priority
        />
        <span className="text-base font-bold text-yellow-500 tracking-wide">GymPro Demo</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{ touchAction: "manipulation" }}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-l-2 border-yellow-500 bg-yellow-500/10 text-yellow-500"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 px-2 py-4">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const isActive = useIsActive();

  return (
    <nav className="flex items-center justify-around border-t border-zinc-800 bg-zinc-900 px-1 py-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            style={{ touchAction: "manipulation" }}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-colors ${
              active ? "text-yellow-500" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
      <form action={signOut}>
        <button
          type="submit"
          className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </form>
    </nav>
  );
}
