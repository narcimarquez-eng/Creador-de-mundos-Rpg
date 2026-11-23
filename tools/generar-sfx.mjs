#!/usr/bin/env node
// Genera los efectos de sfx/prompts.json con la API de efectos de sonido de ElevenLabs.
//
//   ELEVENLABS_API_KEY=xxx node tools/generar-sfx.mjs              # todos
//   ELEVENLABS_API_KEY=xxx node tools/generar-sfx.mjs espadas      # una categoría
//   ELEVENLABS_API_KEY=xxx node tools/generar-sfx.mjs rayo_impacto # un id
//   ... --una                                                      # solo 1 variante de cada uno
//   ... --sobrescribir                                             # rehace los .mp3 que ya existen
//
// Salida: sfx/<categoria>/<id>_<n>.mp3. Cada variante es una llamada (gasta créditos).
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const filtro = args.find((a) => !a.startsWith('--'));
const unaVariante = args.includes('--una');
const sobrescribir = args.includes('--sobrescribir');
const clave = process.env.ELEVENLABS_API_KEY || 'proxy'; // en la nube el proxy inyecta la clave

const { sonidos } = JSON.parse(await readFile(join(raiz, 'sfx/prompts.json'), 'utf8'));
const lista = sonidos.filter((s) => !filtro || s.id === filtro || s.categoria === filtro);
if (!lista.length) { console.error(`Nada coincide con «${filtro}».`); process.exit(1); }

const existe = (p) => access(p).then(() => true, () => false);

for (const s of lista) {
  const n = unaVariante ? 1 : (s.variantes || 1);
  for (let i = 1; i <= n; i++) {
    const salida = join(raiz, 'sfx', s.categoria, `${s.id}_${String(i).padStart(2, '0')}.mp3`);
    if (!sobrescribir && await existe(salida)) { console.log(`= ${salida} (ya existe)`); continue; }
    const r = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
      method: 'POST',
      headers: { 'xi-api-key': clave, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: s.text, duration_seconds: s.duration, prompt_influence: s.influence }),
    });
    if (!r.ok) { console.error(`✖ ${s.id}: HTTP ${r.status} ${await r.text()}`); process.exitCode = 1; continue; }
    await mkdir(dirname(salida), { recursive: true });
    await writeFile(salida, Buffer.from(await r.arrayBuffer()));
    console.log(`✔ ${salida}`);
  }
}
