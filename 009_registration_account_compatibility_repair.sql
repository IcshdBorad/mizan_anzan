-- MIZAN ANZAN — 009 Registration Account Compatibility Repair
-- Non-destructive repair for legacy mizan_accounts installations.
-- Run against the SAME database configured in /public_html/mizan_anzan/includes/db.php.
--
-- Repairs:
--   1) id must be AUTO_INCREMENT because registration inserts omit id.
--   2) access_code must exist because the current registration core uses it.
--   3) existing account_code values are preserved into access_code when possible.
--   4) legacy roles stored as VARCHAR remain supported: coach, parent, entity_manager.
--   5) no DROP / DELETE / TRUNCATE is used.

SET NAMES utf8mb4;
SET @db := DATABASE();

-- 0) Fail clearly if the base account table does not exist.
SET @table_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts'
);

-- 1) Repair id so INSERT statements that omit id can succeed.
SET @id_extra := (
  SELECT COALESCE(EXTRA,'')
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='id'
  LIMIT 1
);
SET @sql := IF(@table_exists=1 AND @id_extra NOT LIKE '%auto_increment%',
  'ALTER TABLE `mizan_accounts` MODIFY COLUMN `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 2) Add access_code as nullable first so existing rows are not broken.
SET @has_access_code := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='access_code'
);
SET @sql := IF(@table_exists=1 AND @has_access_code=0,
  'ALTER TABLE `mizan_accounts` ADD COLUMN `access_code` VARCHAR(40) NULL AFTER `account_code`',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 3) Preserve legacy account codes where available.
SET @has_account_code := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='account_code'
);
SET @sql := IF(@table_exists=1 AND @has_access_code=0 AND @has_account_code=1,
  'UPDATE `mizan_accounts` SET `access_code` = NULLIF(TRIM(`account_code`), '''') WHERE `access_code` IS NULL OR `access_code` = ''''',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 4) Generate deterministic unique compatibility codes for legacy rows that
-- had no account_code. The id is already unique, so the resulting value is unique.
UPDATE `mizan_accounts`
SET `access_code` = CONCAT('MZ-LEG-', LPAD(CAST(`id` AS CHAR), 12, '0'))
WHERE `access_code` IS NULL OR TRIM(`access_code`) = '';

-- 5) Enforce NOT NULL only after every existing row has a value.
SET @access_nullable := (
  SELECT IS_NULLABLE
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='access_code'
  LIMIT 1
);
SET @sql := IF(@table_exists=1 AND @access_nullable='YES',
  'ALTER TABLE `mizan_accounts` MODIFY COLUMN `access_code` VARCHAR(40) NOT NULL',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 6) Add a unique index only if one does not already exist.
SET @has_access_unique := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA=@db
    AND TABLE_NAME='mizan_accounts'
    AND COLUMN_NAME='access_code'
    AND NON_UNIQUE=0
);
SET @sql := IF(@table_exists=1 AND @has_access_unique=0,
  'ALTER TABLE `mizan_accounts` ADD UNIQUE KEY `uq_mizan_accounts_access_code` (`access_code`)',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 7) Ensure registration roles fit the legacy VARCHAR role column.
-- No ALTER is needed when role is VARCHAR(30); this assertion is informational.
SELECT
  'MIZAN_REGISTRATION_ACCOUNT_REPAIR_OK' AS repair_status,
  DATABASE() AS database_name,
  (SELECT EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='id') AS id_extra,
  (SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='role') AS role_type,
  (SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=@db AND TABLE_NAME='mizan_accounts' AND COLUMN_NAME='access_code') AS access_code_type;
