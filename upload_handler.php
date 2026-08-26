<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON payload'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($data)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No data provided'], JSON_UNESCAPED_UNICODE);
    exit;
}

// معالجة البيانات المستلمة بنجاح
echo json_encode([
    'status' => 'success',
    'message' => 'Data received successfully',
    'received' => $data
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);