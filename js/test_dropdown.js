async function createChart(selectedWeek = null) {
    const neoData = await loadNeoData();

    // Aktuelles Datum ermitteln
    const today = new Date();

    // Array für Labels (Tage) und Hintergrundfarben
    const labels = [];
    const backgroundColors = [];

    // Wenn eine Kalenderwoche ausgewählt wurde, filtere die Daten nach dieser Woche
    const filteredNeoData = selectedWeek 
        ? neoData.filter(neo => {
            const neoDate = new Date(neo.timestamp);
            return getWeekNumber(neoDate) === selectedWeek;
        }) 
        : neoData; // Wenn keine Woche ausgewählt ist, alle Daten verwenden

    // Labels für die letzten 7 Tage erstellen
    for (let i = 6; i >= 0; i--) { 
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(formatDate(date));
        backgroundColors.push(i === 0 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(75, 192, 192, 0.2)');
    }

    // Anzahl der NEOs pro Tag berechnen
    const neoCountPerDay = labels.map(label => {
        const count = filteredNeoData.filter(neo => {
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
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    barPercentage: 0.5,
                    categoryPercentage: 0.5,
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
                        max: Math.max(...neoCountPerDay)
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const neosForDay = filteredNeoData.filter(neo => {
                                const neoDate = formatDate(new Date(neo.timestamp));
                                return neoDate === context.label;
                            });

                            if (neosForDay.length > 0) {
                                return neosForDay.map(neo => {
                                    const diameter = neo.estimated_diameter || 'unbekannt';
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

    // Prüfen, ob ein Diagramm schon existiert, wenn ja, dann aktualisieren
    if (window.neoChart) {
        window.neoChart.destroy();
    }

    // Diagramm erstellen
    window.neoChart = new Chart(ctx, config);
}
document.getElementById('weekDropdown').addEventListener('change', function() {
    const selectedWeek = parseInt(this.value, 10); // Die ausgewählte Kalenderwoche
    createChart(selectedWeek); // Das Diagramm mit der ausgewählten Kalenderwoche neu erstellen
});
