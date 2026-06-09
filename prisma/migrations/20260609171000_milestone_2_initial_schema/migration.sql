-- Milestone 2 initial schema for Neon Postgres.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "ParticipantRole" AS ENUM ('admin', 'member');
CREATE TYPE "ParticipantStatus" AS ENUM ('active', 'removed');
CREATE TYPE "InviteStatus" AS ENUM ('active', 'revoked');
CREATE TYPE "ItemType" AS ENUM ('movie');
CREATE TYPE "ExternalSource" AS ENUM ('tmdb');
CREATE TYPE "SpoilerRisk" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "RecommendationVisibility" AS ENUM ('group');
CREATE TYPE "RecommendationTargetType" AS ENUM ('group', 'participant', 'later');
CREATE TYPE "ReactionType" AS ENUM ('want_to_watch', 'maybe', 'seen', 'loved', 'not_for_me');

CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(80) NOT NULL,
    "created_by_participant_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),
    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "account_id" UUID,
    "display_name" VARCHAR(40) NOT NULL,
    "avatar_seed" VARCHAR(80) NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'member',
    "status" "ParticipantStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invite_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "participant_id" UUID NOT NULL,
    "session_token_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "ItemType" NOT NULL DEFAULT 'movie',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "external_source" "ExternalSource" NOT NULL,
    "external_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "movie_metadata" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT,
    "release_date" DATE,
    "release_year" INTEGER,
    "overview" TEXT,
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "runtime" INTEGER,
    "genres" JSONB NOT NULL DEFAULT '[]',
    "original_language" TEXT,
    "popularity" DECIMAL(10,3),
    "vote_average" DECIMAL(4,2),
    "vote_count" INTEGER,
    "tmdb_last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movie_metadata_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recommendation_reasons" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(80) NOT NULL,
    "category" VARCHAR(40),
    "genre_key" VARCHAR(40),
    "sort_order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "spoiler_risk" "SpoilerRisk" NOT NULL DEFAULT 'low',
    "family_safe" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recommendation_reasons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "recommended_by_participant_id" UUID NOT NULL,
    "reason_id" TEXT NOT NULL,
    "note" VARCHAR(280),
    "visibility" "RecommendationVisibility" NOT NULL DEFAULT 'group',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recommendation_targets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recommendation_id" UUID NOT NULL,
    "target_type" "RecommendationTargetType" NOT NULL,
    "participant_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recommendation_targets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "recommendation_targets_target_check" CHECK (
        ("target_type" = 'participant' AND "participant_id" IS NOT NULL)
        OR ("target_type" IN ('group', 'later') AND "participant_id" IS NULL)
    )
);

CREATE TABLE "reactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recommendation_id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "reaction_type" "ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");
CREATE INDEX "participants_group_id_idx" ON "participants"("group_id");
CREATE INDEX "participants_account_id_idx" ON "participants"("account_id");
CREATE UNIQUE INDEX "invite_links_token_hash_key" ON "invite_links"("token_hash");
CREATE INDEX "invite_links_group_id_idx" ON "invite_links"("group_id");
CREATE INDEX "invite_links_participant_id_idx" ON "invite_links"("participant_id");
CREATE UNIQUE INDEX "invite_links_participant_id_active_key" ON "invite_links"("participant_id") WHERE "status" = 'active';
CREATE UNIQUE INDEX "sessions_session_token_hash_key" ON "sessions"("session_token_hash");
CREATE INDEX "sessions_participant_id_idx" ON "sessions"("participant_id");
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");
CREATE UNIQUE INDEX "items_type_external_source_external_id_key" ON "items"("type", "external_source", "external_id");
CREATE UNIQUE INDEX "movie_metadata_item_id_key" ON "movie_metadata"("item_id");
CREATE UNIQUE INDEX "movie_metadata_tmdb_id_key" ON "movie_metadata"("tmdb_id");
CREATE INDEX "recommendation_reasons_genre_key_sort_order_idx" ON "recommendation_reasons"("genre_key", "sort_order");
CREATE INDEX "recommendation_reasons_active_spoiler_risk_idx" ON "recommendation_reasons"("active", "spoiler_risk");
CREATE INDEX "recommendations_group_id_created_at_idx" ON "recommendations"("group_id", "created_at");
CREATE INDEX "recommendations_item_id_idx" ON "recommendations"("item_id");
CREATE INDEX "recommendations_recommended_by_participant_id_idx" ON "recommendations"("recommended_by_participant_id");
CREATE INDEX "recommendation_targets_recommendation_id_idx" ON "recommendation_targets"("recommendation_id");
CREATE INDEX "recommendation_targets_participant_id_idx" ON "recommendation_targets"("participant_id");
CREATE UNIQUE INDEX "reactions_recommendation_id_participant_id_key" ON "reactions"("recommendation_id", "participant_id");
CREATE INDEX "reactions_participant_id_idx" ON "reactions"("participant_id");

ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_participant_id_fkey" FOREIGN KEY ("created_by_participant_id") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "participants" ADD CONSTRAINT "participants_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "participants" ADD CONSTRAINT "participants_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "movie_metadata" ADD CONSTRAINT "movie_metadata_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_recommended_by_participant_id_fkey" FOREIGN KEY ("recommended_by_participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "recommendation_reasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recommendation_targets" ADD CONSTRAINT "recommendation_targets_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recommendation_targets" ADD CONSTRAINT "recommendation_targets_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
