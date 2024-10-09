<?php

include_once 'config.php';

// // Verbindung zur Datenbank herstellen
    $pdo = new PDO($dsn, $username, $password, $options); // Verbindung zur Datenbank herstellen
    $sql = "SELECT name FROM neosWithCloseApproach"; // SQL-Abfrage
    $stmt = $pdo->prepare($sql); // SQL-Abfrage vorbereiten (interne Sicherheitsmassnahme)
    $stmt->execute(); // SQL-Abfrage ausführen
    $neoListDB = $stmt->fetchAll(); // Alle Datensätze abrufen und in ein Array speichern

    // NEO-Daten aus der extract.php-Datei abrufen
$neos = include 'extract.php';

$transformedData = [];

// Durchlaufe die Daten und extrahiere die gewünschten Felder
foreach ($neos['data'] as $neo) {
    $transformedData[] = [
        'name' => $neo[0],             // des (Name des Objekts)
        'distance' => number_format(round($neo[4] * 149597870.7), 0, '.', "'"),         // dist (Annäherungsdistanz)
        'date' => $neo[3],             // cd (Kalenderdatum)
        'velocity' => $neo[7],         // v_rel (relative Geschwindigkeit)
        'estimated_diameter' => (1329 / sqrt(0.2)) * pow(10, -$neo[10] / 5) * 1000        // h (geschätzter Durchmesser)
    ];
}

// Filtere die transformierten Daten, um nur eindeutige Namen zu behalten
$uniqueTransformedData = array_filter($transformedData, function($neo) use ($neoListDB) {
    foreach ($neoListDB as $dbNeo) {
        if ($neo['name'] === $dbNeo['name']) {
            return false;
        }
    }
    return true;
});

// Die eindeutigen transformierten Daten im JSON-Format ausgeben
// header('Content-Type: application/json');
// echo json_encode($uniqueTransformedData, JSON_PRETTY_PRINT);

return $uniqueTransformedData;
?>

