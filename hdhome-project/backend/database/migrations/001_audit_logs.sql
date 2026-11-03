-- ============================================================
-- Audit Log (nhật ký thao tác)
-- ============================================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `audit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `role_name` VARCHAR(50) DEFAULT NULL,
  `action` VARCHAR(50) NOT NULL,
  `entity` VARCHAR(50) DEFAULT NULL,
  `entity_id` VARCHAR(50) DEFAULT NULL,
  `method` VARCHAR(10) DEFAULT NULL,
  `path` VARCHAR(255) DEFAULT NULL,
  `status_code` INT DEFAULT NULL,
  `ip_address` VARCHAR(64) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `payload` JSON DEFAULT NULL,
  `message` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_entity` (`entity`, `entity_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
