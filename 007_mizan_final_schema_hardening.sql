-- MIZAN ANZAN — Migration 007
-- Final schema hardening for the current registration/result architecture.
-- Non-destructive. Run once against the SAME database configured in includes/db.php.

SET NAMES utf8mb4;
SET @db := DATABASE();

-- Genius identity columns introduced after the original 001 schema.
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='anzan_profiles' AND COLUMN_NAME='genius_code')=0,
  'ALTER TABLE anzan_profiles ADD COLUMN genius_code VARCHAR(40) NULL AFTER anz_id', 'SELECT 1');
PREPARE m FROM @sql; EXECUTE m; DEALLOCATE PREPARE m;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='anzan_profiles' AND COLUMN_NAME='display_name_en')=0,
  'ALTER TABLE anzan_profiles ADD COLUMN display_name_en VARCHAR(180) NULL', 'SELECT 1');
PREPARE m FROM @sql; EXECUTE m; DEALLOCATE PREPARE m;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='anzan_profiles' AND COLUMN_NAME='country_code')=0,
  'ALTER TABLE anzan_profiles ADD COLUMN country_code CHAR(2) NULL', 'SELECT 1');
PREPARE m FROM @sql; EXECUTE m; DEALLOCATE PREPARE m;

UPDATE anzan_profiles
SET genius_code = COALESCE(NULLIF(genius_code,''), NULLIF(anz_id,''), NULLIF(legacy_code,''))
WHERE (genius_code IS NULL OR genius_code='') AND role='student';

-- Account / entity foundation.
CREATE TABLE IF NOT EXISTS mizan_entities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  entity_code VARCHAR(40) NOT NULL,
  entity_type VARCHAR(40) NOT NULL DEFAULT 'organization',
  entity_name VARCHAR(200) NOT NULL,
  display_name_en VARCHAR(200) NULL,
  country VARCHAR(100) NULL,
  country_code CHAR(2) NULL,
  region VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  parent_entity_id BIGINT UNSIGNED NULL,
  status ENUM('active','suspended','archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mizan_entity_code (entity_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mizan_branches (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  entity_id BIGINT UNSIGNED NOT NULL,
  branch_code VARCHAR(40) NOT NULL,
  branch_name VARCHAR(200) NOT NULL,
  country VARCHAR(100) NULL,
  country_code CHAR(2) NULL,
  region VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  status ENUM('active','suspended','archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mizan_branch_code (branch_code),
  KEY idx_mizan_branch_entity (entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mizan_accounts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  access_code VARCHAR(40) NOT NULL,
  role ENUM('parent','coach','entity_manager','admin') NOT NULL,
  full_name VARCHAR(180) NOT NULL,
  display_name_en VARCHAR(180) NULL,
  country VARCHAR(100) NULL,
  country_code CHAR(2) NULL,
  entity_id BIGINT UNSIGNED NULL,
  branch_id BIGINT UNSIGNED NULL,
  status ENUM('pending','active','suspended','revoked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mizan_account_code (access_code),
  KEY idx_mizan_account_role_status (role,status),
  KEY idx_mizan_account_entity (entity_id),
  KEY idx_mizan_account_branch (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mizan_relationships (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  account_id BIGINT UNSIGNED NOT NULL,
  genius_profile_id BIGINT UNSIGNED NOT NULL,
  relationship_type ENUM('parent_genius','coach_genius','entity_genius') NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  branch_id BIGINT UNSIGNED NULL,
  status ENUM('pending','active','revoked','expired') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  revoked_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mizan_relationship (account_id,genius_profile_id,relationship_type),
  KEY idx_mizan_rel_genius_status (genius_profile_id,status),
  KEY idx_mizan_rel_account_status (account_id,status),
  KEY idx_mizan_rel_entity_branch (entity_id,branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Compatibility columns for legacy installations.
SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_entities' AND COLUMN_NAME='country_code')=0,
  'ALTER TABLE mizan_entities ADD COLUMN country_code CHAR(2) NULL', 'SELECT 1');
PREPARE m FROM @sql; EXECUTE m; DEALLOCATE PREPARE m;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_branches' AND COLUMN_NAME='country_code')=0,
  'ALTER TABLE mizan_branches ADD COLUMN country_code CHAR(2) NULL', 'SELECT 1');
PREPARE m FROM @sql; EXECUTE m; DEALLOCATE PREPARE m;

SET @sql := IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='country_code')=0,
  'ALTER TABLE mizan_accounts ADD COLUMN country_code CHAR(2) NULL', 'SELECT 1');
PREPARE m FROM @sql; EXECUTE m; DEALLOCATE PREPARE m;

UPDATE mizan_entities SET country_code=UPPER(TRIM(country)) WHERE (country_code IS NULL OR country_code='') AND country REGEXP '^[A-Za-z]{2}$';
UPDATE mizan_branches SET country_code=UPPER(TRIM(country)) WHERE (country_code IS NULL OR country_code='') AND country REGEXP '^[A-Za-z]{2}$';
UPDATE mizan_accounts SET country_code=UPPER(TRIM(country)) WHERE (country_code IS NULL OR country_code='') AND country REGEXP '^[A-Za-z]{2}$';
