import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { WizardShell } from "@/components/app/WizardShell";
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
    <WizardShell
      header={<FixedHeader leftAction={{ href: `/groups/${group.id}`, label: "Back to group" }} subtitle={group.name} title="Choose a movie" />}
    >
      {currentParticipant ? (
        <MovieSearchForm />
      ) : (
        <div className="p-4">
          <Card className="grid gap-3">
            <p className="metadata-label text-text-muted">Session needed</p>
            <h1 className="section-title">Rejoin this group to search movies</h1>
            <p className="text-body-sm text-text-secondary">
              Movie search is available to active group participants. Open your invite link or return from the browser
              where you created the group.
            </p>
          </Card>
        </div>
      )}
    </WizardShell>
  );
}
