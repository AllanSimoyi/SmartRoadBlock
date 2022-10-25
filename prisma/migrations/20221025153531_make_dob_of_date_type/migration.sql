/*
  Warnings:

  - You are about to alter the column `dob` on the `Driver` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `Driver` MODIFY `dob` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
