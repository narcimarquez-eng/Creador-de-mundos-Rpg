import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ArmadurasLib = require(path.join(ROOT, 'js', 'armaduras.js'));

const MUESTRA_IDS = new Set([
  'pesada_D_1',
  'ligera_D_2',
  'mago_C_1',
  'pesada_C_2',
  'ligera_B_1',
  'mago_B_2',
  'pesada_A_1',
  'ligera_A_2',
  'pesada_S_1',
  'mago_S_2',
  'ligera_SR_1',
  'mago_SR_1'
]);

const PIEZAS_MUESTRA_SETS = new Set(['pesada_S_1', 'mago_SR_1']);
const PIEZA_RANURAS = ['helmet', 'torso', 'gloves', 'pants', 'boots'];
const ARMAS_MUESTRA = [
  { ranura: 'weapon', idx: 1, nombre: 'Espada Solar' },
  { ranura: 'weapon', idx: 2, nombre: 'Mandoble Solar (2M)' },
  { ranura: 'weapon', idx: 10, nombre: 'Hacha / Lanza Nv.10' },
  { ranura: 'shield', idx: 1, nombre: 'Escudo Heráldico del Sol' }
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm'
};

function parseArgs(argv) {
  const opts = {
    modo: 'muestra',
    size: 256,
    pieceSize: 128,
    wait: 650,
    edge: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    swiftshader: false
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--modo' && argv[i + 1]) opts.modo = argv[++i];
    else if (a === '--size' && argv[i + 1]) opts.size = Math.max(64, Number(argv[++i]) || 256);
    else if (a === '--piece-size' && argv[i + 1]) opts.pieceSize = Math.max(64, Number(argv[++i]) || 128);
    else if (a === '--wait' && argv[i + 1]) opts.wait = Math.max(150, Number(argv[++i]) || 650);
    else if (a === '--edge' && argv[i + 1]) opts.edge = argv[++i];
    else if (a === '--swiftshader') opts.swiftshader = true;
  }
  return opts;
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      const reqUrl = decodeURIComponent((req.url || '/').split('?')[0]);
      const safeRel = path.normalize(reqUrl).replace(/^(\.\.[/\\])+/, '');
      let filePath = path.join(rootDir, safeRel === '/' || safeRel === '\\' ? 'index.html' : safeRel);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => resolve({ server: srv, port: srv.address().port }));
  });
}

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
  return r.json();
}

async function waitForPageTarget(cdpPort, urlPart, timeoutMs = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const list = await fetchJson(`http://127.0.0.1:${cdpPort}/json`);
      const page = list.find((p) => p.type === 'page' && p.url && p.url.includes(urlPart));
      if (page && page.webSocketDebuggerUrl) return page;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Timeout esperando target CDP de Edge');
}

function connectCdp(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let nextId = 1;
    const pending = new Map();

    ws.onopen = () => resolve({
      send(method, params = {}) {
        return new Promise((res, rej) => {
          const id = nextId++;
          pending.set(id, { res, rej, method });
          ws.send(JSON.stringify({ id, method, params }));
        });
      },
      async evalExpr(expression) {
        const out = await this.send('Runtime.evaluate', {
          expression,
          awaitPromise: true,
          returnByValue: true
        });
        if (out.exceptionDetails) {
          const desc = out.exceptionDetails.exception?.description || out.exceptionDetails.text || 'Error en página';
          throw new Error(desc);
        }
        return out.result?.value;
      },
      close() {
        try { ws.close(); } catch (_) {}
      }
    });

    ws.onerror = (err) => reject(err);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message || JSON.stringify(msg.error)));
        else res(msg.result);
      }
    };
  });
}

function rebuildManifest(outDir) {
  const manifestPath = path.join(outDir, 'manifest.json');
  const prev = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : {};

  const setsDir = path.join(outDir, 'sets');
  const sets = {};
  for (const s of ArmadurasLib.SETS_ARMADURA) {
    const fname = `${s.id}.webp`;
    if (fs.existsSync(path.join(setsDir, fname))) {
      sets[s.id] = `assets/armaduras/sets/${fname}`;
    }
  }

  const piezas = {};
  const piezasDir = path.join(outDir, 'piezas');
  if (fs.existsSync(piezasDir)) {
    for (const f of fs.readdirSync(piezasDir)) {
      if (f.endsWith('.webp')) piezas[f.slice(0, -5)] = `assets/armaduras/piezas/${f}`;
    }
  }

  const armas = {};
  const armasDir = path.join(outDir, 'armas');
  if (fs.existsSync(armasDir)) {
    for (const f of fs.readdirSync(armasDir)) {
      if (f.endsWith('.webp')) armas[f.slice(0, -5)] = `assets/armaduras/armas/${f}`;
    }
  }

  const manifest = {
    version: prev.version || '1.0.0',
    modelo: 'estudio-armaduras-3d',
    sets,
    piezas,
    armas
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  return manifest;
}

async function runCapture(opts, plan) {
  const { server, port: httpPort } = await startStaticServer(ROOT);
  const cdpPort = await getFreePort();
  const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-armaduras-'));
  let edgeProc = null;
  let cdp = null;

  try {
    const edgeArgs = [
      '--headless=new',
      '--window-size=640,640',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${tmpProfile}`,
      '--autoplay-policy=no-user-gesture-required',
      '--no-first-run',
      '--no-default-browser-check'
    ];
    if (opts.swiftshader) {
      edgeArgs.push('--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader');
    }
    edgeArgs.push(`http://127.0.0.1:${httpPort}/estudio-armaduras/index.html`);

    edgeProc = spawn(opts.edge, edgeArgs, { stdio: 'ignore' });
    const target = await waitForPageTarget(cdpPort, 'estudio-armaduras/index.html', 20000);
    cdp = await connectCdp(target.webSocketDebuggerUrl);
    await cdp.send('Runtime.enable');

    // Esperar a que WebGL + window.__studio + maniquí estén listos
    const tReady0 = Date.now();
    let ready = false;
    while (Date.now() - tReady0 < 30000) {
      ready = await cdp.evalExpr(`(() => {
        const cv = document.querySelector('#webgl-viewport canvas');
        const st = window.__studio;
        return Boolean(cv && cv.width > 100 && st && st.estudioCompilado && st.mannequinRoot && Array.isArray(st.ARMOR_LOOKS));
      })()`);
      if (ready) break;
      await new Promise((r) => setTimeout(r, 250));
    }
    if (!ready) throw new Error('El Estudio de Armaduras 3D no inicializó window.__studio a tiempo');

    // Preparar helpers de encuadre completo, aislamiento de sockets y captura WebP
    await cdp.evalExpr(`(() => {
      const vp = document.getElementById('webgl-viewport');
      Array.from(document.body.children).forEach(el => {
        if (el !== vp && !el.contains(vp)) el.style.display = 'none';
      });
      const st = window.__studio;
      const SOCKET_GROUPS = {
        helmet: ['helmet'],
        torso: ['torso', 'shouldersL', 'shouldersR'],
        gloves: ['glovesL', 'glovesR'],
        pants: ['belt', 'tassetL', 'tassetR', 'cuissesL', 'cuissesR', 'kneesL', 'kneesR'],
        boots: ['bootsL', 'bootsR'],
        weapon: ['weaponR'],
        shield: ['shieldL']
      };

      const fijarCamGeneral = () => {
        if (st && st.camera && st.controls) {
          st.camera.position.set(0.58, 1.18, 3.08);
          st.controls.target.set(0, 0.98, 0);
          st.controls.update();
        }
      };

      const capturarCanvas = (size) => {
        const src = document.querySelector('#webgl-viewport canvas');
        if (!src || !src.width || !src.height) throw new Error('Canvas WebGL no disponible');
        const out = document.createElement('canvas');
        out.width = size;
        out.height = size;
        const ctx = out.getContext('2d');
        const lado = Math.min(src.width, src.height);
        const sx = Math.floor((src.width - lado) / 2);
        const sy = Math.floor((src.height - lado) / 2);
        ctx.drawImage(src, sx, sy, lado, lado, 0, 0, size, size);
        return out.toDataURL('image/webp', 0.90);
      };

      const esDescendiente = (obj, allowedSet) => {
        let p = obj;
        while (p) {
          if (allowedSet.has(p)) return true;
          p = p.parent;
        }
        return false;
      };

      const aislarYEncuadrar = (ranura, socketNames, dirVec) => {
        const sceneRoot = st.mannequinRoot && st.mannequinRoot.parent;
        if (!sceneRoot || !st.armorSockets) return null;
        const allowed = new Set(socketNames.map(k => st.armorSockets[k]).filter(Boolean));
        if (ranura !== 'weapon' && ranura !== 'shield' && typeof st.getUnifiedSlotMeshes === 'function') {
          for (const m of st.getUnifiedSlotMeshes(ranura)) {
            if (m) allowed.add(m);
          }
        }
        if (!allowed.size) return null;

        const savedVis = new Map();
        const saveSet = (o, v) => {
          if (!savedVis.has(o)) savedVis.set(o, o.visible);
          o.visible = v;
        };

        const activeMeshes = [];
        sceneRoot.traverse(o => {
          if (o.isMesh) {
            if (esDescendiente(o, allowed)) {
              if (o.visible) activeMeshes.push(o);
            } else {
              saveSet(o, false);
            }
          }
        });

        // Asegurar ancestros de sockets visibles
        for (const sock of allowed) {
          let p = sock;
          while (p) {
            saveSet(p, true);
            p = p.parent;
          }
        }

        if (!activeMeshes.length) {
          for (const [o, v] of savedVis.entries()) o.visible = v;
          return null;
        }

        sceneRoot.updateMatrixWorld(true);
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (const m of activeMeshes) {
          const g = m.geometry;
          if (!g) continue;
          if (m.isSkinnedMesh && typeof m.computeBoundingBox === 'function') m.computeBoundingBox();
          if (!g.boundingBox && typeof g.computeBoundingBox === 'function') g.computeBoundingBox();
          const bb = (m.isSkinnedMesh && m.boundingBox) ? m.boundingBox : g.boundingBox;
          if (!bb) continue;
          const e = m.matrixWorld.elements;
          const xs = [bb.min.x, bb.max.x], ys = [bb.min.y, bb.max.y], zs = [bb.min.z, bb.max.z];
          for (let ix = 0; ix < 2; ix++) {
            for (let iy = 0; iy < 2; iy++) {
              for (let iz = 0; iz < 2; iz++) {
                const vx = xs[ix], vy = ys[iy], vz = zs[iz];
                const wx = e[0] * vx + e[4] * vy + e[8] * vz + e[12];
                const wy = e[1] * vx + e[5] * vy + e[9] * vz + e[13];
                const wz = e[2] * vx + e[6] * vy + e[10] * vz + e[14];
                if (wx < minX) minX = wx; if (wx > maxX) maxX = wx;
                if (wy < minY) minY = wy; if (wy > maxY) maxY = wy;
                if (wz < minZ) minZ = wz; if (wz > maxZ) maxZ = wz;
              }
            }
          }
        }

        if (!isFinite(minX) || !isFinite(maxX)) {
          for (const [o, v] of savedVis.entries()) o.visible = v;
          return null;
        }

        const cx = (minX + maxX) * 0.5;
        const cy = (minY + maxY) * 0.5;
        const cz = (minZ + maxZ) * 0.5;
        const sx = maxX - minX, sy = maxY - minY, sz = maxZ - minZ;
        const maxDim = Math.max(sx, sy, sz, 0.14);
        const fovRad = ((st.camera.fov || 40) * Math.PI) / 180;
        const dist = Math.max(0.28, (maxDim * 0.68) / Math.tan(fovRad * 0.5));
        const len = Math.hypot(dirVec[0], dirVec[1], dirVec[2]) || 1;
        st.controls.target.set(cx, cy, cz);
        st.camera.position.set(cx + (dirVec[0] / len) * dist, cy + (dirVec[1] / len) * dist, cz + (dirVec[2] / len) * dist);
        st.controls.update();

        return () => {
          for (const [o, v] of savedVis.entries()) o.visible = v;
          fijarCamGeneral();
        };
      };

      fijarCamGeneral();

      window.__equiparArmadura = async (setInfo, waitMs) => {
        window.postMessage({
          origen: 'juego-armaduras',
          tipo: 'preview-armadura',
          armorLook: setInfo.armorLook,
          claseArmadura: setInfo.claseArmadura,
          grado: setInfo.grado,
          ocultarUi: true
        }, '*');
        fijarCamGeneral();
        await new Promise(r => setTimeout(r, waitMs));
        fijarCamGeneral();
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      };

      window.__capturarArmadura = async (setInfo, size, waitMs) => {
        await window.__equiparArmadura(setInfo, waitMs);
        return capturarCanvas(size);
      };

      window.__capturarPieza = async (ranura, size) => {
        const sockets = SOCKET_GROUPS[ranura];
        if (!sockets) return { ok: false, motivo: 'ranura_desconocida' };
        const dir = ranura === 'boots' ? [0.42, 0.28, 1.0]
          : ranura === 'gloves' ? [0.45, 0.22, 1.0]
          : [0.28, 0.14, 1.0];
        const restore = aislarYEncuadrar(ranura, sockets, dir);
        if (!restore) return { ok: false, motivo: 'vacio' };
        try {
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          return { ok: true, dataUrl: capturarCanvas(size) };
        } finally {
          restore();
        }
      };

      window.__capturarArma = async (ranura, idx, size, waitMs) => {
        const sockets = ranura === 'weapon' ? ['weaponR', 'shieldL'] : SOCKET_GROUPS[ranura];
        if (!sockets) return { ok: false, motivo: 'ranura_desconocida' };
        st.STATE.fit.villagerOutfit = null;
        st.STATE.equipment.weapon = ranura === 'weapon' ? idx : 1;
        st.STATE.equipment.shield = ranura === 'shield' ? idx : 0;
        st.updateWardrobePieces();
        await new Promise(r => setTimeout(r, waitMs));
        const dir = ranura === 'shield' ? [-0.45, 0.14, 1.0] : [0.45, 0.16, 1.0];
        const restore = aislarYEncuadrar(ranura, sockets, dir);
        if (!restore) return { ok: false, motivo: 'vacio' };
        try {
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          return { ok: true, dataUrl: capturarCanvas(size) };
        } finally {
          restore();
        }
      };
      return true;
    })()`);

    const guardarWebp = (dataUrl, dstPath) => {
      if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/webp;base64,')) {
        throw new Error(`Salida inesperada al guardar ${path.basename(dstPath)}`);
      }
      const buf = Buffer.from(dataUrl.slice('data:image/webp;base64,'.length), 'base64');
      if (buf.subarray(0, 4).toString('ascii') !== 'RIFF' || buf.subarray(8, 12).toString('ascii') !== 'WEBP') {
        throw new Error(`Cabecera WebP inválida en ${path.basename(dstPath)}`);
      }
      fs.mkdirSync(path.dirname(dstPath), { recursive: true });
      fs.writeFileSync(dstPath, buf);
      return buf.length;
    };

    const setsDir = path.join(ROOT, 'assets', 'armaduras', 'sets');
    const piezasDir = path.join(ROOT, 'assets', 'armaduras', 'piezas');
    const armasDir = path.join(ROOT, 'assets', 'armaduras', 'armas');

    let blankCount = 0;
    let totalCapturados = 0;

    // 1. Sets completos
    for (let i = 0; i < plan.sets.length; i++) {
      const s = plan.sets[i];
      const dataUrl = await cdp.evalExpr(
        `window.__capturarArmadura(${JSON.stringify({
          armorLook: s.armorLook,
          claseArmadura: s.claseArmadura,
          grado: s.grado
        })}, ${opts.size}, ${opts.wait})`
      );
      const len = guardarWebp(dataUrl, path.join(setsDir, `${s.id}.webp`));
      totalCapturados++;
      if (len < 1800) blankCount++;
      console.log(`[SET ${i + 1}/${plan.sets.length}] OK ${s.id}.webp (${(len / 1024).toFixed(1)} KB)`);
    }

    // 2. Piezas sueltas aisladas
    for (let i = 0; i < plan.piezasSets.length; i++) {
      const s = plan.piezasSets[i];
      await cdp.evalExpr(
        `window.__equiparArmadura(${JSON.stringify({
          armorLook: s.armorLook,
          claseArmadura: s.claseArmadura,
          grado: s.grado
        })}, ${opts.wait})`
      );
      for (const ranura of PIEZA_RANURAS) {
        const res = await cdp.evalExpr(`window.__capturarPieza(${JSON.stringify(ranura)}, ${opts.pieceSize})`);
        if (!res || !res.ok) {
          console.log(`[PIEZA ${s.id}_${ranura}] omitida (${res?.motivo || 'sin malla'})`);
          continue;
        }
        const len = guardarWebp(res.dataUrl, path.join(piezasDir, `${s.id}_${ranura}.webp`));
        totalCapturados++;
        if (len < 900) blankCount++;
        console.log(`[PIEZA] OK ${s.id}_${ranura}.webp (${(len / 1024).toFixed(1)} KB)`);
      }
    }

    // 3. Armas y escudos aislados
    for (let i = 0; i < plan.armas.length; i++) {
      const a = plan.armas[i];
      const res = await cdp.evalExpr(
        `window.__capturarArma(${JSON.stringify(a.ranura)}, ${a.idx}, ${opts.pieceSize}, ${opts.wait})`
      );
      if (!res || !res.ok) {
        console.log(`[ARMA ${a.ranura}_${a.idx}] omitida (${res?.motivo || 'sin malla'})`);
        continue;
      }
      const len = guardarWebp(res.dataUrl, path.join(armasDir, `${a.ranura}_${a.idx}.webp`));
      totalCapturados++;
      if (len < 900) blankCount++;
      console.log(`[ARMA ${i + 1}/${plan.armas.length}] OK ${a.ranura}_${a.idx}.webp (${(len / 1024).toFixed(1)} KB)`);
    }

    if (totalCapturados > 0 && blankCount === totalCapturados) {
      throw new Error('Todas las capturas resultaron prácticamente vacías; WebGL no renderizó correctamente');
    }
  } finally {
    if (cdp) cdp.close();
    if (edgeProc) {
      try { edgeProc.kill(); } catch (_) {}
    }
    try { server.close(); } catch (_) {}
    setTimeout(() => {
      try { fs.rmSync(tmpProfile, { recursive: true, force: true }); } catch (_) {}
    }, 300);
  }
}

function construirPlan(modo) {
  const catalogo = JSON.parse(fs.readFileSync(path.join(ROOT, 'estudio-armaduras', 'catalogo.json'), 'utf8'));
  const weaponsAll = (catalogo.ranuras && catalogo.ranuras.weapon) || [];
  const shieldsAll = (catalogo.ranuras && catalogo.ranuras.shield) || [];

  if (modo === 'piezas_muestra') {
    return {
      sets: [],
      piezasSets: ArmadurasLib.SETS_ARMADURA.filter((s) => PIEZAS_MUESTRA_SETS.has(s.id)),
      armas: ARMAS_MUESTRA
    };
  }
  if (modo === 'todas') {
    return { sets: ArmadurasLib.SETS_ARMADURA, piezasSets: [], armas: [] };
  }
  if (modo === 'todo') {
    return {
      sets: ArmadurasLib.SETS_ARMADURA,
      piezasSets: ArmadurasLib.SETS_ARMADURA,
      armas: [
        ...weaponsAll.map((w) => ({ ranura: 'weapon', idx: w.idx, nombre: w.nombre })),
        ...shieldsAll.map((sh) => ({ ranura: 'shield', idx: sh.idx, nombre: sh.nombre }))
      ]
    };
  }
  return {
    sets: ArmadurasLib.SETS_ARMADURA.filter((s) => MUESTRA_IDS.has(s.id)),
    piezasSets: [],
    armas: []
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(opts.edge)) {
    console.error(`ERROR: No se encontró Microsoft Edge en ${opts.edge}`);
    process.exit(1);
  }

  const plan = construirPlan(opts.modo);
  console.log(
    `Plan captura 3D (modo=${opts.modo}): sets=${plan.sets.length}, piezasSets=${plan.piezasSets.length}x5, armas=${plan.armas.length}`
  );

  try {
    await runCapture(opts, plan);
  } catch (err) {
    if (!opts.swiftshader) {
      console.warn('Reintentando captura con WebGL SwiftShader por fallback:', err.message);
      await runCapture({ ...opts, swiftshader: true }, plan);
    } else {
      throw err;
    }
  }

  const outDir = path.join(ROOT, 'assets', 'armaduras');
  const m = rebuildManifest(outDir);
  console.log(`Manifest actualizado (${m.modelo}): sets=${Object.keys(m.sets).length}, piezas=${Object.keys(m.piezas).length}, armas=${Object.keys(m.armas).length}`);
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
