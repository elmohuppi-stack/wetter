<?php
// Router für PHP's built-in server
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';

// MIME-Type Tabelle
$mime_types = [
    'js'   => 'application/javascript',
    'css'  => 'text/css',
    'html' => 'text/html; charset=utf-8',
    'json' => 'application/json',
    'png'  => 'image/png',
    'jpg'  => 'image/jpeg',
    'svg'  => 'image/svg+xml',
    'ico'  => 'image/x-icon',
];

// /backend/* direkt servieren (PHP-Datei ausführen)
if (strpos($path, '/backend/') === 0) {
    $file = __DIR__ . $path;
    if (is_file($file)) {
        return false;
    }
    http_response_code(404);
    exit;
}

// Frontend-Pfade normalisieren (strip /frontend/ prefix wenn vorhanden)
$normalized_path = $path;
if (strpos($path, '/frontend/') === 0) {
    $normalized_path = substr($path, strlen('/frontend'));
}

// Statische Dateien aus frontend/ mit korrektem MIME-Type servieren
$frontend_file = __DIR__ . '/frontend' . $normalized_path;
if (is_file($frontend_file)) {
    $ext = strtolower(pathinfo($frontend_file, PATHINFO_EXTENSION));
    $mime = $mime_types[$ext] ?? 'application/octet-stream';
    header('Content-Type: ' . $mime);
    readfile($frontend_file);
    return true;
}

// SPA-Fallback
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/frontend/index.html');
return true;
