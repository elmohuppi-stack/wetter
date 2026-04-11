<?php

// routes/api.php

use App\Http\Controllers\Api\WeatherController;

Route::get('/weather', [WeatherController::class, 'show']);
