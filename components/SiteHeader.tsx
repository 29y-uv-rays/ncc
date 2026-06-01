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
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-base font-semibold text-gray-900">
            RINCC Cadet Points
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            NCC Portal
          </span>
        </div>
        <nav className="flex flex-wrap gap-3 text-xs font-medium text-gray-500">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 transition-colors hover:border-gray-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
