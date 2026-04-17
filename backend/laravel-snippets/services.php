<?php

// config/services.php (add this block to the existing array)

'open_meteo' => [
    'base_url' => env('OPEN_METEO_BASE_URL', 'https://api.open-meteo.com/v1/forecast'),
    'timeout' => env('OPEN_METEO_TIMEOUT', 10),
    'default_lat' => env('DEFAULT_LAT', '52.52'),
    'default_lon' => env('DEFAULT_LON', '13.405'),
],
