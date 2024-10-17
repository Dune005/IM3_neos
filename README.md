# Astro Impact - Neuentdeckungen im All
"Interaktive Medien III"<br>
Klasse MMP23c<br>
Fachhochschule Graubünden<br>
17. Oktober 2024<br>


Willkommen im Repository von "Astro Impact"
Wir sind ein Team von zwei begeisterten Entwicklern und Astro-Nerds, David Widmer und Claudio Riz. Mit "Astro-Impact" betreiben wir Datenforschung und finden heraus, welche NEOs (Near-Earth-Objects) von der NASA neuentdeckt wurden.

## Features

Auf unserer Webseite zeigen wir:

- **Wie viele NEOs werden täglich entdeckt?** Ein Säulendiagramm zeigt die Anzahl an Neuentdeckungen. Beim Hovern über die einzelnen Säulen gibt es Zusatzinfos zu den einzelnen NEOs (Name, Distanz, Geschwindigkeit, etc.)
- **Die fetteste Neuentdeckung der Woche:** Hier wird das NEO mit dem grössten Durchmesser in einer Info-Box angezeigt. Um eine Vorstellung von Geschwindigkeit und Distanz zu erhalten, siehst du, wie lange das Objekt bis zum Aufprall auf der Erde hätte, wenn es sich mit seiner Geschwindigkeit auf unseren Planeten zubewegen würde (was in Realität eigentlich nie der Fall ist.)
- **Hintergrund-Informationen:** Wir informieren darüber, welche Objekte als NEO bezeichnet werden und was es mit dem Begriff "Close Approach" auf sich hat.

## Über das Projekt
Die Knacknuss war, wie wir aus den Daten der API https://ssd-api.jpl.nasa.gov/cad.api eine Data-Story kreieren können. Es handelt sich nämlich um berechnete Daten und nicht um Live-Daten, die sich dynamisch ändern. Wenn ein NEO entdeckt wird, integriert die NASA diesen mit statischen Daten in die API, fertig. Indem wir aber mithilfe unserer Datenbank herausfinden, welche NEOs neu in die Datenbank eingetragen werden, schaffen wir selbst die Live-Daten und haben damit das Potenzial für eine Data-Story.

## Vorgehen
1. Auf Papier und später mit Figma bauten wir ein <b>Mock-Up</b> unseres One-Pagers. Schnell wurde uns in groben Zügen klar, welche Daten wir wo anzeigen wollen.
2. Grundgerüst im <b>html und css</b> bauen
3. <b>ETL-Pipeline</b> erstellen: Hier ging es darum, die richtigen Daten in unsere Datenbank einzupflegen.
- <i>Extract:</i> Wir rufen Daten für den Zeitraum vom aktuellen Tag bis 4 Jahre in die Zukunft ab. Hier sind auch "alte Daten" vorhanden, also NEOs, die schon vor längerer Zeit entdeckt wurden.
- <i>Transform:</i> Hier bearbeiten wir die Daten. Dazu gehören Formatierungen (Datum) und Berechnungen. Einerseits rechnen wir die Distanz von AE (Astronomische Einheit) in Kilometer um. Andererseits berechnen wir den geschätzten Durchmesser des Objekts mit der benötigten physikalischen Formel, die dafür den Helligkeitswert (h) und den Albedo-Wert benötigt. Den Helligkeitswert erhalten wir dabei von unserer API. Für den Albedo-Wert nehmen wir eine Konstante von 0.2 an, weil unsere API diesen Wert nicht enthält. Unsere Recherchen haben aber ergeben, dass 0.2 ein vernünftiger Mittelwert für astronomische Objekte darstellt.
- <i>Load:</i> Alle neuen Daten (welche potenziell Neuentdeckungen darstellen) werden in unsere Datenbank geladen. Wir haben dafür einen Crone-Job erstellt, der load.php jede Stunde ausführt, so entgeht uns mit Sicherheit keine Neuentdeckung des Tages und die Daten sind für die User in einem vernünftigen Mass aktuell.
4. <b>Unload:</b> Dieser Schritt entscheidet darüber, welche NEOs in der Datenbank als Neuentdeckung gehandelt werden. Wir haben die SQL-Abfrage dafür wie folgt konfiguriert:
- Alle Daten vom Erstimport werden exkludiert. Dieser Datensatz enthält zum allergrössten Teil "alte Daten".
- Die offiziellen Namen der NEOs sind so konzipiert, dass das Entdeckungsjahr enthalten ist (z. B. 2024 BA1). Wir rufen mit unload.php nun nur diese NEOs ab, dessen erste 4 Zeichen des Namens mit dem Eintragsjahr in die Datenbank übereinstimmen. Als Beispiel: Am 17.10.2024 wird das NEO "2018 VC3" eingetragen. Dieses NEO ist zwar ein Neueintrag in der Datenbank, anhand seines Namens können wir aber ausschliessen, dass es sich dabei um eine Neuentdeckung handelt.
5. <b>Javascript:</b>
Das Javascript besteht aus folgenden Hauptteilen:
- <i>Grafik:</i> Wir beziehen das Säulendiagramm von chartjs.org, designten es nach unseren Vorstellungen und befüllen es mit unseren Daten. Die Hauptdaten sind dabei der Timestamp, der Auskunft darüber gibt, wann eine Neuentdeckung gemacht wurde (=Zeitpunkt des Eintrag in die Datenbank) und die Anzahl an NEOs für diesen Timestamp (=Säulenhöhe). Mit dem Feature "tooltip" zeigen wir weitere Daten für alle Neuentdeckungen des jeweiligen Tags an.
- <i>Abfrage des grössten NEOs für die Anzeige "fetteste Neuentdeckung der Woche":</i> Hier vergleichen wir den Durchmesser aller Neuentdeckungen der aktuellen Woche und lassen die Daten desjenigen NEOs mit dem grössten Durchmesser ausspielen und anzeigen.
- <i>Datenauswahl für die letzten 5 Wochen:</i> Hier greifen wir mit "fetch" auf einen bestimmten Datumsbereich aus unload.php zu. Das dynamische Dropdown-Menü bestimmt dabei, um welchen Datumsbereich es sich handelt.
- <i>Zusätzliche Formatierungsfunktionen:</i> Hauptsächlich geht es hier darum, die Anzeige von einem Datum zu verändern. Dies betrifft die Anzeige von Kalenderwochen, Wochentagen, und exakten Daten. Gerade die Berechnung der Kalenderwoche ist dabei komplexer als man denken könnte, aber Internet sei Dank mussten wir diese nicht selbst herausknobeln.

## Reflexion zum Projekt
Das Programmierprojekt im Rahmen unseres Studiums war eine lehrreiche und herausfordernde Erfahrung, die uns als Team wachsen liess und unser Verständnis für die Arbeit mit APIs vertiefte und uns die Prozesse beim Verwenden von Datenbanken nahebrachte.

## Learnings und Herausforderungen
1. <i>Was ist eine Data-Story?:</i> Zu Beginn war für uns nicht ganz klar, welche Aspekte eine Datenanalyse berücksichtigen muss, um auch eine Data-Story zu sein. Wir wollten zuerst einfach die Daten aller NEOs auf einer Timeline anzeigen, die auf das Datum des Close Approaches zugreift. Uns war nicht bewusst, die Anzeige von statischen Daten noch keine Data-Story darstellt. Erst im Coaching mit Saumuel Rhyner wurde uns dies uns klar, woraufhin wir unser Konzept noch einmal überarbeiten mussten.
2. <i>Wirkweise einer ETL-Pipeline:</i> Für unser erstes Konzept wäre eine eigene Datenbank gar nicht nötig gewesen, wir hätten auch direkt auf die API zugreifen können. Erst mit der zweiten Idee wurde sie überhaupt nötig. Dieses Projekt zeigte uns sehr verständlich auf, wofür eine ETL-Pipeline benötigt wird und wie sie aufgebaut werden kann.
3. <i>"the little things":</i> Häufig sind es die kleinen Dinge, die viel mehr Arbeit verursachen, als man vermuten könnte. Ein Beispiel dafür ist die Anzeige der Wochentage. Beim breiten Bildschirm sollte die im Format "Do, 17.10.2024" angezeigt werden, bei schmaler Anzeige aus Design-Überlegungen nur noch "Do". Diese vermeintlich kleine Funktion in Javascript zu integrieren, beanspruchte mehrere Stunden.
4. <i>Laufende Überprüfung:</i> Es bietet sich an, mit "echo" (php), resp. "console.log" (js) den Programmierungsfortschritt laufend zu überwachen. Auch bei auftretenden Fehlern trägt dies häufig zur Aufklärung bei.

## Verbesserungs-/ Ausbaupotenzial
Die Daten, die wir auf "Astro Impact" anzeigen, sind nicht allzu viele. Es gibt gar nicht so viele Neuentdeckungen (maximal 4, Stand 17.10.2024), zusätzlich ist der Datensatz mit Distanz, Geschwindigkeit, Durchmesser und Close-Approach-Datum ziemlich überschaubar. Hier böte sich im Anzapfen weiterer APIs ein Ausbaupotenzial. Möglicherweise könnte dort mehr über diese NEOs erfahren werden, vorausgesetzt die Daten sind anhand beispielsweise anhand des Namens eindeutig einander zuzuordnen. Eventuell gäbe es Bilder davon. Eine weitere Ausbaumöglichkeit bestünde darin, die Daten für sogenannte NEAs (Near Earth Asteroids) in einer Sub-Page anzuzeigen. Diese sind in der Regel weiter von der Erde entfernt als unsere NEOs und werden in unserer Datenabfrage nicht erfasst.

## Teamarbeit
Während wir die Aufgaben "Texterstellung" und "Design" aufgeteilt haben, beschäftigten wir uns "gleichberechtigt" mit dem Programming. Um dabei unnötige Doppelspurigkeiten und Programmkonflikte zu verhindern, achteten wir darauf, dass jeweils nur jemand am gleichen File arbeitete. Um gleichzeitig an Lösungen für das gleiche Problem zu arbeiten, erstellten wir subfiles wie beispielsweise test_dw.html.
Auf menschlicher Ebene war es eine sehr gelungene Teamarbeit. Durch einen kreativen Austausch fanden wir gemeinsam Lösungen, auf die wir alleine wohl nicht gekommen wären.

## Projektverwaltung und Beitragende
Das Projekt wird von einem engagierten Team geleitet:

- **Claudio Riz:** Design & Programming <a href="https://github.com/Dune005">@Dune005</a> <br>
- **David Widmer:** Texte & Programming <a href="https://github.com/dwidmer87">@dwidmer87</a> <br>

## Hilfsmittel
Folgende Hilfsmittel wurden verwendet:

- YouTube-Tutorials
- ChatGPT
- GitHub Copilot

## Dank
Einen grossen Dank wollen wir unseren Dozenten ausprechen:
- Wolfgang Bock
- Lea Moser
- Samuel Rhyner