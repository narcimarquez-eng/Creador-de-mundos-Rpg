// Pruebas de las reglas de combate y de la elección de animaciones. Ejecutar: node test/combat.test.js
const assert = require('assert');
const C = require('../js/combat.js');
const CH = require('../js/character.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

t('diferencia de nivel: +10 % por nivel, entre x0,5 y x2', () => {
  assert.strictEqual(C.diffMult(5, 5), 1);
  assert.ok(Math.abs(C.diffMult(6, 5) - 1.1) < 1e-9);
  assert.strictEqual(C.diffMult(1, 20), 0.5);
  assert.strictEqual(C.diffMult(20, 1), 2);
});

t('héroe nuevo: nivel 1, vida y maná llenos', () => {
  const h = C.newHero();
  assert.strictEqual(h.level, 1);
  assert.strictEqual(h.hp, 100);
  assert.strictEqual(h.mp, 50);
});

t('XP: sube de nivel, restaura vida y maná y sube el máximo', () => {
  const h = C.newHero();
  h.hp = 10;
  const gained = C.gainXp(h, 100);
  assert.strictEqual(gained, 1);
  assert.strictEqual(h.level, 2);
  assert.strictEqual(h.maxHp, 112);
  assert.strictEqual(h.hp, 112);
  assert.strictEqual(h.xp, 0);
});

t('XP: varios niveles de una vez', () => {
  const h = C.newHero();
  assert.strictEqual(C.gainXp(h, 100 + 200 + 50), 2);
  assert.strictEqual(h.level, 3);
  assert.strictEqual(h.xp, 50);
});

t('daño del ataque: crece con el nivel y baja contra monstruos altos', () => {
  const h = C.newHero();
  assert.strictEqual(C.heroDamage(h, 'attack', 1), 11);
  h.level = 4;
  assert.strictEqual(C.heroDamage(h, 'attack', 4), 8 + 3 * 4);
  assert.ok(C.heroDamage(h, 'attack', 8) < C.heroDamage(h, 'attack', 4));
});

t('habilidades: maná, enfriamiento y bloqueo', () => {
  const h = C.newHero();
  assert.ok(C.canUse(h, 'attack'));
  C.useSkill(h, 'nova');
  assert.strictEqual(h.mp, 20);
  assert.ok(!C.canUse(h, 'nova'));          // en enfriamiento
  C.tickHero(h, 12);
  assert.ok(h.cd.nova === 0);
  assert.ok(h.mp <= h.maxMp);
  h.mp = 5;
  assert.ok(!C.canUse(h, 'sismo'));         // sin maná
});

t('habilidades: el héroe nuevo tiene enfriamiento de todas; los golpes llegan en sus momentos', () => {
  const h = C.newHero();
  Object.keys(C.SKILLS).forEach(k => assert.strictEqual(h.cd[k], 0, k));
  assert.deepStrictEqual(C.impactos('attack'), [0]);
  assert.deepStrictEqual(C.impactos('torbellino'), [0.85, 1.80]);
  assert.ok(C.SKILLS.disparo.unico && C.SKILLS.disparo.range > 20);
  assert.ok(C.inSkillArea('disparo', 0, 0, 0, 1, 0, 20));
  assert.ok(!C.inSkillArea('disparo', 0, 0, 0, 1, 8, 2));   // fuera del cono estrecho
  Object.keys(C.SKILLS).forEach(k => {
    if (k !== 'attack' && k !== 'disparo' && k !== 'orbe_arcano') {
      assert.ok(C.SKILLS[k].lock >= 1.2, `habilidad activa ${k} debe tener lock >= 1.2s (fue ${C.SKILLS[k].lock})`);
    }
  });
  assert.ok(C.MONSTER.attackCd >= 1.8, `MONSTER.attackCd debe ser >= 1.8s (fue ${C.MONSTER.attackCd})`);
});

t('muerte: pierde 5 % del XP y reaparece con vida completa', () => {
  const h = C.newHero();
  h.xp = 200;
  C.die(h, 1000);
  assert.strictEqual(h.xp, 190);
  assert.strictEqual(h.deadUntil, 1000 + 4000);
  C.takeHit(h, 999);
  C.respawn(h);
  assert.strictEqual(h.dead, false);
  assert.strictEqual(h.hp, h.maxHp);
});

t('vida: no regenera hasta pasados 6 s sin golpes', () => {
  const h = C.newHero();
  C.takeHit(h, 50);                            // recibe un golpe: empieza la cuenta
  assert.strictEqual(h.hp, 50);
  C.tickHero(h, 3);
  assert.strictEqual(h.hp, 50);
  C.tickHero(h, 4);
  assert.ok(h.hp > 50);
});

t('monstruo: vida y daño según el nivel; jefes más fuertes', () => {
  assert.strictEqual(C.monsterStats(1, false).maxHp, 95);
  assert.strictEqual(C.monsterStats(1, true).maxHp, 570);
  assert.strictEqual(C.monsterStats(1, false).dmg, 5.7);
  assert.strictEqual(C.monsterStats(2, false).dmg, 7.6);
  assert.strictEqual(C.monsterStats(3, false).dmg, 9.5);
  assert.strictEqual(C.monsterStats(4, false).dmg, 11.4);
  assert.ok(C.monsterStats(5, true).dmg > C.monsterStats(5, false).dmg);
  assert.ok(C.monsterDamage(6, false, 1) > C.monsterDamage(1, false, 6));
});

t('IA: el monstruo persigue al héroe al verlo y ataca a su ritmo', () => {
  const h = C.newHero();
  const m = C.newMonster({ level: 1, x: 0, z: 0, leash: 50 });
  let attacks = 0;
  for (let i = 0; i < 100; i++) { // 10 s con el héroe a 1,5 m
    const r = C.monsterTick(m, h, 1.5, 0, 0.1);
    if (r.attack) attacks++;
  }
  assert.strictEqual(m.state, 'chase');
  assert.ok(attacks >= 6 && attacks <= 7, 'ataques en 10 s: ' + attacks);
});

t('IA: si el héroe está lejos, el monstruo no se mueve', () => {
  const h = C.newHero();
  const m = C.newMonster({ level: 1, x: 0, z: 0, leash: 50 });
  C.monsterTick(m, h, 100, 0, 0.1);
  assert.strictEqual(m.state, 'idle');
  assert.strictEqual(m.x, 0);
});

t('IA: el monstruo vuelve a su origen si se aleja demasiado', () => {
  const h = C.newHero();
  const m = C.newMonster({ level: 1, x: 0, z: 0, leash: 10 });
  m.x = 0; m.z = 0;
  C.monsterTick(m, h, 5, 0, 0.1);             // empieza a perseguir
  m.x = 20;                                    // lo sacamos de su zona
  C.monsterTick(m, h, 5, 0, 0.1);
  assert.strictEqual(m.state, 'return');
});

t('área: cono frontal para el ataque, alrededor del personaje para la nova', () => {
  // héroe mirando a +z; monstruo delante a 2 m, otro detrás a 2 m
  assert.ok(C.inSkillArea('attack', 0, 0, 0, 1, 0, 2));
  assert.ok(!C.inSkillArea('attack', 0, 0, 0, 1, 0, -2));
  assert.ok(C.inSkillArea('nova', 0, 0, 0, 1, 0, -6));
  assert.ok(!C.inSkillArea('nova', 0, 0, 0, 1, 0, -8));
  // Impacto sísmico: alrededor del personaje, hasta 4,5 m, y golpea al caer (no al pulsar)
  assert.ok(C.inSkillArea('sismo', 0, 0, 0, 1, 0, -4));
  assert.ok(!C.inSkillArea('sismo', 0, 0, 0, 1, 5, 0));
  assert.ok(C.SKILLS.sismo.impacto > 0);
});

t('animaciones: el GLB con los nombres de la lista asigna cada acción', () => {
  const names = ['Guardia (Idle)', 'Pose Estática (Bind Pose)', 'Marcha (Walk)', 'Carrera (Run)', 'Combo de Ataque',
    'Impacto Sísmico', 'Salto Acrobático', 'Postura de Victoria', 'Explosión Nova'];
  const pick = k => names[CH.findClipIndex(names, CH.CLIP_KEYWORDS[k])];
  assert.strictEqual(pick('idle'), 'Guardia (Idle)');
  assert.strictEqual(pick('walk'), 'Marcha (Walk)');
  assert.strictEqual(pick('run'), 'Carrera (Run)');
  assert.strictEqual(pick('attack'), 'Combo de Ataque');
  assert.strictEqual(pick('sismo'), 'Impacto Sísmico');
  // Nombres del cuerpo que exporta el estudio de armaduras
  const estudio = ['idle', 'walk', 'run', 'jump', 'crouch', 'swim', 'punch', 'kick', 'dodge', 'hit', 'ultimate_nova', 'ultimate_slam', 'ultimate_beam', 'victory'];
  const deEstudio = k => estudio[CH.findClipIndex(estudio, CH.CLIP_KEYWORDS[k])];
  assert.strictEqual(deEstudio('sismo'), 'ultimate_slam');
  assert.strictEqual(deEstudio('attack'), 'punch');
  assert.strictEqual(deEstudio('nova'), 'ultimate_nova');
  // Todas las habilidades tienen su animación en el cuerpo del estudio (el tiro, con arco) y el mismo bloqueo
  const conArco = estudio.concat(['spin_slash', 'whirlwind', 'overhead_cleave', 'thrust_lunge', 'rising_slash', 'guard_counter', 'triple_corkscrew', 'backflip', 'archery', 'aerial_shot']);
  const esperada = { tajo: 'spin_slash', torbellino: 'whirlwind', hendidura: 'overhead_cleave', estocada: 'thrust_lunge', ascendente: 'rising_slash',
    contraataque: 'guard_counter', tornillo: 'triple_corkscrew', voltereta: 'backflip', disparo: 'archery', suspension: 'aerial_shot' };
  Object.keys(C.SKILLS).forEach(k => {
    assert.ok(CH.CLIP_KEYWORDS[k], 'animación para ' + k);
    const clip = conArco[CH.findClipIndex(conArco, CH.CLIP_KEYWORDS[k])];
    if (esperada[k]) assert.strictEqual(clip, esperada[k], k);
    assert.strictEqual(CH.ONE_SHOT[k].lock, C.SKILLS[k].lock, 'bloqueo de ' + k);
  });
  assert.strictEqual(pick('jump'), 'Salto Acrobático');
  assert.strictEqual(pick('victory'), 'Postura de Victoria');
  assert.strictEqual(pick('nova'), 'Explosión Nova');
  assert.ok(!names.some(n => CH.CLIP_KEYWORDS.idle.some(k => n.toLowerCase().includes(k))) || pick('idle') !== 'Pose Estática (Bind Pose)');
});

t('penalización de EXP por diferencia de nivel (empezando a 3 niveles y 0 EXP a 7 niveles)', () => {
  // Enemigo de mayor o igual nivel: 100% de EXP
  assert.strictEqual(C.factorXpPorNivel(5, 8), 1.0);
  assert.strictEqual(C.factorXpPorNivel(5, 5), 1.0);
  assert.strictEqual(C.xpPorMonstruo(100, 5, 5), 100);

  // Diferencia de 1 y 2 niveles por debajo: 100% de EXP (sin penalización)
  assert.strictEqual(C.factorXpPorNivel(5, 4), 1.0); // diff = 1
  assert.strictEqual(C.factorXpPorNivel(5, 3), 1.0); // diff = 2
  assert.strictEqual(C.xpPorMonstruo(100, 5, 3), 100);

  // Diferencia de 3 niveles: empieza la penalización (-20% -> 80% EXP)
  assert.strictEqual(C.factorXpPorNivel(5, 2), 0.8); // diff = 3
  assert.strictEqual(C.xpPorMonstruo(100, 5, 2), 80);

  // Diferencia de 4 niveles: 60% EXP
  assert.strictEqual(C.factorXpPorNivel(5, 1), 0.6); // diff = 4
  assert.strictEqual(C.xpPorMonstruo(100, 5, 1), 60);

  // Diferencia de 5 niveles: 40% EXP
  assert.strictEqual(C.factorXpPorNivel(6, 1), 0.4); // diff = 5
  assert.strictEqual(C.xpPorMonstruo(100, 6, 1), 40);

  // Diferencia de 6 niveles: 20% EXP
  assert.strictEqual(C.factorXpPorNivel(7, 1), 0.2); // diff = 6
  assert.strictEqual(C.xpPorMonstruo(100, 7, 1), 20);

  // Diferencia de 7 niveles o más: 0% EXP (ya no da exp)
  assert.strictEqual(C.factorXpPorNivel(8, 1), 0.0); // diff = 7
  assert.strictEqual(C.xpPorMonstruo(100, 8, 1), 0);
  assert.strictEqual(C.factorXpPorNivel(15, 1), 0.0); // diff = 14
  assert.strictEqual(C.xpPorMonstruo(100, 15, 1), 0);
});

t('monstruos arqueros y magos: detección de rol, ataque a distancia y velocidad de persecución', () => {
  // Detección de arqueros
  assert.strictEqual(C.detectarRol({ weapon: 'bone_recurved_bow' }), 'arquero');
  assert.strictEqual(C.detectarRol({ name: 'Esqueleto Arquero' }), 'arquero');
  assert.strictEqual(C.detectarRol({ archetype: 'archer_species_2_forest_goblin_bowman' }), 'arquero');

  // Detección de magos
  assert.strictEqual(C.detectarRol({ weapon: 'arcane_staff' }), 'mago');
  assert.strictEqual(C.detectarRol({ raceCategory: 'magical' }), 'mago');
  assert.strictEqual(C.detectarRol({ name: 'Archimago Oscuro' }), 'mago');

  // Detección de melee
  assert.strictEqual(C.detectarRol({ weapon: 'iron_broadsword' }), 'melee');
  assert.strictEqual(C.detectarRol({ name: 'Lobo Salvaje' }), 'melee');

  // Creación de monstruo arquero
  const arquero = C.newMonster({ level: 3, x: 0, z: 0, weapon: 'bone_recurved_bow' });
  assert.strictEqual(arquero.tipoRango, 'arquero');
  assert.strictEqual(arquero.esADistancia, true);
  assert.strictEqual(arquero.attackRange, 18.0);
  assert.ok(arquero.speed >= 10.0, 'Velocidad de persecución similar al héroe (~10.5 m/s)');

  // IA: el arquero ataca a 15 metros sin tener que acercarse a melee
  const h = C.newHero();
  let ataquesDistancia = 0;
  for (let i = 0; i < 50; i++) {
    const r = C.monsterTick(arquero, h, 15.0, 0, 0.1); // héroe a 15m
    if (r.attack) ataquesDistancia++;
  }
  assert.strictEqual(arquero.state, 'chase');
  assert.ok(ataquesDistancia >= 3, 'El arquero debe atacar a 15m de distancia: ' + ataquesDistancia);
  assert.strictEqual(arquero.x, 0, 'El arquero no debe avanzar hacia melee cuando ya está dentro de su rango (18m)');

  // Monstruo melee a 15m: debe avanzar para acercarse
  const melee = C.newMonster({ level: 3, x: 0, z: 0, weapon: 'iron_broadsword' });
  assert.strictEqual(melee.esADistancia, false);
  assert.strictEqual(melee.attackRange, 2.2);
  C.monsterTick(melee, h, 15.0, 0, 0.1);
  assert.ok(melee.x > 0, 'El monstruo melee debe desplazarse hacia el héroe para alcanzarlo');
});

t('habilidades elementales (fuego, hielo y rayo arcano) y ralentización por escarcha', () => {
  ['bola_fuego', 'lanza_hielo', 'ventisca_glacial', 'tormenta_fuego', 'rayo_arcano'].forEach(id => {
    const sk = C.SKILLS[id];
    assert.ok(sk, 'falta skill ' + id);
    assert.strictEqual(sk.arma, undefined, id + ' debe poderse lanzar con cualquier arma');
    assert.ok(sk.slow === undefined || sk.slow > 0);
  });
  assert.ok(C.SKILLS.bola_fuego.proyectil && C.SKILLS.lanza_hielo.proyectil);
  assert.ok(C.SKILLS.lanza_hielo.slow > 0 && C.SKILLS.ventisca_glacial.slow > 0);

  const h = C.newHero();
  const normal = C.newMonster({ level: 3, x: 0, z: 0, leash: 60 });
  const frozen = C.newMonster({ level: 3, x: 0, z: 0, leash: 60 });
  frozen.slowTimer = 3.0;
  frozen.slowMult = 0.4;
  C.monsterTick(normal, h, 10, 0, 0.5);
  C.monsterTick(frozen, h, 10, 0, 0.5);
  assert.ok(normal.x > 0, 'monstruo normal debe avanzar hacia el héroe');
  assert.ok(frozen.x > 0 && frozen.x < normal.x, `monstruo congelado (${frozen.x}) debe moverse más lento que normal (${normal.x})`);
  assert.ok(frozen.slowTimer < 3.0, 'slowTimer debe decrecer con dt');
});

t('esquiva (dodge): i-frames bloquean daño, cancela lock, respeta cooldown y permite evadir ataques', () => {
  const h = C.newHero();
  assert.ok(C.DODGE && C.DODGE.iframes > 0 && C.DODGE.cd > C.DODGE.duration);
  assert.ok(C.canDodge(h));

  // Cancelar lock de habilidad al esquivar
  h.lock = 0.8;
  assert.strictEqual(C.startDodge(h), true);
  assert.strictEqual(h.lock, 0, 'startDodge debe cancelar el bloqueo de movimiento');
  assert.ok(C.isInvulnerable(h));
  assert.ok(!C.canDodge(h), 'no se puede volver a esquivar en recarga');
  assert.strictEqual(C.startDodge(h), false);

  // Durante i-frames takeHit no quita vida
  const hpAntes = h.hp;
  assert.strictEqual(C.takeHit(h, 40), false);
  assert.strictEqual(h.hp, hpAntes);

  // Al expirar i-frames vuelve a recibir daño; al pasar cd vuelve a poder esquivar
  C.tickHero(h, C.DODGE.iframes + 0.05);
  assert.ok(!C.isInvulnerable(h));
  C.takeHit(h, 25);
  assert.strictEqual(h.hp, hpAntes - 25);

  C.tickHero(h, C.DODGE.cd);
  assert.ok(C.canDodge(h));

  // Evasión espacial de proyectiles y cuerpo a cuerpo
  const flecha = { ranged: true, targetX: 10, targetZ: 10, hitRadius: 1.5, attackerY: 0 };
  assert.strictEqual(C.checkEnemyHitAvoided(flecha, 10.5, 10.5, 0), false);
  assert.strictEqual(C.checkEnemyHitAvoided(flecha, 13.0, 10.0, 0), true);

  const melee = { ranged: false, attackerX: 0, attackerZ: 0, attackerY: 0, hitRadius: 3.3 };
  assert.strictEqual(C.checkEnemyHitAvoided(melee, 2.0, 1.0, 0), false);
  assert.strictEqual(C.checkEnemyHitAvoided(melee, 4.5, 0.0, 0), true);
  assert.strictEqual(C.checkEnemyHitAvoided(melee, 1.0, 0.0, 5.5), true);
});

t('ataques telegrafiados: normal no usa especiales; jefe y élite lanzan specialStart/specialRelease, fase 2 y cancelación', () => {
  const h = C.newHero();

  // 1. Monstruo normal nunca genera telegraph
  const normal = C.newMonster({ level: 3, x: 0, z: 0, leash: 60 });
  for (let i = 0; i < 60; i++) {
    const r = C.monsterTick(normal, h, 3, 0, 0.1);
    assert.strictEqual(r.specialStart, null);
    assert.strictEqual(normal.telegraph, null);
  }

  // 2. Jefe genera specialStart tras specialCd, pausa desplazamiento durante carga y suelta specialRelease
  const jefe = C.newMonster({ level: 5, boss: true, x: 0, z: 0, leash: 60 });
  jefe.specialCd = 0.2;
  let rStart = null;
  for (let i = 0; i < 5 && !rStart; i++) {
    const r = C.monsterTick(jefe, h, 4, 0, 0.1);
    if (r.specialStart) rStart = r.specialStart;
  }
  assert.ok(rStart, 'el jefe debe iniciar un ataque telegrafiado tras agotar specialCd');
  assert.ok(jefe.telegraph, 'jefe.telegraph debe permanecer activo durante la carga');
  const posInicioX = jefe.x;

  let released = null;
  for (let i = 0; i < 30 && !released; i++) {
    const r = C.monsterTick(jefe, h, 4, 0, 0.1);
    assert.strictEqual(jefe.x, posInicioX, 'el jefe no debe moverse ni avanzar mientras carga el telegrafiado');
    assert.strictEqual(r.attack, false, 'no debe soltar ataque básico mientras carga el especial');
    if (r.specialRelease) released = r.specialRelease;
  }
  assert.ok(released, 'el jefe debe emitir specialRelease al completar duration');
  assert.strictEqual(jefe.telegraph, null);

  // 3. Transición única a Fase 2 al bajar a <= 50 % HP y aceleración
  jefe.hp = Math.floor(jefe.maxHp * 0.45);
  jefe.specialCd = 5.0;
  const rF2 = C.monsterTick(jefe, h, 4, 0, 0.1);
  assert.strictEqual(jefe.fase, 2);
  assert.strictEqual(rF2.fase2, true);
  assert.ok(jefe.specialCd <= 1.0);
  const rF2Rep = C.monsterTick(jefe, h, 4, 0, 0.1);
  assert.strictEqual(rF2Rep.fase2, false, 'fase2 solo debe emitirse una vez');

  // 4. Élite genera aviso y se cancela limpio si el héroe muere o sale de leash
  const elite = C.newMonster({ level: 4, rangoElite: 2, x: 0, z: 0, leash: 30 });
  elite.specialCd = 0.05;
  const rEl = C.monsterTick(elite, h, 3, 0, 0.1);
  assert.ok(rEl.specialStart && elite.telegraph);
  h.dead = true;
  const rCan = C.monsterTick(elite, h, 3, 0, 0.1);
  assert.strictEqual(rCan.specialCancel, true);
  assert.strictEqual(elite.telegraph, null);
});

t('inTelegraphArea: detecta exactamente áreas slam, cone, charge y nova_orbs', () => {
  const slam = { tipo: 'slam', x: 0, z: 0, radius: 5 };
  assert.strictEqual(C.inTelegraphArea(slam, 3, 3), true);
  assert.strictEqual(C.inTelegraphArea(slam, 5.5, 0), false);

  const cone = { tipo: 'cone', x: 0, z: 0, dirX: 1, dirZ: 0, radius: 6, halfAngle: 0.5 };
  assert.strictEqual(C.inTelegraphArea(cone, 4, 0), true);
  assert.strictEqual(C.inTelegraphArea(cone, 4, 3.5), false); // ángulo > 0.5 rad
  assert.strictEqual(C.inTelegraphArea(cone, -2, 0), false);  // detrás

  const charge = { tipo: 'charge', x: 0, z: 0, dirX: 0, dirZ: 1, length: 10, halfWidth: 1.5 };
  assert.strictEqual(C.inTelegraphArea(charge, 1.0, 5), true);
  assert.strictEqual(C.inTelegraphArea(charge, 2.2, 5), false); // fuera lateral
  assert.strictEqual(C.inTelegraphArea(charge, 0, 12), false);  // pasado el largo

  const orbs = { tipo: 'nova_orbs', zones: [{ x: 10, z: 10, radius: 2.5 }, { x: 15, z: 10, radius: 2.5 }] };
  assert.strictEqual(C.inTelegraphArea(orbs, 14, 10), true);
  assert.strictEqual(C.inTelegraphArea(orbs, 0, 0), false);
});

t('nuevas habilidades por profesión, escalado poderMagico, regen de maná y recarga de esquiva', () => {
  const nuevas = ['orbe_arcano', 'flecha_perforante', 'trampa_espinas', 'escudo_mana', 'paso_sombrio', 'hoja_veneno'];
  nuevas.forEach(id => {
    const sk = C.SKILLS[id];
    assert.ok(sk, 'falta en CombatLib.SKILLS: ' + id);
    assert.ok(CH.CLIP_KEYWORDS[id] && CH.CLIP_KEYWORDS[id].length > 0, 'falta CLIP_KEYWORDS: ' + id);
    assert.ok(CH.ONE_SHOT[id], 'falta ONE_SHOT: ' + id);
    assert.strictEqual(CH.ONE_SHOT[id].lock, sk.lock, `lock desincronizado en ${id}`);
  });
  assert.strictEqual(C.SKILLS.sismo.arma, undefined, 'sismo debe ser universal entre clases');

  // Escalado de poderMagico afecta a conjuros y báculo, no a tajo físico
  const hSinMagia = C.newHero();
  hSinMagia.level = 5; hSinMagia.ataque = 10; hSinMagia.poderMagico = 0;
  const hMago = C.newHero();
  hMago.level = 5; hMago.ataque = 10; hMago.poderMagico = 30;
  assert.ok(C.heroDamage(hMago, 'bola_fuego', 5) > C.heroDamage(hSinMagia, 'bola_fuego', 5));
  assert.ok(C.heroDamage(hMago, 'orbe_arcano', 5) > C.heroDamage(hSinMagia, 'orbe_arcano', 5));
  assert.strictEqual(C.heroDamage(hMago, 'tajo', 5), C.heroDamage(hSinMagia, 'tajo', 5));

  // mpRegenMult acelera recuperación de maná en tickHero
  const hRegen = C.newHero();
  hRegen.mp = 0; hRegen.mpRegenMult = 1.5;
  const hNorm = C.newHero();
  hNorm.mp = 0; hNorm.mpRegenMult = 1;
  C.tickHero(hRegen, 1.0);
  C.tickHero(hNorm, 1.0);
  assert.ok(hRegen.mp > hNorm.mp);

  // startDodge(hero, 0.7) recorta recarga (ej. Pícaro)
  const hPic = C.newHero();
  assert.strictEqual(C.startDodge(hPic, 0.7), true);
  assert.ok(Math.abs(hPic.dodgeCd - C.DODGE.cd * 0.7) < 1e-6);

  // Bonos elementales de subclase (fuegoMult / hieloMult) en heroDamage
  const hBase = C.newHero(); hBase.level = 15; hBase.ataque = 20;
  const hFuego = C.newHero(); hFuego.level = 15; hFuego.ataque = 20; hFuego.fuegoMult = 0.25;
  const hHielo = C.newHero(); hHielo.level = 15; hHielo.ataque = 20; hHielo.hieloMult = 0.25;
  assert.ok(Math.abs(C.heroDamage(hFuego, 'bola_fuego', 15) - C.heroDamage(hBase, 'bola_fuego', 15) * 1.25) < 1e-6);
  assert.strictEqual(C.heroDamage(hFuego, 'lanza_hielo', 15), C.heroDamage(hBase, 'lanza_hielo', 15));
  assert.ok(Math.abs(C.heroDamage(hHielo, 'lanza_hielo', 15) - C.heroDamage(hBase, 'lanza_hielo', 15) * 1.25) < 1e-6);
  assert.strictEqual(C.heroDamage(hHielo, 'tajo', 15), C.heroDamage(hBase, 'tajo', 15));
});

t('efectos exteriores de fuego y bolas: detectarElemento, fire_orbs, fire_breath y conEfectosEspeciales', () => {
  assert.strictEqual(C.detectarRol({ name: 'Piromante de los Caminos' }), 'mago');
  assert.strictEqual(C.detectarElemento({ name: 'Piromante de los Caminos' }), 'fuego');
  assert.strictEqual(C.detectarElemento({ weapon: 'dragon_breath_maw' }), 'fuego');
  assert.strictEqual(C.detectarElemento({ weapon: 'frost_breath_maw' }), 'hielo');
  assert.strictEqual(C.detectarElemento({ name: 'Lobo Ventisca Glacial' }), 'hielo');
  assert.strictEqual(C.detectarElemento({ weapon: 'arcane_staff' }), 'arcano');
  assert.strictEqual(C.detectarElemento({ name: 'Jabalí Silvestre', weapon: 'ram_charge' }), null);

  assert.ok(C.SPECIAL_ATTACKS.fire_orbs && C.SPECIAL_ATTACKS.fire_breath, 'deben existir fire_orbs y fire_breath');

  const tgOrbs = {
    tipo: 'fire_orbs',
    x: 0,
    z: 0,
    zones: [{ x: 10, z: 10, radius: 2.3 }, { x: 14, z: 10, radius: 2.3 }]
  };
  assert.strictEqual(C.inTelegraphArea(tgOrbs, 10.5, 10.2), true);
  assert.strictEqual(C.inTelegraphArea(tgOrbs, 0, 0), false);

  const tgBreath = { tipo: 'fire_breath', x: 0, z: 0, dirX: 1, dirZ: 0, radius: 5.2, halfAngle: 0.56 };
  assert.strictEqual(C.inTelegraphArea(tgBreath, 3.5, 0), true);
  assert.strictEqual(C.inTelegraphArea(tgBreath, 3.5, 4.0), false);
  assert.strictEqual(C.inTelegraphArea(tgBreath, -2.0, 0), false);

  const h = C.newHero();

  // Normal sin conEfectosEspeciales: sigue sin lanzar telegrafiados
  const sinFx = C.newMonster({ level: 3, x: 0, z: 0, leash: 60 });
  assert.strictEqual(sinFx.conEfectosEspeciales, false);
  for (let i = 0; i < 60; i++) {
    const r = C.monsterTick(sinFx, h, 4, 0, 0.1);
    assert.strictEqual(r.specialStart, null);
  }

  // Normal exterior con conEfectosEspeciales + elemento 'fuego': dispara fire_orbs moderado (2 zonas, <= 1.25x daño)
  const conFx = C.newMonster({ level: 3, x: 0, z: 0, leash: 60, conEfectosEspeciales: true, elemento: 'fuego' });
  assert.strictEqual(conFx.conEfectosEspeciales, true);
  conFx.specialCd = 0.05;
  let inicio = null;
  for (let i = 0; i < 5 && !inicio; i++) {
    const r = C.monsterTick(conFx, h, 6, 0, 0.1);
    if (r.specialStart) inicio = r.specialStart;
  }
  assert.ok(inicio, 'normal con conEfectosEspeciales debe lanzar specialStart');
  assert.strictEqual(inicio.tipo, 'fire_orbs');
  assert.strictEqual(inicio.elemento, 'fuego');
  assert.strictEqual(inicio.zones.length, 2);
  inicio.zones.forEach(z => {
    assert.ok(Number.isFinite(z.x) && Number.isFinite(z.z) && Number.isFinite(z.radius));
  });
  assert.ok(inicio.dmgMult <= 1.25, `dmgMult de bicho normal debe estar acotado (${inicio.dmgMult})`);

  let suelta = null;
  for (let i = 0; i < 30 && !suelta; i++) {
    const r = C.monsterTick(conFx, h, 6, 0, 0.1);
    if (r.specialRelease) suelta = r.specialRelease;
  }
  assert.ok(suelta && suelta.tipo === 'fire_orbs', 'debe completar fire_orbs en specialRelease');

  // Élite exterior de fuego: debe rotar incluyendo fire_orbs / fire_breath / nova_orbs
  const eliteFuego = C.newMonster({ level: 5, rangoElite: 2, x: 0, z: 0, leash: 60, elemento: 'fuego' });
  const tiposVistos = new Set();
  for (let k = 0; k < 5; k++) {
    eliteFuego.specialCd = 0.01;
    let st = null;
    for (let i = 0; i < 3 && !st; i++) st = C.monsterTick(eliteFuego, h, 5, 0, 0.1).specialStart;
    assert.ok(st);
    tiposVistos.add(st.tipo);
    eliteFuego.telegraph = null;
  }
  assert.ok(tiposVistos.has('fire_orbs') && tiposVistos.has('fire_breath') && tiposVistos.has('nova_orbs'),
    'élite de fuego debe lanzar fire_orbs, fire_breath y nova_orbs: ' + [...tiposVistos].join(','));
});

console.log(`\n${n} pruebas correctas`);
