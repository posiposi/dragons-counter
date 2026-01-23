/*
  Warnings:

  - You are about to drop the column `stadium` on the `games` table. All the data in the column will be lost.
  - Added the required column `stadium_id` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `games` DROP COLUMN `stadium`,
    ADD COLUMN `stadium_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `games` ADD CONSTRAINT `games_stadium_id_fkey` FOREIGN KEY (`stadium_id`) REFERENCES `stadiums`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
