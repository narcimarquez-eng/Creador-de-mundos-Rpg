#!/usr/bin/env node
// Extrae todos los diálogos narrativos, de NPCs, acompañantes y encargos del juego
// hacia dialogos_voces.json en la raíz del repositorio.
//
// Uso: node tools/extraer-dialogos.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

const HistoriaLib = require(join(raiz, 'js/historia.js'));
const MundoCampana = require(join(raiz, 'js/mundo-campana.js'));
const MisionZona = require(join(raiz, 'js/mision-zona.js'));
const Acompanante = require(join(raiz, 'js/acompanante.js'));

const NPC_A_PERSONAJE = {
  'guru-1': 'sabia_elara',
  'guru-2': 'maestro_oren',
  'guru-3': 'hermana_ysolde',
  'guru-4': 'viejo_tamsin',
  'guru-5': 'erudita_mirel',
  'serv-herrero': 'herrero_brann',
  'serv-mercader': 'mercader_tovi',
  'serv-comandante': 'comandante_kaelen',
  'serv-informante': 'varek_informante',
  'serv-boticaria': 'madre_cynthia',
  'serv-hereje': 'saelen_hereje'
};

function limpiarTexto(raw) {
  let s = String(raw == null ? '' : raw);
  // Quitar etiquetas HTML
  s = s.replace(/<[^>]+>/g, ' ');
  // Quitar emojis y símbolos decorativos manteniendo puntuación española, letras, números y espacios
  s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '');
  // Quitar comillas angulares que envuelven diálogos para una locución más natural
  s = s.replace(/[«»]/g, '');
  // Normalizar espacios y puntuación
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/\s+([.,;:!?])/g, '$1');
  return s;
}

const entradas = [];
const idsVistos = new Set();
const rutasVistas = new Set();

function agregar(id, personaje, textoRaw) {
  const texto = limpiarTexto(textoRaw);
  if (!texto) throw new Error(`Texto vacío para id=${id}`);
  if (/\{[^}]+\}/.test(texto)) {
    throw new Error(`Marcador sin resolver en id=${id}: ${texto}`);
  }
  if (idsVistos.has(id)) throw new Error(`ID duplicado: ${id}`);
  const archivo_audio = `assets/audio/voces/${id}.ogg`;
  if (rutasVistas.has(archivo_audio)) throw new Error(`Ruta duplicada: ${archivo_audio}`);
  idsVistos.add(id);
  rutasVistas.add(archivo_audio);
  entradas.push({ id, personaje, texto, archivo_audio });
}

const pad2 = n => String(n).padStart(2, '0');

// 1. Prólogo de Valdris
const prologo = HistoriaLib.prologoDe(MundoCampana);
const puebloIni = HistoriaLib.puebloInicial(MundoCampana);
const nomPuebloIni = (puebloIni && puebloIni.name) || 'Albaferro';
const cap1Obj = HistoriaLib.resolverObjetivo(MundoCampana.historia.capitulos[0], MundoCampana);
const nomZonaCap1 = (cap1Obj && cap1Obj.nombre) || 'las tierras de caza cercanas';

agregar(
  'prologo_01',
  'narrador',
  `${prologo.parrafo1} ${prologo.parrafo2} Antes de que la guardia cierre las empalizadas de ${nomPuebloIni}, debes escapar hacia ${nomZonaCap1} y recuperar pieles y placas de pierna para forjar tus primeros pantalones reforzados.`
);
agregar(
  'prologo_02',
  'narrador',
  `Junto a la arcada de la plaza, cuatro compañeros de confianza están dispuestos a romper el miedo y marchar contigo hacia ${nomZonaCap1}. Elige quién luchará a tu lado desde el primer paso.`
);

// 2. Capítulos de Valdris (16 encargos + 16 resoluciones)
const caps = HistoriaLib.capitulosDe(MundoCampana);
caps.forEach((cap, idx) => {
  const num = idx + 1;
  const obj = HistoriaLib.resolverObjetivo(cap, MundoCampana);
  const persSabio = NPC_A_PERSONAJE[cap.npc] || 'narrador';
  const encargoLimpio = obj && obj.encargo ? obj.encargo : HistoriaLib.rellenar(cap.encargo, obj);
  const textoLimpio = HistoriaLib.rellenar(cap.texto, obj);
  agregar(`cap_${pad2(num)}_encargo`, persSabio, encargoLimpio);
  agregar(`cap_${pad2(num)}_texto`, persSabio, textoLimpio);
});

// 3. Hitos narrativos de Valdris (capítulos 5, 8, 10, 11, 14, 16)
const hitos = HistoriaLib.hitosDe(MundoCampana);
Object.keys(hitos)
  .sort((a, b) => Number(a) - Number(b))
  .forEach(num => {
    const h = hitos[num];
    agregar(`hito_${pad2(num)}`, 'narrador', `${h.titulo}. ${h.detalle}`);
  });

// 4. Saludos contextuales de NPCs por Acto (11 NPCs x 5 fases = 55)
const dialogosNpc = HistoriaLib.dialogosDe(MundoCampana);
const FASES_ACTO = [
  { clave: '1', paso: 0 },
  { clave: '2', paso: 5 },
  { clave: '3', paso: 10 },
  { clave: '4', paso: 14 },
  { clave: 'fin', paso: 16 }
];

for (const [npcId, pers] of Object.entries(NPC_A_PERSONAJE)) {
  const tabla = dialogosNpc[npcId] || {};
  for (const fase of FASES_ACTO) {
    const frase = tabla[fase.clave] || tabla[Number(fase.clave)];
    if (frase) {
      agregar(`${pers}_acto_${fase.clave}`, pers, frase);
    }
  }
}

// 5. Respuestas interactivas de trama y postura (11 NPCs x 5 fases + 2 posturas = 57)
for (const [npcId, pers] of Object.entries(NPC_A_PERSONAJE)) {
  for (const fase of FASES_ACTO) {
    const heroeSim = {
      principal: { paso: fase.paso, progreso: 0, objetivo: null },
      dialogosVistos: {},
      reputacion: { pueblo: 0, sombra: 0, vinculo: 0 },
      decisiones: {}
    };
    const dlg = HistoriaLib.dialogoInteractivoNpc(npcId, heroeSim, MundoCampana);
    const opTrama = dlg.opciones.find(o => o.id === 'trama');
    if (opTrama && opTrama.respuesta) {
      agregar(`${pers}_trama_${fase.clave}`, pers, opTrama.respuesta);
    }
  }
}
agregar(
  'postura_pueblo',
  'comandante_kaelen',
  'Que así sea. Las gentes de estas tierras recordarán quién sostuvo el escudo por ellas.'
);
agregar(
  'postura_sombra',
  'varek_informante',
  'Trato hecho. Quien mueve oro sin hacer ruido siempre encuentra puertas entreabiertas aquí.'
);

// 6. Decisiones de capítulo y reacciones de Rowan (7 contextos + 18 reacciones)
for (const [num, dec] of Object.entries(HistoriaLib.DECISIONES_CAPITULO || {})) {
  agregar(`dec_c${num}_contexto`, 'narrador', `${dec.pregunta} ${dec.contexto}`);
  for (const op of dec.opciones || []) {
    if (op.reaccionRowan) {
      agregar(`dec_c${num}_${op.id}`, 'rowan', op.reaccionRowan);
    }
  }
}

// 7. Epílogos finales (3)
for (const [clave, ep] of Object.entries(HistoriaLib.EPILOGOS_FINALES || {})) {
  agregar(`epilogo_${clave}`, 'narrador', `${ep.titulo}. ${ep.texto}`);
}

// 8. Cabañas fronterizas de Valdris (5)
const PERS_CABANA = {
  'cabana-1-clasica': { id: 'cabana_1_garek', pers: 'trampero' },
  'cabana-2-posada': { id: 'cabana_2_borgan', pers: 'guardia' },
  'cabana-3-pescador': { id: 'cabana_3_kyle', pers: 'pescador' },
  'cabana-4-vigia': { id: 'cabana_4_varek', pers: 'guardia' },
  'cabana-5-redonda': { id: 'cabana_5_olorin', pers: 'herbolario' }
};
for (const sp of MundoCampana.secretPlaces || []) {
  if (sp.tipo !== 'cabana' || !sp.frase) continue;
  const meta = PERS_CABANA[sp.id] || { id: sp.id.replace(/-/g, '_'), pers: 'aldeano_hombre' };
  agregar(meta.id, meta.pers, sp.frase);
}

// 9. Frases del acompañante (Acompanante.FRASES: 33)
for (const [cat, lista] of Object.entries(Acompanante.FRASES || {})) {
  if (!Array.isArray(lista)) continue;
  lista.forEach((txt, i) => {
    agregar(`acomp_${cat}_${pad2(i + 1)}`, 'rowan', txt);
  });
}

// 10. Subtítulos vivos por arquetipo de compañero y hora del día
const charlasCamino = [
  { id: 'charla_lyra_normal', pers: 'lyra', ev: { tipo: 'charla_camino', arquetipo: 'lyra' }, heroe: { principal: { paso: 0 }, reputacion: {} } },
  { id: 'charla_lyra_sombra', pers: 'lyra', ev: { tipo: 'charla_camino', arquetipo: 'lyra' }, heroe: { principal: { paso: 0 }, reputacion: { sombra: 5 } } },
  { id: 'charla_elian_inicio', pers: 'elian', ev: { tipo: 'charla_camino', arquetipo: 'elian' }, heroe: { principal: { paso: 0 }, reputacion: {} } },
  { id: 'charla_elian_acto3', pers: 'elian', ev: { tipo: 'charla_camino', arquetipo: 'elian' }, heroe: { principal: { paso: 11 }, reputacion: {} } },
  { id: 'charla_brenda', pers: 'brenda', ev: { tipo: 'charla_camino', arquetipo: 'brenda' }, heroe: { principal: { paso: 0 }, reputacion: {} } },
  { id: 'charla_rowan_acto1', pers: 'rowan', ev: { tipo: 'charla_camino', arquetipo: 'rowan' }, heroe: { principal: { paso: 0 }, reputacion: {} } },
  { id: 'charla_rowan_acto2', pers: 'rowan', ev: { tipo: 'charla_camino', arquetipo: 'rowan' }, heroe: { principal: { paso: 6 }, reputacion: {} } },
  { id: 'charla_rowan_acto3', pers: 'rowan', ev: { tipo: 'charla_camino', arquetipo: 'rowan' }, heroe: { principal: { paso: 11 }, reputacion: {} } },
  { id: 'charla_rowan_fin', pers: 'rowan', ev: { tipo: 'charla_camino', arquetipo: 'rowan' }, heroe: { principal: { paso: 16 }, reputacion: {} } },
  { id: 'hora_day', pers: 'rowan', ev: { tipo: 'hora', hora: 'day' }, heroe: { principal: { paso: 0 }, reputacion: {} } },
  { id: 'hora_golden', pers: 'rowan', ev: { tipo: 'hora', hora: 'golden' }, heroe: { principal: { paso: 0 }, reputacion: {} } },
  { id: 'hora_night', pers: 'rowan', ev: { tipo: 'hora', hora: 'night' }, heroe: { principal: { paso: 0 }, reputacion: {} } }
];
for (const c of charlasCamino) {
  const sub = HistoriaLib.subtituloVivo(c.ev, c.heroe, MundoCampana, 'Compañero');
  if (sub && sub.texto) agregar(c.id, c.pers, sub.texto);
}

// 11. Aldeanos estratégicos de visor-mundo.html y encargos genéricos de zona
const aldeanosFijos = [
  { id: 'ald_vigia', pers: 'guardia', texto: 'Las puertas de piedra siguen en pie, pero las bestias acechan apenas salgas de la muralla.' },
  { id: 'ald_vecina', pers: 'aldeano_mujer', texto: 'Si buscas equipo nuevo, visita al herrero Brann o lleva hojas de forja desde el campo de batalla.' },
  { id: 'ald_campesino', pers: 'aldeano_hombre', texto: 'Sigue las sendas empedradas si no quieres toparte con manadas hambrientas.' },
  { id: 'ald_estibador', pers: 'mercader', texto: 'Los navíos traen provisiones desde el mar, pero las criaturas merodean por la orilla sur.' },
  { id: 'ald_pescadora', pers: 'aldeano_mujer', texto: 'El muelle aguanta cualquier oleaje. Si exploras la costa, encontrarás una cabaña sobre pilotes.' },
  { id: 'ald_laberinto', pers: 'varek_informante', texto: 'Solo hay un pasillo que cruza los muros de piedra. Memoriza los giros y cuidado con las bolas de fuego.' },
  { id: 'ald_mazmorra', pers: 'guardia', texto: 'No entres sin pociones ni armadura revisada: dentro de esta mazmorra aguardan guardianes y un jefe.' }
];
for (const a of aldeanosFijos) agregar(a.id, a.pers, a.texto);

let encIdx = 0;
for (const [tipo, lista] of Object.entries(MisionZona.ENCARGOS || {})) {
  lista.forEach((e, i) => {
    const pers = (encIdx % 2 === 0) ? 'aldeano_hombre' : 'aldeano_mujer';
    encIdx++;
    const frase = String(e.frase)
      .replace(/\{zona\}/g, 'esa comarca')
      .replace(/\{n\}/g, 'varias bestias');
    agregar(`encargo_${tipo}_${pad2(i + 1)}_frase`, pers, frase);
    agregar(`encargo_${tipo}_${pad2(i + 1)}_gracias`, pers, e.gracias);
  });
}

const salida = join(raiz, 'dialogos_voces.json');
writeFileSync(salida, JSON.stringify(entradas, null, 2) + '\n', 'utf8');
console.log(`Generado ${salida} con ${entradas.length} diálogos.`);
