-- MIZAN ANZAN — Identity, Entity, Relationship & Competition Foundation
-- Version: 004
-- Safe migration: adds new structures without deleting existing result data.

SET NAMES utf8mb4;

ALTER TABLE anzan_profiles
    ADD COLUMN IF NOT EXISTS genius_code VARCHAR(40) NULL,
    ADD COLUMN IF NOT EXISTS display_name_en VARCHAR(180) NULL;

UPDATE anzan_profiles
SET genius_code = COALESCE(NULLIF(genius_code,''), NULLIF(anz_id,''), NULLIF(legacy_code,''))
WHERE (genius_code IS NULL OR genius_code = '')
  AND role = 'student';

CREATE UNIQUE INDEX IF NOT EXISTS uq_anzan_profiles_genius_code
    ON anzan_profiles (genius_code);

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
    UNIQUE KEY uq_mizan_entity_code (entity_code),
    KEY idx_mizan_entity_parent (parent_entity_id),
    KEY idx_mizan_entity_type_status (entity_type,status),
    CONSTRAINT fk_mizan_entity_parent FOREIGN KEY (parent_entity_id) REFERENCES mizan_entities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    KEY idx_mizan_branch_entity (entity_id),
    CONSTRAINT fk_mizan_branch_entity FOREIGN KEY (entity_id) REFERENCES mizan_entities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    KEY idx_mizan_account_branch (branch_id),
    CONSTRAINT fk_mizan_account_entity FOREIGN KEY (entity_id) REFERENCES mizan_entities(id) ON DELETE SET NULL,
    CONSTRAINT fk_mizan_account_branch FOREIGN KEY (branch_id) REFERENCES mizan_branches(id) ON DELETE SET NULL
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
    KEY idx_mizan_rel_entity_branch (entity_id,branch_id),
    CONSTRAINT fk_mizan_rel_account FOREIGN KEY (account_id) REFERENCES mizan_accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_mizan_rel_genius FOREIGN KEY (genius_profile_id) REFERENCES anzan_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_mizan_rel_entity FOREIGN KEY (entity_id) REFERENCES mizan_entities(id) ON DELETE SET NULL,
    CONSTRAINT fk_mizan_rel_branch FOREIGN KEY (branch_id) REFERENCES mizan_branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mizan_monthly_awards (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    award_month CHAR(7) NOT NULL,
    award_type VARCHAR(40) NOT NULL,
    genius_profile_id BIGINT UNSIGNED NOT NULL,
    cohort_key VARCHAR(120) NOT NULL DEFAULT 'GLOBAL',
    mgi_score DECIMAL(6,3) NULL,
    criteria_json JSON NULL,
    status ENUM('provisional','official','revoked') NOT NULL DEFAULT 'provisional',
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_mizan_award (award_month,award_type,genius_profile_id,cohort_key),
    KEY idx_mizan_award_month_type (award_month,award_type,status),
    CONSTRAINT fk_mizan_award_genius FOREIGN KEY (genius_profile_id) REFERENCES anzan_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE anzan_results
    ADD INDEX idx_anzan_results_student_created (student_code, created_at),
    ADD INDEX idx_anzan_results_level_age_created (level, age_category, created_at),
    ADD INDEX idx_anzan_results_created_student (created_at, student_code);
