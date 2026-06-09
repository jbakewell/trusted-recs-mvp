import { BrandMark } from "@/components/brand/BrandMark";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { OverprintMotif } from "@/components/visual/OverprintMotif";
import { RandomMotifField } from "@/components/visual/RandomMotifField";
import { SectionAccentBars } from "@/components/visual/SectionAccentBars";

const exampleRecommendation = {
  recommender: "Sarah",
  title: "The Apartment",
  year: "1960",
  genres: "Comedy, Drama",
  reason: "Witty & smart",
  note: "Hilarious and strangely beautiful. One of my all-time favourites.",
  target: "For everyone",
};

export default function Home() {
  return (
    <main className="main-container">
      <section className="relative grid gap-8 overflow-hidden pb-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.7fr)] lg:items-center lg:gap-12 lg:pb-0">
        <OverprintMotif
          className="absolute -left-16 top-[360px] h-72 w-[340px] opacity-95 sm:top-[330px] lg:-bottom-28 lg:left-2 lg:top-auto lg:h-80 lg:w-96"
          intensity="bold"
          palette="roseTealOlive"
          size="xl"
          variant="bottomLandscape"
        />
        <div className="relative z-10 grid gap-6 pt-6 lg:pt-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandMark />
              <p className="metadata-label text-text-secondary">Private movie lists</p>
            </div>
            <Chip className="hidden sm:inline-flex">Milestone 2</Chip>
          </div>

          <div className="grid max-w-[340px] gap-4 sm:max-w-xl">
            <h1 className="font-display text-display-lg font-semibold uppercase leading-none tracking-[0.04em] text-text-primary sm:text-[58px]">
              Trusted Recs
            </h1>
            <p className="font-serifAccent text-[16px] italic leading-[1.4] text-text-secondary">
              Save the films your favourite people tell you to watch.
            </p>
            <p className="text-body text-text-secondary">
              Create a private group, save movie recommendations, and keep track of what everyone actually wants to watch.
            </p>
          </div>

          <div className="grid gap-3 sm:max-w-sm">
            <ButtonLink className="w-full sm:w-fit" href="/groups/new">
              Create a group
            </ButtonLink>
            <p className="text-caption font-bold uppercase tracking-[0.08em] text-text-muted">
              Create your first group and invite your trusted people.
            </p>
          </div>

          <OverprintMotif
            className="absolute right-0 top-28 hidden h-20 w-20 lg:block"
            intensity="subtle"
            palette="roseGreenOrange"
            size="md"
            variant="cornerCluster"
          />
        </div>

        <aside className="relative z-10 grid gap-4" id="example-recommendation">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="metadata-label text-accent">Example card</p>
              <h2 className="section-title mt-1">What you’ll save</h2>
            </div>
            <SectionAccentBars />
          </div>
          <RecommendationCard {...exampleRecommendation} />
          <div className="relative overflow-hidden rounded-card border border-border-subtle bg-bg-surface p-4">
            <RandomMotifField className="opacity-45" density="low" palette="roseGreenOrange" placement="corner" seed="landing-privacy" />
            <p className="relative z-10 metadata-label text-text-muted">Privacy reassurance</p>
            <p className="relative z-10 mt-2 max-w-[300px] text-body-sm text-text-secondary">
              No email, password, phone number, or contact import required for MVP group use.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
