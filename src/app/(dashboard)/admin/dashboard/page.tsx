
import { ShieldCheck } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <ShieldCheck className="size-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <p className="text-muted-foreground">
        Manage GridGuard users, infrastructure, outages, and system operations.
      </p>
    </section>
  );
}
