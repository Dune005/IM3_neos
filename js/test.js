

console.log("test.js");

const apiUrl = "https://neos.klaus-klebband.ch/unload.php";
let chart = null;
let labels = [];
let neoCountPerDay = [];
let neoData = [];

// Initialisiere den Chart
const ctx = document.getElementById("neoChart").getContext("2d");
chart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: labels,
        datasets: [
            {
                label: "Anzahl der neuen NEOs",
                data: neoCountPerDay,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
                borderRadius: 5,
                borderSkipped: false,
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.5)', // Highlight color on hover
                hoverBorderColor: 'rgba(75, 192, 192, 1)', // Border color on hover
                hoverBorderWidth: 2, // Border width on hover
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
                barPercentage: 0.5,
                categoryPercentage: 0.5,
                ticks: {
                    callback: function (value) {
                        const label = this.getLabelForValue(value);
                        return label.split('\n').join(' ');
                    },
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    max: Math.max(...neoCountPerDay),
                },
            },
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
                                const diameter = neo.estimated_diameter || 'unbekannt';
                                return `Name: ${neo.name}, Distanz: ${formatNumber(neo.distance)} km, Geschwindigkeit: ${neo.velocity} km/s, Durchmesser: ${diameter} m`;
                            });
                        } else {
                            return `Keine NEO-Daten für diesen Tag`;
                        }
                    },
                },
            },
        },
        hover: {
            mode: 'index',
            intersect: false,
        },
    },
});







//START - Abfrage des gröten NEOs der letzten 7 Tage

// Laden der Daten des grössten NEOs der letzten 7 Tage
document.addEventListener('DOMContentLoaded', loadNeuentdeckung);

// Funktion zum Laden der Daten des größsten NEOs der letzten 7 Tage
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
        document.getElementById('velocity').textContent = biggestNeo.velocity.toFixed(2);
        document.getElementById('estimated_diameter').textContent = Number(biggestNeo.estimated_diameter).toFixed(1);

        // Zeit berechnen, wie lange das Objekt bräuchte, um die Erde zu erreichen
        const time = Math.round((biggestNeo.distance / biggestNeo.velocity) / 3600); // Zeit in Stunden
        document.getElementById('time').textContent = time;
        document.getElementById('velocity_time').textContent = biggestNeo.velocity.toFixed(1);

    } catch (error) {
        console.error('Fehler beim Laden der Neuentdeckung:', error);
    }
}


//ENDE - Abfrage des gröten NEOs der letzten 7 Tage













// Funktion zur Abfrage der Daten mit einem Datumsbereich
function getApiData(url, startDate, endDate) {
    console.log(`Daten werden von ${startDate} bis ${endDate} abgefragt`);
    
    fetch(`${url}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .then((response) => response.json())
        .then((myData) => {
            console.log("DATA" + myData);
            neoData = myData;

            labels = [];
            neoCountPerDay = [];

            let currentDate = new Date(startDate);
            
            // Erstelle Labels und fülle Daten für jeden Tag im ausgewählten Zeitraum
            while (currentDate <= endDate) {
                labels.push(formatDate(currentDate));
                let count = neoData.filter(neo => {
                    let neoDate = new Date(neo.timestamp);
                    return isSameDay(neoDate, currentDate);
                }).length;
                console.log(`Anzahl der NEOs am ${currentDate}:`, count);
                neoCountPerDay.push(count);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Aktualisiere den Chart
            chart.data.labels = labels;
            chart.data.datasets[0].data = neoCountPerDay;
            chart.update();
        });
}

// Hilfsfunktion, um zu prüfen, ob zwei Daten am gleichen Tag sind
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
}

// Event-Handler für Dropdown-Wechsel
function handleWeekChange() {
    const selectedOption = document.getElementById('zeitraum').value;
    
    let startDate, endDate;

    if (selectedOption === "letzte sieben Tage") {
        endDate = new Date(); // Heute
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
    } else {
        // Berechne den Montag und Sonntag der gewählten Kalenderwoche
        const currentDate = new Date();
        const weekNumber = parseInt(selectedOption.replace('KW ', ''));
        
        // Berechne den Montag und Sonntag der gewählten Woche
        startDate = getMondayOfWeek(weekNumber, currentDate.getFullYear());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
    }

    getApiData(apiUrl, startDate, endDate);
}

// Berechne den Montag der gewählten Kalenderwoche
function getMondayOfWeek(week, year) {
    const date = new Date(year, 0, 4); // 4. Januar ist immer in der ersten Kalenderwoche
    const dayOfWeek = date.getDay(); // Tag der Woche (0 = Sonntag, 1 = Montag, etc.)
    const offset = dayOfWeek <= 4 ? dayOfWeek - 1 : dayOfWeek - 7; // Berechne die Differenz zum Montag der ersten Woche
    const firstMonday = new Date(date.setDate(date.getDate() - offset));
    return new Date(firstMonday.setDate(firstMonday.getDate() + (week - 1) * 7));
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
        year: '2-digit',
    };
    const formattedDate = date.toLocaleDateString('de-DE', options).replace(/\./g, '/');
    const [weekday, rest] = formattedDate.split(', ');
    const shortWeekday = weekday.slice(0, 2);
    const isToday = date.toDateString() === new Date().toDateString();
    return isToday ? 'Heute' : `${shortWeekday}`;
}

// Funktion zur Erstellung des Dropdowns
function populateWeekDropdown() {
    const selectElement = document.getElementById('zeitraum');
    const currentDate = new Date();
    for (let i = 1; i <= 5; i++) {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1 - (i * 7));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const weekNumber = getWeek(startOfWeek);
        const option = document.createElement('option');
        option.value = `KW ${weekNumber}`;
        option.textContent = `KW ${weekNumber}`;
        selectElement.appendChild(option);
    }
}

// Funktion zur Berechnung der Kalenderwoche
function getWeek(d) {
    if (!d) {
        return 0;
    }

    let date;
    if (d instanceof Date) {
        date = new Date(d.getTime());
    } else {
        const x = d.split('-');
        date = new Date(x[0], x[1] - 1, x[2], 11);
    }

    const week1 = new Date(date.getFullYear(), 0, 4, 11, 0, 0, 0);
    const week1Monday = new Date(week1.getTime());
    week1Monday.setDate(week1Monday.getDate() - (week1Monday.getDay() || 7) + 1);

    if (week1Monday.getTime() > date.getTime()) {
        if (week1Monday.getFullYear() === week1.getFullYear()) {
            return getWeek(new Date(week1Monday.getFullYear() - 1, 11, 31, 11));
        }
        return getWeek(new Date(week1Monday.getFullYear(), 11, 31, 11));
    }

    const firstOfYear = new Date(date.getFullYear(), 0, 1, 11, 0, 0, 0);
    const lastOfYear = new Date(date.getFullYear(), 11, 31, 11, 0, 0, 0);
    const isLeap = date.getFullYear() % 4 === 0;
    const has53 = !isLeap && (firstOfYear.getDay() === 4 && lastOfYear.getDay() === 4) ||
        (isLeap && (firstOfYear.getDay() === 3 && lastOfYear.getDay() === 4 || firstOfYear.getDay() === 4 && lastOfYear.getDay() === 5));

    const dateMonday = new Date(date.getTime());
    dateMonday.setDate(dateMonday.getDate() - (dateMonday.getDay() || 7) + 1);

    const weekOffset = (dateMonday.getTime() - week1Monday.getTime()) / 1000 / 60 / 60 / 24;
    const result = 1 + Math.round(weekOffset / 7);
    if (result === 53 && !has53) {
        return 1;
    } else {
        return result;
    }
}

// Initialisiere Dropdown und lade Daten für die aktuelle Woche
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const last7DaysStart = new Date();
    last7DaysStart.setDate(today.getDate() - 6);
    getApiData(apiUrl, last7DaysStart, today);
    populateWeekDropdown();
});



