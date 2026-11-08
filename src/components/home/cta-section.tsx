import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <Zap className="mx-auto mb-5 size-10" />

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Take Control of Your Power?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-primary-foreground/80">
            Join GridGuard to stay informed about power outages, plan around
            load shedding, and manage your electricity services.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              nativeButton={false}
              render={<Link href="/register" />}
              size="lg"
              variant="secondary"
              className="w-full gap-2 sm:w-auto"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Button>

            <Button
              nativeButton={false}
              render={<Link href="/outages" />}
              size="lg"
              variant="outline"
              className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
            >
              Explore Outages
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
