<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WeatherService
{
    protected $baseUrl;
    protected $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.open_meteo.base_url');
        $this->timeout = config('services.open_meteo.timeout', 10);
    }

    public function fetchForecast($lat, $lon)
    {
        $cacheKey = "weather:{$lat}:{$lon}";

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($lat, $lon) {
            $params = [
                'latitude' => $lat,
                'longitude' => $lon,
                'current_weather' => 'true',
                'hourly' => 'temperature_2m,precipitation,weathercode',
                'daily' => 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
                'timezone' => 'auto',
            ];

            $response = Http::timeout($this->timeout)->get($this->baseUrl, $params);

            if ($response->failed()) {
                return [
                    'error' => true,
                    'message' => 'Wetterdaten konnten nicht geladen werden.'
                ];
            }

            return $response->json();
        });
    }
}
