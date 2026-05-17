import Image from "next/image";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:px-6 md:py-4">
      {/* Logo visible solo en mobile (el sidebar está oculto) */}
      <div className="flex md:hidden h-7 w-7 shrink-0 items-center justify-center rounded-full overflow-hidden ring-1 ring-yellow-500/40">
        <Image src="/logo.svg" alt="GymPro Demo" width={28} height={28} className="object-cover" unoptimized />
      </div>
      <h1 className="text-base font-semibold text-zinc-100 md:text-lg">{title}</h1>
    </header>
  );
}
