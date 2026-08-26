-- MIZAN ANZAN — Migration 006
-- Registration schema hardening for existing installations.
-- Purpose: repair/complete the identity tables required by coach, parent and entity registration.
-- Safe approach: create missing tables, then add missing columns using INFORMATION_SCHEMA checks.
-- Run once on the SAME database used by includes/db.php.

SET NAMES utf8mb4;
SET @db := DATABASE();

-- Entity table
CREATE TABLE IF NOT EXISTS mizan_entities (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    entity_code VARCHAR(40) NOT NULL,
    entity_type VARCHAR(40) NOT NULL DEFAULT 'organization',
    entity_name VARCHAR(200) NOT NULL,
    display_name_en VARCHAR(200) NULL,
    country VARCHAR(100) NULL,
    region VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    parent_entity_id BIGINT UNSIGNED NULL,
    status ENUM('active','suspended','archived') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_mizan_entity_code (entity_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Branch table
CREATE TABLE IF NOT EXISTS mizan_branches (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    entity_id BIGINT UNSIGNED NOT NULL,
    branch_code VARCHAR(40) NOT NULL,
    branch_name VARCHAR(200) NOT NULL,
    country VARCHAR(100) NULL,
    region VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    status ENUM('active','suspended','archived') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_mizan_branch_code (branch_code),
    KEY idx_mizan_branch_entity (entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Account table
CREATE TABLE IF NOT EXISTS mizan_accounts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    access_code VARCHAR(40) NOT NULL,
    role ENUM('parent','coach','entity_manager','admin') NOT NULL,
    full_name VARCHAR(180) NOT NULL,
    display_name_en VARCHAR(180) NULL,
    country VARCHAR(100) NULL,
    entity_id BIGINT UNSIGNED NULL,
    branch_id BIGINT UNSIGNED NULL,
    status ENUM('pending','active','suspended','revoked') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_mizan_account_code (access_code),
    KEY idx_mizan_account_role_status (role,status),
    KEY idx_mizan_account_entity (entity_id),
    KEY idx_mizan_account_branch (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add missing columns to legacy installations.
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_entities' AND COLUMN_NAME='display_name_en')=0,
    'ALTER TABLE mizan_entities ADD COLUMN display_name_en VARCHAR(200) NULL AFTER entity_name', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_entities' AND COLUMN_NAME='country')=0,
    'ALTER TABLE mizan_entities ADD COLUMN country VARCHAR(100) NULL AFTER display_name_en', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_entities' AND COLUMN_NAME='status')=0,
    'ALTER TABLE mizan_entities ADD COLUMN status ENUM(''active'',''suspended'',''archived'') NOT NULL DEFAULT ''active''', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='display_name_en')=0,
    'ALTER TABLE mizan_accounts ADD COLUMN display_name_en VARCHAR(180) NULL AFTER full_name', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='country')=0,
    'ALTER TABLE mizan_accounts ADD COLUMN country VARCHAR(100) NULL AFTER display_name_en', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='entity_id')=0,
    'ALTER TABLE mizan_accounts ADD COLUMN entity_id BIGINT UNSIGNED NULL', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='branch_id')=0,
    'ALTER TABLE mizan_accounts ADD COLUMN branch_id BIGINT UNSIGNED NULL', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='status')=0,
    'ALTER TABLE mizan_accounts ADD COLUMN status ENUM(''pending'',''active'',''suspended'',''revoked'') NOT NULL DEFAULT ''active''', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Global ISO country columns.
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='country_code')=0,
    'ALTER TABLE mizan_accounts ADD COLUMN country_code CHAR(2) NULL', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_entities' AND COLUMN_NAME='country_code')=0,
    'ALTER TABLE mizan_entities ADD COLUMN country_code CHAR(2) NULL', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_branches' AND COLUMN_NAME='country_code')=0,
    'ALTER TABLE mizan_branches ADD COLUMN country_code CHAR(2) NULL', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Compatibility for existing account role definitions that lack entity_manager.
SET @role_type := (SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='role' LIMIT 1);
SET @sql := IF(@role_type IS NOT NULL AND @role_type LIKE 'enum%' AND @role_type NOT LIKE '%entity_manager%',
    'ALTER TABLE mizan_accounts MODIFY role ENUM(''parent'',''coach'',''entity_manager'',''admin'') NOT NULL', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Backfill ISO values when legacy country already stores a two-letter code.
UPDATE mizan_accounts SET country_code=UPPER(TRIM(country)) WHERE (country_code IS NULL OR country_code='') AND country REGEXP '^[A-Za-z]{2}$';
UPDATE mizan_entities SET country_code=UPPER(TRIM(country)) WHERE (country_code IS NULL OR country_code='') AND country REGEXP '^[A-Za-z]{2}$';
UPDATE mizan_branches SET country_code=UPPER(TRIM(country)) WHERE (country_code IS NULL OR country_code='') AND country REGEXP '^[A-Za-z]{2}$';
