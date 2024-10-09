<?php

require_once 'config.php';

// transform.php gibt nun direkt ein Array zurück, kein JSON-String
include('transform.php');

// Die Prüfung auf ein Array
if (!is_array($uniqueTransformedData)) {
    echo "Error: Daten konnten nicht geladen werden oder sind nicht im richtigen Format.";
    exit; // Beende das Skript, um weitere Fehler zu vermeiden
}

// PDO-Verbindung aufbauen
$pdo = new PDO($dsn, $username, $password, $options);

$pdo->beginTransaction();



try {

    //Bereite das Einfügen von Daten vor
    $stmt = $pdo->prepare("INSERT INTO neosWithCloseApproach (name, distance, date, velocity, estimated_diameter) 
                           VALUES (?, ?, ?, ?, ?)");

    // Führe die Einfügung durch
    foreach ($uniqueTransformedData as $row) {
        $stmt->execute([
            $row['name'], 
            $row['distance'], 
            $row['date'],
            $row['velocity'],
            $row['estimated_diameter'], 
        ]);
    }

    // Transaktion abschließen
    $pdo->commit();

    echo "Daten wurden erfolgreich in die Datenbank geladen.";

} catch (Exception $e) {
    // Fehler bei der Transaktion behandeln
    $pdo->rollBack();
    echo "Error: " . $e->getMessage();
}

// PDO-Verbindung schließen
$pdo = null;

?>