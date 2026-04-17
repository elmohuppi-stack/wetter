<?php
// Enhanced proxy for Open-Meteo with caching, rate limiting, and multiple APIs
// Usage: /backend/proxy.php?lat=52.52&lon=13.405&api=forecast (default: forecast, historical, seasonal, climate)

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// Rate limiting: API limits are 600/min, 5000/hour, 10000/day, 300000/month
// We use conservative limits to stay safely under these thresholds
$ip = $_SERVER['REMOTE_ADDR'];
$ipSafe = preg_replace('/[^a-z0-9]/i', '_', $ip);
$statsFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'rate_' . $ipSafe . '_stats.json';

// Load or initialize rate limit stats
$stats = [
    'minute' => ['count' => 0, 'timestamp' => date('Y-m-d H:i')],
    'hour' => ['count' => 0, 'timestamp' => date('Y-m-d H')],
    'day' => ['count' => 0, 'timestamp' => date('Y-m-d')],
    'month' => ['count' => 0, 'timestamp' => date('Y-m')],
];

if (file_exists($statsFile)) {
    $loaded = json_decode(file_get_contents($statsFile), true);
    if (is_array($loaded)) {
        // Update counters only if time period hasn't changed
        foreach (['minute', 'hour', 'day', 'month'] as $period) {
            if ($loaded[$period]['timestamp'] === $stats[$period]['timestamp']) {
                $stats[$period]['count'] = $loaded[$period]['count'];
            }
        }
    }
}

// Check rate limits (conservative: 90% of actual limits)
$limits = [
    'minute' => ['max' => 540, 'msg' => 'Minutenlimit (600/min) erreicht'],         // 540 of 600
    'hour' => ['max' => 4500, 'msg' => 'Stundenlimit (5.000/h) erreicht'],          // 4500 of 5000
    'day' => ['max' => 9000, 'msg' => 'Tägliches Limit (10.000/Tag) erreicht'],     // 9000 of 10000
    'month' => ['max' => 270000, 'msg' => 'Monatslimit (300.000/Monat) erreicht'],  // 270000 of 300000
];

foreach ($limits as $period => $limit) {
    if ($stats[$period]['count'] >= $limit['max']) {
        http_response_code(429);
        echo json_encode(['error' => true, 'message' => $limit['msg']]);
        exit;
    }
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
    case 'expert':
        $base = 'https://api.open-meteo.com/v1/forecast';
        $params = [
            'latitude' => $lat,
            'longitude' => $lon,
            'timezone' => 'auto',
        ];
        if (isset($_GET['current'])) {
            $params['current'] = $_GET['current'];
        }
        if (isset($_GET['daily'])) {
            $params['daily'] = $_GET['daily'];
        }
        if (isset($_GET['hourly'])) {
            $params['hourly'] = $_GET['hourly'];
        }
        $cacheTtl = 900; // 15 min for expert
        break;
    case 'dashboard':
        $dashboardStatsFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'weather_stats_' . $ipSafe . '.json';
        $dashStats = ['calls_today' => 0, 'cache_hits' => 0, 'minute_used' => 0, 'hour_used' => 0];
        if (file_exists($dashboardStatsFile)) {
            $dashStats = json_decode(file_get_contents($dashboardStatsFile), true) ?: $dashStats;
        }

        $rateLimitStats = [
            'calls_today' => $dashStats['calls_today'] ?? 0,
            'cache_hits' => $dashStats['cache_hits'] ?? 0,
            'minute_used' => $dashStats['minute_used'] ?? 0,
            'minute_limit' => 540,
            'hour_used' => $dashStats['hour_used'] ?? 0,
            'hour_limit' => 4500,
            'day_limit' => 9000,
            'month_limit' => 270000,
        ];
        echo json_encode($rateLimitStats);
        exit;
    default: // forecast
        $base = 'https://api.open-meteo.com/v1/forecast';
        $params = [
            'latitude' => $lat,
            'longitude' => $lon,
            'current' => 'temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,pressure_msl,precipitation,cloud_cover',
            'hourly' => 'temperature_2m,precipitation,weathercode',
            'daily' => 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
            'timezone' => 'auto',
        ];
        $cacheTtl = 900; // 15 min for forecast
}

$cacheKey = $api . '_' . preg_replace('/[^a-z0-9._-]/i', '_', $lat . '_' . $lon) . ($api === 'expert' ? '_' . md5(serialize($params)) : '');
$cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $cacheKey . '.json';

// Check cache and log hit
$isFromCache = false;
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl)) {
    $isFromCache = true;

    // Update rate limit counters (even for cache hits)
    $stats['minute']['count']++;
    $stats['hour']['count']++;
    $stats['day']['count']++;
    $stats['month']['count']++;
    file_put_contents($statsFile, json_encode($stats));

    // Update dashboard stats for cache hit
    $dashboardStatsFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'weather_stats_' . $ipSafe . '.json';
    $dashboardStats = [
        'calls_today' => 0,
        'cache_hits' => 0,
        'minute_used' => $stats['minute']['count'],
        'hour_used' => $stats['hour']['count'],
        'date' => date('Y-m-d'),
    ];
    if (file_exists($dashboardStatsFile)) {
        $loaded = json_decode(file_get_contents($dashboardStatsFile), true);
        if (is_array($loaded) && $loaded['date'] === date('Y-m-d')) {
            $dashboardStats = $loaded;
        }
    }
    $dashboardStats['calls_today']++;
    $dashboardStats['cache_hits']++;
    file_put_contents($dashboardStatsFile, json_encode($dashboardStats));

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

// Update all rate limit counters
$stats['minute']['count']++;
$stats['hour']['count']++;
$stats['day']['count']++;
$stats['month']['count']++;

// Persist rate limit stats
file_put_contents($statsFile, json_encode($stats));

// Update weather stats for dashboard (API call, not from cache)
$dashboardStatsFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'weather_stats_' . $ipSafe . '.json';
$dashboardStats = [
    'calls_today' => 0,
    'cache_hits' => 0,
    'minute_used' => $stats['minute']['count'],
    'hour_used' => $stats['hour']['count'],
    'date' => date('Y-m-d'),
];
if (file_exists($dashboardStatsFile)) {
    $loaded = json_decode(file_get_contents($dashboardStatsFile), true);
    if (is_array($loaded) && $loaded['date'] === date('Y-m-d')) {
        $dashboardStats = $loaded;
    }
}
$dashboardStats['calls_today']++;
file_put_contents($dashboardStatsFile, json_encode($dashboardStats));

file_put_contents($cacheFile, $response);
echo $response;
