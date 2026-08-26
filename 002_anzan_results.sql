/*
 * MIZAN ANZAN — Migration 002
 * Persistent challenge results used by history, reports, leaderboard and monthly geniuses.
 * Non-destructive: CREATE TABLE IF NOT EXISTS.
 * Run after 001_anzan_id.sql.
 */

CREATE TABLE IF NOT EXISTS anzan_results (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_code VARCHAR(50) NOT NULL,
    student_id BIGINT UNSIGNED NULL,
    anz_id VARCHAR(20) NOT NULL,
    student_name VARCHAR(150) NULL,
    correct_answers INT UNSIGNED NOT NULL DEFAULT 0,
    duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
    avg_time_per_question DECIMAL(10,4) NULL,
    challenge_type VARCHAR(50) NOT NULL DEFAULT 'anzan',
    challenge_type_text VARCHAR(100) NULL,
    digits_count INT UNSIGNED NULL,
    rows_count INT UNSIGNED NULL,
    speed_ms INT UNSIGNED NULL,
    total_questions INT UNSIGNED NOT NULL DEFAULT 0,
    score INT UNSIGNED NOT NULL DEFAULT 0,
    accuracy_percentage DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    time_taken_seconds INT UNSIGNED NOT NULL DEFAULT 0,
    country VARCHAR(100) NULL,
    age_category VARCHAR(50) NULL,
    operation_type VARCHAR(30) NULL,
    training_mode VARCHAR(30) NULL,
    preset VARCHAR(50) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_results_student_id (student_id),
    KEY idx_results_student_code (student_code),
    KEY idx_results_anz_id (anz_id),
    KEY idx_results_score (score),
    KEY idx_results_created (created_at),
    KEY idx_results_month (created_at, student_code),
    CONSTRAINT fk_results_anz_id
        FOREIGN KEY (anz_id) REFERENCES anzan_profiles (anz_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
