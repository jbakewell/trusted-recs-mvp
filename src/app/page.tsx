import { BrandMark } from "@/components/brand/BrandMark";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

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
      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.7fr)] lg:items-center lg:gap-12">
        <div className="relative grid gap-6 pt-6 lg:pt-10">
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
            <ButtonLink className="w-full sm:w-fit" href="#example-recommendation">
              Create a group
            </ButtonLink>
            <p className="text-caption font-bold uppercase tracking-[0.08em] text-text-muted">
              Group creation arrives in the next milestone.
            </p>
          </div>

          <div aria-hidden="true" className="absolute right-0 top-28 hidden h-20 w-20 border border-border-subtle bg-bg-surface lg:block">
            <span className="absolute left-4 top-4 h-8 w-8 rounded-full bg-accent-soft" />
            <span className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-accent-teal/30" />
          </div>
        </div>

        <aside className="grid gap-4" id="example-recommendation">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="metadata-label text-accent">Example card</p>
              <h2 className="section-title mt-1">What you’ll save</h2>
            </div>
            <span className="h-2 w-16 bg-accent" aria-hidden="true" />
          </div>
          <RecommendationCard {...exampleRecommendation} />
          <div className="rounded-card border border-border-subtle bg-bg-surface p-4">
            <p className="metadata-label text-text-muted">Privacy reassurance</p>
            <p className="mt-2 text-body-sm text-text-secondary">
              No email, password, phone number, or contact import required for MVP group use.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
