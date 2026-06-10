CREATE TABLE "recommendation_reason_selections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recommendation_id" UUID NOT NULL,
    "reason_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_reason_selections_pkey" PRIMARY KEY ("id")
);

INSERT INTO "recommendation_reason_selections" ("recommendation_id", "reason_id", "sort_order")
SELECT "id", "reason_id", 0
FROM "recommendations";

CREATE UNIQUE INDEX "recommendation_reason_selections_recommendation_id_reason_id_key"
ON "recommendation_reason_selections"("recommendation_id", "reason_id");

CREATE INDEX "recommendation_reason_selections_reason_id_idx"
ON "recommendation_reason_selections"("reason_id");

ALTER TABLE "recommendation_reason_selections"
ADD CONSTRAINT "recommendation_reason_selections_recommendation_id_fkey"
FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recommendation_reason_selections"
ADD CONSTRAINT "recommendation_reason_selections_reason_id_fkey"
FOREIGN KEY ("reason_id") REFERENCES "recommendation_reasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
