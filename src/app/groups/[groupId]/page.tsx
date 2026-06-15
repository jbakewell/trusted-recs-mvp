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
import { getCurrentParticipantForGroup, getKnownGroupsForDevice } from "@/lib/groups/session.server";
import {
  categoryFromSearchParam,
  itemTypeFromCategory,
  recommendLabel,
  type ItemCategory,
} from "@/lib/items/types";

type GroupPageProps = {
  params: Promise<{ groupId: string }>;
  searchParams?: Promise<{ type?: string | string[] }>;
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
    type: "movie" | "book";
    title: string;
    description: string | null;
    imageUrl: string | null;
    movieMetadata: {
      releaseYear: number | null;
      overview: string | null;
      posterPath: string | null;
      genres: unknown;
    } | null;
    bookMetadata: {
      authors: unknown;
      publisher: string | null;
      publishedYear: number | null;
      description: string | null;
      coverUrl: string | null;
      categories: unknown;
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

const MAX_VISIBLE_PARTICIPANTS = 4;
const PARTICIPANT_AVATAR_COLOR_COUNT = 7;

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

function participantAvatarColorSeeds(participants: ParticipantRow[]) {
  const used = new Set<number>();
  const colorSeeds = new Map<string, number>();

  participants.forEach((participant) => {
    const preferredColor = Math.abs(seedToNumber(participant.avatarSeed)) % PARTICIPANT_AVATAR_COLOR_COUNT;
    let color = preferredColor;

    for (let offset = 0; offset < PARTICIPANT_AVATAR_COLOR_COUNT; offset += 1) {
      const candidate = (preferredColor + offset) % PARTICIPANT_AVATAR_COLOR_COUNT;

      if (!used.has(candidate)) {
        color = candidate;
        break;
      }
    }

    used.add(color);
    colorSeeds.set(participant.id, color);
  });

  return colorSeeds;
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.1 13.2c.1-.4.1-.8.1-1.2s0-.8-.1-1.2l2-1.5-2-3.4-2.4 1a8 8 0 0 0-2.1-1.2L14.3 3h-4.6l-.4 2.7a8 8 0 0 0-2.1 1.2l-2.4-1-2 3.4 2 1.5c-.1.4-.1.8-.1 1.2s0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 2.1 1.2l.4 2.7h4.6l.4-2.7a8 8 0 0 0 2.1-1.2l2.4 1 2-3.4-2.1-1.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ParticipantRail({
  currentParticipantId,
  groupId,
  participants,
}: {
  currentParticipantId: string;
  groupId: string;
  participants: ParticipantRow[];
}) {
  const ordered = orderedParticipants(currentParticipantId, participants);
  const colorSeeds = participantAvatarColorSeeds(ordered);
  const visibleParticipants = ordered.slice(0, MAX_VISIBLE_PARTICIPANTS);
  const overflowCount = Math.max(ordered.length - visibleParticipants.length, 0);

  return (
    <div className="flex h-[64px] items-start justify-center gap-3 overflow-hidden" aria-label="Group participants">
      {visibleParticipants.map((participant) => {
        const isCurrent = participant.id === currentParticipantId;

        return (
          <div className="grid w-[44px] grid-rows-[44px_16px] justify-items-center gap-0.5" key={participant.id}>
            <span className="relative">
              <AvatarBadge
                name={participant.displayName}
                seed={colorSeeds.get(participant.id) ?? seedToNumber(participant.avatarSeed)}
                size="md"
              />
              {isCurrent ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-bg-surface bg-status-success"
                />
              ) : null}
            </span>
            {isCurrent ? <span className="text-[10px] font-semibold leading-4 text-text-primary">You</span> : null}
          </div>
        );
      })}
      {overflowCount > 0 ? (
        <div className="grid w-[44px] grid-rows-[44px_16px] justify-items-center gap-0.5">
          <AvatarBadge label={`+${overflowCount}`} name={`${overflowCount} more participants`} seed={7} size="md" />
        </div>
      ) : null}
      <div className="grid w-[44px] grid-rows-[44px_16px] justify-items-center gap-0.5">
        <Link
          aria-label="Group settings"
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          href={`/groups/${groupId}/manage`}
        >
          <AvatarBadge label={<SettingsIcon />} name="Group settings" seed={7} size="md" />
        </Link>
      </div>
    </div>
  );
}

function FeedTopHeader({
  activeCategory,
  canSwitchGroups,
  currentParticipantId,
  group,
}: {
  activeCategory: ItemCategory;
  canSwitchGroups: boolean;
  currentParticipantId: string;
  group: { id: string; name: string; participants: ParticipantRow[] };
}) {
  const activeItemType = itemTypeFromCategory(activeCategory);

  return (
    <div className="shrink-0 px-4 pb-3 pt-4">
      <section className="relative grid min-h-[150px] content-start gap-3 overflow-visible px-4 pb-3 pt-3">
        <Link
          aria-label={canSwitchGroups ? "Switch group" : group.name}
          className="mx-auto inline-flex min-h-9 max-w-full items-center justify-center gap-1 px-3 text-center text-[18px] font-bold leading-tight text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          href={canSwitchGroups ? "/" : `/groups/${group.id}`}
        >
          <span className="truncate">{group.name}</span>
          {canSwitchGroups ? (
            <span aria-hidden="true" className="text-[16px] leading-none text-text-muted">
              v
            </span>
          ) : null}
        </Link>
        <ParticipantRail currentParticipantId={currentParticipantId} groupId={group.id} participants={group.participants} />
        <CategorySelector activeCategory={activeCategory} groupId={group.id} itemType={activeItemType} />
      </section>
    </div>
  );
}

function CategorySelector({
  activeCategory,
  groupId,
  itemType,
}: {
  activeCategory: ItemCategory;
  groupId: string;
  itemType: "movie" | "book";
}) {
  const tabs: { category: ItemCategory; label: string }[] = [
    { category: "books", label: "Books" },
    { category: "movies", label: "Movies" },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-3">
      <div className="flex min-w-0 items-center gap-2 rounded-full bg-bg-surface/45 p-1 shadow-subtle backdrop-blur-[2px]">
        {tabs.map((tab) => {
          const active = tab.category === activeCategory;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex min-h-9 flex-1 items-center justify-center rounded-full px-3 text-caption font-bold uppercase tracking-[0.08em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
                active ? "bg-accent text-text-inverse shadow-subtle" : "text-text-primary hover:bg-bg-surface/60"
              }`}
              href={`/groups/${groupId}?type=${tab.category}`}
              key={tab.category}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <Link
        aria-label={recommendLabel(itemType)}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-[28px] font-semibold leading-none text-text-inverse shadow-subtle transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        href={`/groups/${groupId}/recommend?type=${itemType}`}
      >
        +
      </Link>
    </div>
  );
}

async function getGroupForFeed(groupId: string, activeCategory: ItemCategory) {
  const activeItemType = itemTypeFromCategory(activeCategory);
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
    where: { deletedAt: null, item: { type: activeItemType } },
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
          type: true,
          title: true,
          description: true,
          imageUrl: true,
          movieMetadata: {
            select: {
              releaseYear: true,
              overview: true,
              posterPath: true,
              genres: true,
            },
          },
          bookMetadata: {
            select: {
              authors: true,
              publisher: true,
              publishedYear: true,
              description: true,
              coverUrl: true,
              categories: true,
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

export default async function GroupPage({ params, searchParams }: GroupPageProps) {
  const { groupId } = await params;
  const resolvedSearchParams = await searchParams;
  const activeCategory = categoryFromSearchParam(resolvedSearchParams?.type);
  const currentParticipant = await getCurrentParticipantForGroup(groupId);
  const knownGroups = await getKnownGroupsForDevice();
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

  const group = await getGroupForFeed(groupId, activeCategory);

  if (!group) {
    notFound();
  }

  return (
    <WizardShell
      background={<OverprintBackground backgroundIndex={backgroundIndex} density="medium" route="group-home" />}
      header={null}
    >
      <FeedTopHeader
        activeCategory={activeCategory}
        canSwitchGroups={knownGroups.length > 1}
        currentParticipantId={currentParticipant.id}
        group={group}
      />

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
              <p className="text-body-sm text-text-secondary">
                Add the first {activeCategory === "books" ? "book" : "film"} someone should try.
              </p>
              <ButtonLink href={`/groups/${group.id}/recommend?type=${itemTypeFromCategory(activeCategory)}`}>
                {recommendLabel(itemTypeFromCategory(activeCategory))}
              </ButtonLink>
            </div>
          </div>
        )}
      </ScrollRegion>
    </WizardShell>
  );
}
