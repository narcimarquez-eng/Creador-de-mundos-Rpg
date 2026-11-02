import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const ROOT = 'C:/Users/narci/.gemini/antigravity/scratch/Creador-de-mundos-Rpg';
const PORT = 8098;

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
  let fp = path.join(ROOT, u === '/' ? 'visor-mundo.html' : u);
  if (!fs.existsSync(fp)) {
    res.writeHead(404);
    return res.end('404');
  }
  const ext = path.extname(fp).toLowerCase();
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});

await new Promise(r => server.listen(PORT, r));
console.log('Servidor activo en http://localhost:' + PORT);

const puppeteerPath = pathToFileURL('C:/Users/narci/.gemini/antigravity/scratch/_herramientas/bench/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js').href;
const puppeteer = (await import(puppeteerPath)).default;

const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-aldeano-'));

try {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    userDataDir: perfil,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-angle=d3d11', '--enable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('Page error:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Console error:', msg.text());
  });

  console.log('1. Generando mundo base en index.html...');
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => localStorage.getItem('rpgMundo.actual'), { timeout: 30000 });

  console.log('2. Navegando a visor-mundo.html...');
  await page.goto(`http://localhost:${PORT}/visor-mundo.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.waitForFunction(() => window.__visor && window.__visor.towns && window.__visor.towns.length > 0, { timeout: 40000 });

  // Crear personaje si el modal está visible
  const creadorVisible = await page.evaluate(() => {
    const el = document.getElementById('crear');
    return el && el.classList.contains('show');
  });
  if (creadorVisible) {
    console.log('Aceptando creación de personaje...');
    await page.waitForFunction(() => {
      const ok = document.getElementById('crear-ok');
      return ok && !ok.disabled;
    }, { timeout: 15000 });
    await page.click('#crear-ok');
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('3. Asegurando acompañante activo y esperando GLB...');
  const resultado = await page.evaluate(async () => {
    // Abrir crónica y activar capítulo 4 para Rowan
    const skCronica = document.getElementById('sk-cronica');
    if (skCronica) skCronica.click();
    const btnActivar = document.querySelector('button[data-accion="activar"][data-cap="3"]');
    if (btnActivar) {
      btnActivar.click();
    } else {
      for (let i = 0; i < 3; i++) {
        const btnSaltar = document.querySelector('button[data-accion="saltar"]');
        if (btnSaltar) btnSaltar.click();
      }
    }
    const btnCerrar = document.getElementById('cro-cerrar');
    if (btnCerrar) btnCerrar.click();

    // Esperar a que el GLB se cargue y se instale
    for (let i = 0; i < 80; i++) {
      const a = window.__visor?.acompanante;
      if (a && a.mesh && a.mesh.name === 'Acompanante_Rowan_GLB') {
        break;
      }
      await new Promise(r => setTimeout(r, 100));
    }

    const ac = window.__visor?.acompanante;
    if (!ac) return { ok: false, error: 'No existe acompañante en __visor' };

    return {
      ok: true,
      nombre: ac.nombre,
      meshName: ac.mesh ? ac.mesh.name : null,
      tieneMixer: !!ac.mixer,
      animacionActual: ac.nombreAnimActual,
      accionesDisponibles: ac.actions ? Object.keys(ac.actions) : [],
      posicion: { x: ac.x, y: ac.y, z: ac.z }
    };
  });

  console.log('4. Diagnóstico acompañante Rowan:', resultado);

  // Dejar que avance la simulación unos segundos
  await new Promise(r => setTimeout(r, 2500));

  const screenshotPath = 'C:/Users/narci/.gemini/antigravity/brain/75ab95b4-2c69-4636-a5da-a879648e1988/visor-aldeano-armadura.png';
  await page.screenshot({ path: screenshotPath });
  console.log('5. Captura guardada en:', screenshotPath);

  if (errors.length > 0) {
    console.error('ERRORES DETECTADOS:', errors);
  } else {
    console.log('¡TODO PERFECTO! Cero errores en consola');
  }

  await browser.close();
} catch (err) {
  console.error('Error durante verificación:', err);
} finally {
  server.close();
  try { fs.rmSync(perfil, { recursive: true, force: true }); } catch {}
}
