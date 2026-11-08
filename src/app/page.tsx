
import ModeToggle from "@/components/shared/mode-toggle";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-primary">
          ⚡ GridGuard
        </h1>

        <ModeToggle />
      </header>

      <section className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-4xl font-bold">
          Welcome to GridGuard
        </h2>

        <p className="max-w-xl text-muted-foreground">
          Smart Load Shedding & Power Management System
        </p>
      </section>
    </main>
  );
}
