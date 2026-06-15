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

export default async function Home() {
  const knownGroups = await getKnownGroupsForDevice();
  const hasKnownGroups = knownGroups.length > 0;
  const backgroundIndex = pickOverprintBackgroundIndex();

  return (
    <main className="relative isolate min-h-dvh overflow-x-hidden bg-bg-page">
      <OverprintBackground backgroundIndex={backgroundIndex} density="bold" route="landingHero" />

      <section className="relative z-10 mx-auto flex w-full max-w-[430px] flex-col items-center px-7 pb-10 pt-[158px] text-center">
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
      </section>

      {hasKnownGroups ? (
        <section className="relative z-10 mx-auto grid w-full max-w-[430px] gap-3 px-7 pb-12 pt-2">
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
