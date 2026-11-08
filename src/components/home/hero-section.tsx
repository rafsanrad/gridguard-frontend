import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-energy/10" />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium text-primary">
          <Zap className="size-4" />
          Smarter Power Management
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Stay Informed.
          <br />
          <span className="text-primary">Stay Powered.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          Track power outages, explore load shedding schedules, and manage
          electricity services through one reliable platform.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            nativeButton={false}
            render={<Link href="/outages" />}
            size="lg"
            className="w-full gap-2 sm:w-auto"
          >
            Explore Outages
            <ArrowRight className="size-4" />
          </Button>

          <Button
            nativeButton={false}
            render={<Link href="/schedules" />}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            View Schedules
          </Button>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-center gap-3 rounded-xl border bg-card/80 p-4">
            <Activity className="size-5 text-primary" />
            <span className="text-sm font-medium">Outage Tracking</span>
          </div>

          <div className="flex items-center justify-center gap-3 rounded-xl border bg-card/80 p-4">
            <Zap className="size-5 text-energy" />
            <span className="text-sm font-medium">Load Schedules</span>
          </div>

          <div className="flex items-center justify-center gap-3 rounded-xl border bg-card/80 p-4">
            <ShieldCheck className="size-5 text-success" />
            <span className="text-sm font-medium">Service Management</span>
          </div>
        </div>
      </div>
    </section>
  );
}
