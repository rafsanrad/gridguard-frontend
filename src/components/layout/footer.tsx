import Link from "next/link";
import { Zap, Mail } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <Zap className="size-6 text-primary" />
              <span className="text-xl font-bold">
                Grid<span className="text-primary">Guard</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              A smart platform for managing power outages, load shedding
              schedules, and electricity services.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Quick Links</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <Link href="/outages" className="hover:text-primary">
                Power Outages
              </Link>
              <Link href="/schedules" className="hover:text-primary">
                Load Shedding Schedules
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Connect</h3>

            <div className="mt-4 flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-primary"
              >
                <FaGithub className="size-5" />
              </a>

              <a
                href="mailto:support@example.com"
                aria-label="Email"
                className="text-muted-foreground hover:text-primary"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GridGuard. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
