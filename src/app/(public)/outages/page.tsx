import PublicOutages from "@/components/public/public-outages";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Power Outages",
  description:
    "View reported electricity outages, affected feeders, restoration estimates, and outage updates on GridGuard.",
};

export default function OutagesPage() {
  return <PublicOutages />;
}
