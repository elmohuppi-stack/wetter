<?php
// Enhanced proxy for Open-Meteo with caching, rate limiting, and multiple APIs
// Usage: /backend/proxy.php?lat=52.52&lon=13.405&api=forecast (default: forecast, historical, seasonal, climate)

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// Rate limiting: 100 calls/day per IP (well under 10k limit)
$ip = $_SERVER['REMOTE_ADDR'];
$rateFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'rate_' . preg_replace('/[^a-z0-9]/i', '_', $ip) . '.txt';
$maxCalls = 100;
$calls = 0;
if (file_exists($rateFile)) {
    $data = explode(',', file_get_contents($rateFile));
    if ($data[0] == date('Y-m-d')) {
        $calls = (int)$data[1];
    }
}
if ($calls >= $maxCalls) {
    http_response_code(429);
    echo json_encode(['error' => true, 'message' => 'Rate limit exceeded. Try again tomorrow.']);
    exit;
}

$lat = isset($_GET['lat']) ? $_GET['lat'] : '52.52';
$lon = isset($_GET['lon']) ? $_GET['lon'] : '13.405';
$api = isset($_GET['api']) ? $_GET['api'] : 'forecast';

switch ($api) {
    case 'historical':
        $base = 'https://archive-api.open-meteo.com/v1/archive';
        $params = [
            'latitude' => $lat,
            'longitude' => $lon,
            'start_date' => isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d', strtotime('-1 year')),
            'end_date' => isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-d'),
            'hourly' => 'temperature_2m,precipitation',
            'daily' => 'temperature_2m_max,temperature_2m_min,precipitation_sum',
            'timezone' => 'auto',
        ];
        $cacheTtl = 3600; // 1 hour for historical
        break;
    case 'seasonal':
        $base = 'https://seasonal-api.open-meteo.com/v1/seasonal';
        $params = [
            'latitude' => $lat,
            'longitude' => $lon,
            'daily' => 'temperature_2m_mean,precipitation_sum',
        ];
        $cacheTtl = 3600 * 6; // 6 hours for seasonal
        break;
    case 'climate':
        $base = 'https://climate-api.open-meteo.com/v1/climate';
        $params = [
            'latitude' => $lat,
            'longitude' => $lon,
            'models' => 'CMCC_CM2_VHR4,FGOALS_f3_H,HiRAM_SIT_HR,MRI_AGCM3_2_S,EC_Earth3P_HR,MPI_ESM1_2_XR,NICAM16_8S',
            'daily' => 'temperature_2m_mean,precipitation_sum',
            'start_date' => '2020-01-01',
            'end_date' => '2050-12-31',
        ];
        $cacheTtl = 3600 * 24; // 1 day for climate
        break;
    case 'dashboard':
        $statsFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'weather_stats.txt';
        $stats = ['calls_today' => 0, 'cache_hits' => 0, 'rate_warnings' => 0];
        if (file_exists($statsFile)) {
            $stats = json_decode(file_get_contents($statsFile), true) ?: $stats;
        }
        echo json_encode([
            'callsToday' => $stats['calls_today'] ?? 0,
            'cacheHits' => $stats['cache_hits'] ?? 0,
            'rateLimitWarnings' => $stats['rate_warnings'] ?? 0,
        ]);
        exit;
    default: // forecast
        $base = 'https://api.open-meteo.com/v1/forecast';
        $params = [
            'latitude' => $lat,
            'longitude' => $lon,
            'current_weather' => 'true',
            'hourly' => 'temperature_2m,precipitation,weathercode',
            'daily' => 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
            'timezone' => 'auto',
        ];
        $cacheTtl = 600; // 10 min for forecast
}

$cacheKey = $api . '_' . preg_replace('/[^a-z0-9._-]/i', '_', $lat . '_' . $lon);
$cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $cacheKey . '.json';

if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl)) {
    echo file_get_contents($cacheFile);
    exit;
}

$url = $base . '?' . http_build_query($params);

$opts = [
    'http' => [
        'method' => 'GET',
        'header' => "User-Agent: Wetter-App-Proxy/1.0\r\n",
        'timeout' => 15,
    ]
];

$context = stream_context_create($opts);
$response = @file_get_contents($url, false, $context);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => true, 'message' => 'Wetterdaten konnten nicht geladen werden.']);
    exit;
}

// Update rate limit
file_put_contents($rateFile, date('Y-m-d') . ',' . ($calls + 1));

// Update stats
$statsFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'weather_stats.txt';
$stats = ['calls_today' => 0, 'cache_hits' => 0, 'rate_warnings' => 0];
if (file_exists($statsFile)) {
    $stats = json_decode(file_get_contents($statsFile), true) ?: $stats;
}
if ($stats['date'] != date('Y-m-d')) {
    $stats = ['calls_today' => 0, 'cache_hits' => 0, 'rate_warnings' => 0, 'date' => date('Y-m-d')];
}
$stats['calls_today']++;
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl)) {
    $stats['cache_hits']++;
}
if ($calls >= $maxCalls - 10) {
    $stats['rate_warnings']++;
}
file_put_contents($statsFile, json_encode($stats));

file_put_contents($cacheFile, $response);
echo $response;
