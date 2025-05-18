/*
  Warnings:

  - You are about to drop the column `preferences` on the `User` table. All the data in the column will be lost.
  - Added the required column `interests` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyEnv` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academic` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "preferences",
ADD COLUMN     "interests" TEXT NOT NULL,
ADD COLUMN     "studyEnv" TEXT NOT NULL,
DROP COLUMN "academic",
ADD COLUMN     "academic" INTEGER NOT NULL;
