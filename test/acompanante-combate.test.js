// Pruebas del sistema de lucha por arquetipo, potenciadores reales e integración en visor-mundo.
// Ejecutar: node --test test/acompanante-combate.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const A = require('../js/acompanante.js');

function crearMeshMock() {
  return {
    position: { set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
    rotation: { y: 0 }
  };
}

test('Rowan: Grito de Aliento, Fervor Bélico, Golpe de Ímpetu y Hendedura Letal ejecutan sus efectos reales', () => {
  const c = A.crearAcompanante({ arquetipo: 'rowan', activo: true, x: 0, z: 0 });
  c.mesh = crearMeshMock();
  c.skillsEquipadas = ['grito', 'fervor', 'partesuelos'];

  const monstruo = {
    name: 'Lobo Salvaje',
    x: 1.5,
    z: 0,
    hp: 400,
    maxHp: 400,
    alive: true,
    muerto: false
  };

  const eventos = [];
  A.actualizarAcompanante(
    c, 0.1, { x: 0, y: 0, z: 2 }, 0, [monstruo], monstruo, () => 0, null,
    (m, dmg, meta) => {
      m.hp = Math.max(0, m.hp - dmg);
      eventos.push({ dmg, meta });
    },
    { hp: 100, maxHp: 100 },
    (tipo, info) => eventos.push({ skill: tipo, info })
  );

  const bonos = A.calcularBonosActivos(c);
  assert.strictEqual(bonos.hero.danioPct, 0.25, 'Grito de Aliento debe dar +25% daño al héroe');
  assert.strictEqual(bonos.companero.danioPct, 0.25, 'Grito de Aliento debe dar +25% daño a Rowan');
  assert.strictEqual(bonos.hero.velocidadPct, 0.30, 'Fervor Bélico debe dar +30% velocidad al héroe');
  assert.strictEqual(bonos.hero.velocidadAtaquePct, 0.30, 'Fervor Bélico debe dar +30% velocidad de ataque al héroe');
  assert.ok(monstruo.defDebuffTimer > 0 && monstruo.defDebuffPct === 0.20, 'Hendedura Letal debe reducir defensa enemiga un 20%');

  const ef = A.estadisticasEfectivasAcompanante(c);
  assert.ok(ef.danoEfectivo > ef.danoBase, 'El ataque efectivo de Rowan debe subir con Grito activo');
  assert.ok(ef.cooldownAtaqueEfectivo < ef.cooldownAtaqueBase, 'El ritmo de ataque debe acelerarse con Fervor');

  // Comprobar Golpe de Ímpetu con empuje
  c.skillsEquipadas = ['impetu'];
  c.tiempoSiguienteAtaque = 99;
  let impInfo = null;
  A.actualizarAcompanante(
    c, 0.1, { x: 0, y: 0, z: 2 }, 0, [monstruo], monstruo, () => 0, null,
    (m, dmg) => { m.hp = Math.max(0, m.hp - dmg); },
    { hp: 100, maxHp: 100 },
    (tipo, info) => { if (tipo === 'ataque_skill') impInfo = info; }
  );
  assert.ok(impInfo && impInfo.id === 'impetu' && impInfo.empuje > 0, 'Golpe de Ímpetu debe reportar empuje e impacto');
});

test('Lyra: no lanza skills heredadas de Rowan, ataca más rápido con dagas, 3 críticos, veneno, sangrado y remate x2.5', () => {
  const c = A.crearAcompanante({ arquetipo: 'lyra', activo: true, x: 0, z: 0 });
  c.mesh = crearMeshMock();
  assert.ok(c.cooldownAtaque < 1.0, 'Lyra debe tener cadencia de ataque rápida (< 1.0s)');

  const monstruo = {
    name: 'Bandido de Hierro',
    x: 1.0,
    z: 0,
    hp: 600,
    maxHp: 600,
    alive: true,
    muerto: false
  };

  const golpes = [];
  const skillsLanzadas = [];
  A.actualizarAcompanante(
    c, 0.1, { x: 0, y: 0, z: 2 }, 0, [monstruo], monstruo, () => 0, null,
    (m, dmg, meta) => {
      m.hp = Math.max(0, m.hp - dmg);
      golpes.push({ dmg, meta });
    },
    { hp: 20, maxHp: 100 }, // Héroe herido: NO debe disparar Rocío Sanador heredado en Lyra
    (tipo, info) => skillsLanzadas.push({ tipo, info })
  );

  assert.strictEqual(c.buffsActivos.some(b => b.id === 'cura' || b.id === 'ataque' || b.id === 'defensa'), false,
    'Lyra no debe disparar las skills heredadas de Rowan');
  const danzaGolpes = golpes.filter(g => g.meta && g.meta.skill === 'danza_dagas');
  assert.strictEqual(danzaGolpes.length, 3, 'Danza de Dagas debe asestar 3 estocadas críticas');
  assert.ok(danzaGolpes.every(g => g.meta.crit === true), 'Las 3 estocadas de Danza de Dagas deben ser críticas');

  const bonos = A.calcularBonosActivos(c);
  assert.strictEqual(bonos.hero.venenoBonus, 18, 'Veneno Letal debe sumar +18 de daño de veneno al héroe');
  assert.strictEqual(bonos.companero.venenoBonus, 18, 'Veneno Letal debe sumar +18 de daño de veneno a Lyra');
  assert.ok(monstruo.sangradoTimer > 0 && monstruo.sangradoDps === 22, 'Corte Hemorrágico debe aplicar sangrado real');

  // Tick de 2.1s: el sangrado debe drenar HP por segundo
  const hpAntesBleed = monstruo.hp;
  c.tiempoSiguienteAtaque = 99;
  A.actualizarAcompanante(
    c, 2.1, { x: 0, y: 0, z: 2 }, 0, [monstruo], monstruo, () => 0, null,
    (m, dmg) => { m.hp = Math.max(0, m.hp - dmg); },
    { hp: 100, maxHp: 100 },
    null
  );
  assert.ok(monstruo.hp <= hpAntesBleed - 44, 'El sangrado debe causar daño por segundo (2 ticks >= 44)');

  // Filo del Verdugo (remate): no dispara si HP > 40%, sí dispara x2.5 cuando HP < 40%
  c.skillsEquipadas = ['remate'];
  const skRemate = c.skillsCatalogo.find(s => s.id === 'remate');
  skRemate.timer = 0;
  monstruo.hp = 500;
  monstruo.maxHp = 600;
  let ejecucionInfo = null;
  A.actualizarAcompanante(
    c, 0.1, { x: 0, y: 0, z: 2 }, 0, [monstruo], monstruo, () => 0, null,
    (m, dmg) => { m.hp = Math.max(0, m.hp - dmg); },
    { hp: 100, maxHp: 100 },
    (tipo, info) => { if (info && info.id === 'remate') ejecucionInfo = info; }
  );
  assert.strictEqual(ejecucionInfo, null, 'Filo del Verdugo no debe gastarse si el objetivo tiene >= 40% HP');

  monstruo.hp = 180; // 30% HP
  A.actualizarAcompanante(
    c, 0.1, { x: 0, y: 0, z: 2 }, 0, [monstruo], monstruo, () => 0, null,
    (m, dmg) => { m.hp = Math.max(0, m.hp - dmg); },
    { hp: 100, maxHp: 100 },
    (tipo, info) => { if (info && info.id === 'remate') ejecucionInfo = info; }
  );
  assert.ok(ejecucionInfo && ejecucionInfo.esEjecucion && ejecucionInfo.dano >= Math.round(65 * 2.5),
    'Filo del Verdugo debe ejecutar con daño x2.5 cuando el enemigo tiene < 40% HP');
});

test('Elian: combate a distancia, Gracia Sanadora, Baluarte de Luz, Manantial Místico y Castigo Sagrado x3 a no-muertos', () => {
  const c = A.crearAcompanante({ arquetipo: 'elian', activo: true, x: 0, z: 0 });
  c.mesh = crearMeshMock();
  assert.ok(c.rangoAtaque >= 9.0, 'Elian debe atacar a distancia (>= 9m)');

  const noMuerto = {
    name: 'Rey Liche',
    archetype: 'enemy_undead_lich_king_low',
    x: 7.5,
    z: 0,
    hp: 500,
    maxHp: 500,
    alive: true,
    muerto: false
  };
  assert.strictEqual(A.esNoMuerto(noMuerto), true, 'Debe reconocer no-muertos en español/inglés');

  c.skillsEquipadas = ['rocio_sanador', 'baluarte_luz', 'purificacion'];
  c.hp = 60;
  let curaRecibidaHeroe = 0;
  let danoPurif = 0;
  A.actualizarAcompanante(
    c, 0.1, { x: -2, y: 0, z: 0 }, 0, [noMuerto], noMuerto, () => 0, null,
    (m, dmg) => { m.hp = Math.max(0, m.hp - dmg); },
    { hp: 40, maxHp: 100 },
    (tipo, info) => {
      if (tipo === 'cura') curaRecibidaHeroe = info.curaHeroe;
      if (tipo === 'ataque_skill' && info.id === 'purificacion') danoPurif = info.dano;
    }
  );

  assert.ok(curaRecibidaHeroe >= 50, 'Gracia Sanadora debe curar al héroe');
  assert.ok(c.hp >= 110, 'Gracia Sanadora debe curar al propio Elian');
  assert.ok(danoPurif >= 132, `Castigo Sagrado a distancia debe triplicar daño contra no-muertos (obtenido: ${danoPurif})`);

  const bonos = A.calcularBonosActivos(c);
  assert.strictEqual(bonos.hero.reduccionPct, 0.35, 'Baluarte de Luz debe dar +35% reducción de daño al héroe');
  assert.strictEqual(bonos.companero.reduccionPct, 0.35, 'Baluarte de Luz debe dar +35% reducción de daño a Elian');

  // Probar mitigación real en recibirDanoAcompanante
  const cSinBuff = A.crearAcompanante({ arquetipo: 'elian', activo: true });
  const dmgSin = A.recibirDanoAcompanante(cSinBuff, 100);
  const dmgCon = A.recibirDanoAcompanante(c, 100);
  assert.ok(dmgCon < dmgSin, `Baluarte de Luz debe reducir el daño real recibido (${dmgCon} < ${dmgSin})`);

  // Probar Manantial Místico
  c.skillsEquipadas = ['manantial'];
  c.hp = 80;
  A.actualizarAcompanante(c, 0.1, { x: -2, y: 0, z: 0 }, 0, [noMuerto], noMuerto, () => 0, null, () => {}, { hp: 80, maxHp: 100, mp: 10, maxMp: 50 }, null);
  const bonosMan = A.calcularBonosActivos(c);
  assert.strictEqual(bonosMan.hero.hpRegenPorSeg, 14, 'Manantial Místico debe regenerar +14 HP/s al héroe');
  assert.strictEqual(bonosMan.hero.mpRegenPorSeg, 14, 'Manantial Místico debe regenerar +14 MP/s al héroe');
});

test('Brenda: acumula furia al recibir daño, provoca múltiples enemigos, roba vida y golpea en área con Torbellino', () => {
  const c = A.crearAcompanante({ arquetipo: 'brenda', activo: true, x: 0, z: 0 });
  c.mesh = crearMeshMock();
  assert.strictEqual(c.furia, 0);

  // Recibir golpe incrementa furia y daño efectivo
  const efAntes = A.estadisticasEfectivasAcompanante(c).danoEfectivo;
  const recibido = A.recibirDanoAcompanante(c, 70);
  assert.ok(recibido > 0);
  assert.ok(c.furia > 0, 'Brenda debe acumular furia al recibir daño');
  const efDespues = A.estadisticasEfectivasAcompanante(c).danoEfectivo;
  assert.ok(efDespues > efAntes, 'La furia y pérdida de HP deben aumentar el ataque efectivo de Brenda');

  const m1 = { name: 'Orco 1', x: 1.5, z: 0, hp: 300, maxHp: 300, alive: true, muerto: false, state: 'idle' };
  const m2 = { name: 'Orco 2', x: -2.0, z: 1.5, hp: 300, maxHp: 300, alive: true, muerto: false, state: 'idle' };
  const mLejos = { name: 'Orco Lejano', x: 20, z: 0, hp: 300, maxHp: 300, alive: true, muerto: false, state: 'idle' };

  c.skillsEquipadas = ['frenesi', 'provocacion', 'torbellino'];
  let afectadosTorbellino = 0;
  A.actualizarAcompanante(
    c, 0.1, { x: 0, y: 0, z: 3 }, 0, [m1, m2, mLejos], m1, () => 0, null,
    (m, dmg) => { m.hp = Math.max(0, m.hp - dmg); },
    { hp: 100, maxHp: 100 },
    (tipo, info) => {
      if (tipo === 'ataque_skill' && info.id === 'torbellino') afectadosTorbellino = info.objetivosAfectados;
    }
  );

  assert.ok(m1.tauntedTimer > 0 && m1.tauntedBy === 'acompanante', 'Grito Provocador debe fijar taunt en m1');
  assert.ok(m2.tauntedTimer > 0 && m2.tauntedBy === 'acompanante', 'Grito Provocador debe fijar taunt en m2');
  assert.strictEqual(m1.state, 'chase', 'Los monstruos provocados deben pasar a persecución');
  assert.ok(!mLejos.tauntedTimer, 'El monstruo lejano fuera de 13m no debe ser provocado');
  assert.strictEqual(afectadosTorbellino, 2, 'Torbellino Feroz debe dañar a los 2 enemigos cercanos simultáneamente');
  assert.ok(m1.hp < 300 && m2.hp < 300, 'Ambos enemigos cercanos debieron recibir daño del Torbellino');

  // Sed de Sangre: robo de vida real para ambos
  c.skillsEquipadas = ['sed_sangre'];
  c.hp = 120;
  c.tiempoSiguienteAtaque = 0;
  A.actualizarAcompanante(
    c, 0.1, { x: 0, y: 0, z: 3 }, 0, [m1], m1, () => 0, null,
    (m, dmg) => { m.hp = Math.max(0, m.hp - dmg); },
    { hp: 100, maxHp: 100 },
    null
  );
  const bonosSed = A.calcularBonosActivos(c);
  assert.strictEqual(bonosSed.hero.roboPct, 0.30, 'Sed de Sangre debe otorgar +30% robo de vida al héroe');
  assert.ok(c.hp > 120, 'Sed de Sangre debe curar a Brenda con el daño infligido');
});

test('Sincronización inconsciente/debilitado, formateo de descripciones y validación de visor-mundo.html', () => {
  const c = A.crearAcompanante({ arquetipo: 'brenda', activo: true });
  A.recibirDanoAcompanante(c, 9999);
  assert.strictEqual(c.inconsciente, true);
  assert.strictEqual(c.debilitado, true);
  assert.strictEqual(c.estado, 'debilitado');

  A.revivirAcompanante(c, 0.60);
  assert.strictEqual(c.inconsciente, false);
  assert.strictEqual(c.debilitado, false);
  assert.strictEqual(c.estado, 'idle');
  assert.strictEqual(c.hp, Math.round(c.maxHp * 0.60));

  // Ninguna descripción formateada debe contener llaves {potencia} o {duracion}
  Object.keys(A.COMPANEROS).forEach(k => {
    A.COMPANEROS[k].skillsCatalogo.forEach(sk => {
      const txt = A.formatearDescripcionSkill(sk);
      assert.ok(!/\{|\}/.test(txt), `Descripción sin formatear en ${k}/${sk.id}: ${txt}`);
    });
  });

  // Verificar que los <script> embebidos de visor-mundo.html compilan sin errores de sintaxis y contienen el HUD
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  assert.ok(html.includes('id="hud-companero"'), 'visor-mundo.html debe incluir #hud-companero');
  assert.ok(html.includes('Estadísticas Potenciadas'), 'visor-mundo.html debe mostrar Estadísticas Potenciadas en #hud-dopes');
  assert.ok(html.includes('AcompananteLib.calcularBonosActivos'), 'visor-mundo.html debe aplicar calcularBonosActivos en stats');

  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length > 0, 'Debe haber scripts embebidos en visor-mundo.html');
  scripts.forEach((m, idx) => {
    const attrs = m[1] || '';
    if (/importmap|json/i.test(attrs)) {
      JSON.parse(m[2]);
      return;
    }
    if (/type\s*=\s*["']module["']/i.test(attrs)) {
      const sinMod = m[2]
        .replace(/^\s*import\s+[\s\S]*?;\s*$/gm, '')
        .replace(/^\s*export\s+(default\s+)?/gm, '');
      new vm.Script(sinMod, { filename: `visor-mundo-module-${idx}.js` });
    } else {
      new vm.Script(m[2], { filename: `visor-mundo-script-${idx}.js` });
    }
  });
});

function crearThreeMockModelo() {
  class Vec3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    setScalar(s) { this.x = s; this.y = s; this.z = s; return this; }
    copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    clampScalar(lo, hi) {
      this.x = Math.max(lo, Math.min(hi, this.x));
      this.y = Math.max(lo, Math.min(hi, this.y));
      this.z = Math.max(lo, Math.min(hi, this.z));
      return this;
    }
  }
  class Obj3D {
    constructor() {
      this.name = '';
      this.children = [];
      this.parent = null;
      this.position = new Vec3(0, 0, 0);
      this.rotation = new Vec3(0, 0, 0);
      this.scale = new Vec3(1, 1, 1);
      this.userData = {};
    }
    add(c) {
      if (c) { c.parent = this; this.children.push(c); }
      return this;
    }
    remove(c) {
      this.children = this.children.filter(x => x !== c);
      if (c && c.parent === this) c.parent = null;
    }
    traverse(fn) {
      fn(this);
      for (const ch of this.children) {
        if (ch && ch.traverse) ch.traverse(fn);
      }
    }
  }
  class Group extends Obj3D {}
  class Mesh extends Obj3D {
    constructor(geom, mat) {
      super();
      this.isMesh = true;
      this.geometry = geom;
      this.material = mat;
    }
  }
  class Box3 {
    constructor() { this.min = new Vec3(0, 0, 0); this.max = new Vec3(0.6, 1.7, 0.5); }
    setFromObject() { return this; }
    getSize(out) { out.set(0.6, 1.7, 0.5); return out; }
  }
  class AnimationMixer {
    constructor(root) { this.root = root; }
    clipAction(clip) {
      return {
        name: clip.name,
        reset() { return this; },
        setLoop() { return this; },
        setEffectiveTimeScale() { return this; },
        fadeIn() { return this; },
        fadeOut() { return this; },
        play() { return this; },
        stop() { return this; }
      };
    }
    update() {}
  }
  return {
    Group,
    Mesh,
    Vector3: Vec3,
    Box3,
    AnimationMixer,
    LoopRepeat: 2201,
    LoopOnce: 2200,
    BoxGeometry: function () { return { rotateX() {} }; },
    CylinderGeometry: function () { return { rotateX() {} }; },
    SphereGeometry: function () { return { rotateX() {} }; },
    ConeGeometry: function () { return { rotateX() {} }; },
    RingGeometry: function () { return { rotateX() {} }; },
    MeshStandardMaterial: function (o) { return Object.assign({}, o); },
    MeshBasicMaterial: function (o) { return Object.assign({}, o); }
  };
}

function recopilarNombres(root) {
  const nombres = [];
  root.traverse(o => { if (o.name) nombres.push(o.name); });
  return nombres;
}

test('Apariencia de clase: cada acompañante usa su armadura asignada y perfil del Estudio de Armaduras', () => {
  assert.strictEqual(A.COMPANEROS.elian.claseArmadura, 'mago', 'Elian debe vestir túnica de mago');
  assert.strictEqual(A.COMPANEROS.brenda.claseArmadura, 'ligera', 'Brenda debe vestir armadura ligera');
  assert.strictEqual(A.COMPANEROS.lyra.claseArmadura, 'ligera', 'Lyra debe vestir armadura ligera');
  assert.strictEqual(A.COMPANEROS.rowan.claseArmadura, 'pesada', 'Rowan debe vestir armadura pesada');

  const pElian = A.perfilEstudioAcompanante('elian');
  const pBrenda = A.perfilEstudioAcompanante('brenda');
  const pLyra = A.perfilEstudioAcompanante('lyra');
  const pRowan = A.perfilEstudioAcompanante('rowan');

  assert.strictEqual(pElian.claseArmadura, 'mago');
  assert.strictEqual(pElian.armorLook, 104);
  assert.strictEqual(pElian.equipo.weapon, 61);
  assert.strictEqual(pBrenda.claseArmadura, 'ligera');
  assert.strictEqual(pBrenda.armorLook, 22);
  assert.strictEqual(pBrenda.equipo.weapon, 22);
  assert.strictEqual(pLyra.claseArmadura, 'ligera');
  assert.strictEqual(pLyra.armorLook, 13);
  assert.strictEqual(pLyra.equipo.weapon, 43);
  assert.strictEqual(pRowan.claseArmadura, 'pesada');
  assert.strictEqual(pRowan.armorLook, 10);
  assert.strictEqual(pRowan.equipo.weapon, 12);
  assert.strictEqual(pRowan.equipo.shield, 1);

  const c = A.crearAcompanante({ arquetipo: 'elian', activo: true });
  assert.strictEqual(c.claseArmadura, 'mago');
  A.cambiarArquetipo(c, 'brenda');
  assert.strictEqual(c.claseArmadura, 'ligera');

  // Modelos 3D diferenciados por clase cuando carga antes o como respaldo del estudio
  const T = crearThreeMockModelo();
  const mElian = A.construirModeloAcompanante(T, 'elian');
  const mLyra = A.construirModeloAcompanante(T, 'lyra');
  const mBrenda = A.construirModeloAcompanante(T, 'brenda');
  const mRowan = A.construirModeloAcompanante(T, 'rowan');

  assert.strictEqual(mElian.root.userData.claseArmadura, 'mago');
  assert.strictEqual(mLyra.root.userData.claseArmadura, 'ligera');
  assert.strictEqual(mBrenda.root.userData.claseArmadura, 'ligera');
  assert.strictEqual(mRowan.root.userData.claseArmadura, 'pesada');

  const nomElian = recopilarNombres(mElian.root);
  const nomLyra = recopilarNombres(mLyra.root);
  const nomBrenda = recopilarNombres(mBrenda.root);
  const nomRowan = recopilarNombres(mRowan.root);

  assert.ok(nomElian.includes('faldonTunica') && nomElian.includes('mantoMago'), 'Elian 3D debe tener faldón y manto de túnica de mago');
  assert.ok(nomLyra.includes('bandoleraA') && nomLyra.includes('capuchaLigera') && nomLyra.includes('dagaIzq'), 'Lyra 3D debe tener cuero ligero, capucha y doble daga');
  assert.ok(nomBrenda.includes('bandoleraA') && nomBrenda.includes('cuelloPiel'), 'Brenda 3D debe tener cuero ligero y piel berserker');
  assert.ok(nomRowan.includes('corazaPesada') && nomRowan.includes('hombreraIzq') && nomRowan.includes('escudoGrupo'), 'Rowan 3D debe tener coraza pesada, hombreras y escudo');

  // instalarModeloGLBAcompanante con esModeloClaseEstudio: true conserva gltf.scene y sus materiales originales
  const matOriginal = { id: 'mat-estudio-mago', color: { setHex() { throw new Error('No debe sobrescribir materiales del estudio'); } } };
  const meshEstudio = new T.Mesh({}, matOriginal);
  meshEstudio.name = 'torso_mago';
  const sceneEstudio = new T.Group();
  sceneEstudio.clone = () => { throw new Error('No debe clonar scene del estudio (rompería SkinnedMesh)'); };
  sceneEstudio.add(meshEstudio);

  const compEst = A.crearAcompanante({ arquetipo: 'elian', activo: true, x: 3, z: -2 });
  const contenedor = A.instalarModeloGLBAcompanante(compEst, {
    scene: sceneEstudio,
    animations: [{ name: 'idle' }, { name: 'walk' }, { name: 'run' }, { name: 'attack' }]
  }, T, { esModeloClaseEstudio: true });

  assert.strictEqual(contenedor, compEst.mesh);
  assert.strictEqual(compEst._esModeloClaseEstudio, true);
  assert.strictEqual(meshEstudio.material, matOriginal);
  assert.strictEqual(compEst.mesh.children[0], sceneEstudio);

  // visor-mundo.html integra el modelo de clase del Estudio y no carga aldeano.glb en asegurarAcompananteActivo
  const html = fs.readFileSync(path.join(__dirname, '..', 'visor-mundo.html'), 'utf8');
  assert.ok(html.includes('cargarModeloEstudioAcompanante'), 'visor-mundo.html debe usar cargarModeloEstudioAcompanante');
  assert.ok(html.includes('esModeloClaseEstudio: true'), 'visor-mundo.html debe instalar el GLB con esModeloClaseEstudio: true');
  assert.ok(html.includes('🧙 Túnica de Mago') && html.includes('🥋 Armadura Ligera') && html.includes('🛡️ Armadura Pesada'),
    'visor-mundo.html debe mostrar la clase de armadura en las tarjetas del prólogo');
  const mAseg = html.match(/function asegurarAcompananteActivo\([\s\S]*?\n  \}/);
  assert.ok(mAseg && !mAseg[0].includes('aldeano.glb'), 'asegurarAcompananteActivo no debe cargar aldeano.glb para el acompañante');
});
