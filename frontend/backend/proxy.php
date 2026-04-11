<?php
// Simple proxy for Open-Meteo with file caching (no framework required)
// Usage: /backend/proxy.php?lat=52.52&lon=13.405

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$lat = isset($_GET['lat']) ? $_GET['lat'] : '52.52';
$lon = isset($_GET['lon']) ? $_GET['lon'] : '13.405';

$cacheKey = 'weather_' . preg_replace('/[^a-z0-9._-]/i', '_', $lat . '_' . $lon);
$cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $cacheKey . '.json';
$cacheTtl = 600; // seconds

if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl)) {
    echo file_get_contents($cacheFile);
    exit;
}

$base = 'https://api.open-meteo.com/v1/forecast';
$params = http_build_query([
    'latitude' => $lat,
    'longitude' => $lon,
    'current_weather' => 'true',
    'hourly' => 'temperature_2m,precipitation,weathercode',
    'daily' => 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
    'timezone' => 'auto',
]);

$url = $base . '?' . $params;

$opts = [
    'http' => [
        'method' => 'GET',
        'header' => "User-Agent: Wetter-App-Proxy/1.0\r\n",
        'timeout' => 10,
    ]
];

$context = stream_context_create($opts);
$response = @file_get_contents($url, false, $context);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => true, 'message' => 'Wetterdaten konnten nicht geladen werden.']);
    exit;
}

file_put_contents($cacheFile, $response);
echo $response;
