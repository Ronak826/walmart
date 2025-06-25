-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'BUSY', 'HELPING');

-- CreateEnum
CREATE TYPE "HelpStatus" AS ENUM ('PENDING', 'ACCEPTED', 'RESOLVED');

-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpRequest" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "helperId" INTEGER,
    "issue" TEXT NOT NULL,
    "status" "HelpStatus" NOT NULL DEFAULT 'PENDING',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_email_key" ON "Driver"("email");

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
