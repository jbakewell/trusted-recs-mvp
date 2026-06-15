CREATE TYPE "MusicService" AS ENUM ('spotify', 'apple_music', 'youtube_music', 'amazon_music', 'bandcamp', 'none');

ALTER TABLE "participants"
ADD COLUMN "preferred_music_service" "MusicService" NOT NULL DEFAULT 'none';
