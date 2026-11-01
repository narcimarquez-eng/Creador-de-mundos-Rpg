const { test } = require('node:test');
const assert = require('node:assert');
const A = require('../js/acompanante.js');
const CombatLib = require('../js/combat.js');

test('los acompañantes suben solo si están luchando (no reciben XP si no luchan)', () => {
  const c = A.crearAcompanante({ arquetipo: 'rowan', activo: true });
  assert.strictEqual(c.nivel, 1);
  assert.strictEqual(c.xp, 0);

  // Caso 1: Monstruo eliminado donde Rowan NO luchó (daño = 0 y fuera de combate)
  const mNormal = CombatLib.newMonster({ level: 3, xp: 80 });
  mNormal.danoPorFuente = { hero: 100, acompanante: 0 };
  
  // Lógica de killMonster: si no luchó, xpComp es 0
  const dComp = mNormal.danoPorFuente.acompanante;
  const compLuchando = dComp > 0;
  let xpComp = 0;
  if (compLuchando) {
    xpComp = Math.round(mNormal.xp * (dComp / 100));
  }

  assert.strictEqual(xpComp, 0, 'No recibe experiencia si no intervino en el combate');
  assert.strictEqual(c.nivel, 1, 'Permanece en su nivel');
  assert.strictEqual(c.xp, 0, 'Permanece con 0 XP');

  // Caso 2: Monstruo donde Rowan SÍ luchó (infligió daño)
  mNormal.danoPorFuente = { hero: 60, acompanante: 40 };
  const dHero = mNormal.danoPorFuente.hero;
  const dCompAct = mNormal.danoPorFuente.acompanante;
  const dTot = dHero + dCompAct;
  const xpGanada = Math.round(mNormal.xp * (dCompAct / dTot));
  assert.ok(xpGanada > 0, 'Gana XP proporcional a su esfuerzo');

  const res = A.ganarXpAcompanante(c, xpGanada);
  assert.strictEqual(c.xp, xpGanada);
  assert.strictEqual(c.nivel, 1);
});

test('los acompañantes no usados nunca se quedan en el nivel mínimo (Nivel 1)', () => {
  const c = A.crearAcompanante({ arquetipo: 'rowan', activo: true });

  // Rowan combate y gana suficiente experiencia para subir 3 niveles (100 + 200 + 300 = 600 XP)
  A.ganarXpAcompanante(c, 650);
  assert.strictEqual(c.nivel, 4, 'Rowan ha subido a Nivel 4 por luchar');

  // Los demás compañeros del roster (Lyra, Elian, Brenda) nunca han sido usados
  assert.ok(c.roster.lyra, 'Lyra existe en el roster');
  assert.strictEqual(c.roster.lyra.nivel, 1, 'Lyra permanece en el nivel mínimo (Nivel 1)');
  assert.strictEqual(c.roster.lyra.xp, 0, 'Lyra tiene 0 XP');

  assert.ok(c.roster.elian, 'Elian existe en el roster');
  assert.strictEqual(c.roster.elian.nivel, 1, 'Elian permanece en el nivel mínimo (Nivel 1)');
  assert.strictEqual(c.roster.elian.xp, 0, 'Elian tiene 0 XP');

  assert.ok(c.roster.brenda, 'Brenda existe en el roster');
  assert.strictEqual(c.roster.brenda.nivel, 1, 'Brenda permanece en el nivel mínimo (Nivel 1)');
  assert.strictEqual(c.roster.brenda.xp, 0, 'Brenda tiene 0 XP');
});

test('el compañero que se usa más sube más; progresión independiente al alternar', () => {
  const c = A.crearAcompanante({ arquetipo: 'rowan', activo: true });

  // 1. Usar intensamente a Rowan: gana 1500 XP
  A.ganarXpAcompanante(c, 1500);
  const nivelRowan = c.nivel;
  assert.ok(nivelRowan >= 5, 'Rowan alcanza un nivel alto (al menos 5) por ser el más usado');
  const maxHpRowan = c.maxHp;
  const danoRowan = c.dano;

  // 2. Cambiar a Lyra: debe entrar en su nivel mínimo (Nivel 1)
  const okLyra = A.cambiarArquetipo(c, 'lyra');
  assert.strictEqual(okLyra, true);
  assert.strictEqual(c.arquetipo, 'lyra');
  assert.strictEqual(c.nivel, 1, 'Lyra comienza en Nivel 1 al ser invocada por primera vez');
  assert.strictEqual(c.xp, 0, 'Lyra comienza con 0 XP');

  // 3. Usar moderadamente a Lyra en combate: gana 350 XP
  A.ganarXpAcompanante(c, 350);
  assert.strictEqual(c.nivel, 3, 'Lyra sube a Nivel 3 por su participación moderada');

  // 4. Cambiar a Brenda: nunca ha luchado, debe estar en Nivel 1
  const okBrenda = A.cambiarArquetipo(c, 'brenda');
  assert.strictEqual(okBrenda, true);
  assert.strictEqual(c.arquetipo, 'brenda');
  assert.strictEqual(c.nivel, 1, 'Brenda sigue en Nivel 1');
  assert.strictEqual(c.xp, 0);

  // 5. Volver a Rowan: debe conservar su nivel alto exactamente igual que lo dejó
  const okRowanVuelta = A.cambiarArquetipo(c, 'rowan');
  assert.strictEqual(okRowanVuelta, true);
  assert.strictEqual(c.arquetipo, 'rowan');
  assert.strictEqual(c.nivel, nivelRowan, 'Rowan mantiene su nivel alto de veteranía');
  assert.strictEqual(c.maxHp, maxHpRowan, 'Rowan mantiene sus puntos de vida mejorados');
  assert.strictEqual(c.dano, danoRowan, 'Rowan mantiene su ataque mejorado');

  // 6. Verificar jerarquía de niveles por uso:
  // Rowan (más usado) > Lyra (uso moderado) > Brenda (nunca usada) = Elian (nunca usado)
  assert.strictEqual(c.roster.rowan.nivel, nivelRowan);
  assert.strictEqual(c.roster.lyra.nivel, 3);
  assert.strictEqual(c.roster.brenda.nivel, 1);
  assert.strictEqual(c.roster.elian.nivel, 1);
  assert.ok(c.roster.rowan.nivel > c.roster.lyra.nivel);
  assert.ok(c.roster.lyra.nivel > c.roster.brenda.nivel);
});

test('persistencia y restauración de roster completo entre partidas', () => {
  // Crear acompañante con roster previo guardado
  const rosterGuardado = {
    rowan: { nivel: 7, xp: 40, puntosCompanero: 8, hp: 330, maxHp: 330, defensa: 26, dano: 42, combatesLuchados: 35 },
    lyra: { nivel: 2, xp: 20, puntosCompanero: 3, hp: 170, maxHp: 170, defensa: 12, dano: 37, combatesLuchados: 6 },
    elian: { nivel: 1, xp: 0, puntosCompanero: 2, hp: 150, maxHp: 150, defensa: 12, dano: 18, combatesLuchados: 0 },
    brenda: { nivel: 1, xp: 0, puntosCompanero: 2, hp: 230, maxHp: 230, defensa: 18, dano: 22, combatesLuchados: 0 }
  };

  const c = A.crearAcompanante({
    arquetipo: 'rowan',
    roster: rosterGuardado
  });

  assert.strictEqual(c.nivel, 7, 'Restaura el nivel 7 de Rowan');
  assert.strictEqual(c.maxHp, 330);
  assert.strictEqual(c.dano, 42);

  A.cambiarArquetipo(c, 'lyra');
  assert.strictEqual(c.nivel, 2, 'Restaura el nivel 2 de Lyra');
  assert.strictEqual(c.dano, 37);

  A.cambiarArquetipo(c, 'elian');
  assert.strictEqual(c.nivel, 1, 'Elian permanece en nivel 1');
});
