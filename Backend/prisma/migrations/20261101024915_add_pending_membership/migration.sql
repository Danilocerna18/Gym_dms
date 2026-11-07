-- AlterEnum
ALTER TYPE "AccessResult" ADD VALUE 'denied_pending';

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "activatedById" TEXT,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_activatedById_fkey" FOREIGN KEY ("activatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

