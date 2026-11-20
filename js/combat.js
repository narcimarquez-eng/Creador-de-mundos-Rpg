/*
 * combat.js — Reglas del combate (sin gráficos). Ver docs/COMBATE.md.
 * Expone window.CombatLib (o module.exports en Node para las pruebas).
 */
(function (root) {
  "use strict";

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const HERO = {
    hpBase: 100, hpPerLevel: 12,
    mpBase: 50, mpPerLevel: 6, mpRegen: 2,           // MP por segundo
    hpRegen: 2, hpRegenDelay: 6,                     // HP por segundo tras 6 s sin recibir golpes
    baseDamage: 8, damagePerLevel: 3,
    respawnSec: 4,
    deathXpLoss: 0.05                                // se pierde el 5 % del XP actual al morir
  };

  const DODGE = { cd: 1.35, duration: 0.34, iframes: 0.36, speed: 22.0 };

  // arc: coseno del semiángulo del cono frontal (-1 = alrededor del personaje).
  // impacto: segundos desde que empieza la animación hasta el golpe (una lista = varios golpes, mult por golpe).
  // arma: 'cuerpo' (cualquier arma menos el arco) o 'arco'; sin arma, vale con cualquiera.
  // unico: golpea solo al monstruo más cercano del área (las flechas).
  // Cada habilidad usa la animación del mismo nombre del personaje (ver js/character.js).
  const SKILLS = {
    attack:      { nombre: 'Combo de ataque', icono: '⚔', cd: 1.30, lock: 1.00, range: 3.0, arc: 0.5, mult: 1.0, mp: 0 },
    sismo:       { nombre: 'Impacto sísmico', icono: '🪨', cd: 5.0, lock: 1.80, range: 4.5, arc: -1, mult: 2.0, mp: 18, impacto: 1.35 },
    nova:        { nombre: 'Explosión nova', icono: '💥', cd: 12, lock: 1.65, range: 7.0, arc: -1, mult: 2.5, mp: 30, impacto: 0.55 },
    // Técnicas de arma (animaciones de ataque especial del estudio)
    tajo:        { nombre: 'Tajo giratorio', icono: '🌀', cd: 5, lock: 1.60, range: 3.5, arc: -1, mult: 1.8, mp: 12, impacto: 0.92, arma: 'cuerpo' },
    estocada:    { nombre: 'Estocada a fondo', icono: '🗡', cd: 4, lock: 1.40, range: 5.0, arc: 0.9, mult: 2.2, mp: 10, impacto: 0.72, arma: 'cuerpo' },
    ascendente:  { nombre: 'Tajo ascendente', icono: '⤴', cd: 5, lock: 1.50, range: 3.2, arc: 0.5, mult: 2.0, mp: 12, impacto: 0.82, arma: 'cuerpo' },
    hendidura:   { nombre: 'Hendidura vertical', icono: '🪓', cd: 7, lock: 1.65, range: 3.5, arc: 0.7, mult: 2.6, mp: 16, impacto: 1.05, arma: 'cuerpo' },
    contraataque:{ nombre: 'Parada y contraataque', icono: '🛡', cd: 9, lock: 1.50, range: 3.0, arc: 0.5, mult: 2.8, mp: 15, impacto: 1.25, arma: 'cuerpo' },
    torbellino:  { nombre: 'Torbellino', icono: '🌪', cd: 9, lock: 2.00, range: 4.0, arc: -1, mult: 1.4, mp: 24, impacto: [0.85, 1.80], arma: 'cuerpo' },
    voltereta:   { nombre: 'Voltereta mortal', icono: '🤸', cd: 8, lock: 1.50, range: 3.0, arc: -1, mult: 1.6, mp: 14, impacto: 1.20, arma: 'cuerpo' },
    tornillo:    { nombre: 'Tornillo triple', icono: '🌩', cd: 15, lock: 2.20, range: 4.5, arc: -1, mult: 3.4, mp: 35, impacto: 1.75, arma: 'cuerpo' },
    // Nuevas habilidades añadidas (desbloqueables por subida de nivel)
    corte_cruzado: { nombre: 'Corte en Cruz', icono: '⚔️', cd: 4.5, lock: 1.50, range: 3.5, arc: 0.7, mult: 1.9, mp: 10, impacto: [0.58, 1.18], arma: 'cuerpo' },
    rafaga:      { nombre: 'Ráfaga de Viento', icono: '💨', cd: 6.0, lock: 1.40, range: 7.0, arc: 0.6, mult: 2.1, mp: 14, impacto: 0.82, arma: 'cuerpo' },
    furia:       { nombre: 'Furia Sangrienta', icono: '🔥', cd: 7.5, lock: 1.55, range: 3.6, arc: 0.8, mult: 2.5, mp: 18, impacto: 0.95, arma: 'cuerpo' },
    escudo_espiritu: { nombre: 'Escudo del Bastión', icono: '🛡️', cd: 10.0, lock: 1.50, range: 3.4, arc: 0.6, mult: 2.3, mp: 20, impacto: 0.82, arma: 'cuerpo' },
    salto_demoledor: { nombre: 'Salto Demoledor', icono: '⚡', cd: 11.0, lock: 1.90, range: 5.5, arc: -1, mult: 2.8, mp: 26, impacto: 1.30, arma: 'cuerpo' },
    lluvia_proyectiles: { nombre: 'Lluvia de Flechas', icono: '🎯', cd: 9.0, lock: 1.85, range: 25.0, arc: -1, mult: 2.5, mp: 22, impacto: [0.75, 1.40], arma: 'arco', unico: true },
    juicio_relampago: { nombre: 'Filo Relámpago', icono: '⚡', cd: 12.0, lock: 1.75, range: 4.2, arc: 0.8, mult: 3.2, mp: 30, impacto: 1.12, arma: 'cuerpo' },
    sentencia_titan: { nombre: 'Sentencia del Titán', icono: '💥', cd: 16.0, lock: 2.00, range: 6.5, arc: -1, mult: 4.0, mp: 42, impacto: 1.45, arma: 'cuerpo' },
    // Arco: el tiro sustituye al combo cuando el arma es un arco
    disparo:     { nombre: 'Tiro con arco', icono: '🏹', cd: 1.65, lock: 1.25, range: 24, arc: 0.95, mult: 1.2, mp: 0, impacto: 1.15, arma: 'arco', unico: true },
    suspension:  { nombre: 'Flecha en suspensión', icono: '🎯', cd: 8, lock: 2.30, range: 26, arc: 0.9, mult: 2.6, mp: 20, impacto: 1.75, arma: 'arco', unico: true },
    // Magia elemental (fuego, hielo y tormenta arcana; usable con cualquier arma)
    bola_fuego:       { nombre: 'Bola de Fuego', icono: '🔥', cd: 3.5, lock: 1.20, range: 22, arc: 0.65, mult: 2.1, mp: 12, impacto: 0.50, elemento: 'fuego', proyectil: true, splash: 3.8 },
    lanza_hielo:      { nombre: 'Lanza de Hielo', icono: '❄️', cd: 4.0, lock: 1.20, range: 22, arc: 0.65, mult: 1.9, mp: 12, impacto: 0.48, elemento: 'hielo', proyectil: true, splash: 3.4, slow: 4.5, slowMult: 0.45 },
    ventisca_glacial: { nombre: 'Ventisca Glacial', icono: '🌨️', cd: 10.0, lock: 1.50, range: 7.5, arc: -1, mult: 2.4, mp: 24, impacto: [0.50, 1.05], elemento: 'hielo', slow: 5.5, slowMult: 0.35 },
    tormenta_fuego:   { nombre: 'Lluvia de Meteoros', icono: '☄️', cd: 12.0, lock: 1.55, range: 8.5, arc: -1, mult: 3.1, mp: 28, impacto: [0.60, 1.20], elemento: 'fuego' },
    rayo_arcano:      { nombre: 'Tormenta Eléctrica', icono: '🌩️', cd: 11.0, lock: 1.45, range: 9.0, arc: -1, mult: 3.3, mp: 30, impacto: 0.58, elemento: 'rayo' },
    // Habilidades específicas por profesión (Báculo / Cazador / Mago / Pícaro)
    orbe_arcano:       { nombre: 'Orbe Arcano', icono: '🔮', cd: 1.35, lock: 1.00, range: 22, arc: 0.85, mult: 1.15, mp: 0, impacto: 0.48, arma: 'baculo', proyectil: true, splash: 1.4, elemento: 'rayo' },
    flecha_perforante: { nombre: 'Flecha Perforante', icono: '🏹', cd: 4.5, lock: 1.40, range: 26, arc: 0.88, mult: 2.2, mp: 12, impacto: 0.72, arma: 'arco' },
    trampa_espinas:    { nombre: 'Trampa de Espinas', icono: '🌿', cd: 9.0, lock: 1.25, range: 12, arc: -1, mult: 2.1, mp: 18, impacto: 0.50, arma: 'arco', slow: 5.0, slowMult: 0.4 },
    escudo_mana:       { nombre: 'Escudo de Maná', icono: '💠', cd: 11.0, lock: 1.20, range: 6.0, arc: -1, mult: 1.7, mp: 20, impacto: 0.45, arma: 'baculo', elemento: 'rayo', escudoPct: 0.28, escudoDur: 8.0 },
    paso_sombrio:      { nombre: 'Paso Sombrío', icono: '🌑', cd: 6.5, lock: 1.20, range: 11.0, arc: 0.7, mult: 2.35, mp: 14, impacto: 0.45, arma: 'cuerpo', dashToTarget: true, bonusCrit: 0.25 },
    hoja_veneno:       { nombre: 'Hoja Envenenada', icono: '☠️', cd: 7.0, lock: 1.30, range: 3.6, arc: 0.7, mult: 2.1, mp: 14, impacto: 0.55, arma: 'cuerpo', venenoPct: 0.24, venenoDur: 5.0 }
  };

  // Momentos de golpe de una habilidad (segundos desde que empieza); [0] = al instante
  function impactos(skill) {
    const i = SKILLS[skill].impacto;
    return Array.isArray(i) ? i.slice() : [i || 0];
  }

  const MONSTER = {
    hpBase: 45, hpPerLevel: 18, hpMult: 1.5,
    dmgBase: 4, dmgPerLevel: 2.0, dmgMult: 0.95,
    xpPerLevel: 10,
    bossMult: { hp: 6, dmg: 1.8, xp: 6 },
    aggro: 16, bossAggro: 20,
    attackRange: 2.2, rangedAttackRange: 18.0, attackCd: 1.85,
    chaseSpeed: 10.5, bossChaseSpeed: 8.5,            // velocidad de persecución similar a la carrera del héroe (12 m/s)
    returnSpeed: 5.5,
    regenPerSec: 0.1                                  // fracción de la vida máxima por segundo al volver
  };

  // Diferencia de nivel: +10 % por cada nivel por encima del rival, entre x0,5 y x2
  function diffMult(attLevel, defLevel) {
    return clamp(1 + 0.1 * (attLevel - defLevel), 0.5, 2);
  }

  function heroMax(level) {
    return { maxHp: HERO.hpBase + HERO.hpPerLevel * (level - 1), maxMp: HERO.mpBase + HERO.mpPerLevel * (level - 1) };
  }

  function newHero() {
    const m = heroMax(1);
    return {
      level: 1, xp: 0,
      hp: m.maxHp, maxHp: m.maxHp, mp: m.maxMp, maxMp: m.maxMp,
      sinceHit: 99, dead: false, deadUntil: 0,
      cd: Object.fromEntries(Object.keys(SKILLS).map(k => [k, 0])), lock: 0,
      dodgeCd: 0, dodgeTimer: 0, invulnTimer: 0
    };
  }

  function xpToNext(level) { return 100 * level; }

  // Suma XP y sube de nivel si hace falta. Devuelve cuántos niveles ha subido.
  function gainXp(hero, amount) {
    hero.xp += amount;
    let gained = 0;
    while (hero.xp >= xpToNext(hero.level)) {
      hero.xp -= xpToNext(hero.level);
      hero.level += 1;
      gained += 1;
    }
    const m = heroMax(hero.level);
    if (gained) { hero.maxHp = m.maxHp; hero.maxMp = m.maxMp; hero.hp = m.maxHp; hero.mp = m.maxMp; }
    return gained;
  }

  // Penalización de experiencia al matar enemigos de menor nivel que el atacante (héroe o acompañante):
  // - Hasta 2 niveles de ventaja (o si el enemigo es de igual/mayor nivel): 100 % de EXP (factor 1.0).
  // - Al superar en 3 niveles al enemigo: empieza la penalización y baja progresivamente un 20 % por cada nivel:
  //   * diff = 3 -> 80 % (factor 0.8)
  //   * diff = 4 -> 60 % (factor 0.6)
  //   * diff = 5 -> 40 % (factor 0.4)
  //   * diff = 6 -> 20 % (factor 0.2)
  // - Al superar en 7 niveles o más al enemigo (diff >= 7): ya no da EXP (factor 0.0).
  function factorXpPorNivel(heroLevel, monsterLevel) {
    const diff = heroLevel - monsterLevel;
    if (diff <= 2) return 1.0;
    if (diff >= 7) return 0.0;
    return Math.round(Math.max(0, 1.0 - (diff - 2) * 0.2) * 100) / 100;
  }

  function xpPorMonstruo(monsterXp, heroLevel, monsterLevel) {
    return Math.round(monsterXp * factorXpPorNivel(heroLevel, monsterLevel));
  }

  function heroDamage(hero, skill, targetLevel) {
    const s = SKILLS[skill];
    const bonoMagico = (s.elemento || s.arma === 'baculo') ? (hero.poderMagico || 0) : 0;
    const multElem = (s.elemento === 'fuego' && hero.fuegoMult ? 1 + hero.fuegoMult : 1)
      * (s.elemento === 'hielo' && hero.hieloMult ? 1 + hero.hieloMult : 1);
    // hero.ataque: ataque del arma equipada (0 sin arma); bonoMagico + multElem: escalado mágico y de subclase
    return (HERO.baseDamage + HERO.damagePerLevel * hero.level + (hero.ataque || 0) + bonoMagico) * s.mult * multElem * diffMult(hero.level, targetLevel);
  }

  function canUse(hero, skill) {
    const s = SKILLS[skill];
    return !hero.dead && hero.lock <= 0 && hero.cd[skill] <= 0 && hero.mp >= s.mp;
  }

  // Gasta el uso de una habilidad (MP, enfriamiento y bloqueo de movimiento)
  function useSkill(hero, skill) {
    const s = SKILLS[skill];
    hero.mp -= s.mp;
    hero.cd[skill] = s.cd;
    hero.lock = s.lock;
  }

  function monsterStats(level, boss, eliteMult = 1) {
    const b = boss ? MONSTER.bossMult : { hp: 1, dmg: 1, xp: 1 };
    const e = (eliteMult && eliteMult > 1) ? Number(eliteMult) : 1;
    const multXpElite = e === 2 ? 2.5 : e === 3 ? 3.8 : e >= 4 ? 5.5 : 1;
    const baseHp = Math.round((MONSTER.hpBase + MONSTER.hpPerLevel * level) * MONSTER.hpMult);
    const rawDmg = (MONSTER.dmgBase + MONSTER.dmgPerLevel * level) * MONSTER.dmgMult * b.dmg * (1 + (e - 1) * 0.25);
    return {
      maxHp: Math.round(baseHp * b.hp * e),
      dmg: Math.round(rawDmg * 100) / 100,
      xp: Math.round(MONSTER.xpPerLevel * level * b.xp * multXpElite)
    };
  }

  // Daño que un monstruo hace al héroe
  function monsterDamage(monsterLevel, boss, heroLevel) {
    return monsterStats(monsterLevel, boss).dmg * diffMult(monsterLevel, heroLevel);
  }

  function isInvulnerable(hero) {
    return !!(hero && (hero.invulnTimer || 0) > 0);
  }

  function canDodge(hero) {
    return !!(hero && !hero.dead && (hero.dodgeCd || 0) <= 0 && (hero.dodgeTimer || 0) <= 0);
  }

  function startDodge(hero, cdMult = 1) {
    if (!canDodge(hero)) return false;
    hero.dodgeCd = DODGE.cd * Math.max(0.5, Number(cdMult) || 1);
    hero.dodgeTimer = DODGE.duration;
    hero.invulnTimer = DODGE.iframes;
    hero.lock = 0;
    return true;
  }

  function checkEnemyHitAvoided(atk, hx, hz, heroY) {
    if (!atk) return false;
    if (typeof heroY === 'number' && typeof atk.attackerY === 'number' &&
        Math.abs(heroY - atk.attackerY) > (atk.ranged ? 8.0 : 4.0)) {
      return true;
    }
    if (atk.ranged) {
      return Math.hypot(hx - atk.targetX, hz - atk.targetZ) > (atk.hitRadius || 1.65);
    }
    return Math.hypot(hx - atk.attackerX, hz - atk.attackerZ) > (atk.hitRadius || 3.4);
  }

  function takeHit(hero, dmg) {
    if (hero.dead || isInvulnerable(hero)) return false;
    hero.hp -= dmg;
    hero.sinceHit = 0;
    if (hero.hp <= 0) { hero.hp = 0; hero.dead = true; return true; }
    return false;
  }

  // Avanza el tiempo del héroe: enfriamientos, bloqueo, MP y regeneración de vida
  function tickHero(hero, dt) {
    if (hero.dead) return;
    for (const k of Object.keys(hero.cd)) hero.cd[k] = Math.max(0, hero.cd[k] - dt);
    hero.lock = Math.max(0, hero.lock - dt);
    hero.dodgeCd = Math.max(0, (hero.dodgeCd || 0) - dt);
    hero.dodgeTimer = Math.max(0, (hero.dodgeTimer || 0) - dt);
    hero.invulnTimer = Math.max(0, (hero.invulnTimer || 0) - dt);
    hero.mp = Math.min(hero.maxMp, hero.mp + HERO.mpRegen * (hero.mpRegenMult || 1) * dt);
    hero.sinceHit += dt;
    if (hero.sinceHit >= HERO.hpRegenDelay) hero.hp = Math.min(hero.maxHp, hero.hp + HERO.hpRegen * dt);
  }

  // Muerte: se pierde una parte del XP y se espera antes de reaparecer
  function die(hero, now) {
    hero.xp = Math.floor(hero.xp * (1 - HERO.deathXpLoss));
    hero.deadUntil = now + HERO.respawnSec * 1000;
  }

  function respawn(hero) {
    hero.dead = false;
    hero.hp = hero.maxHp;
    hero.mp = hero.maxMp;
    hero.sinceHit = 99;
    hero.lock = 0;
    hero.dodgeCd = 0;
    hero.dodgeTimer = 0;
    hero.invulnTimer = 0;
  }

  // Determina el rol de combate (arquero, mago o melee) según arma, arquetipo o nombre
  function detectarRol(opts) {
    if (!opts) return 'melee';
    if (opts.tipoRango === 'arquero' || opts.tipoRango === 'mago') return opts.tipoRango;
    if (opts.esADistancia) return 'mago';
    const w = (opts.weapon || '').toLowerCase();
    const n = ((opts.name || '') + ' ' + (opts.archetype || '') + ' ' + (opts.id || '')).toLowerCase();
    if (w.includes('bow') || w.includes('arco') || n.includes('archer') || n.includes('arquero') || n.includes('bowman')) return 'arquero';
    if (opts.raceCategory === 'magical' || w.includes('staff') || w.includes('baston') || w.includes('varita') || w.includes('dragon_breath') || w.includes('frost_breath') || n.includes('mago') || n.includes('mage') || n.includes('shaman') || n.includes('chaman') || n.includes('brujo') || n.includes('archimago') || n.includes('sorcerer') || n.includes('wizard') || n.includes('hechicero') || n.includes('piromante')) return 'mago';
    return 'melee';
  }

  // Detecta afinidad elemental ('fuego', 'hielo', 'arcano' o null) para proyectiles y ataques especiales enemigos
  function detectarElemento(opts) {
    if (!opts) return null;
    if (opts.elemento === 'fuego' || opts.elemento === 'hielo' || opts.elemento === 'arcano') return opts.elemento;
    const w = (opts.weapon || '').toLowerCase();
    const txt = ((opts.name || '') + ' ' + (opts.archetype || '') + ' ' + (opts.id || '') + ' ' + (opts.zonaNombre || '') + ' ' + (opts.bioma || '')).toLowerCase();
    if (w.includes('dragon_breath') || /fuego|llama|brasa|magma|obsidiana|volc|ceniza|infernal|piromante|salamandra|cerbero|balrog|quebrado|marea roja|yunque|solar|ardiente/i.test(txt)) return 'fuego';
    if (w.includes('frost_breath') || /hielo|escarcha|glacial|ventisca|boreal|ártico|artico|helad|frost|cryo|nieve|invierno/i.test(txt)) return 'hielo';
    if (opts.raceCategory === 'magical' || w.includes('staff') || w.includes('baston') || /arcano|vacío|vacio|astral|djinn|liche|nigromante|espectr|hechicero|brujo|chamán|chaman|mago|maldito|sombra|oscur|rúnico|runico|spriggan|savia/i.test(txt)) return 'arcano';
    return null;
  }

  const SPECIAL_ATTACKS = {
    slam:        { nombre: 'Onda Sísmica',       tipo: 'slam',        radius: 5.5, bossRadius: 7.2, duration: 1.25, dmgMult: 1.75, bossDmgMult: 2.05 },
    charge:      { nombre: 'Embestida Brutal',   tipo: 'charge',      length: 10.5, bossLength: 13.0, halfWidth: 1.55, duration: 1.15, dmgMult: 1.75, bossDmgMult: 2.0 },
    cone:        { nombre: 'Barrido Devastador', tipo: 'cone',        radius: 6.5, bossRadius: 8.0, halfAngle: 0.62, duration: 1.2, dmgMult: 1.7, bossDmgMult: 1.95 },
    nova_orbs:   { nombre: 'Lluvia Arcana',      tipo: 'nova_orbs',   orbCount: 3, eliteCount: 2, fase2Count: 4, orbRadius: 2.8, duration: 1.3, dmgMult: 1.55, bossDmgMult: 1.75 },
    fire_orbs:   { nombre: 'Bolas de Fuego',     tipo: 'fire_orbs',   orbCount: 3, eliteCount: 2, fase2Count: 4, orbRadius: 2.6, duration: 1.32, dmgMult: 1.50, bossDmgMult: 1.85 },
    fire_breath: { nombre: 'Aliento de Fuego',   tipo: 'fire_breath', radius: 6.2, bossRadius: 8.0, halfAngle: 0.56, duration: 1.28, dmgMult: 1.55, bossDmgMult: 1.90 }
  };

  // Un monstruo vivo: posición de origen, estado, rol de ataque y temporizador
  function newMonster(opts) {
    const eliteMult = opts.rangoElite || opts.eliteMult || 1;
    const st = monsterStats(opts.level, opts.boss, eliteMult);
    const tipoRango = detectarRol(opts);
    const esDist = tipoRango === 'arquero' || tipoRango === 'mago' || !!opts.esADistancia;
    const defaultAggro = opts.boss ? MONSTER.bossAggro : MONSTER.aggro;
    const defaultSpeed = opts.boss ? MONSTER.bossChaseSpeed : MONSTER.chaseSpeed;
    const rAtaque = opts.attackRange || (esDist ? MONSTER.rangedAttackRange : MONSTER.attackRange);
    const esJefe = !!opts.boss || eliteMult >= 8;
    const elemento = opts.elemento || detectarElemento(opts);
    const conEfectosEspeciales = !!opts.conEfectosEspeciales;
    return {
      level: opts.level, boss: !!opts.boss,
      rangoElite: eliteMult,
      maxHp: st.maxHp, hp: st.maxHp, xp: st.xp, dmg: st.dmg,
      spawnX: opts.x, spawnZ: opts.z, x: opts.x, z: opts.z,
      leash: opts.leash || 40,
      state: 'idle', attackTimer: 0,
      fase: 1, telegraph: null, specialIdx: 0,
      specialCd: esJefe ? 2.8 : (eliteMult >= 2 ? 3.5 : (conEfectosEspeciales ? 3.8 : 999)),
      tipoRango: tipoRango,
      esADistancia: esDist,
      elemento,
      conEfectosEspeciales,
      attackRange: rAtaque,
      attackCd: opts.attackCd || MONSTER.attackCd,
      aggro: opts.aggro || (esDist ? Math.max(22, defaultAggro) : defaultAggro),
      speed: opts.speed || defaultSpeed,
      danoPorFuente: { hero: 0, acompanante: 0 },
      danoTotal: 0
    };
  }

  function crearTelegrafiado(m, hx, hz) {
    const esJefe = !!m.boss || (m.rangoElite || 1) >= 8;
    const esElite = (m.rangoElite || 1) >= 2;
    const esNormalConEfectos = !esJefe && !esElite && !!m.conEfectosEspeciales;
    const enFase2 = (m.fase || 1) >= 2;
    const elem = m.elemento || detectarElemento(m);
    const dx = hx - m.x, dz = hz - m.z;
    const dHero = Math.hypot(dx, dz) || 1;
    const ux = dx / dHero, uz = dz / dHero;

    let lista;
    if (esNormalConEfectos) {
      lista = (elem === 'arcano' || elem === 'hielo')
        ? ['nova_orbs', 'fire_orbs', 'fire_breath']
        : ['fire_orbs', 'fire_breath', 'nova_orbs'];
    } else if (esJefe) {
      lista = enFase2
        ? ['fire_orbs', 'nova_orbs', 'fire_breath', 'slam', 'charge']
        : ['fire_orbs', 'slam', 'nova_orbs', 'fire_breath', 'charge', 'cone'];
    } else {
      lista = (elem === 'arcano' || elem === 'hielo' || m.tipoRango === 'mago')
        ? ['nova_orbs', 'fire_orbs', 'fire_breath', 'slam', 'charge']
        : ['fire_orbs', 'fire_breath', 'nova_orbs', 'slam', 'charge'];
    }

    const idx = m.specialIdx || 0;
    m.specialIdx = idx + 1;
    let tipo = lista[idx % lista.length];
    if (idx === 0 && !esNormalConEfectos && !elem && m.tipoRango !== 'mago') {
      if (dHero <= 5.5) tipo = 'slam';
      else if (dHero >= 7.5) tipo = 'charge';
    }

    const spec = SPECIAL_ATTACKS[tipo];
    const baseDur = esNormalConEfectos ? Math.max(spec.duration, 1.42) : spec.duration;
    const duration = Math.max(0.85, baseDur * (enFase2 ? 0.85 : 1.0));
    const dmgMult = esNormalConEfectos ? 1.15 : (esJefe ? (spec.bossDmgMult || spec.dmgMult) : spec.dmgMult);
    const elementoTg = (tipo === 'fire_orbs' || tipo === 'fire_breath')
      ? 'fuego'
      : (tipo === 'nova_orbs' ? (elem === 'hielo' ? 'hielo' : 'arcano') : (elem || 'fuego'));

    if (tipo === 'slam') {
      return {
        tipo: 'slam', nombre: spec.nombre, elemento: elementoTg,
        x: m.x, z: m.z,
        radius: esJefe ? spec.bossRadius : spec.radius,
        duration, elapsed: 0, dmgMult
      };
    }
    if (tipo === 'cone' || tipo === 'fire_breath') {
      return {
        tipo, nombre: spec.nombre, elemento: elementoTg,
        x: m.x, z: m.z, dirX: ux, dirZ: uz,
        radius: esNormalConEfectos ? Math.min(spec.radius, 5.2) : (esJefe ? spec.bossRadius : spec.radius),
        halfAngle: spec.halfAngle,
        duration, elapsed: 0, dmgMult
      };
    }
    if (tipo === 'charge') {
      const len = esJefe ? spec.bossLength : spec.length;
      return {
        tipo: 'charge', nombre: spec.nombre, elemento: elementoTg,
        x: m.x, z: m.z, dirX: ux, dirZ: uz,
        length: len, endX: m.x + ux * len, endZ: m.z + uz * len,
        halfWidth: spec.halfWidth,
        duration, elapsed: 0, dmgMult
      };
    }
    const count = esNormalConEfectos
      ? 2
      : (enFase2 ? spec.fase2Count : (esJefe || (m.rangoElite || 1) >= 3 ? spec.orbCount : (spec.eliteCount || 2)));
    const orbR = esNormalConEfectos ? Math.min(spec.orbRadius, 2.3) : spec.orbRadius;
    const zones = [{ x: hx, z: hz, radius: orbR }];
    const baseAng = idx * 1.1;
    for (let i = 1; i < count; i++) {
      const a = baseAng + ((i - 1) * Math.PI * 2) / Math.max(1, count - 1);
      const distZ = count === 2 ? 3.6 : 4.2;
      zones.push({ x: hx + Math.cos(a) * distZ, z: hz + Math.sin(a) * distZ, radius: orbR });
    }
    return {
      tipo, nombre: spec.nombre, elemento: elementoTg,
      x: m.x, z: m.z, zones,
      duration, elapsed: 0, dmgMult
    };
  }

  function inTelegraphArea(tg, hx, hz) {
    if (!tg) return false;
    if (tg.tipo === 'slam') {
      return Math.hypot(hx - tg.x, hz - tg.z) <= tg.radius;
    }
    if (tg.tipo === 'cone' || tg.tipo === 'fire_breath') {
      const dx = hx - tg.x, dz = hz - tg.z;
      const d = Math.hypot(dx, dz);
      if (d > tg.radius) return false;
      if (d < 0.6) return true;
      return (dx * tg.dirX + dz * tg.dirZ) / d >= Math.cos(tg.halfAngle);
    }
    if (tg.tipo === 'charge') {
      const dx = hx - tg.x, dz = hz - tg.z;
      const along = dx * tg.dirX + dz * tg.dirZ;
      const perp = Math.abs(-dx * tg.dirZ + dz * tg.dirX);
      return along >= -0.5 && along <= tg.length + 0.6 && perp <= tg.halfWidth;
    }
    if (tg.tipo === 'nova_orbs' || tg.tipo === 'fire_orbs') {
      return (tg.zones || []).some(z => Math.hypot(hx - z.x, hz - z.z) <= z.radius);
    }
    return false;
  }

  // Un paso de la IA del monstruo. Devuelve { attack, ranged, specialStart, specialRelease, specialCancel, fase2 }.
  function monsterTick(m, hero, hx, hz, dt, dy) {
    const out = { attack: false, ranged: false, specialStart: null, specialRelease: null, specialCancel: false, fase2: false };
    if (m.slowTimer > 0) m.slowTimer = Math.max(0, m.slowTimer - dt);
    const slowFactor = m.slowTimer > 0 ? (m.slowMult || 0.45) : 1;
    const dHero = Math.hypot(hx - m.x, hz - m.z);
    const dSpawn = Math.hypot(m.spawnX - m.x, m.spawnZ - m.z);
    const esJefe = !!m.boss || (m.rangoElite || 1) >= 8;
    const esEspecial = esJefe || (m.rangoElite || 1) >= 2 || !!m.conEfectosEspeciales;

    if (esJefe && (m.fase || 1) < 2 && m.hp > 0 && m.hp <= m.maxHp * 0.5) {
      m.fase = 2;
      m.specialCd = Math.min(m.specialCd !== undefined ? m.specialCd : 1.0, 1.0);
      out.fase2 = true;
    }

    if (m.state !== 'chase' && !hero.dead && dHero < m.aggro) m.state = 'chase';
    if (m.state === 'chase' && (hero.dead || dSpawn > m.leash)) {
      m.state = 'return';
      if (m.telegraph) {
        m.telegraph = null;
        out.specialCancel = true;
      }
    }

    if (m.state === 'chase') {
      if (m.telegraph) {
        m.telegraph.elapsed += dt;
        if (m.telegraph.elapsed >= m.telegraph.duration) {
          out.specialRelease = m.telegraph;
          m.telegraph = null;
          m.specialCd = esJefe ? ((m.fase || 1) >= 2 ? 4.4 : 6.2) : ((m.rangoElite || 1) >= 2 ? 7.2 : 7.8);
          m.attackTimer = Math.max(m.attackTimer || 0, 1.0);
        }
        return out;
      }
      if (esEspecial) {
        const defCd = esJefe ? 2.8 : ((m.rangoElite || 1) >= 2 ? 3.5 : 3.8);
        m.specialCd = Math.max(0, (m.specialCd !== undefined ? m.specialCd : defCd) - dt);
        if (m.specialCd <= 0 && !hero.dead && dHero <= 15.0 && (typeof dy !== 'number' || dy < 5.0)) {
          m.telegraph = crearTelegrafiado(m, hx, hz);
          out.specialStart = m.telegraph;
          return out;
        }
      }
      const attackRange = m.attackRange || (m.esADistancia ? MONSTER.rangedAttackRange : MONSTER.attackRange);
      if (dHero > attackRange) {
        const sp = m.speed * slowFactor * dt / dHero;
        let nx = m.x + (hx - m.x) * Math.min(1, sp);
        let nz = m.z + (hz - m.z) * Math.min(1, sp);
        if (typeof m.puedeIr === 'function' && !m.puedeIr(nx, nz)) {
          if (m.puedeIr(nx, m.z)) nz = m.z;
          else if (m.puedeIr(m.x, nz)) nx = m.x;
          else { nx = m.x; nz = m.z; }
        }
        m.x = nx;
        m.z = nz;
      } else {
        // En rango de ataque: arqueros y magos lanzan a distancia sin tener que acercarse a melee
        const maxDy = m.esADistancia ? 8.0 : 4.0;
        if (typeof dy !== 'number' || dy < maxDy) {
          m.attackTimer -= dt;
          if (m.attackTimer <= 0) {
            m.attackTimer = m.attackCd || MONSTER.attackCd;
            out.attack = true;
            out.ranged = !!m.esADistancia;
          }
        }
      }
    } else if (m.state === 'return') {
      if (dSpawn < 0.5) {
        m.x = m.spawnX; m.z = m.spawnZ; m.state = 'idle';
      } else {
        const sp = MONSTER.returnSpeed * dt / dSpawn;
        let nx = m.x + (m.spawnX - m.x) * Math.min(1, sp);
        let nz = m.z + (m.spawnZ - m.z) * Math.min(1, sp);
        if (typeof m.puedeIr === 'function' && !m.puedeIr(nx, nz)) {
          if (m.puedeIr(nx, m.z)) nz = m.z;
          else if (m.puedeIr(m.x, nz)) nx = m.x;
        }
        m.x = nx;
        m.z = nz;
        m.hp = Math.min(m.maxHp, m.hp + m.maxHp * MONSTER.regenPerSec * dt);
      }
    } else if (m.patrulla) {
      patrullar(m, dt);
    }
    return out;
  }

  // Patrulla opcional (m.patrulla = true): en reposo el monstruo da paseos cortos alrededor de su punto de origen,
  // con pausas entre uno y otro. Mientras camina, m.caminando = true y m.rumbo guarda hacia dónde mira.
  // m.puedeIr(x, z) (opcional) permite descartar destinos que caigan fuera de la estancia.
  function patrullar(m, dt) {
    m.caminando = false;
    if (m.pEspera > 0) { m.pEspera -= dt; return; }
    if (!m.pDest) {
      const radio = m.patrullaRadio || 3;
      for (let i = 0; i < 6 && !m.pDest; i++) {
        const a = Math.random() * Math.PI * 2, r = radio * (0.4 + Math.random() * 0.6);
        const x = m.spawnX + Math.cos(a) * r, z = m.spawnZ + Math.sin(a) * r;
        if (!m.puedeIr || m.puedeIr(x, z)) m.pDest = { x, z };
      }
      if (!m.pDest) { m.pEspera = 2; return; }
    }
    const dx = m.pDest.x - m.x, dz = m.pDest.z - m.z, d = Math.hypot(dx, dz);
    if (d < 0.25) { m.pDest = null; m.pEspera = 1.5 + Math.random() * 3; return; }
    const slowFactor = m.slowTimer > 0 ? (m.slowMult || 0.45) : 1;
    const paso = Math.min(d, (m.speed * 0.3 * slowFactor) * dt);
    m.x += dx / d * paso; m.z += dz / d * paso;
    m.rumbo = Math.atan2(dx, dz);
    m.caminando = true;
  }

  // Daño de un ataque a un monstruo: ¿está dentro del alcance y del cono frontal?
  function inSkillArea(skill, px, pz, facingX, facingZ, mx, mz) {
    const s = SKILLS[skill];
    const dx = mx - px, dz = mz - pz;
    const d = Math.hypot(dx, dz);
    if (d > s.range) return false;
    if (s.arc <= -1) return true;
    if (d < 1e-6) return true;
    const dot = (dx * facingX + dz * facingZ) / d;
    return dot >= s.arc;
  }

  const api = {
    HERO, SKILLS, MONSTER, DODGE, SPECIAL_ATTACKS,
    diffMult, heroMax, newHero, xpToNext, gainXp, factorXpPorNivel, xpPorMonstruo, heroDamage,
    canUse, useSkill, isInvulnerable, canDodge, startDodge, checkEnemyHitAvoided,
    crearTelegrafiado, inTelegraphArea,
    monsterStats, monsterDamage, takeHit, tickHero,
    die, respawn, newMonster, monsterTick, inSkillArea, impactos, detectarRol, detectarElemento
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CombatLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
