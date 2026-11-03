-- HDHOME Database Schema
-- Tự sinh từ analysis của backend code

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Roles
-- ============================================================
CREATE TABLE IF NOT EXISTS `roles` (
  `role_id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `employee_id` INT DEFAULT NULL,
  `role_id` INT NOT NULL,
  `status` ENUM('ACTIVE','LOCKED') DEFAULT 'ACTIVE',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_role_id` (`role_id`),
  KEY `idx_employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Customers
-- ============================================================
CREATE TABLE IF NOT EXISTS `customers` (
  `customer_id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_customer_phone` (`phone`),
  KEY `idx_full_name` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Investors
-- ============================================================
CREATE TABLE IF NOT EXISTS `investors` (
  `investor_id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `organization` VARCHAR(200) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_investor_phone` (`phone`),
  KEY `idx_full_name` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Employees
-- ============================================================
CREATE TABLE IF NOT EXISTS `employees` (
  `employee_id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_code` VARCHAR(50) UNIQUE,
  `full_name` VARCHAR(150) NOT NULL,
  `position` VARCHAR(100) DEFAULT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `status` ENUM('ACTIVE','INACTIVE','LEAVE') DEFAULT 'ACTIVE',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Materials
-- ============================================================
CREATE TABLE IF NOT EXISTS `materials` (
  `material_id` INT AUTO_INCREMENT PRIMARY KEY,
  `material_code` VARCHAR(50) UNIQUE,
  `material_name` VARCHAR(150) NOT NULL,
  `unit` VARCHAR(30) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Projects
-- ============================================================
CREATE TABLE IF NOT EXISTS `projects` (
  `project_id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_code` VARCHAR(50) UNIQUE,
  `project_name` VARCHAR(255) NOT NULL,
  `customer_id` INT DEFAULT NULL,
  `investor_id` INT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `expected_end_date` DATE DEFAULT NULL,
  `actual_end_date` DATE DEFAULT NULL,
  `status` ENUM('PLANNING','IN_PROGRESS','PAUSED','COMPLETED','CANCELLED') DEFAULT 'PLANNING',
  `progress` INT DEFAULT 0,
  `featured` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_investor_id` (`investor_id`),
  KEY `idx_status` (`status`),
  KEY `idx_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Contracts
-- ============================================================
CREATE TABLE IF NOT EXISTS `contracts` (
  `contract_id` INT AUTO_INCREMENT PRIMARY KEY,
  `contract_number` VARCHAR(50) UNIQUE,
  `project_id` INT NOT NULL,
  `customer_id` INT DEFAULT NULL,
  `investor_id` INT DEFAULT NULL,
  `signed_date` DATE DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `contract_value` DECIMAL(15,2) DEFAULT 0,
  `status` ENUM('DRAFT','SIGNED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'DRAFT',
  `note` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_project_id` (`project_id`),
  KEY `idx_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Contact Requests
-- ============================================================
CREATE TABLE IF NOT EXISTS `contact_requests` (
  `contact_id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('NEW','CONTACTED','CLOSED') DEFAULT 'NEW',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_contact_phone_subject` (`phone`, `subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Project Employees (assignment)
-- ============================================================
CREATE TABLE IF NOT EXISTS `project_employees` (
  `project_employee_id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `employee_id` INT NOT NULL,
  `role_in_project` VARCHAR(100) DEFAULT NULL,
  `assigned_date` DATE DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  UNIQUE KEY `uq_project_employee` (`project_id`, `employee_id`),
  KEY `idx_employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Project Materials
-- ============================================================
CREATE TABLE IF NOT EXISTS `project_materials` (
  `project_material_id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `material_id` INT NOT NULL,
  `quantity` DECIMAL(15,2) DEFAULT 0,
  `note` TEXT DEFAULT NULL,
  UNIQUE KEY `uq_project_material` (`project_id`, `material_id`),
  KEY `idx_material_id` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Progress Updates
-- ============================================================
CREATE TABLE IF NOT EXISTS `progress_updates` (
  `update_id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `progress_percent` INT NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `image_path` VARCHAR(500) DEFAULT NULL,
  `updated_by` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_progress_project_title` (`project_id`, `title`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_updated_by` (`updated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Project Files
-- ============================================================
CREATE TABLE IF NOT EXISTS `project_files` (
  `file_id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) DEFAULT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_type` VARCHAR(50) DEFAULT 'DRAWING',
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `file_size` BIGINT DEFAULT 0,
  `uploaded_by` INT NOT NULL,
  `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_project_id` (`project_id`),
  KEY `idx_uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Project Images
-- ============================================================
CREATE TABLE IF NOT EXISTS `project_images` (
  `image_id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `image_path` VARCHAR(500) NOT NULL,
  `uploaded_by` INT NOT NULL,
  `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
