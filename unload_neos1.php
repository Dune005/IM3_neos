<?php

// CORS-Header hinzufügen, um den Zugriff von anderen Domains zu ermöglichen
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Verbindung zur Datenbank herstellen
$servername = "k27gao.myd.infomaniak.com"; // oder dein Datenbankserver
$username = "k27gao_riz";
$password = "9Rt#aoj@nXjQ9kET";
$dbname = "k27gao_neos";

$conn = new mysqli($servername, $username, $password, $dbname);

// Überprüfen, ob die Verbindung erfolgreich ist
if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

// Abfrage der NEO-Daten für die letzten 7 Tage
$sql = SELECT name, distance, velocity, estimated_diameter, timestamp 
FROM neosWithCloseApproach 
WHERE timestamp >= CURDATE() - INTERVAL 7 DAY 
AND DATE(timestamp) != '2024-10-09'
AND LEFT(name, 4) = LEFT(timestamp, 4);

$result = $conn->query($sql);

$neos = array();

if ($result->num_rows > 0) {
    // Alle Daten in ein Array einfügen
    while($row = $result->fetch_assoc()) {
        $neos[] = $row;
    }
} else {
    echo "Keine Daten gefunden";
}

$conn->close();

// JSON-Antwort zurückgeben
header('Content-Type: application/json');
echo json_encode($neos);

?>