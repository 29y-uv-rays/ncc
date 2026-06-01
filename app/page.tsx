import Link from "next/link";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";

const cards = [
  { href: "/roadmap", title: "Roadmap", description: "Platoon progress at a glance." },
  { href: "/rewards", title: "Rewards", description: "Track rewards and point targets." },
  { href: "/points", title: "Points", description: "Leaderboard, platoons, and cadets." },
  { href: "/notes", title: "Notes", description: "Specialist assessment notes." },
  { href: "/contact", title: "Contact Us", description: "Reach teachers and EXCO." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <PageShell title="Dashboard" subtitle="RINCC Cadet Points System">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-normal text-gray-600">
            Send your videos to your Platoon Sergeant via WhatsApp or Teams with your name.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300"
            >
              <p className="text-xs font-medium text-gray-500">Navigate</p>
              <h2 className="text-lg font-semibold text-gray-900 mt-1">{card.title}</h2>
              <p className="text-sm font-normal text-gray-600 mt-2">{card.description}</p>
            </Link>
          ))}
        </div>
      </PageShell>
    </>
  );
}
