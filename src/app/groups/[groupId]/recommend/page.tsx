import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandMark";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/db/prisma";
import { hashToken, SESSION_COOKIE_NAME } from "@/lib/groups/session";
import { RecommendMovieForm } from "./RecommendMovieForm";

type RecommendPageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function RecommendPage({ params }: RecommendPageProps) {
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
        select: {
          id: true,
          displayName: true,
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

  const reasons = await prisma.recommendationReason.findMany({
    where: { active: true },
    orderBy: [{ genreKey: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      label: true,
      genreKey: true,
      sortOrder: true,
    },
  });

  const targetParticipants = group.participants.filter((participant) => participant.id !== currentParticipant?.id);

  return (
    <main className="main-container">
      <section className="mx-auto grid max-w-3xl gap-5">
        <div className="grid gap-4 pt-4 sm:flex sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="metadata-label text-text-secondary">Recommend a movie</p>
              <p className="text-body-sm text-text-secondary">{group.name}</p>
            </div>
          </div>
          <ButtonLink className="w-full sm:w-fit" href={`/groups/${group.id}`} variant="secondary">
            Back to group
          </ButtonLink>
        </div>

        {currentParticipant ? (
          <RecommendMovieForm groupId={group.id} participants={targetParticipants} reasons={reasons} />
        ) : (
          <Card className="grid gap-3">
            <p className="metadata-label text-text-muted">Session needed</p>
            <h1 className="section-title">Rejoin this group to recommend movies</h1>
            <p className="text-body-sm text-text-secondary">
              Recommendations are available to active group participants. Open your invite link or return from the
              browser where you created the group.
            </p>
          </Card>
        )}
      </section>
    </main>
  );
}
