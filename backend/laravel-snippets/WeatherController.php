<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\WeatherService;

class WeatherController extends Controller
{
    protected $weather;

    public function __construct(WeatherService $weather)
    {
        $this->weather = $weather;
    }

    /**
     * GET /api/weather?lat=52.52&lon=13.405
     */
    public function show(Request $request)
    {
        $lat = $request->query('lat', config('services.open_meteo.default_lat'));
        $lon = $request->query('lon', config('services.open_meteo.default_lon'));

        $data = $this->weather->fetchForecast($lat, $lon);

        return response()->json($data);
    }
}
