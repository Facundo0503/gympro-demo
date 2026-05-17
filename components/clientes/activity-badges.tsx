interface ActivityBadgesProps {
  activities: string[];
  size?: "sm" | "xs";
}

const BADGE_STYLES: Record<string, string> = {
  gimnasio: "bg-blue-500/15 text-blue-400",
  muay_thai: "bg-red-500/15 text-red-400",
  zumba: "bg-purple-500/15 text-purple-400",
  funcional: "bg-green-500/15 text-green-400",
};

const BADGE_LABELS: Record<string, string> = {
  gimnasio: "Gimnasio",
  muay_thai: "Muay Thai",
  zumba: "Zumba",
  funcional: "Funcional",
};

const ACTIVITY_ORDER = ["gimnasio", "muay_thai", "zumba", "funcional"];

export function ActivityBadges({ activities, size = "xs" }: ActivityBadgesProps) {
  if (!activities || activities.length === 0) return null;
  const px = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";
  return (
    <div className="flex gap-1 flex-wrap">
      {ACTIVITY_ORDER.filter((a) => activities.includes(a)).map((a) => (
        <span key={a} className={`rounded-full font-semibold ${BADGE_STYLES[a] ?? "bg-zinc-500/15 text-zinc-400"} ${px}`}>
          {BADGE_LABELS[a] ?? a}
        </span>
      ))}
    </div>
  );
}
