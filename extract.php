<?php

$url = "https://api.open-meteo.com/v1/forecast?latitude=46.9481,46.8499,47.3667&longitude=7.4474,9.5329,8.55&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,rain,showers,snowfall,cloud_cover&temperature_unit=celsius&timezone=auto&forecast_days=1";

// Initialisiert eine cURL-Sitzung
$ch = curl_init($url);

// Setzt Optionen
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Führt die cURL-Sitzung aus und erhält den Inhalt
$response = curl_exec($ch);

// Überprüft auf cURL-Fehler
if (curl_errno($ch)) {
    echo 'cURL-Fehler: ' . curl_error($ch);
    curl_close($ch);
    exit;
}

// Schließt die cURL-Sitzung
curl_close($ch);

// Überprüft den HTTP-Statuscode
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($http_code != 200) {
    echo 'HTTP-Fehler: ' . $http_code;
    exit;
}

// Dekodiert die JSON-Antwort
$locations = json_decode($response, true);

// Überprüft auf JSON-Fehler
if (json_last_error() !== JSON_ERROR_NONE) {
    echo 'JSON-Fehler: ' . json_last_error_msg();
    exit;
}

// Gibt das Array zurück
return $locations;

// Zeigt die JSON-Antwort an
echo '<pre>';
print_r($locations);
echo '</pre>';

