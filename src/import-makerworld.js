import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const thirdpartyDir = path.join(process.cwd(), 'thirdparty');

/**
 * ============================================================================
 * LINKLISTE / URL_LIST
 * ============================================================================
 * Trage hier beim nächsten Mal deine MakerWorld-Links als String-Array ein.
 *
 * Beispiele:
 *
 * 1. Als einfaches String-Array:
 * export const URL_LIST = [
 *   'https://makerworld.com/de/models/1724774-pencil-container#profileId-1831063',
 *   'https://makerworld.com/de/models/3213113-big-kodak-film-roll#profileId-3637348'
 * ];
 *
 * 2. Optional mit eigenem deutschen Modellnamen und Themengruppe:
 * export const URL_LIST = [
 *   { url: 'https://makerworld.com/de/models/1724774...', title: 'Bleistift-Behälter', group: 'Behälter' }
 * ];
 *
 * Nach dem Eintragen einfach ausführen:
 *   npm run import-models
 *   (oder: node src/import-makerworld.js)
 * ============================================================================
 */
export const URL_LIST = [
  // Trage hier deine MakerWorld-URLs ein:
  'https://makerworld.com/de/models/2604148-nfc-3dlp-itx-pc-case-with-lp-gpu-support?from=search#profileId-2873660',
  'https://makerworld.com/de/models/2261082-pc-case-mini-itx?from=search#profileId-2463570',
  'https://makerworld.com/de/models/3067358-3-7l-itx-case-supports-up-to-5070mini?from=search#profileId-3452616',
  'https://makerworld.com/de/models/1979514-fractal-north-itx?from=search#profileId-2129229',
  'https://makerworld.com/de/models/1842823-mac-style-workstation-itx-case-vertical-inverted-v?from=recommend#profileId-1969004',
  'https://makerworld.com/de/models/1988858-hdd-cage-1-6-bays?from=recommend#profileId-2681620',
  'https://makerworld.com/de/models/206743-robot-vacuum-ramp?from=recommend#profileId-821776',
  'https://makerworld.com/de/models/3161278-desktop-style-raspberry-pi-5-case-m-2-hat-fan#profileId-3572718',
  'https://makerworld.com/de/models/1261216-cover-i-phone-12-pro-max?from=search#profileId-1285826',
  'https://makerworld.com/de/models/501904-iphone-12-pro-max-cover-hexagon-design?from=search#profileId-417064',
  'https://makerworld.com/de/models/3005430-apple-iphone-12-pro-max?from=search#profileId-3374839',
  'https://makerworld.com/de/models/960944-iphone-12-pro-max-case?from=search#profileId-930886',
  'https://makerworld.com/de/search/models?keyword=iphone+12+pro+max&isTrending=true',

];

// Helper to strip HTML tags and decode entities
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<li[^>]*>/gi, '\n* ')
    .replace(/<\/li>/gi, '')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<h[1-6][^>]*>/gi, '\n\n### ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Execute javascript in Google Chrome tab matching a URL substring
function runChromeJS(tabUrlSub, jsCode) {
  try {
    const script = `
tell application "Google Chrome"
    repeat with w in windows
        repeat with t in tabs of w
            if (URL of t) contains ${JSON.stringify(tabUrlSub)} then
                return (execute t javascript ${JSON.stringify(jsCode)})
            end if
        end repeat
    end repeat
    return "NOT_FOUND"
end tell
`;
    const res = execSync('osascript', { input: script, encoding: 'utf8' }).trim();
    if (res === 'missing value' || res === 'NOT_FOUND') return null;
    return res;
  } catch (err) {
    return null;
  }
}

// Map of known clean German titles for existing models
const germanTitles = {
  '1724774': 'Bleistiftbehälter - Ein Bleistift-förmiger Behälter',
  '3213113': 'GROSSE Kodak Filmrolle – Stifthalter & Aufbewahrungsbox',
  '3222215': 'Großer Radiergummi – Schreibtisch-Organizer & Aufbewahrungsbehälter',
  '3124649': 'Riesen-Lippenbalsam-Mäppchen - Jumbo-Stiftehalter',
  '2882438': 'Gewelltes Bic-Feuerzeughülle',
  '3173421': 'Die Glückspille (Wandkunst)',
  '2798796': 'Dock iPhone MagSafe Retro-Mac-Originalcomputer',
  '1419433': 'Moderne Tischleuchte – Design im Stil des Space Age',
  '2595522': 'Licht-Klappe Steckdosenleiste',
  '3090603': 'Gerippte Bogenvase - Trendige Ästhetik Kunstdekor',
  '2920408': 'Mac Mini Ständer zur thermischen Optimierung (12-18)',
  '2210565': 'IKEA TIMMERFLOTTE Ständer',
  '2590517': 'Luxus LED Lampe im italienischen Design (LED Kit-001)',
  '2270773': 'Minimalistischer Elgato Stream Deck Ständer',
  '1645766': 'Mac mini Wandhalterung',
  '2043990': 'Licht Schalter und Steckdosen Abdeckung 81mmx81mm',
  '2058735': 'Magic Mouse Vertikale Ladestation & Display-Ständer',
  '3177494': 'BILRESA Individuelle Frontplatte - mit Konfigurator und Rohlingen',
  '3083393': 'Mac mini M4 Macintosh iPad-Gehäuse Macintosh-Gehäuse für iPad',
  '2712956': 'IKEA BILRESA Umbau zu einem Vier-Tasten-Wandschalter',
  '2834105': 'DIY Cineback für A7 IV, A7S III, A7R V, A7R IV, A1',
  '1536989': 'Modern Mac – eine Hommage an den Raspberry Pi Macintosh von 1984',
  '643237': 'Schlankes Apple AirTag Etui',
  '1637923': 'Mac Mini M1-M2 Halterung VESA-Halterung Power-Button-Drücker',
  '477292': 'Retro-PC-Gehäuse (Mac Mini One)',
  '1527130': 'Tragbarer Mac Mini mit iPad-Setup',
  '1817116': 'JVC 3100R Retro-Stil für Macmini M4',
  '1095094': 'Mac Mini M1-2 Dock',
  '1018681': 'Apple AirTag Brieftaschenkarte',
  '2784098': 'Türstopper - Männchen',
  '956319': 'Kapseltresor - Zahlenschloss',
  '629782': 'Hüllenfreundliches iPhone 12 bis 18 Pro & Max Dock',
  '615378': 'iPhone Standby-Modus-Dock (entwickelt mit OVERWERK)',
  '1496323': 'Steinesatz Fiat 500',
  '1884108': 'Spiderman Wandkunst',
  '1111830': 'L-E-G-O Lichtstein-Lampe (KEIN AMS)',
  '1293993': 'Schmelzender LEGO-Stiftständer'
};

async function downloadFile(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buf);
    return true;
  } catch (err) {
    console.error(`  Fehler beim Download von ${url}: ${err.message}`);
    return false;
  }
}

export const KNOWN_GROUPS = [
  'Autos',
  'Leuchten',
  'Behälter',
  'Raspberry Pi',
  'Mac',
  'iPhone',
  'Apple',
  'Computergehäuse',
  'Fotografie',
  'Figuren',
  'Kunst',
  'Vase',
  'Schale',
  'Werkzeug',
  '_Diverse'
];

/**
 * Erkennt automatisch die passende Themengruppe anhand von Titel und Beschreibung.
 */
export function detectGroup(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();

  // Autos
  if (/(auto|automobile|car|fahrzeug|vehicle|porsche|ferrari|bmw|mercedes|fiat|bulli|volkswagen|shelby|cobra|audi|mustang)/i.test(text)) {
    return 'Autos';
  }
  // Leuchten
  if (/(lampe|leuchte|lichtstein|lichtbox|lamp|light|lantern|desk lamp|night light|led kit|lighting)/i.test(text) && !/(schalter|steckdose|power strip|blackout)/i.test(text)) {
    return 'Leuchten';
  }
  // Behälter
  if (/(behälter|container|aufbewahrung|organizer|box mit deckel|taschentuchbox|stifthalter|bleistiftbehälter|tresor|vault|dose|trockenmittelbehälter|dispenser|storage)/i.test(text)) {
    return 'Behälter';
  }
  // Raspberry Pi
  if (/raspberry\s*pi|raspi/i.test(text)) {
    return 'Raspberry Pi';
  }
  // Mac
  if (/(mac\s*mini|macbook|imac|macintosh|magic mouse)/i.test(text)) {
    return 'Mac';
  }
  // iPhone
  if (/(iphone|magsafe)/i.test(text)) {
    return 'iPhone';
  }
  // Apple (AirTag, etc.)
  if (/(airtag|apple watch)/i.test(text)) {
    return 'Apple';
  }
  // Computergehäuse
  if (/(pc case|itx case|matx|computergehäuse|gehäuse.*gaming)/i.test(text)) {
    return 'Computergehäuse';
  }
  // Fotografie
  if (/(kamera|camera|objektiv|lens|cineback|v-mount|fotostudio|photo studio)/i.test(text)) {
    return 'Fotografie';
  }
  // Figuren
  if (/(figur|figure|asterix|obelix|tintin|tim und struppi|gromit|wallace|action figure)/i.test(text)) {
    return 'Figuren';
  }
  // Kunst
  if (/(wandkunst|wall art|skulptur|sculpture|ornament|glückspille)/i.test(text)) {
    return 'Kunst';
  }
  // Vase
  if (/vase/i.test(text)) {
    return 'Vase';
  }
  // Schale
  if (/(schale|bowl)/i.test(text)) {
    return 'Schale';
  }
  // Werkzeug
  if (/(werkzeug|tool|bosch|sortimo|l-boxx|pbd40|gridfinity|abstreifer|hobel|klemme|zange|schraub|bohrer|sägeblatt)/i.test(text)) {
    return 'Werkzeug';
  }

  return '_Diverse';
}

function findExistingGroup(folderName) {
  try {
    const groups = fs.readdirSync(thirdpartyDir, { withFileTypes: true }).filter(d => d.isDirectory());
    for (const g of groups) {
      if (fs.existsSync(path.join(thirdpartyDir, g.name, folderName))) {
        return g.name;
      }
    }
  } catch {}
  return null;
}

export async function processModel(input) {
  let url = '';
  let customTitle = null;
  let customGroup = null;

  if (typeof input === 'string') {
    url = input.trim().replace(/^[\*\-\s]+/, '');
  } else if (input && typeof input === 'object') {
    url = (input.url || '').trim().replace(/^[\*\-\s]+/, '');
    customTitle = input.title ? input.title.trim() : null;
    customGroup = input.group ? input.group.trim() : null;
  }

  const match = url.match(/models\/(\d+)(?:-([^#]+))?(?:#profileId-(\d+))?/);
  if (!match) {
    console.log(`Ungültige oder unbekannte URL übersprungen: ${url || JSON.stringify(input)}`);
    return;
  }

  const designId = match[1];
  let profileId = match[3];

  console.log(`\n======================================================`);
  console.log(`Verarbeite Design-ID: ${designId}`);
  console.log(`URL: ${url}`);

  // 1. Metadaten von API abrufen
  let designData = null;
  try {
    const resp = await fetch(`https://api.bambulab.com/v1/design-service/design/${designId}`);
    if (resp.ok) {
      designData = await resp.json();
    }
  } catch (e) {
    console.error(`  Fehler beim API-Abruf für ${designId}:`, e.message);
  }

  if (!designData) {
    console.error(`  Konnte Daten für Design ${designId} nicht laden. Überspringe.`);
    return;
  }

  // Fallback für Profil-ID
  if (!profileId && designData.instances?.length > 0) {
    profileId = designData.instances[0].id?.toString() || designData.instances[0].profileId?.toString();
  }

  // Titel und Ordnername ermitteln
  let title = customTitle || germanTitles[designId];
  if (!title) {
    const tabTitle = runChromeJS(`/models/${designId}`, 'document.title');
    if (tabTitle) {
      title = tabTitle.replace(/ – Kostenloses 3D-Druckmodell.*$/, '').trim();
    }
  }
  if (!title) {
    title = designData.titleTranslated || designData.title || `Model-${designId}`;
  }

  // Ordnernamen bereinigen (keine Slashes oder ungültige Sonderzeichen)
  const folderName = title
    .replace(/\//g, '-')
    .replace(/[:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const descriptionText = cleanHtml(designData.summary || designData.description || '');

  // Zielgruppe bestimmen
  const existingGroup = findExistingGroup(folderName);
  const targetGroup = customGroup || existingGroup || detectGroup(title, descriptionText);

  const modelDir = path.join(thirdpartyDir, targetGroup, folderName);
  const stlDir = path.join(modelDir, 'stl');

  console.log(`Zielordner: thirdparty/${targetGroup}/${folderName}`);
  fs.mkdirSync(modelDir, { recursive: true });
  fs.mkdirSync(stlDir, { recursive: true });

  // 2. readme.txt erstellen
  const readmePath = path.join(modelDir, 'readme.txt');
  let profileNotes = '';
  const selectedInstance = (designData.instances || []).find(i => i.id == profileId) || designData.instances?.[0];
  if (selectedInstance) {
    const ps = selectedInstance.extention?.modelInfo?.projectSettings;
    const filaments = selectedInstance.extention?.modelInfo?.plates?.flatMap(p => p.filaments || []) || [];
    const filamentInfo = [...new Set(filaments.map(f => `${f.type || 'PLA'} (${f.color || ''})`))].filter(Boolean);

    const notes = [];
    if (selectedInstance.title) notes.push(`Druckprofil: ${selectedInstance.title}`);
    if (ps?.layerHeight) notes.push(`Schichthöhe: ${ps.layerHeight} mm`);
    if (ps?.wallLoops) notes.push(`Wandlinien: ${ps.wallLoops}`);
    if (ps?.sparseInfillDensity) notes.push(`Infill: ${ps.sparseInfillDensity}`);
    if (filamentInfo.length > 0) notes.push(`Filament: ${filamentInfo.join(', ')}`);

    if (notes.length > 0) {
      profileNotes = '\n\nDruckeinstellungen:\n' + notes.map(n => `- ${n}`).join('\n');
    }
  }

  const readmeContent = `${title}\n\n${url}\n\n${descriptionText}${profileNotes}\n`;
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
  console.log(`  [OK] readme.txt geschrieben (${readmeContent.length} Zeichen)`);

  // 3. Bilder herunterladen
  const pictures = designData.designExtension?.design_pictures || [];
  const imageUrls = [];
  if (designData.coverPortrait) imageUrls.push(designData.coverPortrait);
  for (const pic of pictures) {
    if (pic.url && !imageUrls.includes(pic.url)) {
      imageUrls.push(pic.url);
    }
  }

  console.log(`  Lade ${imageUrls.length} Bild(er) herunter...`);
  for (let i = 0; i < imageUrls.length; i++) {
    const imgUrl = imageUrls[i];
    const ext = path.extname(new URL(imgUrl).pathname) || '.webp';
    const imgName = i === 0 ? `${folderName}${ext}` : `${folderName}-${String(i + 1).padStart(2, '0')}${ext}`;
    const destPath = path.join(modelDir, imgName);
    if (!fs.existsSync(destPath)) {
      await downloadFile(imgUrl, destPath);
    }
  }
  console.log(`  [OK] Bilder vorhanden`);

  // 4. Download 3MF & STL über Chrome-Sitzung versuchen
  let dl3mfUrl = null;
  let dlZipUrl = null;

  try {
    const checkDlCode = `
    (() => {
      window.__dlAttempt = null;
      Promise.all([
        fetch('/api/v1/design-service/instance/${profileId}/f3mf?type=download').then(r => r.json()).catch(() => null),
        fetch('/api/v1/design-service/instance/${profileId}/f3mf?type=download&fileType=3mfstl').then(r => r.json()).catch(() => null),
        fetch('/api/v1/design-service/design/${designId}/model?modelType=all&type=download').then(r => r.json()).catch(() => null)
      ]).then(([f3mf, stlZip, rawZip]) => {
        window.__dlAttempt = JSON.stringify({ f3mf, stlZip, rawZip });
      }).catch(e => { window.__dlAttempt = JSON.stringify({ error: e.message }); });
    })()
    `;
    runChromeJS(`/models/${designId}`, checkDlCode);

    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise(r => setTimeout(r, 600));
      const res = runChromeJS(`/models/${designId}`, 'window.__dlAttempt');
      if (res && res !== 'missing value' && res !== 'null') {
        const parsed = JSON.parse(res);
        if (parsed.f3mf?.url) dl3mfUrl = parsed.f3mf;
        if (parsed.stlZip?.url) dlZipUrl = parsed.stlZip;
        else if (parsed.rawZip?.url) dlZipUrl = parsed.rawZip;
        break;
      }
    }
  } catch (err) {
    // Fehler bei Chrome-Abfrage ignorieren
  }

  // 3MF speichern wenn URL signiert vorhanden
  if (dl3mfUrl?.url) {
    const fileName = dl3mfUrl.name || `${folderName}.3mf`;
    const target3mf = path.join(modelDir, fileName);
    console.log(`  Lade 3MF: ${fileName}...`);
    await downloadFile(dl3mfUrl.url, target3mf);
    console.log(`  [OK] 3MF gespeichert: ${fileName}`);
  } else {
    console.log(`  [INFO] 3MF-Download erfordert Browser-Captcha-Bestätigung`);
  }

  // STL Zip herunterladen & entpacken wenn signiert vorhanden
  if (dlZipUrl?.url) {
    const zipDest = path.join(modelDir, dlZipUrl.name || 'model_stls.zip');
    console.log(`  Lade STL-Archiv herunter...`);
    const ok = await downloadFile(dlZipUrl.url, zipDest);
    if (ok) {
      try {
        execSync(`unzip -o -q "${zipDest}" -d "${stlDir}"`);
        console.log(`  [OK] STLs entpackt nach stl/`);
      } catch (err) {
        console.error(`  Fehler beim Entpacken der ZIP: ${err.message}`);
      }
    }
  } else {
    console.log(`  [INFO] STL-Archiv-Download erfordert Browser-Captcha-Bestätigung`);
  }

  console.log(`[ABGESCHLOSSEN] ${folderName}`);
}

/**
 * Hauptfunktion zum Abarbeiten eines Arrays von URLs:
 * @param {string[]} inputUrls - Array von MakerWorld-URLs
 */
export async function importUrls(inputUrls) {
  if (!Array.isArray(inputUrls) || inputUrls.length === 0) {
    console.log('Keine URLs übergeben.');
    return;
  }

  // Duplikate bereinigen und Einträge normalisieren
  const seen = new Set();
  const itemsToProcess = [];
  for (const item of inputUrls) {
    let url = '';
    if (typeof item === 'string') {
      url = item.trim().replace(/^[\*\-\s]+/, '');
    } else if (item && typeof item === 'object') {
      url = (item.url || '').trim().replace(/^[\*\-\s]+/, '');
    }
    if (!url || !url.includes('makerworld.com')) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    itemsToProcess.push(item);
  }

  if (itemsToProcess.length === 0) {
    console.log('Keine gültigen MakerWorld-URLs gefunden.');
    return;
  }

  console.log(`Starte Import für ${itemsToProcess.length} Modell(e)...`);

  for (let i = 0; i < itemsToProcess.length; i++) {
    console.log(`\n>>> [${i + 1}/${itemsToProcess.length}] Starte Modell`);
    await processModel(itemsToProcess[i]);
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n======================================================`);
  console.log(`Alle Modelle verarbeitet! Aktualisiere Thumbnails...`);
  try {
    execSync('npm run generate-thumbs', { stdio: 'inherit' });
    console.log(`Thumbnail-Generierung erfolgreich abgeschlossen.`);
  } catch (e) {
    console.error(`Thumbnail-Generierung fehlgeschlagen: ${e.message}`);
  }
}

// CLI- und Ausführungslogik
async function run() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Verwendung von import-makerworld:');
    console.log('1. String-Array im Code: URL_LIST in src/import-makerworld.js definieren und "npm run import-models" ausführen');
    console.log('2. JSON-Array via CLI: node src/import-makerworld.js \'["https://makerworld.com/..."]\'');
    console.log('3. URLs direkt via CLI: node src/import-makerworld.js "https://makerworld.com/..." "https://..."');
    console.log('4. Datei übergeben: node src/import-makerworld.js --file urls.json');
    console.log('5. links.json im Projekt-Root anlegen und "npm run import-models" ausführen');
    return;
  }

  // 1. CLI Argument: JSON Array als einzelner String
  if (args.length === 1 && args[0].startsWith('[') && args[0].endsWith(']')) {
    try {
      const parsed = JSON.parse(args[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`Verwende ${parsed.length} URLs aus übergebenem JSON-Array.`);
        await importUrls(parsed);
        return;
      }
    } catch {}
  }

  // 2. CLI Argumente: URLs direkt als Argumente übergeben
  const cliUrls = args.filter(a => a.startsWith('http://') || a.startsWith('https://') || a.includes('makerworld.com'));
  if (cliUrls.length > 0) {
    console.log('Verwende URLs aus CLI-Argumenten.');
    await importUrls(cliUrls);
    return;
  }

  // 3. CLI Argument: Datei übergeben mit --file <dateipfad>
  const fileArgIdx = args.indexOf('--file');
  if (fileArgIdx !== -1 && args[fileArgIdx + 1]) {
    const filePath = path.resolve(process.cwd(), args[fileArgIdx + 1]);
    console.log(`Lese URLs aus Datei: ${filePath}`);
    const raw = fs.readFileSync(filePath, 'utf8');
    let urls = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) urls = parsed;
    } catch {
      urls = raw
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.includes('makerworld.com'))
        .map(l => l.replace(/^[\*\-\s]+/, ''));
    }
    await importUrls(urls);
    return;
  }

  // 4. Wenn URL_LIST im Code gefüllt ist
  if (Array.isArray(URL_LIST) && URL_LIST.length > 0) {
    console.log(`Verwende ${URL_LIST.length} URL(s) aus exportierter URL_LIST.`);
    await importUrls(URL_LIST);
    return;
  }

  // 5. Fallback: links.json falls im Projektverzeichnis vorhanden
  const linksJsonPath = path.join(process.cwd(), 'links.json');
  if (fs.existsSync(linksJsonPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(linksJsonPath, 'utf8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`Verwende ${parsed.length} URLs aus links.json...`);
        await importUrls(parsed);
        return;
      }
    } catch (e) {
      console.warn(`Warnung: links.json konnte nicht gelesen werden: ${e.message}`);
    }
  }

  // 6. Wenn keine URLs angegeben sind, Hilfestellung ausgeben
  console.log('\nHinweis: Aktuell sind keine URLs angegeben.');
  console.log('So kannst du beim nächsten Mal URLs importieren:');
  console.log('  1. Trage URLs in src/import-makerworld.js in URL_LIST = [...] ein und führe "npm run import-models" aus.');
  console.log('  2. Lege eine Datei "links.json" mit einem String-Array im Hauptverzeichnis an.');
  console.log('  3. Über die Befehlszeile: node src/import-makerworld.js "https://makerworld.com/..."');
  console.log('  4. JSON-Array via Terminal: node src/import-makerworld.js \'["https://..."]\'');
  console.log('  5. Beliebige Datei einlesen: node src/import-makerworld.js --file prompt001.md\n');
}

// Direkt ausführen wenn über CLI gestartet
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  run().catch(err => console.error('Unerwarteter Fehler:', err));
}
