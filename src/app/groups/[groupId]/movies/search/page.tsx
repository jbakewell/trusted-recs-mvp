import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandMark";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/db/prisma";
import { hashToken, SESSION_COOKIE_NAME } from "@/lib/groups/session";
import { MovieSearchForm } from "./MovieSearchForm";

type MovieSearchPageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function MovieSearchPage({ params }: MovieSearchPageProps) {
  const { groupId } = await params;
  const cookieStore = await cookies();
  const rawSessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const sessionTokenHash = rawSessionToken ? hashToken(rawSessionToken) : null;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true },
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
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="metadata-label text-text-secondary">Movie search</p>
              <p className="text-body-sm text-text-secondary">{group.name}</p>
            </div>
          </div>
          <ButtonLink className="w-full sm:w-fit" href={`/groups/${group.id}`} variant="secondary">
            Back to group
          </ButtonLink>
        </div>

        {currentParticipant ? (
          <MovieSearchForm />
        ) : (
          <Card className="grid gap-3">
            <p className="metadata-label text-text-muted">Session needed</p>
            <h1 className="section-title">Rejoin this group to search movies</h1>
            <p className="text-body-sm text-text-secondary">
              Movie search is available to active group participants. Open your invite link or return from the browser
              where you created the group.
            </p>
          </Card>
        )}
      </section>
    </main>
  );
}
