
import { Activity } from "lucide-react";

export default function OperatorDashboardPage() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Activity className="size-8 text-energy" />
        <h1 className="text-3xl font-bold">Operator Dashboard</h1>
      </div>

      <p className="text-muted-foreground">
        Monitor outages, manage load shedding schedules, and coordinate operations.
      </p>
    </section>
  );
}
