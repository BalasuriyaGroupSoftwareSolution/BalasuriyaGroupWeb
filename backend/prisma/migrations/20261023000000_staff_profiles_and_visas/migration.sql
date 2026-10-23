-- Staff roles used by the staff portal
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CONSTRUCTION_STAFF';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TOURISM_STAFF';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SOFTWARE_STAFF';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TICKET_STAFF';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'FINANCE_STAFF';

-- Construction columns the code already used but no earlier migration created
ALTER TABLE "ConstructionProject" ADD COLUMN IF NOT EXISTS "projectType" TEXT;
ALTER TABLE "ConstructionProject" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;
ALTER TABLE "ConstructionProject" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "ConstructionProject_featured_idx" ON "ConstructionProject"("featured");

-- Staff profile fields
ALTER TABLE "User" ADD COLUMN "secondaryRoles" "Role"[] DEFAULT ARRAY[]::"Role"[];
ALTER TABLE "User" ADD COLUMN "department" TEXT;
ALTER TABLE "User" ADD COLUMN "jobTitle" TEXT;
ALTER TABLE "User" ADD COLUMN "assignedDivisions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Visa applications (previously kept in a temporary file that was wiped on every deploy)
CREATE TYPE "VisaStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'DOCS_REQUIRED', 'EMBASSY_PROCESSING', 'APPROVED', 'REJECTED');

CREATE TABLE "VisaApplication" (
    "id" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryFlag" TEXT,
    "category" TEXT NOT NULL,
    "visaTypeLabel" TEXT,
    "entryType" TEXT NOT NULL DEFAULT 'SINGLE',
    "passportNumber" TEXT NOT NULL,
    "passportExpiry" TEXT,
    "passportIssueDate" TEXT,
    "nationality" TEXT,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "occupation" TEXT,
    "employerName" TEXT,
    "intendedArrivalDate" TEXT,
    "intendedDepartureDate" TEXT,
    "stayDurationDays" INTEGER,
    "destinationAddress" TEXT,
    "sponsorCompany" TEXT,
    "sponsorContact" TEXT,
    "meetingPurpose" TEXT,
    "notes" TEXT,
    "documentSummary" TEXT,
    "status" "VisaStatus" NOT NULL DEFAULT 'SUBMITTED',
    "statusNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VisaApplication_referenceNo_key" ON "VisaApplication"("referenceNo");
CREATE INDEX "VisaApplication_userEmail_idx" ON "VisaApplication"("userEmail");
CREATE INDEX "VisaApplication_status_idx" ON "VisaApplication"("status");
