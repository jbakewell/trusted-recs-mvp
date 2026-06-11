import { notFound } from "next/navigation";
import Link from "next/link";
import { FixedHeader } from "@/components/app/FixedHeader";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { WizardShell } from "@/components/app/WizardShell";
import { PrivateGroupRejoin } from "@/components/groups/PrivateGroupRejoin";
import { FeedRecommendationCard } from "@/components/recommendations/FeedRecommendationCard";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { ButtonLink } from "@/components/ui/Button";
import { OverprintBackground, pickOverprintBackgroundIndex } from "@/components/visual/OverprintBackground";
import { OverprintMotif } from "@/components/visual/OverprintMotif";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";

type GroupPageProps = {
  params: Promise<{ groupId: string }>;
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

const MAX_VISIBLE_PARTICIPANTS = 5;

function orderedParticipants(currentParticipantId: string, participants: ParticipantRow[]) {
  return [...participants].sort((first, second) => {
    if (first.id === currentParticipantId) {
      return -1;
    }

    if (second.id === currentParticipantId) {
      return 1;
    }

    return 0;
  });
}

function ParticipantRail({ currentParticipantId, participants }: { currentParticipantId: string; participants: ParticipantRow[] }) {
  const ordered = orderedParticipants(currentParticipantId, participants);
  const visibleParticipants = ordered.slice(0, MAX_VISIBLE_PARTICIPANTS);
  const overflowCount = Math.max(ordered.length - visibleParticipants.length, 0);

  return (
    <div className="flex h-[58px] items-start justify-center gap-3 overflow-hidden" aria-label="Group participants">
      {visibleParticipants.map((participant) => {
        const isCurrent = participant.id === currentParticipantId;

        return (
          <div className="grid w-10 grid-rows-[40px_16px] justify-items-center gap-0.5" key={participant.id}>
            <span className="relative">
              <AvatarBadge name={participant.displayName} seed={seedToNumber(participant.avatarSeed)} size="md" />
              {isCurrent ? (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg-surface bg-status-success"
                />
              ) : null}
            </span>
            {isCurrent ? <span className="text-[10px] font-semibold leading-4 text-text-primary">You</span> : null}
          </div>
        );
      })}
      {overflowCount > 0 ? (
        <div className="grid w-10 grid-rows-[40px_16px] justify-items-center gap-0.5">
          <span
            aria-label={`${overflowCount} more participants`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-avatar-paper text-body-sm font-bold tracking-[0.02em] text-text-primary"
            title={`${overflowCount} more participants`}
          >
            +{overflowCount}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function FeedTopHeader({
  currentParticipantId,
  group,
}: {
  currentParticipantId: string;
  group: { id: string; name: string; participants: ParticipantRow[] };
}) {
  return (
    <div className="shrink-0 px-4 pb-3 pt-4">
      <section className="relative grid min-h-[176px] content-start gap-3 overflow-hidden rounded-t-[30px] rounded-b-card border border-border-subtle surface-strong px-4 pb-4 pt-3 shadow-subtle">
        <Link
          aria-label={`Manage ${group.name}`}
          className="mx-auto inline-flex min-h-9 max-w-full items-center justify-center gap-1 px-3 text-center text-[18px] font-bold leading-tight text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          href={`/groups/${group.id}/manage`}
        >
          <span className="truncate">{group.name}</span>
          <span aria-hidden="true" className="text-[16px] leading-none text-text-muted">
            v
          </span>
        </Link>
        <ParticipantRail currentParticipantId={currentParticipantId} participants={group.participants} />
        <ButtonLink className="h-11 min-h-11 w-full" href={`/groups/${group.id}/recommend`}>
          Recommend a movie
        </ButtonLink>
      </section>
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

async function groupExists(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true },
  });

  return Boolean(group);
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params;
  const currentParticipant = await getCurrentParticipantForGroup(groupId);
  const backgroundIndex = pickOverprintBackgroundIndex();

  if (!currentParticipant) {
    if (!(await groupExists(groupId))) {
      notFound();
    }

    return (
      <WizardShell
        background={<OverprintBackground backgroundIndex={backgroundIndex} density="medium" route="group-home" />}
        header={<FixedHeader leftAction={{ href: "/", label: "Home" }} subtitle="Invite required" title="Private group" />}
      >
        <PrivateGroupRejoin />
      </WizardShell>
    );
  }

  const group = await getGroupForFeed(groupId);

  if (!group) {
    notFound();
  }

  return (
    <WizardShell
      background={<OverprintBackground backgroundIndex={backgroundIndex} density="medium" route="group-home" />}
      header={null}
    >
      <FeedTopHeader currentParticipantId={currentParticipant.id} group={group} />

      <ScrollRegion className="flex flex-col gap-3 px-4 pb-24 pt-0" aria-label="Recommendation feed">
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
              <ButtonLink href={`/groups/${group.id}/recommend`}>
                Recommend a movie
              </ButtonLink>
            </div>
          </div>
        )}
      </ScrollRegion>
    </WizardShell>
  );
}
