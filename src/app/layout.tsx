import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/providers/theme-provider";
import QueryProvider from "@/providers/query-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GridGuard | Load Shedding & Power Management",
    template: "%s | GridGuard",
  },

  description:
    "GridGuard is a power management platform for tracking electricity outages, monitoring load shedding schedules, reporting power issues, and managing service requests.",

  applicationName: "GridGuard",

  keywords: [
    "GridGuard",
    "Load Shedding",
    "Power Management",
    "Electricity Outage",
    "Power Outage Tracking",
    "Electricity Management",
    "Service Requests",
    "Bangladesh Electricity",
  ],

  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "GridGuard",
    title: "GridGuard | Load Shedding & Power Management",
    description:
      "Track power outages, monitor load shedding schedules, and manage electricity service requests with GridGuard.",
  },

  twitter: {
    card: "summary",
    title: "GridGuard | Load Shedding & Power Management",
    description:
      "A modern platform for electricity outage tracking and load shedding management.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}

            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
