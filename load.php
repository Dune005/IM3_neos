<?php

require_once 'config.php';

// transform.php gibt nun direkt ein Array zurück, kein JSON-String
include('transform.php');

// Die Prüfung auf ein Array
if (!is_array($transformierteDaten)) {
    echo "Error: Daten konnten nicht geladen werden oder sind nicht im richtigen Format.";
    exit; // Beende das Skript, um weitere Fehler zu vermeiden
}

// PDO-Verbindung aufbauen
$pdo = new PDO($dsn, $username, $password, $options);

$pdo->beginTransaction();



try {
    // // Lösche alle Einträge in der 'weather'-Tabelle
    // $pdo->exec("DELETE FROM weather");

    // Bereite das Einfügen von Daten vor
    // $stmt = $pdo->prepare("INSERT INTO weather (city, temperature, rain, showers, snowfall, cloudCover, weatherCondition) 
    //                        VALUES (?, ?, ?, ?, ?, ?, ?)");

    // // Führe die Einfügung durch
    // foreach ($transformierteDaten as $row) {
    //     $stmt->execute([
    //         $row['city'], 
    //         $row['temperature'], 
    //         $row['rain'], 
    //         $row['showers'], 
    //         $row['snowfall'], 
    //         $row['cloudCover'], 
    //         $row['weatherCondition'],
    //     ]);
    // }

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