import Link from "next/link";

const navItems = [
  { href: "/points", label: "Points" },
  { href: "/rewards", label: "Rewards" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/notes", label: "Notes" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-dark-border bg-surface">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-base font-semibold text-sand">
            RINCC Cadet Points
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-dark-border bg-surface px-3 py-1 text-xs font-medium text-coyote-light">
            <span className="h-1.5 w-1.5 rounded-full bg-olive" />
            NCC Portal
          </span>
        </div>
        <nav className="flex flex-wrap gap-3 text-xs font-medium text-muted">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-dark-border bg-surface px-3 py-1 text-coyote-light transition-colors hover:border-hover-border"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
