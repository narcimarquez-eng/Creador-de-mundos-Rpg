// Pruebas del sistema completo de armaduras: 3+ por clase y grado, stats por clase/nivel, habilidades de conjunto, diseño y visor.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ArmadurasLib = require('../js/armaduras.js');
const EquipoLib = require('../js/equipo.js');
const HeroeLib = require('../js/heroe.js');
const PartidaLib = require('../js/partida.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

const estudioPath = path.join(__dirname, '..', 'estudio-armaduras', 'index.html');
const estudioHtml = fs.readFileSync(estudioPath, 'utf8');
const catalogoPath = path.join(__dirname, '..', 'estudio-armaduras', 'catalogo.json');
const catalogo = JSON.parse(fs.readFileSync(catalogoPath, 'utf8'));
const visorPath = path.join(__dirname, '..', 'visor-mundo.html');
const visorHtml = fs.readFileSync(visorPath, 'utf8');

function extractStudioTables() {
  const iState = estudioHtml.indexOf('const STATE = {');
  const iApply = estudioHtml.indexOf('function applyArmorLook(');
  const snippet = estudioHtml.slice(iState, iApply)
    + '\nmodule.exports = { TEXTURE_PRESETS, ARMOR_CLASSES, ARMOR_RANKS, ARMOR_LOOKS };';
  const ctx = { module: { exports: {} }, Math, Array, Object, Set, JSON, console };
  vm.runInNewContext(snippet, ctx);
  return ctx.module.exports;
}

t('ARMOR_LOOKS en estudio-armaduras tiene >= 3 armaduras por cada clase (pesada, ligera, mago) y grado (D..SR)', () => {
  const S = extractStudioTables();
  for (const cls of ['pesada', 'ligera', 'mago']) {
    for (const grado of ['D', 'C', 'B', 'A', 'S', 'SR']) {
      const count = S.ARMOR_LOOKS.filter(l => l.cls === cls && l.rank === grado).length;
      assert.ok(count >= 3, `Faltan looks en estudio-armaduras para ${cls} grado ${grado}: encontrados ${count}`);
    }
  }
});

t('ArmadurasLib.SETS_ARMADURA contiene 3 conjuntos por cada clase y grado (54 total) enlazados a looks y paletas reales', () => {
  const S = extractStudioTables();
  const tpById = Object.fromEntries(S.TEXTURE_PRESETS.map(p => [p.id, p]));
  assert.strictEqual(ArmadurasLib.SETS_ARMADURA.length, 54);
  for (const cls of ['pesada', 'ligera', 'mago']) {
    for (const grado of ArmadurasLib.GRADOS_ORDEN) {
      const sets = ArmadurasLib.setsPorClaseYGrado(cls, grado);
      assert.ok(sets.length >= 3, `Faltan conjuntos en ArmadurasLib para ${cls} grado ${grado}`);
      sets.forEach(s => {
        const lk = S.ARMOR_LOOKS[s.armorLook];
        assert.ok(lk, `armorLook ${s.armorLook} inválido en ${s.id}`);
        assert.strictEqual(lk.cls, cls);
        assert.strictEqual(lk.rank, grado);
        assert.ok(tpById[s.tex], `Textura ${s.tex} no existe en TEXTURE_PRESETS`);
        assert.strictEqual(s.habilidades.length, 3, `${s.id} debe tener 3 habilidades`);
        assert.deepStrictEqual(s.habilidades.map(h => h.piezasReq), [1, 3, 5]);
        assert.ok(s.diseno && s.diseno.length > 15);
        const svg = ArmadurasLib.disenoSvgHtml(s);
        assert.ok(svg.includes('<svg') && svg.includes(s.paleta.primary));
      });
    }
  }
});

t('catalogo.json contiene las 5 piezas (270 total) de los 54 conjuntos con subpiezas y compatibilidad', () => {
  for (const r of ArmadurasLib.RANURAS_SET) {
    assert.strictEqual(catalogo.ranuras[r].length, 54, `Ranura ${r} debe tener 54 piezas`);
  }
  for (const s of ArmadurasLib.SETS_ARMADURA) {
    for (const r of ArmadurasLib.RANURAS_SET) {
      const p = catalogo.ranuras[r].find(x => x.setId === s.id);
      assert.ok(p, `Falta pieza ${r} de ${s.id} en catalogo.json`);
      assert.strictEqual(p.grado, s.grado);
      assert.strictEqual(p.tipoArmadura, s.claseArmadura);
      assert.strictEqual(p.armorLook, s.armorLook);
      if (r === 'pants') {
        assert.ok(p.subpiezas && typeof p.subpiezas.belt === 'number', `Falta subpiezas en pants de ${s.id}`);
      }
    }
  }
});

t('características propias por clase de armadura y escalado por nivel y grado (D < C < B < A < S < SR)', () => {
  const pesD = ArmadurasLib.statsDePieza({ ranura: 'torso', nivel: 10, grado: 'D', tipoArmadura: 'pesada' }, 1);
  const ligD = ArmadurasLib.statsDePieza({ ranura: 'torso', nivel: 10, grado: 'D', tipoArmadura: 'ligera' }, 1);
  const magD = ArmadurasLib.statsDePieza({ ranura: 'torso', nivel: 10, grado: 'D', tipoArmadura: 'mago' }, 1);

  assert.ok(pesD.defensa > ligD.defensa && ligD.defensa > magD.defensa, 'Pesada > Ligera > Mago en defensa base');
  assert.ok(pesD.stats.vida > 0 && pesD.stats.reduccion > 0, 'Pesada aporta vida y reducción');
  assert.ok(ligD.stats.critico > 0 && ligD.stats.velocidad > 0 && ligD.stats.velocidadAtaque > 0, 'Ligera aporta crítico y velocidad');
  assert.ok(magD.stats.mana > 0 && magD.stats.poderMagico > 0 && magD.stats.mpRegenBonus > 0, 'Mago aporta maná, poder mágico y regen');

  let prevDef = 0;
  for (const g of ArmadurasLib.GRADOS_ORDEN) {
    const s = ArmadurasLib.setsPorClaseYGrado('pesada', g)[0];
    const st = ArmadurasLib.statsCompletosSet(s.id, 1);
    assert.ok(st.defensaTotal > prevDef, `Defensa total debe crecer en grado ${g}`);
    prevDef = st.defensaTotal;
  }
});

t('habilidades de armadura (1, 3 y 5 piezas) se activan progresivamente en HeroeLib.estadisticas y ficha()', () => {
  const h = HeroeLib.nuevoHeroe();
  const s = ArmadurasLib.setPorId('mago_S_1');
  const piezas = ArmadurasLib.piezasDeSet(s.id).map(p => EquipoLib.instancia(p, 1));

  const st0 = HeroeLib.estadisticas(h, 35, [], 'mago');
  const st1 = HeroeLib.estadisticas(h, 35, piezas.slice(0, 1), 'mago');
  const st3 = HeroeLib.estadisticas(h, 35, piezas.slice(0, 3), 'mago');
  const st5 = HeroeLib.estadisticas(h, 35, piezas, 'mago');

  assert.strictEqual(st1.armaduraSets[0].habilidadesActivas.length, 1);
  assert.strictEqual(st3.armaduraSets[0].habilidadesActivas.length, 2);
  assert.strictEqual(st5.armaduraSets[0].habilidadesActivas.length, 3);
  assert.ok(st5.maná > st3.maná && st3.maná > st1.maná && st1.maná > st0.maná);
  assert.ok(st5.poderMagico > st3.poderMagico && st3.poderMagico > st1.poderMagico);
  assert.ok(st5.fuegoMult >= 0.28, 'Habilidad de 3 piezas de Major Arcana activa +28% fuego');
  assert.ok(st5.escudoBonusPct >= 0.18, 'Habilidad de 5 piezas de Major Arcana activa +18% escudo');

  const ficha = HeroeLib.ficha(piezas[0]);
  assert.strictEqual(ficha.setId, s.id);
  assert.strictEqual(ficha.habilidadesSet.length, 3);
  assert.ok(ficha.lineas.some(l => /Poder Mágico/i.test(l)));
});

t('PartidaLib.cleanPersonaje conserva setId, setNombre y statsArmadura al guardar/cargar', () => {
  const s = ArmadurasLib.setPorId('ligera_A_2');
  const pieza = EquipoLib.instancia(ArmadurasLib.piezasDeSet(s.id)[1], 1);
  const clean = PartidaLib.cleanPersonaje({
    nombre: 'Vex',
    clase: 'picaro',
    fit: { muscular: 0.5 },
    inventario: [pieza],
    equipo: { torso: pieza.uid }
  });
  const saved = clean.inventario[0];
  assert.strictEqual(saved.setId, s.id);
  assert.strictEqual(saved.setNombre, s.nombre);
  assert.ok(saved.statsArmadura && saved.statsArmadura.critico > 0);
});

t('visor-mundo.html integra js/armaduras.js, modal de armaduras, vista 3D y pestaña en Crónica', () => {
  assert.ok(visorHtml.includes('js/armaduras.js'));
  assert.ok(visorHtml.includes('id="armaduras-modal"'));
  assert.ok(visorHtml.includes('id="btn-armaduras"'));
  assert.ok(visorHtml.includes('id="sk-armaduras"'));
  assert.ok(visorHtml.includes('id="arm-preview-frame"'));
  assert.ok(visorHtml.includes("id: 'armaduras'"));
  assert.ok(visorHtml.includes('abrirModalArmaduras'));
  assert.ok(estudioHtml.includes("d.tipo === 'preview-armadura'"));
});

console.log(`\n${n} pruebas de armaduras superadas.`);
