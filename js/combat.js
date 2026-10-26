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

  // arc: coseno del semiángulo del cono frontal (-1 = alrededor del personaje)
  const SKILLS = {
    attack: { cd: 0.7, lock: 0.5, range: 3.0, arc: 0.5, mult: 1.0, mp: 0 },  // Espacio: Combo de Ataque
    spin:   { cd: 4.0, lock: 0.7, range: 3.5, arc: -1,  mult: 1.6, mp: 15 }, // Q: Patada Giratoria
    nova:   { cd: 12,  lock: 1.0, range: 7.0, arc: -1,  mult: 2.5, mp: 30 }  // E: Explosión Nova
  };

  const MONSTER = {
    hpBase: 20, hpPerLevel: 8,
    dmgBase: 3, dmgPerLevel: 1.5,
    xpPerLevel: 10,
    bossMult: { hp: 5, dmg: 1.6, xp: 5 },
    aggro: 14, bossAggro: 16,
    attackRange: 2.2, attackCd: 1.5,
    chaseSpeed: 3.5, bossChaseSpeed: 2.5,
    returnSpeed: 5,
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
      cd: { attack: 0, spin: 0, nova: 0 }, lock: 0
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

  function heroDamage(hero, skill, targetLevel) {
    const s = SKILLS[skill];
    return (HERO.baseDamage + HERO.damagePerLevel * hero.level) * s.mult * diffMult(hero.level, targetLevel);
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

  function monsterStats(level, boss) {
    const b = boss ? MONSTER.bossMult : { hp: 1, dmg: 1, xp: 1 };
    return {
      maxHp: (MONSTER.hpBase + MONSTER.hpPerLevel * level) * b.hp,
      dmg: (MONSTER.dmgBase + MONSTER.dmgPerLevel * level) * b.dmg,
      xp: MONSTER.xpPerLevel * level * b.xp
    };
  }

  // Daño que un monstruo hace al héroe
  function monsterDamage(monsterLevel, boss, heroLevel) {
    return monsterStats(monsterLevel, boss).dmg * diffMult(monsterLevel, heroLevel);
  }

  function takeHit(hero, dmg) {
    if (hero.dead) return false;
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
    hero.mp = Math.min(hero.maxMp, hero.mp + HERO.mpRegen * dt);
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
  }

  // Un monstruo vivo: posición de origen, estado y temporizador de ataque
  function newMonster(opts) {
    const st = monsterStats(opts.level, opts.boss);
    return {
      level: opts.level, boss: !!opts.boss,
      maxHp: st.maxHp, hp: st.maxHp, xp: st.xp, dmg: st.dmg,
      spawnX: opts.x, spawnZ: opts.z, x: opts.x, z: opts.z,
      leash: opts.leash || 40,
      state: 'idle', attackTimer: 0,
      aggro: opts.boss ? MONSTER.bossAggro : MONSTER.aggro,
      speed: opts.boss ? MONSTER.bossChaseSpeed : MONSTER.chaseSpeed
    };
  }

  // Un paso de la IA del monstruo. Devuelve { attack: bool } para indicar si golpea este frame.
  function monsterTick(m, hero, hx, hz, dt) {
    const out = { attack: false };
    const dHero = Math.hypot(hx - m.x, hz - m.z);
    const dSpawn = Math.hypot(m.spawnX - m.x, m.spawnZ - m.z);

    if (m.state !== 'chase' && !hero.dead && dHero < m.aggro) m.state = 'chase';
    if (m.state === 'chase' && (hero.dead || dSpawn > m.leash)) m.state = 'return';

    if (m.state === 'chase') {
      if (dHero > MONSTER.attackRange) {
        const sp = m.speed * dt / dHero;
        m.x += (hx - m.x) * Math.min(1, sp);
        m.z += (hz - m.z) * Math.min(1, sp);
      } else {
        m.attackTimer -= dt;
        if (m.attackTimer <= 0) { m.attackTimer = MONSTER.attackCd; out.attack = true; }
      }
    } else if (m.state === 'return') {
      if (dSpawn < 0.5) {
        m.x = m.spawnX; m.z = m.spawnZ; m.state = 'idle';
      } else {
        const sp = MONSTER.returnSpeed * dt / dSpawn;
        m.x += (m.spawnX - m.x) * Math.min(1, sp);
        m.z += (m.spawnZ - m.z) * Math.min(1, sp);
        m.hp = Math.min(m.maxHp, m.hp + m.maxHp * MONSTER.regenPerSec * dt);
      }
    }
    return out;
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
    HERO, SKILLS, MONSTER,
    diffMult, heroMax, newHero, xpToNext, gainXp, heroDamage,
    canUse, useSkill, monsterStats, monsterDamage, takeHit, tickHero,
    die, respawn, newMonster, monsterTick, inSkillArea
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CombatLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
