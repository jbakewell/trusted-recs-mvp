import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { WizardShell } from "@/components/app/WizardShell";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MoviePoster } from "@/components/ui/MoviePoster";
import { OverprintMotif } from "@/components/visual/OverprintMotif";
import { InvitePanel } from "./InvitePanel";
import { prisma } from "@/lib/db/prisma";
import { hashToken, SESSION_COOKIE_NAME } from "@/lib/groups/session";
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
  inviteLinks?: { status: "active" | "revoked" }[];
};

type RecommendationRow = {
  id: string;
  note: string | null;
  recommendedByParticipant: {
    displayName: string;
  };
  reason: {
    label: string;
  };
  item: {
    title: string;
    description: string | null;
    movieMetadata: {
      releaseYear: number | null;
      overview: string | null;
      posterPath: string | null;
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

export default async function GroupPage({ params, searchParams }: GroupPageProps) {
  const { groupId } = await params;
  const { recommended } = await searchParams;
  const cookieStore = await cookies();
  const rawSessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const sessionTokenHash = rawSessionToken ? hashToken(rawSessionToken) : null;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      participants: {
        where: { status: "active" },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        include: {
          inviteLinks: {
            where: { status: "active" },
            select: { status: true },
          },
        },
      },
      recommendations: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          recommendedByParticipant: {
            select: { displayName: true },
          },
          reason: {
            select: { label: true },
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

  const session = sessionTokenHash
    ? await prisma.session.findUnique({
        where: { sessionTokenHash },
        include: { participant: true },
      })
    : null;
  const currentParticipant =
    session?.participant.groupId === group.id && !session.revokedAt && session.expiresAt > new Date() ? session.participant : null;

  return (
    <WizardShell
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
      <div className="shrink-0 border-b border-border-subtle bg-bg-page p-4">
        <section className="relative grid gap-3 overflow-hidden border border-border-subtle bg-accent-soft/40 p-4">
          <OverprintMotif
            className="absolute -bottom-12 -right-10 h-40 w-40 opacity-80"
            intensity="standard"
            palette="roseGreenOrange"
            size="lg"
            variant="cornerCluster"
          />
          <div className="relative z-10 grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <p className="metadata-label text-text-muted">Private group</p>
              <span className="text-caption font-bold uppercase tracking-[0.08em] text-text-muted">
                {group.participants.length} people
              </span>
            </div>
            {recommended ? (
              <p className="border border-accent bg-bg-surface/80 p-2 text-body-sm font-semibold text-accent">
                Recommendation saved.
              </p>
            ) : null}
            {currentParticipant ? (
              <ButtonLink className="w-full" href={`/groups/${group.id}/recommend`}>
                Recommend a movie
              </ButtonLink>
            ) : (
              <p className="text-body-sm text-text-secondary">
                Rejoin from the creator browser to add recommendations.
              </p>
            )}
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Recommendation filters">
              <Chip selected>All</Chip>
              <Chip>For everyone</Chip>
              <Chip>For you</Chip>
              <Chip>For later</Chip>
            </div>
          </div>
        </section>
      </div>

      <ScrollRegion className="grid content-start gap-3 p-4" aria-label="Recommendation feed">
        {group.recommendations.length > 0 ? (
          group.recommendations.map((recommendation: RecommendationRow) => (
            <article
              className="relative grid grid-cols-[64px_minmax(0,1fr)] gap-3 overflow-hidden border border-border-subtle bg-bg-surface p-3"
              key={recommendation.id}
            >
              <span className="absolute right-0 top-0 h-full w-[3px] bg-accent-teal" aria-hidden="true" />
              <MoviePoster
                size="sm"
                src={tmdbImageUrl(recommendation.item.movieMetadata?.posterPath ?? null) ?? undefined}
                title={recommendation.item.title}
              />
              <div className="min-w-0 space-y-2">
                <div>
                  <h2 className="line-clamp-2 text-card-title font-semibold uppercase tracking-[0.02em] text-text-primary">
                    {recommendation.item.title}
                  </h2>
                  <p className="metadata-label mt-1 text-text-muted">
                    {recommendation.item.movieMetadata?.releaseYear ?? "Year unknown"} - {recommendation.recommendedByParticipant.displayName}
                  </p>
                </div>
                {recommendation.item.movieMetadata?.overview ?? recommendation.item.description ? (
                  <p className="line-clamp-3 text-body-sm text-text-secondary">
                    {recommendation.item.movieMetadata?.overview ?? recommendation.item.description}
                  </p>
                ) : null}
                <Chip className="min-h-8 w-fit" selected={false} tint={tintForReason(recommendation.reason.label)}>
                  {recommendation.reason.label}
                </Chip>
                {recommendation.note ? <p className="line-clamp-2 text-body-sm text-text-secondary">"{recommendation.note}"</p> : null}
                <p className="text-body-sm font-semibold text-text-muted">{recommendationTargetText(recommendation.targets)}</p>
              </div>
            </article>
          ))
        ) : (
          <div className="relative grid min-h-[280px] place-items-center overflow-hidden border border-border-subtle bg-bg-surface p-6 text-center">
            <OverprintMotif
              className="absolute -bottom-8 -right-8 h-40 w-40 opacity-75"
              intensity="standard"
              palette="roseGreenOrange"
              size="lg"
              variant="emptyState"
            />
            <div className="relative z-10 grid max-w-[260px] gap-2">
              <p className="section-title">No recommendations yet</p>
              <p className="text-body-sm text-text-secondary">Add the first film someone should watch.</p>
            </div>
          </div>
        )}

        <details className="border border-border-subtle bg-bg-surface">
          <summary className="cursor-pointer px-4 py-3 text-caption font-bold uppercase tracking-[0.08em] text-text-primary">
            Manage group
          </summary>
          <div className="grid gap-3 border-t border-border-subtle p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {group.participants.map((participant: ParticipantRow) => (
                <div className="flex items-center gap-3 border border-border-subtle bg-bg-muted p-3" key={participant.id}>
                  <AvatarBadge name={participant.displayName} seed={seedToNumber(participant.avatarSeed)} size="md" />
                  <div>
                    <p className="text-body-sm font-bold text-text-primary">{participant.displayName}</p>
                    <p className="metadata-label text-text-muted">{participant.role === "admin" ? "Admin" : "Member"}</p>
                  </div>
                </div>
              ))}
            </div>
            {currentParticipant?.role === "admin" ? (
              <InvitePanel
                participants={group.participants.map((participant: ParticipantRow) => ({
                  id: participant.id,
                  displayName: participant.displayName,
                  role: participant.role,
                  hasActiveInvite: Boolean(participant.inviteLinks?.length),
                }))}
              />
            ) : (
              <Card className="grid gap-2 bg-accent-soft/40">
                <p className="metadata-label text-text-muted">Invite management</p>
                <p className="text-body-sm text-text-secondary">
                  Ask the group admin to copy, revoke, or regenerate invite links.
                </p>
              </Card>
            )}
          </div>
        </details>
      </ScrollRegion>
    </WizardShell>
  );
}
