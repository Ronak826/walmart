/*
  Warnings:

  - You are about to drop the column `phoneno` on the `Driver` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "phoneno",
ADD COLUMN     "phoneNo" INTEGER,
ADD COLUMN     "vehicleNo" TEXT;
