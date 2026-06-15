import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { WizardShell } from "@/components/app/WizardShell";
import { PrivateGroupRejoin } from "@/components/groups/PrivateGroupRejoin";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import { OverprintBackground, pickOverprintBackgroundIndex } from "@/components/visual/OverprintBackground";
import { buildBookshopSearchUrl } from "@/lib/books/bookshop";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";
import { buildAlbumServiceLinks } from "@/lib/music/serviceLinks";
import {
  authorsText,
  categoriesText,
  genresText,
  ratingText,
  recommendationReasons,
  recommendationTargetText,
  recommenderNoteText,
  runtimeText,
} from "@/lib/recommendations/display";
import { tmdbImageUrl } from "@/lib/tmdb/movies";
import { tintForReason } from "@/lib/visual/chipTint";
import { ArchiveRecommendationButton } from "./ArchiveRecommendationButton";

type ItemDetailPageProps = {
  params: Promise<{ groupId: string; itemId: string }>;
};

export const dynamic = "force-dynamic";

function seedToNumber(seed: string) {
  return Number.parseInt(seed.slice(0, 8), 16) || 0;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

export async function getItemDetailForGroup(groupId: string, itemId: string) {
  const [group, item] = await Promise.all([
    prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, name: true, archivedAt: true },
    }),
    prisma.item.findFirst({
      where: {
        id: itemId,
        recommendations: {
          some: {
            groupId,
            deletedAt: null,
          },
        },
      },
      include: {
        movieMetadata: true,
        bookMetadata: true,
        albumMetadata: true,
        recommendations: {
          where: {
            groupId,
            deletedAt: null,
          },
          orderBy: { createdAt: "desc" },
          include: {
            recommendedByParticipant: {
              select: {
                displayName: true,
                avatarSeed: true,
              },
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
    }),
  ]);

  return group && item ? { group, item } : null;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { groupId, itemId } = await params;
  const currentParticipant = await getCurrentParticipantForGroup(groupId);
  const backgroundIndex = pickOverprintBackgroundIndex();

  if (!currentParticipant) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) {
      notFound();
    }

    return (
      <WizardShell
        background={<OverprintBackground backgroundIndex={backgroundIndex} density="medium" route="generic" />}
        header={<FixedHeader leftAction={{ href: "/", label: "Home" }} subtitle="Invite required" title="Private group" />}
      >
        <PrivateGroupRejoin title="Rejoin this group to view details" />
      </WizardShell>
    );
  }

  const detail = await getItemDetailForGroup(groupId, itemId);

  if (!detail) {
    notFound();
  }

  const { group, item } = detail;
  if (group.archivedAt) {
    return (
      <WizardShell
        background={<OverprintBackground backgroundIndex={backgroundIndex} density="medium" route="generic" />}
        header={<FixedHeader leftAction={{ href: "/", label: "Home" }} subtitle="Archived" title="Group archived" />}
      >
        <ScrollRegion className="grid content-start gap-4 p-4">
          <Card className="grid gap-2 text-center">
            <p className="metadata-label text-text-muted">Archived group</p>
            <h1 className="section-title">{group.name}</h1>
            <p className="text-body-sm text-text-secondary">This group is no longer active.</p>
          </Card>
        </ScrollRegion>
      </WizardShell>
    );
  }

  const movieMetadata = item.movieMetadata;
  const bookMetadata = item.bookMetadata;
  const albumMetadata = item.albumMetadata;
  const isBook = item.type === "book";
  const isAlbum = item.type === "album";
  const overview = isBook
    ? bookMetadata?.description ?? item.description
    : isAlbum
      ? item.description
      : movieMetadata?.overview ?? item.description;
  const metadataItems = isBook
    ? [
        authorsText(bookMetadata?.authors, 3),
        bookMetadata?.publishedYear ? String(bookMetadata.publishedYear) : null,
        bookMetadata?.publisher,
        categoriesText(bookMetadata?.categories, 2),
        bookMetadata?.pageCount ? `${bookMetadata.pageCount} pages` : null,
        bookMetadata?.language ? bookMetadata.language.toUpperCase() : null,
      ].filter(Boolean)
    : isAlbum
      ? [
          authorsText(albumMetadata?.artists, 3),
          albumMetadata?.releaseYear ? String(albumMetadata.releaseYear) : null,
          albumMetadata?.releaseDate,
          albumMetadata?.totalTracks
            ? `${albumMetadata.totalTracks} ${albumMetadata.totalTracks === 1 ? "track" : "tracks"}`
            : null,
        ].filter(Boolean)
    : [
        movieMetadata?.releaseYear ? String(movieMetadata.releaseYear) : null,
        genresText(movieMetadata?.genres, 3),
        runtimeText(movieMetadata?.runtime),
        movieMetadata?.originalLanguage ? movieMetadata.originalLanguage.toUpperCase() : null,
        ratingText(movieMetadata?.voteAverage, movieMetadata?.voteCount),
      ].filter(Boolean);
  const thumbnailSrc = isBook
    ? bookMetadata?.coverUrl ?? item.imageUrl
    : isAlbum
      ? albumMetadata?.coverImageUrl ?? item.imageUrl
    : tmdbImageUrl(movieMetadata?.posterPath ?? null) ?? item.imageUrl;
  const backCategory = isBook ? "books" : isAlbum ? "albums" : "movies";
  const itemKind = isBook ? "book" : isAlbum ? "album" : "movie";
  const bookshopUrl = isBook
    ? buildBookshopSearchUrl({
        title: item.title,
        authors: bookMetadata?.authors,
      })
    : null;
  const albumServiceLinks =
    isAlbum
      ? buildAlbumServiceLinks({
          title: item.title,
          artists: stringArray(albumMetadata?.artists),
          spotifyUrl: albumMetadata?.spotifyUrl,
          preferredMusicService: currentParticipant.preferredMusicService,
        })
      : null;

  return (
    <WizardShell
      background={<OverprintBackground backgroundIndex={backgroundIndex} density="medium" route="generic" />}
      header={
        <FixedHeader
          leftAction={{ href: `/groups/${group.id}?type=${backCategory}`, label: "Back to group" }}
          rightAction={
            <AvatarBadge
              name={currentParticipant.displayName}
              seed={seedToNumber(currentParticipant.avatarSeed)}
              size="sm"
            />
          }
          subtitle={group.name}
          title={isBook ? "Book" : isAlbum ? "Album" : "Movie"}
        />
      }
    >
      <ScrollRegion className="grid content-start gap-4 p-4">
        <Card className="grid gap-4 p-4 md:p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-4">
            <div className="min-w-0">
              <p className="metadata-label text-accent">{isBook ? "Book details" : isAlbum ? "Album details" : "Movie details"}</p>
              <h1 className="mt-2 font-display text-[34px] font-semibold uppercase leading-none tracking-[0.04em] text-text-primary">
                {item.title}
              </h1>
              <p className="metadata-label mt-3 text-text-muted">{metadataItems.join(" - ")}</p>
            </div>
            <ItemThumbnail
              aspect={isAlbum ? "square" : "portrait"}
              className="self-start"
              label={isBook || isAlbum ? "cover" : "poster"}
              size="md"
              src={thumbnailSrc ?? undefined}
              title={item.title}
            />
          </div>
          {overview ? <p className="text-body-sm text-text-secondary">{overview}</p> : null}
          {bookshopUrl ? (
            <a
              aria-label={`Find ${item.title} on Bookshop.org`}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-border-strong px-4 text-caption font-bold uppercase tracking-[0.06em] text-text-primary"
              href={bookshopUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Bookshop.org
            </a>
          ) : null}
          {albumServiceLinks ? (
            <div className="grid gap-2">
              <p className="metadata-label text-text-muted">Music links</p>
              <div className="flex flex-wrap gap-2">
                {albumServiceLinks.primary ? (
                  <a
                    aria-label={albumServiceLinks.primary.ariaLabel}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-transparent bg-accent px-4 text-caption font-bold uppercase tracking-[0.06em] text-text-inverse"
                    href={albumServiceLinks.primary.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {albumServiceLinks.primary.label}
                  </a>
                ) : null}
                {albumServiceLinks.secondary.map((link) => (
                  <a
                    aria-label={link.ariaLabel}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-border-strong px-4 text-caption font-bold uppercase tracking-[0.06em] text-text-primary"
                    href={link.url}
                    key={`${link.service}-${link.url}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        <section className="grid gap-3" aria-label={`Recommendations for this ${itemKind}`}>
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <p className="metadata-label text-accent">Group notes</p>
              <h2 className="section-title">{item.recommendations.length} recommendations</h2>
            </div>
          </div>

          {item.recommendations.map((recommendation) => {
            const reasons = recommendationReasons(recommendation);
            const canArchive =
              currentParticipant.role === "admin" || recommendation.recommendedByParticipantId === currentParticipant.id;

            return (
              <article className="rounded-card border border-border-subtle surface-strong p-4 shadow-subtle" key={recommendation.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <AvatarBadge
                      name={recommendation.recommendedByParticipant.displayName}
                      seed={seedToNumber(recommendation.recommendedByParticipant.avatarSeed)}
                      size="sm"
                    />
                    <p className="truncate text-body-sm font-semibold text-text-primary">
                      {recommendation.recommendedByParticipant.displayName}
                    </p>
                  </div>
                  <p className="shrink-0 text-caption font-semibold text-text-muted">
                    {recommendationTargetText(recommendation.targets)}
                  </p>
                </div>

                <p className="mt-3 text-body-sm text-text-secondary">
                  {recommenderNoteText(recommendation.recommendedByParticipant.displayName, recommendation.note)}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {reasons.map((reason) => (
                    <Chip key={reason} selected={false} tint={tintForReason(reason)}>
                      {reason}
                    </Chip>
                  ))}
                </div>
                {canArchive ? (
                  <div className="mt-3 flex justify-end">
                    <ArchiveRecommendationButton
                      groupId={group.id}
                      itemId={item.id}
                      itemType={itemKind}
                      recommendationId={recommendation.id}
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      </ScrollRegion>
    </WizardShell>
  );
}
