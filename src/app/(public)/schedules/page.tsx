import type { Metadata } from "next";
import PublicSchedules from "@/components/public/public-schedules";

export const metadata: Metadata = {
  title: "Load Shedding Schedules",
  description:
    "Check planned load shedding schedules, affected electricity feeders, and scheduled power interruption times on GridGuard.",
};

export default function SchedulesPage() {
  return <PublicSchedules />;
}
