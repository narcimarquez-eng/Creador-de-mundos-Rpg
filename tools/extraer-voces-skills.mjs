#!/usr/bin/env node
// Genera voces_skills.json con el nombre real en español de cada habilidad de CombatLib.SKILLS
// (excluyendo ataques básicos 'attack' y 'disparo') más las 12 líneas de habilidades de acompañantes.
//
// Uso: node tools/extraer-voces-skills.mjs
import { writeFileSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const CombatLib = require(join(raiz, 'js/combat.js'));

const ENTRADAS_COMPANERO = [
  { id: 'comp_rowan_buff',    personaje: 'rowan',  texto: '¡Aguanta conmigo, camarada!' },
  { id: 'comp_rowan_ataque',  personaje: 'rowan',  texto: '¡Cubro tu flanco!' },
  { id: 'comp_rowan_defensa', personaje: 'rowan',  texto: '¡Escudos arriba!' },
  { id: 'comp_lyra_ataque',   personaje: 'lyra',   texto: '¡Te tengo en la mira!' },
  { id: 'comp_lyra_debuff',   personaje: 'lyra',   texto: '¡Desangra al objetivo!' },
  { id: 'comp_lyra_buff',     personaje: 'lyra',   texto: '¡Velocidad mortal!' },
  { id: 'comp_elian_cura',    personaje: 'elian',  texto: '¡Que la luz cierre tus heridas!' },
  { id: 'comp_elian_defensa', personaje: 'elian',  texto: '¡Barrera sagrada!' },
  { id: 'comp_elian_ataque',  personaje: 'elian',  texto: '¡Luz purificadora!' },
  { id: 'comp_brenda_ataque', personaje: 'brenda', texto: '¡Aplástalos a todos!' },
  { id: 'comp_brenda_buff',   personaje: 'brenda', texto: '¡Sangre y furia!' },
  { id: 'comp_brenda_defensa',personaje: 'brenda', texto: '¡Nada me derriba!' }
];

const SKILLS_MAGO = new Set([
  'nova', 'bola_fuego', 'lanza_hielo', 'ventisca_glacial', 'tormenta_fuego', 'rayo_arcano'
]);
const SKILLS_PICARO = new Set(['paso_sombrio', 'hoja_veneno']);

function personajeDeSkill(id, sk) {
  if (sk.armaClase === 'arcos' || sk.arma === 'arco') return 'heroe_cazador';
  if (sk.armaClase === 'dagas' || SKILLS_PICARO.has(id)) return 'heroe_picaro';
  if (sk.armaClase === 'bastones' || sk.arma === 'baculo' || SKILLS_MAGO.has(id)) return 'heroe_mago';
  return 'heroe_guerrero';
}

function textoDeSkill(nombre) {
  let s = String(nombre || '').replace(/\s*\(2M\)/g, '').trim();
  s = s.replace(/\bDoble Shot\b/gi, 'Doble disparo');
  return `¡${s}!`;
}

const entradas = [];
for (const [id, sk] of Object.entries(CombatLib.SKILLS || {})) {
  if (id === 'attack' || id === 'disparo') continue;
  const vozId = `sk_${id}`;
  entradas.push({
    id: vozId,
    personaje: personajeDeSkill(id, sk),
    texto: textoDeSkill(sk.nombre),
    archivo_audio: `assets/audio/voces/skills/${vozId}.ogg`
  });
}

for (const c of ENTRADAS_COMPANERO) {
  entradas.push({
    id: c.id,
    personaje: c.personaje,
    texto: c.texto,
    archivo_audio: `assets/audio/voces/skills/${c.id}.ogg`
  });
}

const dirSkills = join(raiz, 'assets/audio/voces/skills');
const validos = new Set(entradas.map(e => `${e.id}.ogg`));
if (existsSync(dirSkills)) {
  for (const archivo of readdirSync(dirSkills)) {
    if (archivo.endsWith('.ogg') && !validos.has(archivo)) {
      unlinkSync(join(dirSkills, archivo));
    }
  }
}

const salida = join(raiz, 'voces_skills.json');
writeFileSync(salida, JSON.stringify(entradas, null, 2) + '\n', 'utf8');
console.log(`Generado ${salida} con ${entradas.length} voces (79 skills + 12 acompañante).`);
