/*
|--------------------------------------------------------------------------
| ميزان أنزان
| Migration 001
| ANZ ID + Genius Profile
|--------------------------------------------------------------------------
|
| المسار:
| /public_html/mizan_anzan/database/migrations/001_anzan_id.sql
|
| هذه الهجرة غير مدمرة Non-Destructive.
|
*/

CREATE TABLE IF NOT EXISTS anzan_profiles (

    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    /*
    |--------------------------------------------------------------------------
    | الهوية
    |--------------------------------------------------------------------------
    */

    anz_id VARCHAR(20) NOT NULL,

    legacy_code VARCHAR(100) NULL,

    full_name VARCHAR(150) NULL,

    country VARCHAR(100) NULL,

    city VARCHAR(100) NULL,

    role ENUM(
        'student',
        'teacher',
        'parent',
        'admin'
    ) NOT NULL DEFAULT 'student',

    /*
    |--------------------------------------------------------------------------
    | المستوى
    |--------------------------------------------------------------------------
    */

    level VARCHAR(30) NULL DEFAULT 'L1',

    rank_name VARCHAR(50) NULL DEFAULT 'Kyu',

    /*
    |--------------------------------------------------------------------------
    | المؤشرات الأساسية
    |--------------------------------------------------------------------------
    */

    focus_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,

    accuracy_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,

    speed_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,

    development_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,

    consistency_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,

    anzan_index DECIMAL(5,2) NOT NULL DEFAULT 0.00,

    /*
    |--------------------------------------------------------------------------
    | التدريب
    |--------------------------------------------------------------------------
    */

    total_sessions INT UNSIGNED NOT NULL DEFAULT 0,

    total_questions INT UNSIGNED NOT NULL DEFAULT 0,

    correct_answers INT UNSIGNED NOT NULL DEFAULT 0,

    total_training_seconds INT UNSIGNED NOT NULL DEFAULT 0,

    current_streak INT UNSIGNED NOT NULL DEFAULT 0,

    best_streak INT UNSIGNED NOT NULL DEFAULT 0,

    points INT UNSIGNED NOT NULL DEFAULT 0,

    /*
    |--------------------------------------------------------------------------
    | آخر نشاط
    |--------------------------------------------------------------------------
    */

    last_training_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    /*
    |--------------------------------------------------------------------------
    | المفاتيح
    |--------------------------------------------------------------------------
    */

    PRIMARY KEY (id),

    UNIQUE KEY uq_anzan_profiles_anz_id (anz_id),

    KEY idx_anzan_profiles_legacy_code (legacy_code),

    KEY idx_anzan_profiles_role (role),

    KEY idx_anzan_profiles_level (level),

    KEY idx_anzan_profiles_anzan_index (anzan_index),

    KEY idx_anzan_profiles_last_training (last_training_at)

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| سجل المحاولات
|--------------------------------------------------------------------------
|
| هنا سنبني لاحقاً ذكاء أنزان.
| كل محاولة يمكن أن تسجل:
| - صحة الإجابة
| - الزمن
| - الصعوبة
| - نوع العملية
| - المستوى
|
*/

CREATE TABLE IF NOT EXISTS anzan_attempts (

    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    anz_id VARCHAR(20) NOT NULL,

    session_id VARCHAR(64) NULL,

    challenge_type VARCHAR(50) NOT NULL DEFAULT 'anzan',

    operation_type VARCHAR(50) NULL,

    level VARCHAR(30) NULL,

    difficulty DECIMAL(6,2) NULL,

    is_correct TINYINT(1) NOT NULL DEFAULT 0,

    response_time_ms INT UNSIGNED NOT NULL DEFAULT 0,

    attempts_before_correct TINYINT UNSIGNED NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_attempts_anz_id (anz_id),

    KEY idx_attempts_session (session_id),

    KEY idx_attempts_created (created_at),

    KEY idx_attempts_correct (is_correct),

    CONSTRAINT fk_attempts_anz_id
        FOREIGN KEY (anz_id)
        REFERENCES anzan_profiles (anz_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


/*
|--------------------------------------------------------------------------
| جلسات التدريب
|--------------------------------------------------------------------------
*/

CREATE TABLE IF NOT EXISTS anzan_sessions (

    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    session_id VARCHAR(64) NOT NULL,

    anz_id VARCHAR(20) NOT NULL,

    challenge_type VARCHAR(50) NOT NULL DEFAULT 'anzan',

    level VARCHAR(30) NULL,

    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    ended_at DATETIME NULL,

    duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,

    total_questions INT UNSIGNED NOT NULL DEFAULT 0,

    correct_answers INT UNSIGNED NOT NULL DEFAULT 0,

    score INT UNSIGNED NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_session_id (session_id),

    KEY idx_sessions_anz_id (anz_id),

    KEY idx_sessions_started (started_at),

    CONSTRAINT fk_sessions_anz_id
        FOREIGN KEY (anz_id)
        REFERENCES anzan_profiles (anz_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;