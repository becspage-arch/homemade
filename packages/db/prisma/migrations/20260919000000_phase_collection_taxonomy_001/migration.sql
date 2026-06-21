-- CreateEnum
CREATE TYPE "CollectionAxis" AS ENUM ('OCCASION', 'SEASON', 'STYLE', 'SUBJECT');

-- CreateEnum
CREATE TYPE "TaggableType" AS ENUM ('TUTORIAL', 'CROSS_STITCH_PATTERN', 'CROCHET_PATTERN', 'NEEDLEWORK_PATTERN', 'KNITTING_PATTERN', 'SEWING_PATTERN');

-- CreateEnum
CREATE TYPE "CollectionTagSource" AS ENUM ('AUTHORED', 'DERIVED', 'VISION', 'BACKFILL', 'MANUAL');

-- CreateTable
CREATE TABLE "CollectionTag" (
    "id" TEXT NOT NULL,
    "axis" "CollectionAxis" NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "taggerGuidance" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isThemePage" BOOLEAN NOT NULL DEFAULT false,
    "heroMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionTagAssignment" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "contentType" "TaggableType" NOT NULL,
    "contentId" TEXT NOT NULL,
    "source" "CollectionTagSource" NOT NULL DEFAULT 'AUTHORED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionTagAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CollectionTag_slug_key" ON "CollectionTag"("slug");

-- CreateIndex
CREATE INDEX "CollectionTag_axis_order_idx" ON "CollectionTag"("axis", "order");

-- CreateIndex
CREATE INDEX "CollectionTagAssignment_contentType_contentId_idx" ON "CollectionTagAssignment"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "CollectionTagAssignment_tagId_idx" ON "CollectionTagAssignment"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionTagAssignment_tagId_contentType_contentId_key" ON "CollectionTagAssignment"("tagId", "contentType", "contentId");

-- AddForeignKey
ALTER TABLE "CollectionTag" ADD CONSTRAINT "CollectionTag_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CollectionTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTagAssignment" ADD CONSTRAINT "CollectionTagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "CollectionTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
