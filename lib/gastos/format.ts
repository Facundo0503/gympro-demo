const ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function fmtARS(n: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `${n < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${n < 0 ? "-" : ""}$${(abs / 1_000).toFixed(0)}k`;
  }
  return ARS.format(n);
}

export function fmtInt(n: number): string {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n);
}

export function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function fmtDateTime(s: string): string {
  return new Date(s).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtRelative(s: string): string {
  const diff = Date.now() - new Date(s).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "recién";
  if (mins < 60) return `hace ${mins} min`;
  if (hours < 24) return `hace ${hours} h`;
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  return fmtDate(s);
}
