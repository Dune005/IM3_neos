<?php

// CORS-Header hinzufügen, um den Zugriff von anderen Domains zu ermöglichen
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Verbindung zur Datenbank herstellen
require_once 'config.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Abfrage der NEO-Daten für die letzten 7 Tage
    $sql = "SELECT name, distance, velocity, estimated_diameter, timestamp 
            FROM neosWithCloseApproach 
            WHERE timestamp >= CURDATE() - INTERVAL 7 DAY
            AND DATE(timestamp) != '2024-10-09'
            AND LEFT(name, 4) = LEFT(timestamp, 4)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $neos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($neos);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

?>