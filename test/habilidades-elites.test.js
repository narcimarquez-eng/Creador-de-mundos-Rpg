const test = require('node:test');
const assert = require('node:assert');

const CombatLib = require('../js/combat.js');
const HeroeLib = require('../js/heroe.js');
const AcompananteLib = require('../js/acompanante.js');
const CharacterLib = require('../js/character.js');

test('habilidades: al menos 6 nuevas habilidades añadidas con requisitos de nivel', () => {
  const nuevas = [
    'corte_cruzado', 'rafaga', 'furia', 'escudo_espiritu',
    'salto_demoledor', 'lluvia_proyectiles', 'juicio_relampago', 'sentencia_titan'
  ];

  assert.ok(nuevas.length >= 6, 'Debe haber al menos 6 nuevas habilidades');

  nuevas.forEach(id => {
    // Comprobar existencia en HeroeLib
    const hHab = HeroeLib.HABILIDADES[id];
    assert.ok(hHab, `Habilidad ${id} debe existir en HeroeLib.HABILIDADES`);
    assert.strictEqual(hHab.tipo, 'activa', `${id} debe ser de tipo activa`);
    assert.ok(hHab.nivel >= 2, `${id} debe requerir al menos nivel 2 (desbloqueo por nivel)`);

    // Comprobar existencia en CombatLib
    const cHab = CombatLib.SKILLS[id];
    assert.ok(cHab, `Habilidad ${id} debe existir en CombatLib.SKILLS`);
    assert.ok(cHab.cd > 0, `${id} debe tener tiempo de recarga cd`);
    assert.ok(cHab.mp > 0, `${id} debe requerir maná`);
    assert.ok(cHab.mult > 1.0, `${id} debe tener multiplicador de daño > 1.0`);

    // Comprobar que tiene animación y one-shot asignado
    assert.ok(CharacterLib.CLIP_KEYWORDS[id], `${id} debe tener palabras clave de animación en character.js`);
    assert.ok(CharacterLib.ONE_SHOT[id], `${id} debe tener configuración ONE_SHOT`);
    assert.strictEqual(CharacterLib.ONE_SHOT[id].lock, cHab.lock, `El bloqueo de ${id} debe coincidir`);
  });
});

test('desbloqueo y progresión por subida de nivel del héroe', () => {
  const h = HeroeLib.nuevoHeroe();
  h.puntos = 10;

  // A nivel 1, no puede usar corte_cruzado (pide nivel 2)
  assert.strictEqual(HeroeLib.disponible(h, 'corte_cruzado', 1), false);
  assert.throws(() => HeroeLib.mejorar(h, 'corte_cruzado', 1), /nivel 2/i);

  // Al subir a nivel 2, se desbloquea corte_cruzado y se puede mejorar
  assert.strictEqual(HeroeLib.disponible(h, 'corte_cruzado', 2), true);
  HeroeLib.mejorar(h, 'corte_cruzado', 2);
  assert.strictEqual(h.gastados.corte_cruzado, 1);

  // A nivel 5, no puede usar furia (pide nivel 8)
  assert.strictEqual(HeroeLib.disponible(h, 'furia', 5), false);
  // A nivel 8, furia se desbloquea
  assert.strictEqual(HeroeLib.disponible(h, 'furia', 8), true);
  HeroeLib.mejorar(h, 'furia', 8);
  assert.strictEqual(h.gastados.furia, 1);

  // A nivel 12, salto_demoledor se desbloquea
  assert.strictEqual(HeroeLib.disponible(h, 'salto_demoledor', 12), true);

  // A nivel 20, sentencia_titan se desbloquea
  assert.strictEqual(HeroeLib.disponible(h, 'sentencia_titan', 20), true);

  // Asignar habilidad a la barra
  HeroeLib.asignar(h, 'q', 'corte_cruzado');
  assert.strictEqual(h.barra.q, 'corte_cruzado');
});

test('monstruos élite: multiplicadores de vida x2, x3 y x4 con recompensas ampliadas', () => {
  const normal = CombatLib.newMonster({ level: 5, boss: false, rangoElite: 1, x: 0, z: 0 });
  const elite2 = CombatLib.newMonster({ level: 5, boss: false, rangoElite: 2, x: 0, z: 0 });
  const elite3 = CombatLib.newMonster({ level: 5, boss: false, rangoElite: 3, x: 0, z: 0 });
  const elite4 = CombatLib.newMonster({ level: 5, boss: false, rangoElite: 4, x: 0, z: 0 });

  // Vida escalada exactamente a x2, x3 y x4
  assert.strictEqual(elite2.maxHp, normal.maxHp * 2, 'Elite x2 debe tener exactamente 2x vida');
  assert.strictEqual(elite3.maxHp, normal.maxHp * 3, 'Elite x3 debe tener exactamente 3x vida');
  assert.strictEqual(elite4.maxHp, normal.maxHp * 4, 'Elite x4 debe tener exactamente 4x vida');

  // XP escalada superior
  assert.ok(elite2.xp >= normal.xp * 2, 'Elite x2 debe otorgar al menos 2x XP');
  assert.ok(elite3.xp >= normal.xp * 3, 'Elite x3 debe otorgar al menos 3x XP');
  assert.ok(elite4.xp >= normal.xp * 4, 'Elite x4 debe otorgar al menos 4x XP');
});

test('reparto de EXP en monstruos normales proporcional al daño realizado', () => {
  const m = CombatLib.newMonster({ level: 5, boss: false, rangoElite: 1, x: 0, z: 0 });
  m.xp = 100;

  // Simular daño de héroe (70) y acompañante (30)
  m.danoPorFuente = { hero: 70, acompanante: 30 };
  m.danoTotal = 100;

  const dHero = m.danoPorFuente.hero;
  const dComp = m.danoPorFuente.acompanante;
  const total = dHero + dComp;

  const xpHeroe = Math.round(m.xp * (dHero / total));
  const xpComp = Math.round(m.xp * (dComp / total));

  assert.strictEqual(xpHeroe, 70, 'El héroe debe recibir el 70% de la XP según su daño');
  assert.strictEqual(xpComp, 30, 'El acompañante debe recibir el 30% de la XP según su daño');
});

test('reparto de EXP en monstruos élite (x2, x3, x4): experiencia por igual', () => {
  [2, 3, 4].forEach(rango => {
    const m = CombatLib.newMonster({ level: 6, boss: false, rangoElite: rango, x: 0, z: 0 });
    m.esElite = true;
    m.xp = 200 * rango;

    // Aunque el héroe haya hecho 90% del daño y el acompañante 10%
    m.danoPorFuente = { hero: 90, acompanante: 10 };
    m.danoTotal = 100;

    // En élites, reparten la experiencia por igual
    const xpHeroe = Math.round(m.xp * 0.5);
    const xpComp = Math.round(m.xp * 0.5);

    assert.strictEqual(xpHeroe, xpComp, `En élite x${rango} ambos deben recibir exactamente la misma experiencia`);
    assert.strictEqual(xpHeroe + xpComp, m.xp, `La suma de la XP repartida debe igualar la XP del élite`);
  });
});

test('progresión y subida de nivel del acompañante con la XP ganada', () => {
  const comp = AcompananteLib.crearAcompanante({ arquetipo: 'rowan', nivel: 1 });
  const hpAntes = comp.maxHp;
  const danoAntes = comp.dano;
  const puntosAntes = comp.puntosCompanero || 0;

  // Ganar 50 XP (no llega a los 100 necesarios para subir a nivel 2)
  const r1 = AcompananteLib.ganarXpAcompanante(comp, 50);
  assert.strictEqual(r1.subioNivel, false);
  assert.strictEqual(comp.nivel, 1);
  assert.strictEqual(comp.xp, 50);

  // Ganar otros 60 XP (total 110 XP: sube a nivel 2 y sobran 10 XP)
  const r2 = AcompananteLib.ganarXpAcompanante(comp, 60);
  assert.strictEqual(r2.subioNivel, true);
  assert.strictEqual(comp.nivel, 2);
  assert.strictEqual(comp.xp, 10);
  assert.ok(comp.maxHp > hpAntes, 'La vida máxima del compañero debe aumentar');
  assert.ok(comp.dano > danoAntes, 'El ataque del compañero debe aumentar');
  assert.strictEqual(comp.puntosCompanero, puntosAntes + 1, 'Debe ganar 1 punto de maestría de compañero');
});
