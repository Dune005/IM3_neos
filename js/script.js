const ctx = document.getElementById('neoChart').getContext('2d');

// Funktion zum Laden der Daten aus der Datenbank via AJAX
async function loadNeoData() {
    try {
        // Pfad zu deinem PHP-Skript, das die Datenbank abfragt
        const response = await fetch('https://neos.klaus-klebband.ch/unload.php');
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok');
        }
        const neoData = await response.json();
        console.log('Geladene NEO-Daten:', neoData); // Log der geladenen Daten
        return neoData;
    } catch (error) {
        console.error('Fehler beim Laden der NEO-Daten:', error);
        return [];
    }
}

// Funktion zur Formatierung der Zahl
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

// Funktion zur Formatierung des Datums
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'numeric', 
        year: '2-digit' 
    };
    const formattedDate = date.toLocaleDateString('de-DE', options).replace(/\./g, '/');
    const [weekday, rest] = formattedDate.split(', ');
    return `${weekday}\n${rest}`;
}

// Diagramm erstellen
async function createChart() {
    const neoData = await loadNeoData();

    // Aktuelles Datum ermitteln
    const today = new Date();

    // Array für Labels (Tage) und Hintergrundfarben
    const labels = [];
    const backgroundColors = [];

    // Labels für die letzten 7 Tage erstellen
    for (let i = 6; i >= 0; i--) { 
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(formatDate(date));
        backgroundColors.push(i === 0 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(75, 192, 192, 0.2)');
    }

    // Anzahl der NEOs pro Tag berechnen
    const neoCountPerDay = labels.map(label => {
        const count = neoData.filter(neo => {
            const neoDate = formatDate(new Date(neo.timestamp));
            return neoDate === label;
        }).length;
        console.log(`Anzahl der NEOs am ${label}:`, count); // Log der Anzahl der NEOs pro Tag
        return count;
    });

    // Daten für das Diagramm vorbereiten
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Anzahl der neuen NEOs',
                data: neoCountPerDay,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderRadius: 5,
                borderSkipped: false,
            }
        ]
    };

    // Optionen für das Diagramm
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false, // Ermöglicht die Anpassung des Aspektverhältnisses
            scales: {
                x: {
                    beginAtZero: true,
                    barPercentage: 0.5, // Breite der Bars (0.0 - 1.0)
                    categoryPercentage: 0.5, // Abstand zwischen den Kategorien (0.0 - 1.0)
                    ticks: {
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.split('\n').join(' '); // Zeilenumbruch für Labels
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        max: Math.max(...neoCountPerDay) // Setzt das Maximum auf die maximale Anzahl der neuen NEOs
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const neosForDay = neoData.filter(neo => {
                                const neoDate = formatDate(new Date(neo.timestamp));
                                return neoDate === context.label;
                            });

                            if (neosForDay.length > 0) {
                                return neosForDay.map(neo => {
                                    const diameter = neo.estimated_diameter || 'unbekannt'; // Überprüfen, ob der Durchmesser vorhanden ist
                                    return `Name: ${neo.name}, Distanz: ${formatNumber(neo.distance)} km, Geschwindigkeit: ${neo.velocity} km/s, Durchmesser: ${diameter} m`;
                                });
                            } else {
                                return `Keine NEO-Daten für diesen Tag`;
                            }
                        }
                    }
                }
            }
        }
    };

    // Diagramm erstellen
    const neoChart = new Chart(ctx, config);

    console.log(neoData);
}

// Diagramm erstellen, wenn das Dokument geladen ist
document.addEventListener('DOMContentLoaded', createChart);