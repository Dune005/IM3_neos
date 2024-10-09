<?php

$neos = include 'extract.php';

$transformedData = [];

// $pdo = new PDO('mysql:host=k27gao.myd.infomaniak.com;dbname=k27gao_neos', 'k27gao_widdi', 'dP$peS&NaNYtebs9');
// $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// foreach ($neos as $neo) {
//     $stmt = $pdo->prepare('SELECT COUNT(*) FROM neosWithCloseApproach WHERE unique_column = :unique_value');
//     $stmt->execute(['unique_value' => $neo['unique_column']]);
//     $count = $stmt->fetchColumn();

//     if ($count == 0) {
//         $transformedData[] = $neo;
//     }
// }

$transformedData[] = [
    'name' => $neos[0],
    // 'distance' => number_format($neo[4] * 149597870.7, 0, '.', "'")
    // 'date' => $neo[3],
    // 'velocity' => $neo[7],
    // 'estimated_diameter' => (1329 / Math.sqrt(0.2)) * Math.pow(10, -$neo[10] / 5) * 1000,
];

 print_r($transformedData);

?>
