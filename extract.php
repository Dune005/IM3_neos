<?php

// Aktuelles Datum
$currentDate = date('Y-m-d');

// Berechne das Datum heute und ein Jahr später
$dateMin = $currentDate;
$dateMax = date('Y-m-d', strtotime('+1 year', strtotime($currentDate)));


// Erstelle die URL mit dynamischen Daten
$url = "https://ssd-api.jpl.nasa.gov/cad.api?diameter=true&date-min=$dateMin&date-max=$dateMax&body=earth";


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
$neos = json_decode($response, true);


// Überprüft auf JSON-Fehler
if (json_last_error() !== JSON_ERROR_NONE) {
    echo 'JSON-Fehler: ' . json_last_error_msg();
    exit;
}

// Gibt das Array zurück
return $neos;

// Zeigt die JSON-Antwort an
print_r($neos);

?>