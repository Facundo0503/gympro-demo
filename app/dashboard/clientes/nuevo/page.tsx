import { Header } from "@/components/layout/header";
import { MemberForm } from "@/components/clientes/member-form";

export default function NuevoClientePage() {
  return (
    <div className="flex flex-col">
      <Header title="Nuevo cliente" />
      <div className="p-6">
        <MemberForm />
      </div>
    </div>
  );
}
