import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { WizardShell } from "@/components/app/WizardShell";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MoviePoster } from "@/components/ui/MoviePoster";
import { OverprintBackground, pickOverprintBackgroundIndex } from "@/components/visual/OverprintBackground";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";
import {
  genresText,
  ratingText,
  recommendationReasons,
  recommendationTargetText,
  recommenderNoteText,
  runtimeText,
} from "@/lib/recommendations/display";
import { tmdbImageUrl } from "@/lib/tmdb/movies";
import { tintForReason } from "@/lib/visual/chipTint";

type MovieDetailPageProps = {
  params: Promise<{ groupId: string; itemId: string }>;
};

export const dynamic = "force-dynamic";

function seedToNumber(seed: string) {
  return Number.parseInt(seed.slice(0, 8), 16) || 0;
}

export async function getMovieDetailForGroup(groupId: string, itemId: string) {
  const [group, item] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true },
    }),
    prisma.item.findFirst({
      where: {
        id: itemId,
        recommendations: {
          some: {
            groupId,
            deletedAt: null,
          },
        },
      },
      include: {
        movieMetadata: true,
        recommendations: {
          where: {
            groupId,
            deletedAt: null,
          },
          orderBy: { createdAt: "desc" },
          include: {
            recommendedByParticipant: {
              select: {
                displayName: true,
                avatarSeed: true,
              },
            },
            reason: {
              select: { label: true },
            },
            reasonSelections: {
              orderBy: { sortOrder: "asc" },
              include: {
                reason: {
                  select: { label: true },
                },
              },
            },
            targets: {
              include: {
                participant: {
                  select: { displayName: true },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return group && item ? { group, item } : null;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { groupId, itemId } = await params;
  const detail = await getMovieDetailForGroup(groupId, itemId);

  if (!detail) {
    notFound();
  }

  const { group, item } = detail;
  const metadata = item.movieMetadata;
  const backgroundIndex = pickOverprintBackgroundIndex();
  const currentParticipant = await getCurrentParticipantForGroup(group.id);
  const overview = metadata?.overview ?? item.description;
  const metadataItems = [
    metadata?.releaseYear ? String(metadata.releaseYear) : null,
    genresText(metadata?.genres, 3),
    runtimeText(metadata?.runtime),
    metadata?.originalLanguage ? metadata.originalLanguage.toUpperCase() : null,
    ratingText(metadata?.voteAverage, metadata?.voteCount),
  ].filter(Boolean);

  return (
    <WizardShell
      background={<OverprintBackground backgroundIndex={backgroundIndex} density="medium" route="generic" />}
      header={
        <FixedHeader
          leftAction={{ href: `/groups/${group.id}`, label: "Back to group" }}
          rightAction={
            currentParticipant ? (
              <AvatarBadge
                name={currentParticipant.displayName}
                seed={seedToNumber(currentParticipant.avatarSeed)}
                size="sm"
              />
            ) : null
          }
          subtitle={group.name}
          title="Movie"
        />
      }
    >
      <ScrollRegion className="grid content-start gap-4 p-4">
        <Card className="grid gap-4 p-4 md:p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-4">
            <div className="min-w-0">
              <p className="metadata-label text-accent">Movie details</p>
              <h1 className="mt-2 font-display text-[34px] font-semibold uppercase leading-none tracking-[0.04em] text-text-primary">
                {item.title}
              </h1>
              <p className="metadata-label mt-3 text-text-muted">{metadataItems.join(" - ")}</p>
            </div>
            <MoviePoster
              className="self-start"
              size="md"
              src={tmdbImageUrl(metadata?.posterPath ?? null) ?? undefined}
              title={item.title}
            />
          </div>
          {overview ? <p className="text-body-sm text-text-secondary">{overview}</p> : null}
        </Card>

        <section className="grid gap-3" aria-label="Recommendations for this movie">
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <p className="metadata-label text-accent">Group notes</p>
              <h2 className="section-title">{item.recommendations.length} recommendations</h2>
            </div>
          </div>

          {item.recommendations.map((recommendation) => {
            const reasons = recommendationReasons(recommendation);

            return (
              <article className="rounded-card border border-border-subtle surface-strong p-4 shadow-subtle" key={recommendation.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <AvatarBadge
                      name={recommendation.recommendedByParticipant.displayName}
                      seed={seedToNumber(recommendation.recommendedByParticipant.avatarSeed)}
                      size="sm"
                    />
                    <p className="truncate text-body-sm font-semibold text-text-primary">
                      {recommendation.recommendedByParticipant.displayName}
                    </p>
                  </div>
                  <p className="shrink-0 text-caption font-semibold text-text-muted">
                    {recommendationTargetText(recommendation.targets)}
                  </p>
                </div>

                <p className="mt-3 text-body-sm text-text-secondary">
                  {recommenderNoteText(recommendation.recommendedByParticipant.displayName, recommendation.note)}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {reasons.map((reason) => (
                    <Chip key={reason} selected={false} tint={tintForReason(reason)}>
                      {reason}
                    </Chip>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </ScrollRegion>
    </WizardShell>
  );
}
