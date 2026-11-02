import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const ROOT = 'C:/Users/narci/.gemini/antigravity/scratch/Creador-de-mundos-Rpg';
const PORT = 8097;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.css': 'text/css',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (u === '/harness.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`<!DOCTYPE html>
<html>
<head><title>Harness</title></head>
<body style="margin:0;background:#000;">
  <iframe id="studio" src="/estudio-armaduras/index.html" style="width:1024px;height:768px;border:none;"></iframe>
  <script>
    window.studioListo = false;
    window.glbBase64 = null;
    window.glbError = null;

    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || d.origen !== 'armadura-estudio') return;
      console.log('Mensaje de estudio:', d.tipo);
      if (d.tipo === 'listo') {
        window.studioListo = true;
      }
      if (d.tipo === 'glb') {
        try {
          const bytes = new Uint8Array(d.buffer);
          let binary = '';
          const len = bytes.byteLength;
          const chunk = 16384;
          for (let i = 0; i < len; i += chunk) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + chunk, len)));
          }
          window.glbBase64 = btoa(binary);
          console.log('GLB base64 preparado, longitud:', window.glbBase64.length);
        } catch (err) {
          window.glbError = err.message;
        }
      }
    });

    window.pedirExport = function() {
      const iframe = document.getElementById('studio');
      iframe.contentWindow.postMessage({
        origen: 'juego-armaduras',
        tipo: 'exportar-personaje',
        id: 'aldeano',
        equipo: {
          underlayer: 3, // Cuero Oscuro Articulado con Correas
          belt: 5,       // Cinturón de Comandante con Hebilla
          boots: 1,      // Botas simples
          weapon: 12,    // Espada simple de aventura
          shield: 0,
          helmet: 0,
          torso: 0,
          pauldrons: 0,
          bracers: 0,
          tassets: 0,
          cape: 0
        }
      }, '*');
    };
  </script>
</body>
</html>`);
  }

  let fp = path.join(ROOT, u === '/' ? 'visor-mundo.html' : u);
  if (!fs.existsSync(fp)) {
    res.writeHead(404);
    return res.end('404 Not Found: ' + u);
  }
  const ext = path.extname(fp).toLowerCase();
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});

await new Promise(r => server.listen(PORT, r));
console.log('Servidor activo en http://localhost:' + PORT);

const puppeteerPath = pathToFileURL('C:/Users/narci/.gemini/antigravity/scratch/_herramientas/bench/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js').href;
const puppeteer = (await import(puppeteerPath)).default;

const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'export-aldeano-'));

try {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    userDataDir: perfil,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-angle=d3d11', '--enable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });

  page.on('console', msg => console.log('[Página]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[Error página]', err.message));

  console.log('Cargando harness...');
  await page.goto(`http://localhost:${PORT}/harness.html`, { waitUntil: 'load', timeout: 60000 });

  console.log('Esperando a que el estudio esté listo...');
  await page.waitForFunction(() => window.studioListo === true, { timeout: 60000 });
  console.log('¡Estudio listo! Solicitando exportación del aldeano...');

  await page.evaluate(() => window.pedirExport());

  console.log('Esperando GLB generado...');
  await page.waitForFunction(() => window.glbBase64 !== null || window.glbError !== null, { timeout: 60000 });

  const { glbBase64, glbError } = await page.evaluate(() => ({
    glbBase64: window.glbBase64,
    glbError: window.glbError
  }));

  if (glbError) {
    throw new Error('Error al generar GLB en cliente: ' + glbError);
  }

  const buf = Buffer.from(glbBase64, 'base64');
  const destDir = path.join(ROOT, 'npc', 'aldeanos');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, 'aldeano.glb');
  fs.writeFileSync(destPath, buf);

  console.log(`¡Éxito! Guardado aldeano.glb (${(buf.length / 1024).toFixed(1)} KB) en ${destPath}`);

  await browser.close();
} catch (e) {
  console.error('Error durante exportación:', e);
} finally {
  server.close();
  try { fs.rmSync(perfil, { recursive: true, force: true }); } catch {}
}
