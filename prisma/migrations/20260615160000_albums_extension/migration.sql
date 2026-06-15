ALTER TYPE "ItemType" ADD VALUE IF NOT EXISTS 'album';
ALTER TYPE "ExternalSource" ADD VALUE IF NOT EXISTS 'spotify';

CREATE TABLE "album_metadata" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "spotify_album_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artists" JSONB NOT NULL DEFAULT '[]',
    "release_date" TEXT,
    "release_year" INTEGER,
    "cover_image_url" TEXT,
    "total_tracks" INTEGER,
    "spotify_url" TEXT,
    "spotify_last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "album_metadata_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "album_metadata_item_id_key" ON "album_metadata"("item_id");
CREATE UNIQUE INDEX "album_metadata_spotify_album_id_key" ON "album_metadata"("spotify_album_id");

ALTER TABLE "album_metadata"
ADD CONSTRAINT "album_metadata_item_id_fkey"
FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
