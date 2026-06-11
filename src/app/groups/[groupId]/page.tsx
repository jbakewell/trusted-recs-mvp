import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { WizardShell } from "@/components/app/WizardShell";
import { FeedRecommendationCard } from "@/components/recommendations/FeedRecommendationCard";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { OverprintBackground, pickOverprintBackgroundIndex } from "@/components/visual/OverprintBackground";
import { OverprintMotif } from "@/components/visual/OverprintMotif";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";

type GroupPageProps = {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ recommended?: string }>;
};

export const dynamic = "force-dynamic";

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
  reasonSelections?: {
    reason: {
      label: string;
    };
  }[];
  item: {
    id: string;
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

function ParticipantRail({ currentParticipantId, participants }: { currentParticipantId?: string; participants: ParticipantRow[] }) {
  return (
    <div className="flex h-[70px] gap-3 overflow-x-auto pb-1" aria-label="Group participants">
      {participants.map((participant) => (
        <div className="grid min-w-10 grid-rows-[40px_18px] justify-items-center gap-1" key={participant.id}>
          <AvatarBadge name={participant.displayName} seed={seedToNumber(participant.avatarSeed)} size="md" />
          <span className="max-w-14 truncate text-[10px] font-semibold text-text-muted">
            {participant.id === currentParticipantId ? "You" : participant.displayName}
          </span>
        </div>
      ))}
    </div>
  );
}

async function getGroupForFeed(groupId: string) {
  const participantInclude = {
    where: { status: "active" as const },
    orderBy: [{ role: "asc" as const }, { createdAt: "asc" as const }],
    select: {
      id: true,
      displayName: true,
      avatarSeed: true,
      role: true,
    },
  };

  const recommendationInclude = {
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" as const },
    take: 20,
    include: {
      recommendedByParticipant: {
        select: { displayName: true, avatarSeed: true },
      },
      reason: {
        select: { label: true },
      },
      reasonSelections: {
        orderBy: { sortOrder: "asc" as const },
        include: {
          reason: {
            select: { label: true },
          },
        },
      },
      item: {
        select: {
          id: true,
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
  };

  try {
    return await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: participantInclude,
        recommendations: recommendationInclude,
      },
    });
  } catch (error) {
    console.error("Group feed rich query failed; falling back to legacy recommendation reasons.", error);

    return prisma.group.findUnique({
      where: { id: groupId },
      include: {
        participants: participantInclude,
        recommendations: {
          ...recommendationInclude,
          include: {
            recommendedByParticipant: recommendationInclude.include.recommendedByParticipant,
            reason: recommendationInclude.include.reason,
            item: recommendationInclude.include.item,
            targets: recommendationInclude.include.targets,
          },
        },
      },
    });
  }
}

export default async function GroupPage({ params, searchParams }: GroupPageProps) {
  const { groupId } = await params;
  const { recommended } = await searchParams;

  const group = await getGroupForFeed(groupId);

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
        <section className="relative grid min-h-[300px] grid-rows-[48px_70px_44px_48px_40px] gap-3 overflow-visible rounded-card border border-border-subtle surface-strong p-4">
          <div className="flex h-12 items-center justify-between gap-3">
            <p className="metadata-label text-text-muted">Private group</p>
            <ButtonLink className="min-h-9 min-w-[124px] px-3 text-[11px]" href={`/groups/${group.id}/manage`} variant="secondary">
              Manage
            </ButtonLink>
          </div>
          <ParticipantRail currentParticipantId={currentParticipant?.id} participants={group.participants} />
          {recommended ? (
            <p className="flex h-11 items-center rounded-full border border-accent bg-surface-strong px-4 text-body-sm font-semibold text-accent">
              Recommendation saved.
            </p>
          ) : null}
          {currentParticipant ? (
            <ButtonLink className="h-12 w-full" href={`/groups/${group.id}/recommend`}>
              Recommend a movie
            </ButtonLink>
          ) : (
            <p className="flex h-12 items-center text-body-sm text-text-secondary">
              Rejoin from a remembered browser or invite link to add recommendations.
            </p>
          )}
          <div className="flex h-10 gap-2 overflow-x-auto pb-1" aria-label="Recommendation filters">
            <Chip selected>All</Chip>
            <Chip>For everyone</Chip>
            <Chip>For you</Chip>
            <Chip>For later</Chip>
          </div>
        </section>
      </div>

      <ScrollRegion className="flex flex-col gap-4 px-4 pb-24 pt-4" aria-label="Recommendation feed">
        {group.recommendations.length > 0 ? (
          group.recommendations.map((recommendation: RecommendationRow) => (
            <FeedRecommendationCard groupId={group.id} key={recommendation.id} recommendation={recommendation} />
          ))
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
