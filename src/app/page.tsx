import { BrandMark } from "@/components/brand/BrandMark";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MoviePoster } from "@/components/ui/MoviePoster";
import { OverprintBackground } from "@/components/visual/OverprintBackground";
import { SectionAccentBars } from "@/components/visual/SectionAccentBars";
import { getKnownGroupsForDevice } from "@/lib/groups/session.server";

function seedToNumber(seed: string) {
  return Number.parseInt(seed.slice(0, 8), 16) || 0;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function ExampleRecommendationCard() {
  return (
    <Card className="relative grid gap-3 overflow-hidden p-4 md:p-4">
      <div className="flex items-center gap-2">
        <AvatarBadge name="Maya" seed={12} size="sm" />
        <p className="text-caption font-semibold text-text-muted">Maya recommended</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-3">
        <div className="min-w-0">
          <p className="font-display text-card-title font-semibold uppercase tracking-[0.04em] text-text-primary">
            The Grand Budapest Hotel
          </p>
          <p className="metadata-label mt-1 text-text-muted">2014 - Comedy, Adventure</p>
          <Chip className="mt-3 w-fit" tint="olive">
            Re-watchable
          </Chip>
          <p className="mt-3 line-clamp-3 text-body-sm text-text-secondary">
            Wes Anderson at his finest. Beautiful, clever, and endlessly re-watchable.
          </p>
        </div>
        <MoviePoster size="md" title="The Grand Budapest Hotel" />
      </div>
    </Card>
  );
}

export default async function Home() {
  const knownGroups = await getKnownGroupsForDevice();
  const hasKnownGroups = knownGroups.length > 0;

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-bg-page">
      <OverprintBackground density="bold" route="landing" seed={hasKnownGroups ? "returning" : "new"} />
      <section className="relative z-10 mx-auto grid min-h-dvh w-full max-w-[480px] content-start gap-6 px-5 pb-10 pt-10 lg:max-w-5xl lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,0.62fr)] lg:items-center lg:gap-12 lg:px-8">
        <div className="grid gap-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <p className="metadata-label text-text-secondary">Movies recommended by people you trust.</p>
          </div>

          <div className="grid gap-4">
            <h1 className="font-display text-[58px] font-semibold uppercase leading-[0.92] tracking-[0.04em] text-text-primary sm:text-[74px]">
              Trusted Recs
            </h1>
            <p className="font-serifAccent text-[24px] italic leading-[1.25] text-text-primary">
              Great picks.
              <br />
              Better together.
            </p>
            <p className="max-w-sm text-body text-text-secondary">
              Discover and share the best movies recommended by people you trust.
            </p>
          </div>

          <div className="grid gap-3 sm:max-w-sm">
            <ButtonLink className="w-full" href="/groups/new">
              {hasKnownGroups ? "Create another group" : "Create a group"}
            </ButtonLink>
            <p className="metadata-label text-text-muted">
              {hasKnownGroups ? "Start a new private list with trusted people." : "Create your first group and invite your trusted people."}
            </p>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="metadata-label text-accent">Example recommendation</p>
            </div>
            <SectionAccentBars />
          </div>
          <ExampleRecommendationCard />

          {hasKnownGroups ? (
            <div className="grid gap-3">
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
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
