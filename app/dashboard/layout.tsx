import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar, MobileBottomNav } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  } catch (err) {
    const isRedirect =
      err instanceof Error && (err as { digest?: string }).digest?.startsWith("NEXT_REDIRECT");
    if (isRedirect) throw err;
    console.error("[dashboard/layout] auth error:", err);
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Sidebar — solo desktop */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Contenido principal — deja espacio para la bottom nav en mobile */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">{children}</main>

      {/* Bottom nav — solo mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
