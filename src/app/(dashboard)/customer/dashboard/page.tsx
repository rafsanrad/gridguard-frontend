
import { House } from "lucide-react";

export default function CustomerDashboardPage() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <House className="size-8 text-success" />
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>
      </div>

      <p className="text-muted-foreground">
        View power updates, report outages, and manage electricity services.
      </p>
    </section>
  );
}
