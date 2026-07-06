-- Migration: Create reconciliation table
-- Date: 2025-01-XX
-- Description: Adds reconciliation table for document matching and comparison

CREATE TABLE IF NOT EXISTS `reconciliation` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NULL,
  `status` VARCHAR(20) NOT NULL,
  `sourceFileKeys` JSON NOT NULL,
  `targetFileKeys` JSON NOT NULL,
  `reconciliationType` VARCHAR(50) NOT NULL,
  `matchedCount` INT NOT NULL DEFAULT 0,
  `unmatchedCount` INT NOT NULL DEFAULT 0,
  `discrepancyCount` INT NOT NULL DEFAULT 0,
  `resultFileKey` VARCHAR(255) NULL,
  `matchingResults` JSON NULL,
  `errorMessage` TEXT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_createdAt` (`createdAt`),
  CONSTRAINT `fk_reconciliation_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for better query performance
CREATE INDEX `idx_reconciliation_type` ON `reconciliation` (`reconciliationType`);
CREATE INDEX `idx_reconciliation_user_status` ON `reconciliation` (`userId`, `status`);
