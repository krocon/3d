# AGENTS.md — Richtlinien für 3D Model Repository & MakerWorld Importer

Dieses Dokument beschreibt die Projektarchitektur, Verzeichniskonventionen und den Workflow für den automatisierten Import von 3D-Modellen aus MakerWorld.

---

## 1. Verzeichnisstruktur & Datenmodell

Alle Drittanbieter-Modelle befinden sich unter `thirdparty/` geordnet nach Themengruppen (z. B. `Autos`, `Leuchten`, `Behälter`, `Raspberry Pi`, `Mac`, `iPhone`, `Apple`, `Computergehäuse`, `Fotografie`, `Figuren`, `Kunst`, `Vase`, `Schale`, `Werkzeug`, `_Diverse`). Für jedes Modell gilt folgende feste Struktur:

```text
thirdparty/
└── <Gruppe>/
    └── <Deutscher Modellname>/
        ├── readme.txt                     # Metadaten, Link & Beschreibung
        ├── <Deutscher Modellname>.jpg/webp # Hauptbild
        ├── <Deutscher Modellname>-02.jpg  # Zusätzliche Bilder (-02, -03 ...)
        ├── <Modell>.3mf                   # 3MF-Druckdatei (direkt im Modellordner)
        └── stl/                           # STL-Dateien (immer im Unterordner stl/)
            ├── Teil_1.stl
            └── Teil_2.stl
```

### Aufbau von `readme.txt`
1. **Zeile 1:** Modellname (bevorzugt deutscher Titel).
2. **Zeile 2:** Leerzeile.
3. **Zeile 3:** Vollständige Original-URL von MakerWorld (z. B. `https://makerworld.com/de/models/...#profileId-...`).
4. **Zeile 4:** Leerzeile.
5. **Ab Zeile 5:** Bereinigte Beschreibung (ohne HTML-Tags), gefolgt von Druckeinstellungen (Druckprofil, Schichthöhe, Wandlinien, Infill, Filamente & Farben).

### Vorschaubilder & Web-Viewer
- Vorschaubilder werden in `public/thumbs/` abgelegt.
- Nach jedem Hinzufügen, Verschieben oder Ändern von Bildern im `thirdparty/`-Verzeichnis **muss** folgender Befehl ausgeführt werden:
  ```bash
  npm run generate-thumbs
  ```
- Der Server (`src/server.js`) liest `thirdparty/` dynamisch aus und stellt den lokalen 3D-Model-Viewer bereit (`npm start`).

---

## 2. MakerWorld Importer (`src/import-makerworld.js`)

Der Importer automatisiert die Ordneranlage innerhalb der passenden Themengruppe (automatische Erkennung oder manuelle Vorgabe), das Schreiben der `readme.txt`, den Bild-Download und den Abruf der 3MF/STL-Dateien.

### Aufruf-Optionen für neue Linklisten:

#### Option A: Direkt im Code als String-Array
In `src/import-makerworld.js` das Array `URL_LIST` befüllen:
```javascript
export const URL_LIST = [
  'https://makerworld.com/de/models/1724774-pencil-container-a-pencil-shaped-container#profileId-1831063',
  'https://makerworld.com/de/models/3213113-big-kodak-film-roll-pen-holder-storage-box#profileId-3637348',
  // Optional mit eigenem deutschem Titel und/oder expliziter Themengruppe:
  { url: 'https://makerworld.com/de/models/...', title: 'Mein Modellname', group: 'Behälter' }
];
```
Danach ausführen:
```bash
npm run import-models
# oder
node src/import-makerworld.js
```

#### Option B: Über eine `links.json` im Projekt-Root
Erstelle einfach eine Datei `links.json` im Hauptverzeichnis:
```json
[
  "https://makerworld.com/de/models/1724774...",
  "https://makerworld.com/de/models/3213113..."
]
```
Und starte:
```bash
npm run import-models
```

#### Option C: Über die Befehlszeile (CLI)
Mehrere URLs direkt als Argumente oder als JSON-Array übergeben:
```bash
# Einzelne Argumente:
node src/import-makerworld.js "https://makerworld.com/de/models/1724774..." "https://makerworld.com/de/models/3213113..."

# Als JSON-Array-String:
node src/import-makerworld.js '["https://makerworld.com/de/models/1724774...", "https://makerworld.com/de/models/3213113..."]'
```

#### Option D: Über eine beliebige JSON- oder Textdatei
Eine Datei mit einem JSON-Array oder zeilenweisen URLs übergeben:
```bash
node src/import-makerworld.js --file meine-links.json
```

#### Option E: Programmatisch in anderen Skripten
```javascript
import { importUrls } from './src/import-makerworld.js';

await importUrls([
  'https://makerworld.com/de/models/1724774...',
  'https://makerworld.com/de/models/3213113...'
]);
```

---

## 3. Technische API-Details & Downloads

### Öffentliche API (ohne Authentifizierung)
- **Endpunkt:** `https://api.bambulab.com/v1/design-service/design/<designId>`
- Liefert ohne Login: Titel, Beschreibung (`summary`), Render- und Bauteilbilder (`design_pictures`), Platten-Filamente und Profileinstellungen.

### Modelldateien (3MF & STL)
- **3MF-Endpunkt:** `/api/v1/design-service/instance/<profileId>/f3mf?type=download`
- **STL-ZIP-Endpunkt:** `/api/v1/design-service/instance/<profileId>/f3mf?type=download&fileType=3mfstl`
- **Raw-Model-Endpunkt:** `/api/v1/design-service/design/<designId>/model?modelType=all&type=download`

### Authentifizierung & Bot-Schutz (Geetest Captcha)
- Automatisierte API-Logins per E-Mail/Passwort erfordern bei Bambu Lab eine 2FA-Bestätigung per Mail (`verifyCode`).
- Direkte Downloads über die API verlangen bei automatisierten Anfragen eine Geetest-Captcha-Validierung (`captchaId`).
- **Browser-Schnittstelle:** In Google Chrome ist **„JavaScript von Apple Events erlauben“** aktiviert (unter *Ansicht > Entwickler*). Wenn MakerWorld-Tabs in Chrome geöffnet sind, kann das Skript direkt über die bestehende Browsersitzung interagieren.
- Sollte ein Download ein Captcha erfordern, legt das Skript das Verzeichnis, die `readme.txt` und alle Bilder vollständig an und dokumentiert den Status. Die 3MF/STL-Dateien können dann manuell oder via Bambu Studio in den vorbereiteten Ordner gelegt werden.

---

## 4. Wichtige Regeln für AI-Agents

1. **Namens- und Strukturkonventionen:** Jedes Modell muss sich in einer Untergruppe unter `thirdparty/<Gruppe>/<Modellname>/` befinden (Standardgruppen: `Autos`, `Leuchten`, `Behälter`, `Raspberry Pi`, `Mac`, `iPhone`, `Apple`, `Computergehäuse`, `Fotografie`, `Figuren`, `Kunst`, `Vase`, `Schale`, `Werkzeug`, `_Diverse`). Ordnernamen dürfen niemals Slashes (`/`) enthalten; ersetze Slashes durch `-` (z. B. `Mac Mini M1-M2 Dock`).
2. **Dateipfade:** STL-Dateien gehören **ausnahmslos** in das Unterverzeichnis `stl/` des jeweiligen Modells.
3. **Bestehende Daten erhalten:** Überschreibe keine bestehenden manuell gepflegten Notizen oder STL-Dateien, es sei denn, der Nutzer fordert es explizit.
4. **Thumbnail-Generierung:** Führe nach jeder Änderung an Bildern `npm run generate-thumbs` aus.
5. **Portierbarkeit:** Verwende Node.js ECMAScript Modules (`import`/`export`) und halte `package.json` aktuell.
