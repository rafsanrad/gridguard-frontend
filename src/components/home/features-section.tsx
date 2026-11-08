import {
  Activity,
  CalendarDays,
  Bell,
  MapPin,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Power Outage Tracking",
    description:
      "Stay informed about reported power outages and their current status.",
  },
  {
    icon: CalendarDays,
    title: "Load Shedding Schedules",
    description:
      "Explore planned load shedding schedules to prepare for interruptions.",
  },
  {
    icon: Bell,
    title: "Service Updates",
    description: "Stay updated on important electricity service announcements.",
  },
  {
    icon: MapPin,
    title: "Area-Based Information",
    description: "Find outage and schedule information relevant to your area.",
  },
  {
    icon: CreditCard,
    title: "Online Payments",
    description: "Access supported electricity service payments securely.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Management",
    description: "Dedicated management tools for authorized GridGuard users.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our Features
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Stay Connected
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            GridGuard brings essential power management tools together in one
            easy-to-use platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>

                <h3 className="text-lg font-semibold">{feature.title}</h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
