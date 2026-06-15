ALTER TYPE "ItemType" ADD VALUE IF NOT EXISTS 'book';
ALTER TYPE "ExternalSource" ADD VALUE IF NOT EXISTS 'google_books';

CREATE TABLE "book_metadata" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "google_books_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "authors" JSONB NOT NULL DEFAULT '[]',
    "publisher" TEXT,
    "published_date" TEXT,
    "published_year" INTEGER,
    "description" TEXT,
    "cover_url" TEXT,
    "page_count" INTEGER,
    "categories" JSONB NOT NULL DEFAULT '[]',
    "language" TEXT,
    "average_rating" DECIMAL(4,2),
    "ratings_count" INTEGER,
    "google_books_last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_metadata_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "book_metadata_item_id_key" ON "book_metadata"("item_id");
CREATE UNIQUE INDEX "book_metadata_google_books_id_key" ON "book_metadata"("google_books_id");

ALTER TABLE "book_metadata" ADD CONSTRAINT "book_metadata_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
