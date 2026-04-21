/*
  Warnings:

  - You are about to drop the column `billingCycle` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `nextBillingDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `serviceName` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `user_settings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `billing_cycle` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `next_payment_date` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `subscriptions` DROP FOREIGN KEY `subscriptions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_settings` DROP FOREIGN KEY `user_settings_userId_fkey`;

-- DropIndex
DROP INDEX `subscriptions_userId_fkey` ON `subscriptions`;

-- AlterTable
ALTER TABLE `subscriptions` DROP COLUMN `billingCycle`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `endDate`,
    DROP COLUMN `isArchived`,
    DROP COLUMN `nextBillingDate`,
    DROP COLUMN `paymentMethod`,
    DROP COLUMN `serviceName`,
    DROP COLUMN `startDate`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `billing_cycle` ENUM('WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `end_date` DATETIME(3) NULL,
    ADD COLUMN `is_archived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `last_paid_at` DATETIME(3) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `next_payment_date` DATETIME(3) NOT NULL,
    ADD COLUMN `payment_method` VARCHAR(191) NULL,
    ADD COLUMN `start_date` DATETIME(3) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL,
    MODIFY `amount` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `avatarUrl`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `name`,
    DROP COLUMN `provider`,
    DROP COLUMN `providerId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `email` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `user_settings`;

-- CreateTable
CREATE TABLE `notification_settings` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `default_time` VARCHAR(191) NOT NULL DEFAULT '09:00',
    `days_before` INTEGER NOT NULL DEFAULT 1,
    `on_payment_day` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_settings_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_settings` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'ko',
    `currency` VARCHAR(191) NOT NULL DEFAULT 'KRW',
    `default_view` VARCHAR(191) NOT NULL DEFAULT 'subscription',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `app_settings_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `subscriptions_user_id_is_archived_idx` ON `subscriptions`(`user_id`, `is_archived`);

-- CreateIndex
CREATE INDEX `subscriptions_next_payment_date_idx` ON `subscriptions`(`next_payment_date`);

-- AddForeignKey
ALTER TABLE `notification_settings` ADD CONSTRAINT `notification_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_settings` ADD CONSTRAINT `app_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
