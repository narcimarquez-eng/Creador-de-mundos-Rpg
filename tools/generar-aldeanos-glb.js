/**
 * tools/generar-aldeanos-glb.js
 * Genera los 10 modelos GLB de aldeanos medievales reales desde estudio-armaduras/index.html
 * usando el generador de aldeanos (ropas de tela/cuero, texturas de rostro reales y clips idle/walk).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEST_DIR = path.join(ROOT, 'npc', 'aldeanos');
const PORT = 8098;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.css': 'text/css',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp'
};

// Especificación de los 10 aldeanos que necesita el mundo RPG
const ALDEANOS_SPEC = [
  { file: 'herrero.glb',    professionId: 'herrero',    gender: 'hombre', build: 'fornido',  faceIdx: 0 },
  { file: 'mercader.glb',   professionId: 'mercader',   gender: 'hombre', build: 'natural',  faceIdx: 1 },
  { file: 'herbolario.glb', professionId: 'herbolario', gender: 'mujer',  build: 'esbelto',  faceIdx: 0 },
  {
    file: 'informante.glb', professionId: 'campesino',  gender: 'hombre', build: 'esbelto',  faceIdx: 2,
    outfit: {
      torso: 'merchant_doublet', lower: 'wool_trousers', sleeves: 'long_linen',
      belt: 'leather_pouch', boots: 'laced_boot', head: 'cloth_cowl',
      shirtColor: '#cfc9be', leatherColor: '#432d23', pantsColor: '#2c303c', accentColor: '#36465e'
    }
  },
  { file: 'tabernero.glb',  professionId: 'tabernero',  gender: 'hombre', build: 'robusto',  faceIdx: 3 },
  { file: 'campesino.glb',  professionId: 'campesino',  gender: 'hombre', build: 'esbelto',  faceIdx: 4 },
  { file: 'lenador.glb',    professionId: 'lenador',    gender: 'hombre', build: 'fornido',  faceIdx: 5 },
  { file: 'cazador.glb',    professionId: 'cazador',    gender: 'hombre', build: 'esbelto',  faceIdx: 6 },
  { file: 'aldeana.glb',    professionId: 'aldeana',    gender: 'mujer',  build: 'esbelto',  faceIdx: 1 },
  { file: 'aldeano.glb',    professionId: 'campesino',  gender: 'hombre', build: 'natural',  faceIdx: 7,
    outfit: {
      torso: 'peasant_tunic', lower: 'puttees_breeches', sleeves: 'rolled',
      belt: 'rope_pouch', boots: 'turnshoe', head: 'none',
      shirtColor: '#e0d6c2', leatherColor: '#63412b', pantsColor: '#3d4754', accentColor: '#6b5c45'
    }
  }
];

function parseGlbInfo(buf) {
  if (buf.length < 20 || buf.toString('ascii', 0, 4) !== 'glTF') {
    throw new Error('Cabecera glTF inválida');
  }
  const chunkLen = buf.readUInt32LE(12);
  const chunkType = buf.toString('ascii', 16, 20);
  if (chunkType !== 'JSON') throw new Error('Primer chunk no es JSON');
  const json = JSON.parse(buf.toString('utf8', 20, 20 + chunkLen));
  const anims = (json.animations || []).map(a => a.name);
  const imgs = (json.images || []).length;
  const meshes = (json.meshes || []).length;
  return { anims, imgs, meshes };
}

const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (u === '/harness-aldeanos.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Generador Aldeanos GLB</title></head>
<body style="margin:0;background:#090d16;color:#e2e8f0;font-family:sans-serif">
  <iframe id="studio" src="/estudio-armaduras/index.html" style="width:960px;height:720px;border:0"></iframe>
  <script>
    window.__studioReady = false;
    window.__rostros = null;
    window.__exports = {};
    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || d.origen !== 'armadura-estudio') return;
      if (d.tipo === 'listo') window.__studioReady = true;
      if (d.tipo === 'rostros') window.__rostros = d.rostros || [];
      if (d.tipo === 'glb' && d.id) {
        const bytes = new Uint8Array(d.buffer);
        let bin = '';
        const chunk = 16384;
        for (let i = 0; i < bytes.byteLength; i += chunk) {
          bin += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunk, bytes.byteLength)));
        }
        window.__exports[d.id] = { ok: true, base64: btoa(bin), nombre: d.nombre, rostro: d.rostro || null };
      }
      if (d.tipo === 'error' && d.id) {
        window.__exports[d.id] = { ok: false, error: d.error || 'Error desconocido' };
      }
    });
    window.pedirRostros = () => {
      document.getElementById('studio').contentWindow.postMessage({
        origen: 'juego-armaduras', tipo: 'listar-rostros', id: 'faces'
      }, '*');
    };
    window.exportarUno = (payload) => {
      delete window.__exports[payload.id];
      document.getElementById('studio').contentWindow.postMessage({
        origen: 'juego-armaduras',
        tipo: 'exportar-aldeano',
        ...payload
      }, '*');
    };
  </script>
</body>
</html>`);
  }

  let fp = path.join(ROOT, u === '/' ? 'visor-mundo.html' : u.replace(/^\/+/, ''));
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
    res.writeHead(404);
    return res.end('404 Not Found: ' + u);
  }
  const ext = path.extname(fp).toLowerCase();
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});

await new Promise(r => server.listen(PORT, r));
console.log('Servidor generador activo en http://localhost:' + PORT);

const puppeteerCandidates = [
  'C:/Users/narci/.gemini/antigravity/scratch/_herramientas/bench/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js',
  path.join(ROOT, 'node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')
];
const puppeteerFile = puppeteerCandidates.find(p => fs.existsSync(p));
if (!puppeteerFile) {
  server.close();
  throw new Error('No se encontró puppeteer-core');
}
const puppeteer = (await import(pathToFileURL(puppeteerFile).href)).default;

const chromePath = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
].find(p => fs.existsSync(p));
if (!chromePath) {
  server.close();
  throw new Error('No se encontró Chrome/Edge');
}

const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-aldeanos-'));
let browser;
try {
  browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    userDataDir: perfil,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-angle=d3d11', '--enable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 800 });
  page.on('pageerror', err => console.error('[pageerror]', err.message));

  await page.goto(`http://localhost:${PORT}/harness-aldeanos.html`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.__studioReady === true, { timeout: 60000 });

  await page.evaluate(() => window.pedirRostros());
  await page.waitForFunction(() => Array.isArray(window.__rostros) && window.__rostros.length > 0, { timeout: 30000 });
  const rostros = await page.evaluate(() => window.__rostros);
  const hombres = rostros.filter(r => r.gender === 'hombre');
  const mujeres = rostros.filter(r => r.gender === 'mujer');
  console.log(`Rostros cargados: ${rostros.length} (${hombres.length} H / ${mujeres.length} M)`);

  fs.mkdirSync(DEST_DIR, { recursive: true });

  for (const spec of ALDEANOS_SPEC) {
    const pool = spec.gender === 'mujer' ? (mujeres.length ? mujeres : rostros) : (hombres.length ? hombres : rostros);
    const chosenFace = pool[spec.faceIdx % pool.length];
    const exportId = 'ald_' + spec.file.replace('.glb', '');
    console.log(`Exportando ${spec.file} (${spec.professionId}, ${spec.gender}, rostro=${chosenFace.id})...`);

    await page.evaluate((payload) => window.exportarUno(payload), {
      id: exportId,
      professionId: spec.professionId,
      gender: spec.gender,
      build: spec.build,
      outfit: spec.outfit || null,
      rostro: chosenFace ? { id: chosenFace.id, gender: chosenFace.gender } : null,
      fps: 12,
      maxTex: 384
    });

    await page.waitForFunction((eid) => !!window.__exports[eid], { timeout: 90000 }, exportId);
    const res = await page.evaluate((eid) => window.__exports[eid], exportId);
    if (!res || !res.ok) throw new Error(`Fallo exportando ${spec.file}: ${res && res.error}`);

    const buf = Buffer.from(res.base64, 'base64');
    const info = parseGlbInfo(buf);
    if (!info.anims.includes('idle') || !info.anims.includes('walk')) {
      throw new Error(`${spec.file} no contiene clips idle/walk (${info.anims.join(', ')})`);
    }
    if (info.imgs < 1) {
      throw new Error(`${spec.file} no contiene texturas embebidas`);
    }
    const outPath = path.join(DEST_DIR, spec.file);
    fs.writeFileSync(outPath, buf);
    console.log(`  OK ${spec.file}: ${(buf.length / 1024).toFixed(1)} KB, mallas=${info.meshes}, texturas=${info.imgs}, anims=[${info.anims.join(',')}]`);
  }

  console.log('Todos los aldeanos GLB generados y verificados correctamente.');
} finally {
  if (browser) await browser.close();
  server.close();
  try { fs.rmSync(perfil, { recursive: true, force: true }); } catch {}
}
