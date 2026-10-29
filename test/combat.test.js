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
  assert.strictEqual(C.monsterStats(1, false).maxHp, 28);
  assert.strictEqual(C.monsterStats(1, true).maxHp, 140);
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
  assert.strictEqual(pick('jump'), 'Salto Acrobático');
  assert.strictEqual(pick('victory'), 'Postura de Victoria');
  assert.strictEqual(pick('nova'), 'Explosión Nova');
  assert.ok(!names.some(n => CH.CLIP_KEYWORDS.idle.some(k => n.toLowerCase().includes(k))) || pick('idle') !== 'Pose Estática (Bind Pose)');
});

console.log(`\n${n} pruebas correctas`);
