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
        weekday: 'short', 
        day: 'numeric', 
        month: 'numeric', 
        year: '2-digit' 
    };
    const formattedDate = date.toLocaleDateString('de-DE', options).replace(/\./g, '/');
    const [weekday, rest] = formattedDate.split(', ');
    const shortWeekday = weekday.slice(0, 2);
    const isToday = date.toDateString() === new Date().toDateString();
    return isToday ? 'Heute' : `${shortWeekday}`;
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




document.addEventListener('DOMContentLoaded', loadNeuentdeckung);

async function loadNeuentdeckung() {
    try {
        // Daten für alle NEOs der Woche von der Datenbank abrufen
        const response = await fetch('https://neos.klaus-klebband.ch/unload.php');
        const neoData = await response.json();

        // Filter für Objekte der letzten 7 Tage
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyNeos = neoData.filter(neo => {
            const neoDate = new Date(neo.timestamp);
            return neoDate >= oneWeekAgo;
        });

        function getBiggestNeoByDiameter(weeklyNeos) {
            return weeklyNeos.reduce((biggestNeo, currentNeo) => {
                // Vergleiche den Wert von "estimated_diameter" und aktualisiere das größte Objekt
                return parseFloat(currentNeo.estimated_diameter) > parseFloat(biggestNeo.estimated_diameter) 
                    ? currentNeo 
                    : biggestNeo;
            });
        }


        // Aufruf der Funktion und Ausgabe des größten NEO
const biggestNeo = getBiggestNeoByDiameter(weeklyNeos);
console.log(biggestNeo);

        
        // Überprüfen, ob ein Objekt gefunden wurde
        if (Object.keys(biggestNeo).length === 0) {
            console.error('Kein NEO in den letzten 7 Tagen gefunden.');
            return;
        }

        // Daten in die HTML-Elemente einfügen
        document.getElementById('name').textContent = biggestNeo.name;
        document.getElementById('distance').textContent = formatNumber(biggestNeo.distance);
        document.getElementById('velocity').textContent = biggestNeo.velocity;
        document.getElementById('estimated_diameter').textContent = biggestNeo.estimated_diameter;

        // Zeit berechnen, wie lange das Objekt bräuchte, um die Erde zu erreichen
        const time = (biggestNeo.distance / biggestNeo.velocity) / 3600; // Zeit in Stunden
        document.getElementById('time').textContent = time.toFixed(2);
        document.getElementById('velocity_time').textContent = biggestNeo.velocity;

    } catch (error) {
        console.error('Fehler beim Laden der Neuentdeckung:', error);
    }
}

// Formatierungsfunktion für große Zahlen
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}


// Diagramm erstellen, wenn das Dokument geladen ist
document.addEventListener('DOMContentLoaded', createChart);