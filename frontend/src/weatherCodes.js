/*
  Wettercodes an einem Ort (4. September 2026).

  Die Zuordnung Code → Symbol stand vorher dreimal fast identisch in
  CurrentWeather.js, WeeklyList.js und MapPreview.js — mit unterschiedlichen
  Lücken. Jetzt einmal hier.
*/

const ICONS = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌦️",
  56: "🌨️", 57: "🌨️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  66: "🌨️", 67: "🌨️",
  71: "❄️", 73: "❄️", 75: "❄️", 77: "❄️",
  80: "🌦️", 81: "🌦️", 82: "🌦️",
  85: "❄️", 86: "❄️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

/*
  Google beschriftet den Zustand knapp ("Sonnig", "Regen") statt technisch
  ("Leichter Nieselregen"). Deshalb kurze Wörter.
*/
const LABELS = {
  0: "Sonnig",
  1: "Überwiegend sonnig",
  2: "Teilweise bewölkt",
  3: "Bewölkt",
  45: "Nebel",
  48: "Nebel",
  51: "Nieselregen",
  53: "Nieselregen",
  55: "Nieselregen",
  56: "Gefrierender Niesel",
  57: "Gefrierender Niesel",
  61: "Leichter Regen",
  63: "Regen",
  65: "Starker Regen",
  66: "Gefrierender Regen",
  67: "Gefrierender Regen",
  71: "Leichter Schneefall",
  73: "Schneefall",
  75: "Starker Schneefall",
  77: "Schneegriesel",
  80: "Regenschauer",
  81: "Regenschauer",
  82: "Kräftige Schauer",
  85: "Schneeschauer",
  86: "Schneeschauer",
  95: "Gewitter",
  96: "Gewitter mit Hagel",
  99: "Gewitter mit Hagel",
};

export function weatherIcon(code) {
  return ICONS[code] || "🌤️";
}

export function weatherLabel(code) {
  return LABELS[code] || "Wetter";
}
