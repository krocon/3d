---
description: Workflow-Trigger für Gruppen-Ergänzung und Umgruppierung
globs: ["thirdparty/**", "src/**", "scripts/**", "AGENTS.md"]
---

# Workflow: "Ergänze folgende Gruppen: ..."

Wenn der Nutzer Befehle wie **"Ergänze folgende Gruppen: <Liste>"** oder **"Ergänze die Gruppen: <Liste>"** eingibt, muss der Agent diesen 6-Schritte-Workflow ausführen:

1. **Ordner anlegen:** `thirdparty/<Gruppe>/` für jede neue Gruppe erstellen.
2. **Modelle umgruppieren:** Bestehende Modelle aus `_Diverse` (oder anderen Ordnern) mit `git mv` in die passenden neuen Gruppenordner verschieben. Alle Begleitdateien (readme.txt, Bilder, .3mf, stl/) beibehalten.
3. **Skripte & Heuristik updaten:**
   - In `src/import-makerworld.js`: `KNOWN_GROUPS` und `detectGroup(title, description)` um Keywords der neuen Gruppen erweitern.
   - In `public/index.html`: `placeholder` des Filters anpassen.
4. **AGENTS.md pflegen:** Die Listen der Standardgruppen in Abschnitt 1 und 4 aktualisieren.
5. **Thumbnails generieren & bereinigen:** `npm run generate-thumbs` ausführen.
6. **Verifikation & Bericht:** API-Endpunkt `/api/models` prüfen und dem Nutzer die Übersicht präsentieren.
