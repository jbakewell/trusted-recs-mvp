import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { InvitePanel } from "./InvitePanel";
import { prisma } from "@/lib/db/prisma";
import { hashToken, SESSION_COOKIE_NAME } from "@/lib/groups/session";

type GroupPageProps = {
  params: Promise<{ groupId: string }>;
};

type ParticipantRow = {
  id: string;
  displayName: string;
  avatarSeed: string;
  role: "admin" | "member";
  inviteLinks?: { status: "active" | "revoked" }[];
};

function seedToNumber(seed: string) {
  return Number.parseInt(seed.slice(0, 8), 16) || 0;
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params;
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
              <p className="metadata-label text-text-muted">Movie search</p>
              <h2 className="section-title">Find a film from TMDB</h2>
              <p className="text-body-sm text-text-secondary">
                Search movie posters, years, and overviews before the recommendation flow is added.
              </p>
            </div>
            <ButtonLink className="w-full sm:w-fit" href={`/groups/${group.id}/movies/search`}>
              Find a movie
            </ButtonLink>
          </Card>
        ) : null}

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
