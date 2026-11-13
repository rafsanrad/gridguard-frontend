import type { Metadata } from "next";

import CTASection from "@/components/home/cta-section";
import FeaturesSection from "@/components/home/features-section";
import HeroSection from "@/components/home/hero-section";

export const metadata: Metadata = {
  title: "Home",

  description:
    "GridGuard helps customers and electricity operators track power outages, monitor load shedding schedules, report electricity issues, and manage service requests.",

  openGraph: {
    title: "GridGuard | Smart Power Management",
    description:
      "Stay informed about power outages, track load shedding schedules, and manage electricity service requests with GridGuard.",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "GridGuard | Smart Power Management",
    description:
      "Track electricity outages, monitor load shedding, and manage power-related services with GridGuard.",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
