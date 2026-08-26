-- MIZAN ANZAN — Migration 005
-- Global Country Identity / ISO 3166-1 alpha-2
-- Compatible/idempotent implementation for common MySQL/MariaDB hosting.

SET NAMES utf8mb4;

SET @db := DATABASE();

-- anzan_profiles.country_code
SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='anzan_profiles' AND COLUMN_NAME='country_code')=0,
  'ALTER TABLE anzan_profiles ADD COLUMN country_code CHAR(2) NULL AFTER country',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- mizan_accounts.country_code
SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='country_code')=0,
  'ALTER TABLE mizan_accounts ADD COLUMN country_code CHAR(2) NULL AFTER country',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- mizan_entities.country_code
SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_entities' AND COLUMN_NAME='country_code')=0,
  'ALTER TABLE mizan_entities ADD COLUMN country_code CHAR(2) NULL AFTER country',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- mizan_branches.country_code
SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_branches' AND COLUMN_NAME='country_code')=0,
  'ALTER TABLE mizan_branches ADD COLUMN country_code CHAR(2) NULL AFTER country',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Indexes, added only when absent.
SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='anzan_profiles' AND INDEX_NAME='idx_anzan_profiles_country_code')=0,
  'CREATE INDEX idx_anzan_profiles_country_code ON anzan_profiles(country_code)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND INDEX_NAME='idx_mizan_accounts_country_code')=0,
  'CREATE INDEX idx_mizan_accounts_country_code ON mizan_accounts(country_code)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_entities' AND INDEX_NAME='idx_mizan_entities_country_code')=0,
  'CREATE INDEX idx_mizan_entities_country_code ON mizan_entities(country_code)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_branches' AND INDEX_NAME='idx_mizan_branches_country_code')=0,
  'CREATE INDEX idx_mizan_branches_country_code ON mizan_branches(country_code)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Safe backfill for legacy rows already containing a two-letter code.
UPDATE anzan_profiles SET country_code=UPPER(TRIM(country))
WHERE (country_code IS NULL OR country_code='') AND country REGEXP '^[A-Za-z]{2}$';

UPDATE mizan_accounts SET country_code=UPPER(TRIM(country))
WHERE (country_code IS NULL OR country_code='') AND country REGEXP '^[A-Za-z]{2}$';

UPDATE mizan_entities SET country_code=UPPER(TRIM(country))
WHERE (country_code IS NULL OR country_code='') AND country REGEXP '^[A-Za-z]{2}$';

UPDATE mizan_branches SET country_code=UPPER(TRIM(country))
WHERE (country_code IS NULL OR country_code='') AND country REGEXP '^[A-Za-z]{2}$';
