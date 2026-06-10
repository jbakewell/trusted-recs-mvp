import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { WizardShell } from "@/components/app/WizardShell";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { MoviePoster } from "@/components/ui/MoviePoster";
import { OverprintBackground, pickOverprintBackgroundIndex } from "@/components/visual/OverprintBackground";
import { OverprintMotif } from "@/components/visual/OverprintMotif";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";
import { tmdbImageUrl } from "@/lib/tmdb/movies";
import { tintForReason } from "@/lib/visual/chipTint";

type GroupPageProps = {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ recommended?: string }>;
};

type ParticipantRow = {
  id: string;
  displayName: string;
  avatarSeed: string;
  role: "admin" | "member";
};

type RecommendationRow = {
  id: string;
  note: string | null;
  recommendedByParticipant: {
    displayName: string;
    avatarSeed: string;
  };
  reason: {
    label: string;
  };
  reasonSelections: {
    reason: {
      label: string;
    };
  }[];
  item: {
    title: string;
    description: string | null;
    movieMetadata: {
      releaseYear: number | null;
      overview: string | null;
      posterPath: string | null;
      genres: unknown;
    } | null;
  };
  targets: {
    targetType: "group" | "participant" | "later";
    participant: { displayName: string } | null;
  }[];
};

function seedToNumber(seed: string) {
  return Number.parseInt(seed.slice(0, 8), 16) || 0;
}

function recommendationTargetText(targets: RecommendationRow["targets"]) {
  if (targets.some((target) => target.targetType === "group")) {
    return "For everyone";
  }

  if (targets.some((target) => target.targetType === "later")) {
    return "Saved for later";
  }

  const names = targets.map((target) => target.participant?.displayName).filter(Boolean);
  return names.length > 0 ? `For ${names.join(", ")}` : "For specific people";
}

function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function genresText(genres: unknown) {
  return Array.isArray(genres) && genres.length > 0
    ? genres.slice(0, 3).map((genre) => titleCase(String(genre))).join(", ")
    : "Genre unknown";
}

function recommendationReasons(recommendation: RecommendationRow) {
  const labels = recommendation.reasonSelections.map((selection) => selection.reason.label);
  return labels.length > 0 ? labels : [recommendation.reason.label];
}

function ParticipantRail({ currentParticipantId, participants }: { currentParticipantId?: string; participants: ParticipantRow[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Group participants">
      {participants.map((participant) => (
        <div className="grid min-w-10 justify-items-center gap-1" key={participant.id}>
          <AvatarBadge name={participant.displayName} seed={seedToNumber(participant.avatarSeed)} size="md" />
          <span className="max-w-14 truncate text-[10px] font-semibold text-text-muted">
            {participant.id === currentParticipantId ? "You" : participant.displayName}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function GroupPage({ params, searchParams }: GroupPageProps) {
  const { groupId } = await params;
  const { recommended } = await searchParams;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      participants: {
        where: { status: "active" },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          displayName: true,
          avatarSeed: true,
          role: true,
        },
      },
      recommendations: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          recommendedByParticipant: {
            select: { displayName: true, avatarSeed: true },
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
          item: {
            select: {
              title: true,
              description: true,
              movieMetadata: {
                select: {
                  releaseYear: true,
                  overview: true,
                  posterPath: true,
                  genres: true,
                },
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
  });

  if (!group) {
    notFound();
  }

  const currentParticipant = await getCurrentParticipantForGroup(group.id);
  const backgroundIndex = pickOverprintBackgroundIndex();

  return (
    <WizardShell
      background={<OverprintBackground backgroundIndex={backgroundIndex} density="medium" route="group-home" />}
      header={
        <FixedHeader
          leftAction={{ href: "/", label: "Home" }}
          rightAction={
            currentParticipant ? (
              <AvatarBadge
                name={currentParticipant.displayName}
                seed={seedToNumber(currentParticipant.avatarSeed)}
                size="sm"
              />
            ) : null
          }
          subtitle={currentParticipant ? `Viewing as ${currentParticipant.displayName}` : `${group.participants.length} people`}
          title={group.name}
        />
      }
    >
      <div className="shrink-0 border-b border-border-subtle px-4 py-3">
        <section className="relative grid max-h-[220px] gap-3 overflow-hidden rounded-card border border-border-subtle surface-strong p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="metadata-label text-text-muted">Private group</p>
            <ButtonLink className="min-h-8 min-w-0 px-3 text-[11px]" href={`/groups/${group.id}/manage`} variant="secondary">
              Manage
            </ButtonLink>
          </div>
          <ParticipantRail currentParticipantId={currentParticipant?.id} participants={group.participants} />
          {recommended ? (
            <p className="rounded-full border border-accent bg-surface-strong px-3 py-2 text-body-sm font-semibold text-accent">
              Recommendation saved.
            </p>
          ) : null}
          {currentParticipant ? (
            <ButtonLink className="w-full" href={`/groups/${group.id}/recommend`}>
              Recommend a movie
            </ButtonLink>
          ) : (
            <p className="text-body-sm text-text-secondary">
              Rejoin from a remembered browser or invite link to add recommendations.
            </p>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Recommendation filters">
            <Chip selected>All</Chip>
            <Chip>For everyone</Chip>
            <Chip>For you</Chip>
            <Chip>For later</Chip>
          </div>
        </section>
      </div>

      <ScrollRegion className="grid content-start gap-4 p-4" aria-label="Recommendation feed">
        {group.recommendations.length > 0 ? (
          group.recommendations.map((recommendation: RecommendationRow) => {
            const metadata = recommendation.item.movieMetadata;
            const overview = metadata?.overview ?? recommendation.item.description;
            const reasons = recommendationReasons(recommendation);

            return (
              <article
                className="relative overflow-hidden rounded-card border border-border-subtle surface-strong p-3 shadow-subtle"
                key={recommendation.id}
              >
                <OverprintMotif
                  className="absolute -right-20 -top-14 h-56 w-56 opacity-25"
                  intensity="standard"
                  palette="roseGreenOrange"
                  size="lg"
                  variant="feedAccent"
                />
                <div className="relative z-10 grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <AvatarBadge
                        name={recommendation.recommendedByParticipant.displayName}
                        seed={seedToNumber(recommendation.recommendedByParticipant.avatarSeed)}
                        size="sm"
                      />
                      <p className="truncate text-caption font-semibold text-text-muted">
                        {recommendation.recommendedByParticipant.displayName} recommended
                      </p>
                    </div>
                    <p className="text-caption font-semibold text-text-muted">{recommendationTargetText(recommendation.targets)}</p>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 font-display text-page-title font-semibold uppercase leading-none tracking-[0.04em] text-text-primary">
                        {recommendation.item.title}
                      </h2>
                      <p className="metadata-label mt-2 text-text-muted">
                        {metadata?.releaseYear ?? "Year unknown"} - {genresText(metadata?.genres)}
                      </p>
                      {overview ? <p className="mt-3 line-clamp-3 text-body-sm text-text-secondary">{overview}</p> : null}
                      {recommendation.note ? (
                        <p className="mt-2 line-clamp-2 text-body-sm text-text-secondary">"{recommendation.note}"</p>
                      ) : null}
                    </div>
                    <MoviePoster
                      size="md"
                      src={tmdbImageUrl(metadata?.posterPath ?? null) ?? undefined}
                      title={recommendation.item.title}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {reasons.map((reason) => (
                      <Chip key={reason} selected={false} tint={tintForReason(reason)}>
                        {reason}
                      </Chip>
                    ))}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="relative grid min-h-[360px] place-items-center overflow-hidden rounded-card border border-border-subtle surface-soft p-6 text-center">
            <OverprintMotif
              className="absolute bottom-2 right-8 h-44 w-44 opacity-75"
              intensity="standard"
              palette="roseGreenOrange"
              size="lg"
              variant="emptyState"
            />
            <div className="relative z-10 grid max-w-[260px] justify-items-center gap-3">
              <p className="section-title">No recommendations yet</p>
              <p className="text-body-sm text-text-secondary">Add the first film someone should watch.</p>
              {currentParticipant ? (
                <ButtonLink href={`/groups/${group.id}/recommend`}>
                  Recommend a movie
                </ButtonLink>
              ) : null}
            </div>
          </div>
        )}
      </ScrollRegion>
    </WizardShell>
  );
}
