import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MoviePoster } from "@/components/ui/MoviePoster";
import { InvitePanel } from "./InvitePanel";
import { prisma } from "@/lib/db/prisma";
import { hashToken, SESSION_COOKIE_NAME } from "@/lib/groups/session";
import { tmdbImageUrl } from "@/lib/tmdb/movies";

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
    movieMetadata: {
      releaseYear: number | null;
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
        take: 5,
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
              movieMetadata: {
                select: {
                  releaseYear: true,
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
    <main className="main-container">
      <section className="mx-auto grid max-w-3xl gap-5">
        <div className="grid gap-4 pt-4 sm:flex sm:items-start sm:justify-between">
          <div className="grid gap-2">
            <Chip className="w-fit">Group created</Chip>
            <h1 className="font-display text-display-md font-semibold uppercase leading-none tracking-[0.04em] text-text-primary">
              {group.name}
            </h1>
            <p className="text-body text-text-secondary">
              {currentParticipant
                ? `You’re viewing as ${currentParticipant.displayName}.`
                : "Your group is ready. Rejoin from the creator browser to see the saved session."}
            </p>
          </div>
          <ButtonLink href="/" variant="secondary">
            Home
          </ButtonLink>
        </div>

        {recommended ? (
          <Card className="grid gap-2 border-accent bg-accent-soft/50">
            <p className="metadata-label text-accent">Recommendation saved</p>
            <p className="text-body-sm text-text-secondary">Your movie is now visible to the group.</p>
          </Card>
        ) : null}

        <Card className="grid gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="metadata-label text-accent">Participants</p>
              <h2 className="section-title mt-1">Your trusted circle</h2>
            </div>
            <span className="text-caption font-bold uppercase tracking-[0.08em] text-text-muted">
              {group.participants.length} people
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {group.participants.map((participant: ParticipantRow) => (
              <div className="flex items-center gap-3 border border-border-subtle bg-bg-muted p-3" key={participant.id}>
                <AvatarBadge name={participant.displayName} seed={seedToNumber(participant.avatarSeed)} />
                <div>
                  <p className="text-body-sm font-bold text-text-primary">{participant.displayName}</p>
                  <p className="metadata-label text-text-muted">{participant.role === "admin" ? "Admin" : "Member"}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {currentParticipant ? (
          <Card className="grid gap-3 bg-accent-soft/40">
            <div className="grid gap-1">
              <p className="metadata-label text-text-muted">Recommendations</p>
              <h2 className="section-title">Add a trusted rec</h2>
              <p className="text-body-sm text-text-secondary">
                Search TMDB, choose a reason chip, and save a movie for the group.
              </p>
            </div>
            <ButtonLink className="w-full sm:w-fit" href={`/groups/${group.id}/recommend`}>
              Recommend a movie
            </ButtonLink>
          </Card>
        ) : null}

        <Card className="grid gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="metadata-label text-accent">Latest recs</p>
              <h2 className="section-title mt-1">Movies to remember</h2>
            </div>
          </div>

          {group.recommendations.length > 0 ? (
            <div className="grid gap-3">
              {group.recommendations.map((recommendation: RecommendationRow) => (
                <article className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border border-border-subtle bg-bg-muted p-3" key={recommendation.id}>
                  <MoviePoster
                    src={tmdbImageUrl(recommendation.item.movieMetadata?.posterPath ?? null) ?? undefined}
                    title={recommendation.item.title}
                  />
                  <div className="min-w-0 space-y-2">
                    <div>
                      <h3 className="line-clamp-2 text-card-title font-semibold uppercase tracking-[0.02em] text-text-primary">
                        {recommendation.item.title}
                      </h3>
                      <p className="metadata-label mt-1 text-text-muted">
                        {recommendation.item.movieMetadata?.releaseYear ?? "Year unknown"} | {recommendation.recommendedByParticipant.displayName}
                      </p>
                    </div>
                    <Chip className="min-h-8 bg-accent-soft/70" selected={false}>{recommendation.reason.label}</Chip>
                    {recommendation.note ? <p className="line-clamp-2 text-body-sm text-text-secondary">"{recommendation.note}"</p> : null}
                    <p className="text-body-sm font-semibold text-text-muted">{recommendationTargetText(recommendation.targets)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-text-secondary">No recommendations yet. Add the first film worth remembering.</p>
          )}
        </Card>

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
      </section>
    </main>
  );
}
