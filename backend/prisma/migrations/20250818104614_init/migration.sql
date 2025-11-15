-- CreateTable
CREATE TABLE `games` (
    `id` VARCHAR(191) NOT NULL,
    `game_date` DATETIME(3) NOT NULL,
    `opponent` VARCHAR(191) NOT NULL,
    `dragons_score` INTEGER NOT NULL,
    `opponent_score` INTEGER NOT NULL,
    `result` ENUM('win', 'lose', 'draw') NOT NULL,
    `stadium` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
