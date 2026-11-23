#!/usr/bin/env node
// Busca en el bundle de Sonniss (GDC Game Audio Bundle, descargado a mano) los sonidos de sfx/prompts.json.
//
//   node tools/importar-sonniss.mjs <carpeta-del-bundle>              # solo lista candidatos
//   node tools/importar-sonniss.mjs <carpeta-del-bundle> --copiar 3   # copia los 3 mejores de cada efecto
//
// Escribe sfx/sonniss-candidatos.md. Con --copiar, convierte a .ogg (mono, 44,1 kHz, máx. 4 s) con ffmpeg si lo
// encuentra; si no, copia el archivo tal cual. Salida: sfx/<categoria>/sonniss/<id>_<n>.ogg
//
// Licencia Sonniss: uso libre en juegos (también comercial), pero no se puede redistribuir la librería tal cual.
// Sube al repositorio solo los sonidos que el juego usa, y mejor si el repositorio es privado.
import { readFile, writeFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import { join, dirname, extname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const [carpeta, ...resto] = process.argv.slice(2);
if (!carpeta) { console.error('Uso: node tools/importar-sonniss.mjs <carpeta-del-bundle> [--copiar N]'); process.exit(1); }
const iCopiar = resto.indexOf('--copiar');
const copiar = iCopiar >= 0 ? Number(resto[iCopiar + 1] || 3) : 0;

// Palabras que debe tener el nombre (todas las de un grupo de "si"), y que suman o restan puntos.
// Los códigos en mayúscula son categorías UCS que usa Sonniss (WEAPSwrd, ELECArc, MAGElem…).
const reglas = {
  espada_choque_01:     { si: [['sword|blade|swrd'], ['clash|clang|hit|impact|parry|block']], mas: ['metal', 'steel', 'clash'], menos: ['whoosh', 'swish', 'draw', 'sheath', 'flesh'] },
  espada_choque_pesado: { si: [['sword|blade|swrd|greatsword|axe'], ['clash|clang|impact|heavy']], mas: ['heavy', 'big', 'great', 'large'], menos: ['whoosh', 'light', 'small'] },
  espada_roce:          { si: [['sword|blade|swrd|metal'], ['scrape|grind|slide|screech']], mas: ['sword', 'blade'], menos: [] },
  espada_parada_chispa: { si: [['sword|blade|swrd'], ['parry|deflect|ting|ring|spark']], mas: ['parry', 'spark', 'ring'], menos: ['whoosh'] },
  espada_escudo:        { si: [['shield'], ['hit|impact|block|bash']], mas: ['sword', 'wood', 'metal'], menos: [] },
  espada_swing:         { si: [['sword|blade|swrd|weapon'], ['whoosh|swish|swing|swoosh']], mas: ['sword', 'fast'], menos: ['impact', 'hit', 'clash'] },
  espada_impacto_carne: { si: [['sword|blade|slash|stab|cut'], ['flesh|body|gore|stab|slice']], mas: ['armor', 'chain'], menos: ['whoosh'] },
  torbellino:           { si: [['spin|whirl|swirl|circular'], ['whoosh|sword|blade|wind']], mas: ['sword'], menos: [] },
  rayo_impacto:         { si: [['lightning|thunder|thun|bolt'], ['strike|crack|close|impact|clap']], mas: ['close', 'crack', 'strike'], menos: ['distant', 'far', 'rain'] },
  rayo_carga:           { si: [['electric|elec|static|energy|voltage'], ['charge|rise|build|power up|powerup']], mas: ['electric', 'charge'], menos: [] },
  rayo_cadena:          { si: [['electric|elec|zap|arc|spark|tesla'], ['zap|arc|crackle|spark']], mas: ['zap', 'arc'], menos: ['charge', 'hum'] },
  rayo_espada:          { si: [['electric|elec|zap|spark'], ['sword|blade|whoosh|swing']], mas: [], menos: [] },
  trueno_lejano:        { si: [['thunder|thun|storm'], ['distant|far|rumble|roll']], mas: ['distant', 'rumble'], menos: ['rain', 'close'] },
  nova_explosion:       { si: [['magic|mag|arcane|spell|energy'], ['explo|burst|blast|nova|shockwave']], mas: ['magic', 'shimmer'], menos: [] },
  impacto_sismico:      { si: [['ground|earth|rock|stone|debris'], ['slam|impact|quake|crash|boom']], mas: ['heavy', 'slam', 'quake'], menos: [] },
  baculo_proyectil:     { si: [['magic|mag|spell|energy|arcane'], ['projectile|missile|cast|shoot|bolt|whoosh']], mas: ['cast', 'projectile'], menos: [] },
  fuego_aliento:        { si: [['fire|flame|dragon'], ['breath|blast|whoosh|thrower|burst']], mas: ['breath', 'flamethrower'], menos: ['crackle loop', 'campfire'] },
  hielo_aliento:        { si: [['ice|frost|freeze|frozen'], ['blast|crack|form|breath|shatter|spell']], mas: ['freeze', 'magic'], menos: [] },
  curacion:             { si: [['heal|holy|chime|shimmer|bless|buff'], ['spell|magic|mag|chime|shimmer']], mas: ['heal', 'holy'], menos: ['dark', 'evil'] },
};

const exts = new Set(['.wav', '.flac', '.ogg', '.mp3', '.aif', '.aiff']);
async function* archivos(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* archivos(p);
    else if (exts.has(extname(e.name).toLowerCase())) yield p;
  }
}

// "WEAPSwrd_Sword Clash 01" → "weap swrd sword clash 01"
const normaliza = (s) => s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_\-.()\[\]/\\]+/g, ' ').toLowerCase();

function puntua(texto, r) {
  if (!r.si.every((g) => new RegExp(`\\b(${g[0]})`).test(texto))) return 0;
  let p = 10;
  for (const w of r.mas) if (texto.includes(w)) p += 3;
  for (const w of r.menos) if (texto.includes(w)) p -= 6;
  return p;
}

const { sonidos } = JSON.parse(await readFile(join(raiz, 'sfx/prompts.json'), 'utf8'));
const lista = [];
for await (const f of archivos(carpeta)) lista.push(f);
console.log(`${lista.length} archivos de audio en ${carpeta}`);

let hayFfmpeg = true;
try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch { hayFfmpeg = false; }

let md = `# Candidatos de Sonniss\n\nGenerado por \`tools/importar-sonniss.mjs\` (${lista.length} archivos revisados).\n`;
for (const s of sonidos) {
  const r = reglas[s.id];
  if (!r) continue;
  const top = lista
    .map((f) => {
      const rel = relative(carpeta, f);
      // El nombre del archivo pesa el doble que la carpeta.
      const t = normaliza(basename(f)) + ' ' + normaliza(basename(f)) + ' ' + normaliza(dirname(rel));
      return { f, rel, p: puntua(t, r) };
    })
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p || a.rel.localeCompare(b.rel))
    .slice(0, 8);
  md += `\n## ${s.id} — ${s.uso}\n\n`;
  md += top.length ? top.map((x) => `- (${x.p}) \`${x.rel}\``).join('\n') + '\n' : '_Sin coincidencias._\n';
  console.log(`${top.length ? '✔' : '·'} ${s.id}: ${top.length} candidatos`);

  for (let i = 0; i < Math.min(copiar, top.length); i++) {
    const destDir = join(raiz, 'sfx', s.categoria, 'sonniss');
    await mkdir(destDir, { recursive: true });
    const n = String(i + 1).padStart(2, '0');
    if (hayFfmpeg) {
      const dest = join(destDir, `${s.id}_${n}.ogg`);
      const max = Math.max(4, s.duration + 1);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', top[i].f, '-t', String(max), '-ac', '1', '-ar', '44100',
        '-af', `afade=t=out:st=${max - 0.3}:d=0.3`, '-c:a', 'libvorbis', '-q:a', '5', dest]);
    } else {
      await copyFile(top[i].f, join(destDir, `${s.id}_${n}${extname(top[i].f).toLowerCase()}`));
    }
  }
}
await writeFile(join(raiz, 'sfx/sonniss-candidatos.md'), md);
console.log(`\nLista: sfx/sonniss-candidatos.md${copiar ? ` · copiados hasta ${copiar} por efecto en sfx/<categoria>/sonniss/` : ''}`);
