// Pruebas de objetos del personaje, estado y drops. Ejecutar: node test/equipo.test.js
const assert = require('assert');
const E = require('../js/equipo.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

// Catálogo de prueba con la forma de piezas/catalogo.json (armaduras-glb)
const CATALOGO = {
  maxNivel: 10,
  inicial: { underlayer: 2 },
  ranuras: {
    underlayer: [{ idx: 1, nombre: 'Gambesón', nivel: 2, archivo: null }, { idx: 2, nombre: 'Cota de malla', nivel: 1, archivo: null }],
    torso: [{ idx: 1, nombre: 'Cota de escamas', nivel: 3, archivo: 'piezas/torso/1.glb' }, { idx: 2, nombre: 'Peto', nivel: 6, archivo: 'piezas/torso/2.glb' }],
    helmet: [{ idx: 1, nombre: 'Corona', nivel: 4, archivo: 'piezas/helmet/1.glb' }],
    weapon: [{ idx: 1, nombre: 'Espada básica', nivel: 1, archivo: 'piezas/weapon/1.glb' }, { idx: 2, nombre: 'Maza', nivel: 1, archivo: 'piezas/weapon/2.glb' }, { idx: 3, nombre: 'Hacha', nivel: 4, archivo: 'piezas/weapon/3.glb' }, { idx: 4, nombre: 'Espada solar', nivel: 8, archivo: 'piezas/weapon/4.glb' }]
  },
  clases: { guerrero: ['underlayer', 'torso', 'helmet', 'weapon'], mago: [] }
};
// Valores de rnd en orden: 1.º = ¿cae algo? (<0,05), 2.º = qué pieza, 3.º = estado
const sec = (...v) => { let i = 0; return () => v[i++ % v.length]; };
const SUERTE = [0.0, 0.0, 0.5];

t('personaje nuevo: cota inicial y arma básica (la de menor ataque de nivel 1)', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero', 'Ana');
  assert.strictEqual(p.nombre, 'Ana');
  const cota = E.objeto(p, p.equipo.underlayer);
  assert.strictEqual(cota.nombre, 'Cota de malla');
  const arma = E.objeto(p, p.equipo.weapon);
  assert.strictEqual(arma.nombre, 'Espada básica');
  assert.ok(arma.ataque > 0);
  const idx = E.equipoPorIdx(p);
  assert.strictEqual(idx.underlayer, 2);
  assert.strictEqual(idx.weapon, 1);
  assert.strictEqual(idx.torso, 0);
});

t('hasta nivel 5 solo caen cotas, nunca armas', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  for (let i = 0; i < 200; i++) {
    const r = Math.random();
    const o = E.soltarPieza(p, CATALOGO, 3, false, sec(0.0, r, 0.5));
    if (o) {
      assert.ok(E.esCota({ nombre: o.nombre }), o.nombre);
      assert.notStrictEqual(o.ranura, 'weapon');
    }
  }
});

t('el mismo nombre sale con distinto estado (de malo a perfecto)', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  const malo = E.soltarPieza(p, CATALOGO, 1, false, sec(0.0, 0.0, 0.0));
  const perfecto = E.soltarPieza(p, CATALOGO, 1, false, sec(0.0, 0.0, 1.0));
  assert.strictEqual(malo.nombre, perfecto.nombre);
  assert.notStrictEqual(malo.uid, perfecto.uid);
  assert.ok(malo.defensa < perfecto.defensa);
});

t('nivel bajo: las armas que caen son las de menor ataque', () => {
  const lista = E.armasDeDrop(CATALOGO, 'guerrero', 1);
  // Las dos de nivel 1 tienen el mismo ataque: caen las dos (no se corta un empate por el orden del catálogo)
  assert.deepStrictEqual(lista.map(a => a.nombre), ['Espada básica', 'Maza']);
  assert.ok(lista.every(a => a.nivel <= 1));
  assert.ok(!E.armasDeDrop(CATALOGO, 'guerrero', 4).some(a => a.nivel > 4));
});

t('a partir de nivel 6 también caen armaduras de su nivel', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  const nombres = new Set();
  for (let i = 0; i < 50; i++) {
    const o = E.soltarPieza(p, CATALOGO, 6, false, sec(0.0, i / 50, 0.5));
    if (o) nombres.add(o.nombre);
  }
  assert.ok([...nombres].some(x => !/Espada|Maza|Hacha/.test(x)));
});

t('monstruo normal sin suerte no suelta nada; el jefe siempre suelta', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  assert.strictEqual(E.soltarPieza(p, CATALOGO, 3, false, () => 0.99), null);
  assert.ok(E.soltarPieza(p, CATALOGO, 3, true, () => 0.99));
});

t('equipar: hace falta tener el objeto y el nivel', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  E.fabricar(p, CATALOGO, 'weapon.3', 4, 1000);
  const hacha = p.inventario[p.inventario.length - 1];
  assert.throws(() => E.equipar(p, 'no-existe', 10), /No tienes ese objeto/);
  assert.throws(() => E.fabricar(p, CATALOGO, 'weapon.4', 4, 1000), /requiere nivel 8/);
  E.equipar(p, hacha.uid, 4);
  assert.strictEqual(E.equipoPorIdx(p).weapon, 3);
});

t('herrero: fabrica con estado perfecto, cuesta oro y exige nivel', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  assert.throws(() => E.fabricar(p, CATALOGO, 'helmet.1', 3, 1000), /requiere nivel 4/);
  assert.throws(() => E.fabricar(p, CATALOGO, 'helmet.1', 10, 10), /Faltan/);
  const coste = E.fabricar(p, CATALOGO, 'helmet.1', 10, 1000);
  assert.strictEqual(coste, E.FORJA_ORO * 4);
  const casco = p.inventario[p.inventario.length - 1];
  assert.strictEqual(casco.estado, 1);
});

t('inventario: tope de huecos; sin hueco no cae nada', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  while (!E.llena(p)) E.fabricar(p, CATALOGO, 'helmet.1', 10, 1e9);
  assert.strictEqual(E.huecosLibres(p), 0);
  assert.strictEqual(E.soltarPieza(p, CATALOGO, 1, true, () => 0.0), null);
  assert.throws(() => E.fabricar(p, CATALOGO, 'helmet.1', 10, 1e9), /Inventario lleno/);
});

t('vender: da oro según nivel y estado, no vende lo equipado', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  // Con jefe no se tira el dado de «¿cae algo?»: 1.º = pieza, 2.º = estado
  const malo = E.soltarPieza(p, CATALOGO, 1, true, sec(0.0, 0.0));
  const perfecto = E.soltarPieza(p, CATALOGO, 1, true, sec(0.0, 0.99));
  assert.ok(malo.estado < perfecto.estado);
  assert.ok(E.precioVenta(p, perfecto) > E.precioVenta(p, malo));
  const antes = p.inventario.length;
  const oro = E.vender(p, malo.uid);
  assert.strictEqual(oro, E.precioVenta(p, malo));
  assert.strictEqual(p.inventario.length, antes - 1);
  assert.throws(() => E.vender(p, p.equipo.underlayer), /Desequipa/);
});

t('mercader: vende a nivel del héroe con calidad estándar y cobra', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  const venta = E.piezasDeTienda(CATALOGO, 'guerrero', 4).map(x => x.id);
  assert.ok(venta.includes('helmet.1') && venta.includes('weapon.3'));
  assert.ok(!venta.includes('weapon.4'));
  assert.throws(() => E.comprar(p, CATALOGO, 'helmet.1', 4, 10), /Faltan/);
  assert.throws(() => E.comprar(p, CATALOGO, 'weapon.4', 4, 1e9), /requiere nivel 8/);
  const coste = E.comprar(p, CATALOGO, 'weapon.3', 4, 1e9);
  assert.strictEqual(coste, E.COMPRA_ORO * 4);
  assert.strictEqual(p.inventario[p.inventario.length - 1].estado, 0.75);
});

t('los drops son del nivel del monstruo: un nivel 3 no suelta piezas de nivel 6 ni más', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  for (let i = 0; i < 100; i++) {
    const o = E.soltarPieza(p, CATALOGO, 3, true, sec(0.0, i / 100, 0.5));
    if (o) assert.ok(o.nivel <= 3 && o.nivel >= 1, o.nombre + ' nivel ' + o.nivel);
  }
});

t('candidatas de drop: las que se muestran al seleccionar un monstruo son las que caen', () => {
  const bajo = E.candidatasDrop(CATALOGO, 'guerrero', 3).map(p => p.nombre);
  assert.ok(bajo.length > 0 && bajo.every(x => /Cota/.test(x)), bajo.join(','));
  const medio = E.candidatasDrop(CATALOGO, 'guerrero', 8).map(p => p.nombre);
  assert.ok(medio.includes('Peto'), medio.join(','));
  assert.ok(medio.includes('Espada solar'), medio.join(','));
});

t('hojas: solo desde nivel 8 y de piezas superiores; se forjan con arena', () => {
  const p = E.crearPersonaje(CATALOGO, 'guerrero');
  assert.strictEqual(E.soltarHoja(p, CATALOGO, 3, true, () => 0.0), null);
  // Con el catálogo de prueba no hay piezas de nivel 10: sin hoja
  assert.strictEqual(E.soltarHoja(p, CATALOGO, 8, true, () => 0.0), null);
  assert.strictEqual(E.soltarArena(3, false, () => 0.99), 0);
  assert.ok(E.soltarArena(5, true, () => 0.99) >= 1);
});

t('forjar con hoja: consume la hoja, cuesta arena y da la pieza en estado perfecto', () => {
  const cat = JSON.parse(JSON.stringify(CATALOGO));
  cat.ranuras.torso.push({ idx: 3, nombre: 'Armadura superior', nivel: 10, archivo: 'piezas/torso/3.glb' });
  const p = E.crearPersonaje(cat, 'guerrero');
  const hoja = { uid: 'hoja1', tipo: 'hoja', piezaId: 'torso.3', ranura: 'torso', idx: 3, nombre: 'Hoja de Armadura superior', nivel: 10 };
  p.inventario.push(hoja);
  assert.throws(() => E.equipar(p, 'hoja1', 10), /se forja/);
  assert.throws(() => E.forjarConHoja(p, cat, 'hoja1', 10, 5), /Faltan/);
  const coste = E.forjarConHoja(p, cat, 'hoja1', 10, 1000);
  assert.strictEqual(coste, E.ARENA_FORJA * 10);
  assert.ok(!p.inventario.some(o => o.uid === 'hoja1'));
  assert.ok(p.inventario.some(o => o.piezaId === 'torso.3' && o.estado === 1));
});

t('profesiones real (catalogo.json): perfilesClase, armas iniciales, compatibilidad y futuras armaduras por tipoArmadura', () => {
  const fs = require('fs');
  const path = require('path');
  const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'estudio-armaduras', 'catalogo.json'), 'utf8'));
  assert.ok(cat.perfilesClase, 'catalogo.json debe definir perfilesClase');

  const g = E.crearPersonaje(cat, 'guerrero', 'Kael');
  const c = E.crearPersonaje(cat, 'cazador', 'Lyra');
  const m = E.crearPersonaje(cat, 'mago', 'Aldric');
  const p = E.crearPersonaje(cat, 'picaro', 'Vex');

  assert.strictEqual(E.objeto(g, g.equipo.weapon).idx, 1, 'Guerrero nace con Espada Solar');
  assert.strictEqual(E.objeto(c, c.equipo.weapon).idx, 71, 'Cazador nace con Arco Largo Élfico');
  assert.strictEqual(E.objeto(m, m.equipo.weapon).idx, 61, 'Mago nace con Báculo Solar');
  assert.strictEqual(E.objeto(p, p.equipo.weapon).idx, 41, 'Pícaro nace con Daga Élfica');

  assert.strictEqual(E.tipoArmaduraDeClase(cat, 'guerrero'), 'pesada');
  assert.strictEqual(E.tipoArmaduraDeClase(cat, 'cazador'), 'ligera');
  assert.strictEqual(E.tipoArmaduraDeClase(cat, 'mago'), 'mago');
  assert.strictEqual(E.tipoArmaduraDeClase(cat, 'picaro'), 'ligera');

  // Restricción de clase al equipar con catálogo
  const arcoAjeno = E.instancia({ id: 'weapon.71', ranura: 'weapon', idx: 71, nombre: 'Arco Largo Élfico', nivel: 1 }, 1);
  g.inventario.push(arcoAjeno);
  assert.throws(() => E.equipar(g, arcoAjeno.uid, 10, cat), /compatible/i);

  const petoPesado = E.instancia({ id: 'torso.1', ranura: 'torso', idx: 1, nombre: 'Peto pesado', nivel: 1 }, 1);
  m.inventario.push(petoPesado);
  assert.throws(() => E.equipar(m, petoPesado.uid, 10, cat), /compatible/i);

  // Con las nuevas túnicas de Armaduras-glb, Mago SÍ tiene armaduras dedicadas por grado (D..SR)
  const tieneTipoMago = p => Array.isArray(p.tipoArmadura) ? p.tipoArmadura.includes('mago') : p.tipoArmadura === 'mago';
  const torsosMago = cat.ranuras.torso.filter(tieneTipoMago);
  assert.ok(torsosMago.length >= 6, 'El catálogo incluye túnicas dedicadas para Mago');
  const magoTodas = E.piezasDeClase(cat, 'mago');
  for (const gChk of ['D', 'C', 'B', 'A', 'S', 'SR']) {
    assert.ok(magoTodas.some(p => E.gradoDePieza(p) === gChk && p.ranura !== 'weapon'), `Mago debe tener armadura dedicada en grado ${gChk}`);
  }
  const forjaMagoDirecto = E.forjarPiezaBasica(m, cat, 'torso', () => 0);
  assert.ok(forjaMagoDirecto && forjaMagoDirecto.ranura === 'torso' && tieneTipoMago(forjaMagoDirecto), 'Forja básica de Mago en torso produce túnica dedicada');

  // Fallback si un catálogo aislado no tuviera torso/guantes/hombreras/escarcelas/musleras/rodilleras para Mago
  const catSinMago = JSON.parse(JSON.stringify(cat));
  ['torso', 'gloves', 'shoulders', 'tassets', 'cuisses', 'knees'].forEach(r => {
    if (catSinMago.ranuras[r]) catSinMago.ranuras[r] = catSinMago.ranuras[r].filter(p => !tieneTipoMago(p));
  });
  const forjaMagoFallback = E.forjarPiezaBasica(m, catSinMago, 'torso', () => 0);
  assert.ok(forjaMagoFallback && !['torso', 'gloves', 'shoulders', 'tassets', 'cuisses', 'knees'].includes(forjaMagoFallback.ranura));

  // Grados D..SR y escalado de estadísticas + clase de arma + escudos
  assert.deepStrictEqual(Object.keys(E.GRADOS), ['D', 'C', 'B', 'A', 'S', 'SR']);
  const espadaInst = E.piezasDeClase(cat, 'guerrero').find(w => w.ranura === 'weapon' && w.claseArma === 'espadas');
  assert.ok(espadaInst && E.claseArmaDePieza(espadaInst, cat) === 'espadas');
  const torsoD = E.instancia({ id: 'torso.t1', ranura: 'torso', idx: 1, nombre: 'Pet D', nivel: 10, grado: 'D', tipoArmadura: 'pesada' }, 1);
  const torsoSR = E.instancia({ id: 'torso.t2', ranura: 'torso', idx: 2, nombre: 'Pet SR', nivel: 10, grado: 'SR', tipoArmadura: 'pesada' }, 1);
  assert.ok(torsoSR.defensa > torsoD.defensa, 'Grado SR debe dar más defensa que D a igual nivel');
  assert.ok(Array.isArray(cat.ranuras.shield) && cat.ranuras.shield.length >= 1, 'Escudos disponibles en el catálogo');

  // Al añadir futuras armaduras etiquetadas con tipoArmadura, aparecen automáticamente solo para su clase y se priorizan
  const catFut = JSON.parse(JSON.stringify(cat));
  catFut.perfilesClase.mago.ranurasFuturas = ['shoulders'];
  catFut.ranuras.gloves = [{ idx: 97, nombre: 'Guante Genérico de Prueba', nivel: 1, archivo: 'piezas/gloves/97.glb' }];
  catFut.ranuras.gloves.push({ idx: 98, nombre: 'Guante Arcano Dedicado', nivel: 1, archivo: 'piezas/gloves/98.glb', tipoArmadura: 'mago' });
  catFut.ranuras.shoulders.push({ idx: 99, nombre: 'Manto Astral Futuro', nivel: 1, archivo: 'piezas/shoulders/99.glb', tipoArmadura: 'mago' });

  const piezasMagoFut = E.piezasDeClase(catFut, 'mago');
  assert.ok(piezasMagoFut.some(x => x.id === 'shoulders.99'), 'Una ranura futura etiquetada debe integrarse en Mago sin tocar código');
  const glovesMago = piezasMagoFut.filter(x => x.ranura === 'gloves');
  assert.strictEqual(glovesMago.length, 1, 'Si hay piezas dedicadas por tipoArmadura, se priorizan sobre las genéricas');
  assert.strictEqual(glovesMago[0].idx, 98);
  assert.ok(!E.piezasDeClase(catFut, 'guerrero').some(x => x.id === 'gloves.98'), 'Una pieza de Mago no debe aparecer en Guerrero');

  // Cambio de clase con asegurarArmaDeClase
  g.inventario.push(petoPesado);
  E.equipar(g, petoPesado.uid, 10, cat);
  assert.ok(g.equipo.torso, 'Guerrero llevaba peto equipado');
  const nuevaArma = E.asegurarArmaDeClase(g, cat, 'mago', 12);
  assert.strictEqual(g.clase, 'mago');
  assert.strictEqual(g.equipo.torso, undefined, 'Al pasar a Mago se desequipan placas incompatibles');
  assert.ok(nuevaArma && cat.ranuras.weapon.find(w => w.idx === nuevaArma.idx).familia === 'baculo');
});

t('sistema de 5 piezas (helmet, torso, gloves, pants, boots) + expansión pants en equipoPorIdx', () => {
  const fs = require('fs');
  const path = require('path');
  const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'estudio-armaduras', 'catalogo.json'), 'utf8'));
  for (const cls of ['guerrero', 'cazador', 'mago', 'picaro']) {
    const r = cat.perfilesClase[cls].ranuras;
    assert.deepStrictEqual(r.slice(0, 5), ['helmet', 'torso', 'gloves', 'pants', 'boots'], cls + ' usa las 5 piezas de armadura');
    const piezas = E.piezasDeClase(cat, cls);
    for (const slot of ['helmet', 'torso', 'gloves', 'pants', 'boots']) {
      assert.ok(piezas.some(p => p.ranura === slot), cls + ' tiene piezas en ' + slot);
    }
  }
  const g = E.crearPersonaje(cat, 'guerrero', 'Tanque');
  assert.ok(g.equipo.torso && g.equipo.weapon && g.equipo.shield, 'Guerrero nace con peto, espada y escudo');
  const pantsPz = E.piezasDeClase(cat, 'guerrero').find(p => p.ranura === 'pants' && p.nivel <= 2);
  const pantsObj = E.instancia(pantsPz, 1);
  g.inventario.push(pantsObj);
  E.equipar(g, pantsObj.uid, 10, cat);
  const idx = E.equipoPorIdx(g, cat);
  assert.strictEqual(idx.pants, pantsObj.idx);
  assert.strictEqual(idx.belt, pantsPz.subpiezas.belt);
  assert.strictEqual(idx.tassets, pantsPz.subpiezas.tassets);
  assert.strictEqual(idx.cuisses, pantsPz.subpiezas.cuisses);
  assert.strictEqual(idx.knees, pantsPz.subpiezas.knees);
  assert.strictEqual(idx.shoulders, 0, 'Hombreras integradas en el peto');

  // Historia Cap 1 ('belt') y Cap 6 ('shoulders') traducen al sistema de 5 piezas
  const forjaPants = E.forjarPiezaBasica(g, cat, 'belt', () => 0);
  assert.strictEqual(forjaPants.ranura, 'pants');
  const forjaTorso = E.forjarPiezaBasica(g, cat, 'shoulders', () => 0);
  assert.strictEqual(forjaTorso.ranura, 'torso');
});

t('regla del escudo: solo 1M para guerreros tanques y quien usa hacha de una mano', () => {
  const fs = require('fs');
  const path = require('path');
  const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'estudio-armaduras', 'catalogo.json'), 'utf8'));

  const g = E.crearPersonaje(cat, 'guerrero', 'Roland');
  // Guerrero tanque (sin subclase y Paladín) permite escudo con espada 1M y maza 1M
  assert.strictEqual(E.puedeUsarEscudo(g, cat, null).ok, true);
  assert.strictEqual(E.puedeUsarEscudo(g, cat, 'paladin').ok, true);

  // Al pasar a Berserker con espada 1M NO es tanque -> escudo bloqueado (solo hacha 1M)
  assert.strictEqual(E.puedeUsarEscudo(g, cat, 'berserker').ok, false);

  // Equipa hacha de 1 mano -> Berserker SÍ puede usar escudo
  const hacha1M = cat.ranuras.weapon.find(w => w.claseArma === 'hachas' && w.manos === 1);
  const hachaObj = E.instancia(Object.assign({ ranura: 'weapon', id: 'weapon.' + hacha1M.idx }, hacha1M), 1);
  g.inventario.push(hachaObj);
  E.equipar(g, hachaObj.uid, 30, cat, { subclase: 'berserker' });
  assert.strictEqual(E.puedeUsarEscudo(g, cat, 'berserker').ok, true, 'Hacha 1M permite escudo incluso en Berserker');
  const sh2 = E.instancia(Object.assign({ ranura: 'shield', id: 'shield.2' }, cat.ranuras.shield[1]), 1);
  g.inventario.push(sh2);
  E.equipar(g, sh2.uid, 30, cat, { subclase: 'berserker' });
  assert.strictEqual(g.equipo.shield, sh2.uid);

  // Al cambiar a arma 2M (mandoble / hacha 2M), el escudo se desequipa automáticamente y no se puede equipar
  const mandoble = cat.ranuras.weapon.find(w => w.claseArma === 'mandobles' && w.manos === 2);
  const mandObj = E.instancia(Object.assign({ ranura: 'weapon', id: 'weapon.' + mandoble.idx }, mandoble), 1);
  g.inventario.push(mandObj);
  const opts = { subclase: 'paladin' };
  E.equipar(g, mandObj.uid, 30, cat, opts);
  assert.strictEqual(g.equipo.shield, undefined, 'Mandoble 2M desequipa automáticamente el escudo');
  assert.ok(opts.escudoDesequipado && opts.escudoDesequipado.includes('una mano'));
  assert.throws(() => E.equipar(g, sh2.uid, 30, cat, { subclase: 'paladin' }), /una mano/);

  // Otras clases (Cazador, Mago, Pícaro) nunca equipan escudo
  for (const cls of ['cazador', 'mago', 'picaro']) {
    const pj = E.crearPersonaje(cat, cls, cls);
    assert.strictEqual(pj.equipo.shield, undefined, cls + ' no nace con escudo');
    const chk = E.puedeUsarEscudo(pj, cat);
    assert.strictEqual(chk.ok, false);
    assert.ok(/guerreros tanques o hacha de una mano/i.test(chk.motivo), cls + ' explica restricción de escudo');
    const sh = E.instancia(Object.assign({ ranura: 'shield', id: 'shield.1' }, cat.ranuras.shield[0]), 1);
    pj.inventario.push(sh);
    assert.throws(() => E.equipar(pj, sh.uid, 30, cat), /compatible/i);
  }
});

console.log(`\n${n} pruebas de equipo superadas.`);
