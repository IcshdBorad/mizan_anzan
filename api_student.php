<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

try {
    require_once __DIR__ . '/includes/db.php';
} catch (Throwable $e) {
    error_log('[MIZAN api_student][DB] ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Database service unavailable.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$action = (string)($_POST['action'] ?? '');

if ($action === 'diagnostic') {
    echo json_encode(['status' => 'success', 'message' => 'Database connection active'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'save_advanced_stats') {
    if (!$pdo->query("SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='student_logs'")->fetchColumn()) {
        echo json_encode(['status' => 'error', 'message' => 'Legacy student_logs table is not part of the current MIZAN ANZAN schema.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $fullName = trim((string)($_POST['full_name'] ?? 'مجهول'));
    $country = trim((string)($_POST['country'] ?? 'غير محدد'));
    $score = (int)($_POST['score'] ?? 0);
    $accuracy = (int)($_POST['accuracy'] ?? 0);
    $ageGroup = trim((string)($_POST['age_group'] ?? '7_9'));
    $level = trim((string)($_POST['level'] ?? 'MIX'));

    $stmt = $pdo->prepare('INSERT INTO student_logs (full_name, country, score, accuracy, age_group, level_type, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$fullName, $country, $score, $accuracy, $ageGroup, $level]);
    echo json_encode(['status' => 'success'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Unsupported action.'], JSON_UNESCAPED_UNICODE);
