import { BrandMark } from "@/components/brand/BrandMark";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OverprintBackground, pickOverprintBackgroundIndex } from "@/components/visual/OverprintBackground";
import { SectionAccentBars } from "@/components/visual/SectionAccentBars";
import { getKnownGroupsForDevice } from "@/lib/groups/session.server";

function seedToNumber(seed: string) {
  return Number.parseInt(seed.slice(0, 8), 16) || 0;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function ExamplePoster() {
  return (
    <div
      aria-label="The Grand Budapest Hotel poster"
      className="relative aspect-[2/3] w-[88px] shrink-0 overflow-hidden border border-border-subtle bg-accent"
      role="img"
    >
      <div className="absolute inset-x-0 top-0 h-10 bg-accent/90" />
      <div className="absolute inset-x-4 top-5 text-center font-display text-[10px] font-semibold uppercase leading-[0.95] tracking-[0.08em] text-text-inverse">
        The Grand
        <br />
        Budapest
        <br />
        Hotel
      </div>
      <div className="absolute bottom-5 left-4 right-4 h-10 bg-bg-surface/75" />
      <div className="absolute bottom-5 left-6 h-16 w-3 bg-bg-surface/90" />
      <div className="absolute bottom-5 left-11 h-16 w-3 bg-bg-surface/90" />
      <div className="absolute bottom-5 right-6 h-16 w-3 bg-bg-surface/90" />
      <div className="absolute bottom-4 left-3 right-3 h-2 bg-bg-surface/90" />
    </div>
  );
}

function ExampleRecommendationCard() {
  return (
    <article className="relative w-full overflow-hidden rounded-card border border-border-subtle surface-paper p-4 text-left shadow-subtle">
      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <AvatarBadge name="Maya" seed={12} size="sm" />
          <p className="text-caption font-semibold text-text-muted">Maya recommended</p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-[19px] font-semibold uppercase leading-[1.05] tracking-[0.04em] text-text-primary">
              The Grand Budapest Hotel
            </h2>
            <p className="metadata-label mt-1 text-text-muted">2014 - Comedy, Adventure</p>
            <p className="mt-3 line-clamp-4 text-[12px] leading-[1.45] text-text-secondary">
              Wes Anderson at his finest. Beautiful, clever, and endlessly re-watchable.
            </p>
          </div>
          <ExamplePoster />
        </div>
        <div className="flex items-center justify-between border-t border-border-subtle pt-2 text-caption font-semibold text-text-muted">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <svg aria-hidden="true" className="h-4 w-4 fill-accent text-accent" viewBox="0 0 24 24">
                <path d="M12 21s-7.2-4.6-9.5-8.7C.7 9.1 2.4 5 6.2 5c2 0 3.4 1.1 4.2 2.2C11.2 6.1 12.6 5 14.6 5c3.8 0 5.5 4.1 3.7 7.3C16 16.4 12 21 12 21Z" />
              </svg>
              12
            </span>
            <span className="inline-flex items-center gap-1">
              <svg aria-hidden="true" className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24">
                <path d="M6 18.5 3.5 21v-5.2A8.4 8.4 0 0 1 2 11c0-5 4.2-9 9.5-9S21 6 21 11s-4.2 9-9.5 9A10 10 0 0 1 6 18.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              2 comments
            </span>
          </div>
          <svg aria-hidden="true" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24">
            <path d="M7 4h10v16l-5-3-5 3V4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </article>
  );
}

export default async function Home() {
  const knownGroups = await getKnownGroupsForDevice();
  const hasKnownGroups = knownGroups.length > 0;
  const backgroundIndex = pickOverprintBackgroundIndex();

  return (
    <main className="relative isolate min-h-dvh overflow-x-hidden bg-bg-page">
      <OverprintBackground backgroundIndex={backgroundIndex} density="bold" route="landingHero" />

      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center px-7 pb-7 pt-[158px] text-center">
        <div className="flex items-center justify-center gap-3">
          <BrandMark />
          <h1 className="font-display text-[38px] font-semibold uppercase leading-none tracking-[0.04em] text-text-primary">
            Trusted Recs
          </h1>
        </div>

        <p className="mt-6 font-serifAccent text-[27px] italic leading-[1.08] text-text-primary">
          Great picks.
          <br />
          Better together.
        </p>
        <p className="mt-4 max-w-[300px] text-[13px] leading-[1.45] text-text-secondary">
          Discover and share the best movies recommended by people you trust.
        </p>

        <ButtonLink className="mt-5 min-h-11 w-[210px]" href="/groups/new">
          Create a group
        </ButtonLink>

        <div className="mt-7 w-full">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="metadata-label text-text-muted">Example recommendation</p>
            <SectionAccentBars />
          </div>
          <ExampleRecommendationCard />
        </div>
      </section>

      {hasKnownGroups ? (
        <section className="relative z-10 mx-auto grid w-full max-w-[430px] gap-3 px-7 pb-12 pt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="metadata-label text-accent">Welcome back</p>
              <h2 className="section-title mt-1">Your groups</h2>
            </div>
            <SectionAccentBars />
          </div>
          {knownGroups.map((group) => (
            <Card className="grid gap-3 p-4 md:p-4" key={group.groupId}>
              <div className="flex items-start gap-3">
                <AvatarBadge
                  name={group.participantName}
                  seed={seedToNumber(group.participantAvatarSeed)}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-card-title font-semibold uppercase tracking-[0.02em] text-text-primary">
                    {group.groupName}
                  </h2>
                  <p className="mt-1 text-body-sm text-text-secondary">Viewing as {group.participantName}</p>
                  <p className="metadata-label mt-2 text-text-muted">
                    {pluralize(group.participantCount, "person", "people")} - {pluralize(group.recommendationCount, "recommendation")}
                  </p>
                </div>
              </div>
              <ButtonLink className="w-full" href={`/groups/${group.groupId}`}>
                Open group
              </ButtonLink>
            </Card>
          ))}
        </section>
      ) : null}
    </main>
  );
}
