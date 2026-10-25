import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tapit Card Gallery — 36 Business Card Designs" },
      {
        name: "description",
        content:
          "Browse all 36 Tapit NFC business card designs — illustrated fronts with contact details and QR-only backs, across gaming, education, space, retail, fashion and tech themes.",
      },
      { property: "og:title", content: "Tapit Card Gallery — 36 Business Card Designs" },
      {
        property: "og:description",
        content:
          "All 36 Tapit NFC card designs in one gallery — fronts with details and QR backs across nine themes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ---------------------------------- data ---------------------------------- */

type AssetModule = { default: { url: string } };
const files = import.meta.glob<AssetModule>("../assets/cards/*.asset.json", {
  eager: true,
});

type SetKey = "frontA" | "frontB" | "backA" | "backB";

const SETS: { key: SetKey; label: string; blurb: string }[] = [
  { key: "frontA", label: "Fronts — Set 1", blurb: "Front designs with name & contact details" },
  { key: "frontB", label: "Fronts — Set 2", blurb: "Front designs with name & contact details" },
  { key: "backA", label: "Backs — Set 1", blurb: "QR-only card backs" },
  { key: "backB", label: "Backs — Set 2", blurb: "QR-only card backs" },
];

const NAMES: Record<string, string> = {
  frontA_0: "Minimal Ivory",
  frontA_1: "Midnight Gamer",
  frontA_2: "Scholar Cream",
  frontA_3: "Deep Space",
  frontA_4: "Retail Kraft",
  frontA_5: "Blush Atelier",
  frontA_6: "Studio Grey",
  frontA_7: "Circuit Emerald",
  frontA_8: "Lavender Mist",
  frontB_0: "Sky Blue",
  frontB_1: "Neon Gamer",
  frontB_2: "Campus Kraft",
  frontB_3: "Planetary Navy",
  frontB_4: "Botanic Olive",
  frontB_5: "Rose Atelier",
  frontB_6: "Obsidian Tech",
  frontB_7: "Circuit Frost",
  frontB_8: "Torn Kraft",
  backA_0: "Corporate Glass",
  backA_1: "Violet Gamer",
  backA_2: "Graduate Cream",
  backA_3: "Orbit Navy",
  backA_4: "Amber Cart",
  backA_5: "Silk White",
  backA_6: "Lavender Audio",
  backA_7: "Emerald Circuit",
  backA_8: "Sage Wave",
  backB_0: "Ice Blue",
  backB_1: "Neon Arcade",
  backB_2: "Desk Kraft",
  backB_3: "Satellite Navy",
  backB_4: "Cream Cart",
  backB_5: "Wardrobe",
  backB_6: "Desk Light",
  backB_7: "Circuit Navy",
  backB_8: "Blue Wave",
};

type Card = { id: string; name: string; setKey: SetKey; setLabel: string; url: string };

const CARDS: Card[] = Object.entries(files)
  .map(([path, mod]) => {
    const base = path.split("/").pop()!.replace(".png.asset.json", "");
    const [setKey, idx] = base.split("_");
    const set = SETS.find((s) => s.key === setKey)!;
    return {
      id: base,
      name: NAMES[base] ?? base,
      setKey: setKey as SetKey,
      setLabel: set.label,
      url: mod.default.url,
      order: SETS.findIndex((s) => s.key === setKey) * 100 + Number(idx),
    };
  })
  .sort((a, b) => a.order - b.order)
  .map(({ order: _o, ...c }) => c);

/* --------------------------------- page ----------------------------------- */

type Filter = "all" | SetKey;

function Index() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Card | null>(null);

  const shown = useMemo(
    () => (filter === "all" ? CARDS : CARDS.filter((c) => c.setKey === filter)),
    [filter]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header filter={filter} onFilter={setFilter} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        {filter === "all" ? (
          SETS.map((set) => (
            <Section key={set.key} title={set.label} blurb={set.blurb}>
              <CardGrid cards={CARDS.filter((c) => c.setKey === set.key)} onOpen={setSelected} />
            </Section>
          ))
        ) : (
          <Section
            title={SETS.find((s) => s.key === filter)!.label}
            blurb={SETS.find((s) => s.key === filter)!.blurb}
          >
            <CardGrid cards={shown} onOpen={setSelected} />
          </Section>
        )}
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Tapit card design gallery · 36 editions · 9 themes
      </footer>

      {selected && <Lightbox card={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Header({ filter, onFilter }: { filter: Filter; onFilter: (f: Filter) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-bold tracking-tight">Tapit</span>
          <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground sm:inline">
            Card Gallery
          </span>
        </div>
        <nav className="flex flex-wrap gap-1.5">
          <Chip active={filter === "all"} onClick={() => onFilter("all")}>
            All
          </Chip>
          {SETS.map((s) => (
            <Chip key={s.key} active={filter === s.key} onClick={() => onFilter(s.key)}>
              {s.label}
            </Chip>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring " +
        (active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-accent")
      }
    >
      {children}
    </button>
  );
}

function Section({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-10">
      <div className="mb-5">
        <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      </div>
      {children}
    </section>
  );
}

function CardGrid({ cards, onOpen }: { cards: Card[]; onOpen: (c: Card) => void }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => onOpen(card)}
          aria-label={`View ${card.name} card design`}
          className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-ring"
        >
          <img
            src={card.url}
            alt={`${card.name} — Topit card design`}
            loading="lazy"
            className="block h-auto w-full"
          />
        </button>
      ))}
    </div>
  );
}

function Lightbox({ card, onClose }: { card: Card; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={card.name}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-11 right-0 rounded-full bg-secondary p-2 text-secondary-foreground transition-colors hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
        <figure>
          <img
            src={card.url}
            alt={`${card.name} — Topit card design`}
            className="max-h-[80vh] w-auto rounded-xl shadow-2xl"
          />
          <figcaption className="mt-4 flex justify-center">
            <span className="inline-flex items-baseline gap-2 rounded-full bg-background/95 px-4 py-1.5 shadow-md">
              <span className="font-display text-sm font-semibold text-foreground">{card.name}</span>
              <span className="text-xs text-muted-foreground">{card.setLabel}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
