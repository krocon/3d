import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const thirdpartyDir = path.join(process.cwd(), 'thirdparty');

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

// Map of known clean German titles for the prompt models
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
    console.error(`  Failed to download ${url}: ${err.message}`);
    return false;
  }
}

async function processModel(url) {
  const match = url.match(/models\/(\d+)(?:-([^#]+))?(?:#profileId-(\d+))?/);
  if (!match) {
    console.log(`Skipping invalid URL: ${url}`);
    return;
  }

  const designId = match[1];
  let profileId = match[3];

  console.log(`\n======================================================`);
  console.log(`Processing Design ID: ${designId}`);
  console.log(`URL: ${url}`);

  // 1. Fetch metadata from API
  let designData = null;
  try {
    const resp = await fetch(`https://api.bambulab.com/v1/design-service/design/${designId}`);
    if (resp.ok) {
      designData = await resp.json();
    }
  } catch (e) {
    console.error(`  Error fetching API data for ${designId}:`, e.message);
  }

  if (!designData) {
    console.error(`  Could not load data for design ${designId}. Skipping.`);
    return;
  }

  // Profile ID fallback
  if (!profileId && designData.instances?.length > 0) {
    profileId = designData.instances[0].id?.toString() || designData.instances[0].profileId?.toString();
  }

  // Determine Title & Folder Name
  let title = germanTitles[designId];
  if (!title) {
    const tabTitle = runChromeJS(`/models/${designId}`, 'document.title');
    if (tabTitle) {
      title = tabTitle.replace(/ – Kostenloses 3D-Druckmodell.*$/, '').trim();
    }
  }
  if (!title) {
    title = designData.titleTranslated || designData.title || `Model-${designId}`;
  }

  // Clean folder name: sanitize slashes, colons, quotes
  const folderName = title
    .replace(/\//g, '-')
    .replace(/[:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const modelDir = path.join(thirdpartyDir, folderName);
  const stlDir = path.join(modelDir, 'stl');

  console.log(`Directory: thirdparty/${folderName}`);
  fs.mkdirSync(modelDir, { recursive: true });
  fs.mkdirSync(stlDir, { recursive: true });

  // 2. Generate and write readme.txt
  const readmePath = path.join(modelDir, 'readme.txt');
  let descriptionText = cleanHtml(designData.summary || designData.description || '');

  // Add instance / profile print details if available
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
  console.log(`  [OK] readme.txt saved (${readmeContent.length} bytes)`);

  // 3. Download images
  const pictures = designData.designExtension?.design_pictures || [];
  const imageUrls = [];
  if (designData.coverPortrait) imageUrls.push(designData.coverPortrait);
  for (const pic of pictures) {
    if (pic.url && !imageUrls.includes(pic.url)) {
      imageUrls.push(pic.url);
    }
  }

  console.log(`  Downloading ${imageUrls.length} image(s)...`);
  for (let i = 0; i < imageUrls.length; i++) {
    const imgUrl = imageUrls[i];
    const ext = path.extname(new URL(imgUrl).pathname) || '.webp';
    const imgName = i === 0 ? `${folderName}${ext}` : `${folderName}-${String(i + 1).padStart(2, '0')}${ext}`;
    const destPath = path.join(modelDir, imgName);
    if (!fs.existsSync(destPath)) {
      await downloadFile(imgUrl, destPath);
    }
  }
  console.log(`  [OK] Images downloaded`);

  // 4. Try 3MF & STL Download via Chrome session
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
    // Ignore and proceed
  }

  // Download 3MF if signed URL is available
  if (dl3mfUrl?.url) {
    const fileName = dl3mfUrl.name || `${folderName}.3mf`;
    const target3mf = path.join(modelDir, fileName);
    console.log(`  Downloading 3MF: ${fileName}...`);
    await downloadFile(dl3mfUrl.url, target3mf);
    console.log(`  [OK] 3MF file saved: ${fileName}`);
  } else {
    console.log(`  [INFO] 3MF direct signed download requires captcha verification`);
  }

  // Download STL Zip if signed URL is available
  if (dlZipUrl?.url) {
    const zipDest = path.join(modelDir, dlZipUrl.name || 'model_stls.zip');
    console.log(`  Downloading STL Archive...`);
    const ok = await downloadFile(dlZipUrl.url, zipDest);
    if (ok) {
      try {
        execSync(`unzip -o -q "${zipDest}" -d "${stlDir}"`);
        console.log(`  [OK] Extracted STLs to stl/`);
      } catch (err) {
        console.error(`  Failed to extract zip: ${err.message}`);
      }
    }
  } else {
    console.log(`  [INFO] STL archive direct signed download requires captcha verification`);
  }

  console.log(`[DONE] ${folderName}`);
}

async function main() {
  const promptFile = path.join(process.cwd(), 'prompt001.md');
  const content = fs.readFileSync(promptFile, 'utf8');
  const urls = content
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('* https://makerworld.com'))
    .map(l => l.replace(/^\*\s*/, ''));

  const uniqueUrls = [...new Set(urls)];
  console.log(`Found ${uniqueUrls.length} unique models to import.\n`);

  for (let i = 0; i < uniqueUrls.length; i++) {
    console.log(`\n>>> [${i + 1}/${uniqueUrls.length}] Starting import`);
    await processModel(uniqueUrls[i]);
    // Small pause between models
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n======================================================`);
  console.log(`All models processed! Running generate-thumbs...`);
  try {
    execSync('npm run generate-thumbs', { stdio: 'inherit' });
    console.log(`Thumbnail generation finished successfully.`);
  } catch (e) {
    console.error(`Thumbnail generation error: ${e.message}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
});
