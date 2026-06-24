-- AlterTable
ALTER TABLE "Stitch" ADD COLUMN "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[];
