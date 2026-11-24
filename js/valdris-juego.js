/*
 * valdris-juego.js — Sistemas de juego completo para "Valdris · Tierras del Sol Quebrado".
 *
 * Incluye:
 *  - Maestría de Caza por Zona (cuota de caza, Campeón Alfa nombrado, descubrimiento de POI)
 *  - Rachas de Caza con multiplicadores temporales de XP y oro
 *  - Bestiario de Valdris con bonos de conocimiento (+5 % / +10 % daño)
 *  - Red de Viaje Rápido (Piedras de Viaje en pueblos, santuarios y portales descubiertos)
 *  - Descanso de campaña en campamentos y santuarios de ruta
 *  - Progreso global de Valdris (0–100 %)
 *
 * Sin DOM ni Three.js. Expone window.ValdrisJuegoLib y module.exports.
 */
(function (root) {
  "use strict";

  const CAMPAIGN_ID = 'valdris-sol-quebrado-v1';
  const VENTANA_RACHA_MS = 90000;

  function esValdris(world) {
    return !!(world && world.campaignId === CAMPAIGN_ID);
  }

  function limpiarNombreEspecie(nombre) {
    return String(nombre || 'Criatura')
      .replace(/^(?:👑|🔥|⭐|☠️|☠)\s*/gu, '')
      .replace(/^\[Élite[^\]]*\]\s*/i, '')
      .replace(/^Alfa de\s+/i, '')
      .trim();
  }

  function claveEspecie(nombre) {
    return limpiarNombreEspecie(nombre)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'criatura';
  }

  function asegurarEstadoCaza(heroeEst, zonaId) {
    if (!heroeEst || typeof heroeEst !== 'object' || !zonaId) return null;
    heroeEst.cazaValdris = heroeEst.cazaValdris || {};
    if (!heroeEst.cazaValdris[zonaId] || typeof heroeEst.cazaValdris[zonaId] !== 'object') {
      heroeEst.cazaValdris[zonaId] = {
        kills: 0,
        campeonAbatido: false,
        poiDescubierto: false,
        dominada: false,
        reclamos: {}
      };
    }
    const st = heroeEst.cazaValdris[zonaId];
    st.kills = Math.max(0, Math.floor(Number(st.kills) || 0));
    st.campeonAbatido = !!st.campeonAbatido;
    st.poiDescubierto = !!st.poiDescubierto;
    st.dominada = !!st.dominada;
    st.reclamos = (st.reclamos && typeof st.reclamos === 'object') ? st.reclamos : {};
    return st;
  }

  function metaCazaDeZona(zona, world) {
    if (!zona) return null;
    const nivel = Math.max(1, Number(zona.levelMin) || 1);
    const esJefe = zona.type === 'jefe';
    const metaKills = esJefe ? 1 : Math.max(10, Math.min(24, 8 + Math.round(nivel * 0.8)));
    const campDef = (zona.monsters || []).find(m => m && (m.campeonZona || m.boss)) || null;
    const poi = (world && Array.isArray(world.pois))
      ? (world.pois.find(p => p && p.zoneId === zona.id) || null)
      : null;
    return {
      zonaId: zona.id,
      zonaNombre: zona.name || zona.id,
      nivel,
      esJefe,
      metaKills,
      campeonNombre: campDef ? campDef.name : null,
      poiId: poi ? poi.id : null,
      poiNombre: poi ? poi.name : null
    };
  }

  function evaluarDominioZona(st, meta, nivel) {
    const out = {
      hitosNuevos: [],
      oro: 0,
      xp: 0,
      arena: 0,
      puntos: 0,
      dominadaAhora: false
    };
    if (!st || !meta) return out;
    const n = Math.max(1, nivel || meta.nivel || 1);

    if (st.kills >= meta.metaKills && !st.reclamos.caza) {
      st.reclamos.caza = true;
      const oro = 80 + n * 25;
      const xp = 120 + n * 30;
      const arena = 8 + n;
      out.oro += oro;
      out.xp += xp;
      out.arena += arena;
      out.hitosNuevos.push({
        tipo: 'caza',
        titulo: `Cuota de caza · ${meta.zonaNombre}`,
        oro, xp, arena, puntos: 0
      });
    }

    if (meta.campeonNombre && st.campeonAbatido && !st.reclamos.campeon) {
      st.reclamos.campeon = true;
      const oro = 180 + n * 40;
      const xp = 220 + n * 45;
      const arena = 15 + n;
      const puntos = 1;
      out.oro += oro;
      out.xp += xp;
      out.arena += arena;
      out.puntos += puntos;
      out.hitosNuevos.push({
        tipo: 'campeon',
        titulo: `Campeón derrotado · ${meta.campeonNombre}`,
        oro, xp, arena, puntos
      });
    }

    if (meta.poiId && st.poiDescubierto && !st.reclamos.poi) {
      st.reclamos.poi = true;
      const oro = 60 + n * 15;
      const xp = 100 + n * 20;
      out.oro += oro;
      out.xp += xp;
      out.hitosNuevos.push({
        tipo: 'poi',
        titulo: `Hito descubierto · ${meta.poiNombre}`,
        oro, xp, arena: 0, puntos: 0
      });
    }

    const cumpleCaza = st.kills >= meta.metaKills;
    const cumpleCamp = !meta.campeonNombre || st.campeonAbatido;
    const cumplePoi = !meta.poiId || st.poiDescubierto;

    if (cumpleCaza && cumpleCamp && cumplePoi && !st.dominada) {
      st.dominada = true;
      if (!st.reclamos.dominio) {
        st.reclamos.dominio = true;
        out.dominadaAhora = true;
        out.oro += 250;
        out.puntos += 1;
        out.hitosNuevos.push({
          tipo: 'dominio',
          titulo: `¡Zona Dominada! · ${meta.zonaNombre}`,
          oro: 250, xp: 0, arena: 0, puntos: 1
        });
      }
    }

    return out;
  }

  function registrarCazaZona(heroeEst, zona, monstruo, world) {
    if (!heroeEst || !zona || !zona.id) {
      return { hitosNuevos: [], oro: 0, xp: 0, arena: 0, puntos: 0, dominadaAhora: false };
    }
    const meta = metaCazaDeZona(zona, world);
    const st = asegurarEstadoCaza(heroeEst, zona.id);
    if (!st || !meta) {
      return { hitosNuevos: [], oro: 0, xp: 0, arena: 0, puntos: 0, dominadaAhora: false };
    }

    const esCampeon = !!(monstruo && (
      monstruo.campeonZona ||
      monstruo.boss ||
      (meta.campeonNombre && limpiarNombreEspecie(monstruo.name) === limpiarNombreEspecie(meta.campeonNombre))
    ));

    if (!meta.esJefe || esCampeon) {
      st.kills = Math.min(9999, st.kills + 1);
    }
    if (esCampeon) {
      st.campeonAbatido = true;
    }

    return evaluarDominioZona(st, meta, meta.nivel);
  }

  function registrarPoiDescubierto(heroeEst, poi, world) {
    if (!heroeEst || !poi) {
      return { nuevo: false, hitosNuevos: [], oro: 0, xp: 0, arena: 0, puntos: 0, dominadaAhora: false, desbloqueoViaje: false };
    }
    heroeEst.hitosMundo = heroeEst.hitosMundo || {};
    const clavePoi = 'poi_' + String(poi.id || poi.name);
    const yaVisto = !!heroeEst.hitosMundo[clavePoi];
    heroeEst.hitosMundo[clavePoi] = true;

    let desbloqueoViaje = false;
    if (poi.type === 'portal' || poi.type === 'santuario') {
      desbloqueoViaje = desbloquearViajeRapido(heroeEst, 'poi:' + poi.id);
    }

    const zona = (world && Array.isArray(world.zones) && poi.zoneId)
      ? (world.zones.find(z => z.id === poi.zoneId) || null)
      : null;

    if (zona) {
      const meta = metaCazaDeZona(zona, world);
      const st = asegurarEstadoCaza(heroeEst, zona.id);
      if (st && meta) {
        st.poiDescubierto = true;
        const res = evaluarDominioZona(st, meta, meta.nivel);
        return Object.assign({ nuevo: !yaVisto, desbloqueoViaje }, res);
      }
    }

    if (yaVisto) {
      return { nuevo: false, hitosNuevos: [], oro: 0, xp: 0, arena: 0, puntos: 0, dominadaAhora: false, desbloqueoViaje };
    }

    const nivel = Math.max(1, Number(poi.level) || 1);
    const oro = 60 + nivel * 15;
    const xp = 100 + nivel * 20;
    return {
      nuevo: true,
      desbloqueoViaje,
      hitosNuevos: [{
        tipo: 'poi',
        titulo: `Hito descubierto · ${poi.name || poi.id}`,
        oro, xp, arena: 0, puntos: 0
      }],
      oro,
      xp,
      arena: 0,
      puntos: 0,
      dominadaAhora: false
    };
  }

  function multiplicadorZonaDominada(heroeEst, zonaId) {
    const st = heroeEst && heroeEst.cazaValdris && zonaId ? heroeEst.cazaValdris[zonaId] : null;
    if (st && st.dominada) {
      return { xpMult: 1.10, oroMult: 1.10, dominada: true };
    }
    return { xpMult: 1.0, oroMult: 1.0, dominada: false };
  }

  function resumenMaestriaZonas(heroeEst, world) {
    const zonas = (world && Array.isArray(world.zones)) ? world.zones : [];
    return zonas.map(z => {
      const meta = metaCazaDeZona(z, world);
      const st = (heroeEst && heroeEst.cazaValdris && heroeEst.cazaValdris[z.id]) || {
        kills: 0, campeonAbatido: false, poiDescubierto: false, dominada: false
      };
      const killsShown = Math.min(meta.metaKills, st.kills || 0);
      let hitosHechos = 0;
      let hitosTotal = 1;
      if ((st.kills || 0) >= meta.metaKills) hitosHechos++;
      if (meta.campeonNombre) {
        hitosTotal++;
        if (st.campeonAbatido) hitosHechos++;
      }
      if (meta.poiId) {
        hitosTotal++;
        if (st.poiDescubierto) hitosHechos++;
      }
      return {
        zonaId: z.id,
        zonaNombre: z.name,
        tipo: z.type,
        nivelMin: z.levelMin || 1,
        nivelMax: z.levelMax || 1,
        x: z.x,
        y: z.y,
        kills: st.kills || 0,
        killsShown,
        metaKills: meta.metaKills,
        campeonNombre: meta.campeonNombre,
        campeonAbatido: !!st.campeonAbatido,
        poiId: meta.poiId,
        poiNombre: meta.poiNombre,
        poiDescubierto: !!st.poiDescubierto,
        dominada: !!st.dominada,
        hitosHechos,
        hitosTotal
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Racha de Caza
  // ---------------------------------------------------------------------------
  function bonoRachaCaza(racha) {
    const n = Math.max(0, Math.floor(Number(racha) || 0));
    if (n >= 20) {
      return { tramo: 3, nombre: 'Cazador Imparable', racha: n, xpMult: 1.25, oroMult: 1.30 };
    }
    if (n >= 10) {
      return { tramo: 2, nombre: 'Furia de Caza', racha: n, xpMult: 1.16, oroMult: 1.22 };
    }
    if (n >= 5) {
      return { tramo: 1, nombre: 'Racha de Caza', racha: n, xpMult: 1.08, oroMult: 1.12 };
    }
    return { tramo: 0, nombre: '', racha: n, xpMult: 1.0, oroMult: 1.0 };
  }

  function actualizarRachaCaza(estadoRacha, nowMs) {
    const st = estadoRacha && typeof estadoRacha === 'object'
      ? estadoRacha
      : { count: 0, lastKillAt: 0 };
    const t = typeof nowMs === 'number' && isFinite(nowMs) ? nowMs : Date.now();
    if (st.lastKillAt > 0 && (t - st.lastKillAt) <= VENTANA_RACHA_MS) {
      st.count += 1;
    } else {
      st.count = 1;
    }
    st.lastKillAt = t;
    return Object.assign({ count: st.count, lastKillAt: st.lastKillAt }, bonoRachaCaza(st.count));
  }

  function rachaVigente(estadoRacha, nowMs) {
    if (!estadoRacha || !estadoRacha.count || !estadoRacha.lastKillAt) return 0;
    const t = typeof nowMs === 'number' && isFinite(nowMs) ? nowMs : Date.now();
    return (t - estadoRacha.lastKillAt) <= VENTANA_RACHA_MS ? estadoRacha.count : 0;
  }

  // ---------------------------------------------------------------------------
  // Bestiario de Valdris
  // ---------------------------------------------------------------------------
  function registrarBestiario(heroeEst, monstruo) {
    if (!heroeEst || !monstruo) return null;
    heroeEst.bestiario = heroeEst.bestiario || {};
    const nombreLimpio = limpiarNombreEspecie(monstruo.name || 'Criatura');
    const key = claveEspecie(nombreLimpio);
    const prev = heroeEst.bestiario[key] || {
      nombre: nombreLimpio,
      kills: 0,
      nivel: Math.max(1, Number(monstruo.level) || 1),
      zona: (monstruo.zone && monstruo.zone.id) || '',
      campeon: !!(monstruo.campeonZona || monstruo.boss)
    };
    const killsAntes = prev.kills || 0;
    prev.kills = killsAntes + 1;
    prev.nombre = nombreLimpio;
    prev.nivel = Math.max(prev.nivel || 1, Math.max(1, Number(monstruo.level) || 1));
    if (monstruo.zone && monstruo.zone.id) prev.zona = monstruo.zone.id;
    if (monstruo.campeonZona || monstruo.boss) prev.campeon = true;
    heroeEst.bestiario[key] = prev;

    const rangoAntes = killsAntes >= 15 ? 2 : (killsAntes >= 5 ? 1 : 0);
    const rangoAhora = prev.kills >= 15 ? 2 : (prev.kills >= 5 ? 1 : 0);
    return {
      key,
      entry: prev,
      rangoSubido: rangoAhora > rangoAntes ? rangoAhora : 0
    };
  }

  function bonoConocimientoEspecie(heroeEst, nombreMonstruo) {
    if (!heroeEst || !heroeEst.bestiario || !nombreMonstruo) {
      return { kills: 0, rango: 0, etiqueta: 'Sin estudio', bonusDanio: 0 };
    }
    const key = claveEspecie(nombreMonstruo);
    const entry = heroeEst.bestiario[key];
    const kills = entry ? (entry.kills || 0) : 0;
    if (kills >= 15) {
      return { kills, rango: 2, etiqueta: 'Maestro Cazador (+10 % daño)', bonusDanio: 0.10 };
    }
    if (kills >= 5) {
      return { kills, rango: 1, etiqueta: 'Rastreador (+5 % daño)', bonusDanio: 0.05 };
    }
    return { kills, rango: 0, etiqueta: `${kills}/5 para Rastreador`, bonusDanio: 0 };
  }

  function listaBestiario(heroeEst) {
    if (!heroeEst || !heroeEst.bestiario) return [];
    return Object.keys(heroeEst.bestiario)
      .map(key => {
        const e = heroeEst.bestiario[key];
        const bono = bonoConocimientoEspecie(heroeEst, e.nombre);
        return Object.assign({ key }, e, bono);
      })
      .sort((a, b) => (b.campeon ? 1 : 0) - (a.campeon ? 1 : 0) || b.nivel - a.nivel || b.kills - a.kills);
  }

  // ---------------------------------------------------------------------------
  // Red de Viaje Rápido (Piedras de Viaje)
  // ---------------------------------------------------------------------------
  function desbloquearViajeRapido(heroeEst, destinoId) {
    if (!heroeEst || !destinoId) return false;
    heroeEst.viajeRapido = Array.isArray(heroeEst.viajeRapido) ? heroeEst.viajeRapido : [];
    if (heroeEst.viajeRapido.includes(destinoId)) return false;
    heroeEst.viajeRapido.push(destinoId);
    return true;
  }

  function esDestinoDescubierto(destId, heroeEst, visitedSet, world) {
    if (!destId) return false;
    if (heroeEst && Array.isArray(heroeEst.viajeRapido) && heroeEst.viajeRapido.includes(destId)) return true;
    if (destId.startsWith('town:')) {
      const tid = destId.slice(5);
      if (world && Array.isArray(world.towns)) {
        const t = world.towns.find(x => x.id === tid);
        if (t && (t.isStart || t.id === world.startTownId)) return true;
      }
      if (visitedSet && typeof visitedSet.has === 'function' && visitedSet.has(tid)) return true;
    } else if (destId.startsWith('poi:')) {
      const pid = destId.slice(4);
      if (heroeEst && heroeEst.hitosMundo && heroeEst.hitosMundo['poi_' + pid]) return true;
    }
    return false;
  }

  function destinosViajeRapido(world, heroeEst, visitedSet) {
    if (!world) return [];
    const lista = [];
    (world.towns || []).forEach(t => {
      const id = 'town:' + t.id;
      const descubierto = esDestinoDescubierto(id, heroeEst, visitedSet, world);
      const costeOro = t.isStart ? 0 : (15 * Math.max(1, Number(t.level) || 1));
      lista.push({
        id,
        refId: t.id,
        tipo: 'pueblo',
        icono: t.isStart ? '⭐' : '🏘️',
        nombre: t.name,
        nivel: t.level || 1,
        x: t.x,
        z: t.y,
        descubierto,
        costeOro
      });
    });
    (world.pois || []).filter(p => p && (p.type === 'portal' || p.type === 'santuario')).forEach(p => {
      const id = 'poi:' + p.id;
      const descubierto = esDestinoDescubierto(id, heroeEst, visitedSet, world);
      lista.push({
        id,
        refId: p.id,
        tipo: p.type,
        icono: p.type === 'portal' ? '🌀' : '🏛️',
        nombre: p.name,
        nivel: p.level || 1,
        x: p.x,
        z: p.y,
        descubierto,
        costeOro: 0
      });
    });
    return lista;
  }

  function puedeViajarRapido(opts) {
    opts = opts || {};
    if (opts.enCombate) {
      return { ok: false, motivo: 'No puedes usar la Piedra de Viaje en pleno combate.' };
    }
    const lista = destinosViajeRapido(opts.world, opts.heroeEst, opts.visitedSet);
    const dest = lista.find(d => d.id === opts.destinoId || d.refId === opts.destinoId);
    if (!dest) {
      return { ok: false, motivo: 'Destino de Piedra de Viaje desconocido.' };
    }
    if (!dest.descubierto) {
      return { ok: false, motivo: `${dest.nombre} aún no ha sido descubierto en el mapa.` };
    }
    const oroActual = typeof opts.oro === 'number' ? opts.oro : Infinity;
    const coste = dest.costeOro || 0;
    if (oroActual < coste) {
      return { ok: false, motivo: `Necesitas ${coste} 🪙 para viajar a ${dest.nombre}.`, costeOro: coste };
    }
    return {
      ok: true,
      motivo: '',
      destino: dest,
      costeOro: coste,
      x: dest.x,
      z: dest.z,
      nombre: dest.nombre
    };
  }

  // ---------------------------------------------------------------------------
  // Campamentos de caza (descanso en ruta)
  // ---------------------------------------------------------------------------
  function campamentoCercano(world, x, z, radioMax) {
    if (!world || !Array.isArray(world.pois)) return null;
    const r = typeof radioMax === 'number' ? radioMax : 22;
    let mejor = null, mejorD = r;
    world.pois.forEach(p => {
      if (!p || (p.type !== 'campamento' && p.type !== 'santuario')) return;
      const d = Math.hypot((Number(p.x) || 0) - x, (Number(p.y) || 0) - z);
      if (d <= mejorD) {
        mejorD = d;
        mejor = p;
      }
    });
    return mejor;
  }

  // ---------------------------------------------------------------------------
  // Progreso Global de Valdris (0–100 %)
  // ---------------------------------------------------------------------------
  function progresoGlobalValdris(heroeEst, world, visitedSet, lugaresSecretos) {
    const capsTotal = (world && world.historia && Array.isArray(world.historia.capitulos))
      ? world.historia.capitulos.length
      : 16;
    const capsHechos = Math.min(capsTotal, (heroeEst && heroeEst.principal && heroeEst.principal.paso) || 0);

    const pueblosTotal = (world && Array.isArray(world.towns)) ? world.towns.length : 0;
    let pueblosHechos = 0;
    (world && world.towns || []).forEach(t => {
      if ((visitedSet && visitedSet.has && visitedSet.has(t.id)) ||
          (heroeEst && Array.isArray(heroeEst.viajeRapido) && heroeEst.viajeRapido.includes('town:' + t.id)) ||
          t.isStart) {
        pueblosHechos++;
      }
    });

    const maestria = resumenMaestriaZonas(heroeEst, world);
    const zonasTotal = maestria.length;
    const zonasDominadas = maestria.filter(z => z.dominada).length;
    const campeonesTotal = maestria.filter(z => !!z.campeonNombre).length;
    const campeonesAbatidos = maestria.filter(z => z.campeonNombre && z.campeonAbatido).length;

    const encargosTotal = (world && Array.isArray(world.zones)) ? world.zones.length : 0;
    let encargosHechos = 0;
    if (heroeEst && heroeEst.zonas) {
      Object.values(heroeEst.zonas).forEach(z => { if (z && z.entregada) encargosHechos++; });
    }

    const cabanas = (lugaresSecretos || (world && world.secretPlaces) || []).filter(s => s && s.tipo === 'cabana' && s.misionCabana);
    const cabanasTotal = cabanas.length;
    const cabanasHechas = cabanas.filter(c => c.misionCabana && (c.misionCabana.entregada || c.misionCabana.cumplida)).length;

    const hitos = (heroeEst && heroeEst.hitosMundo) || {};
    const mazmorrasTotal = (world && Array.isArray(world.dungeons)) ? world.dungeons.length : 0;
    const mazmorrasHechas = (world && world.dungeons || []).filter(d => !!hitos['dun_' + d.id]).length;

    const laberintos = (world && Array.isArray(world.zones)) ? world.zones.filter(z => z.relieve && z.relieve.activo) : [];
    const laberintosTotal = laberintos.length;
    const laberintosHechos = laberintos.filter(z => !!hitos['lab_' + z.id]).length;

    const poisTotal = (world && Array.isArray(world.pois)) ? world.pois.length : 0;
    const poisHechos = (world && world.pois || []).filter(p => !!hitos['poi_' + p.id]).length;

    const especiesBestiario = listCount(heroeEst && heroeEst.bestiario);

    const hecho = capsHechos + pueblosHechos + zonasDominadas + encargosHechos + cabanasHechas + mazmorrasHechas + laberintosHechos + poisHechos;
    const total = capsTotal + pueblosTotal + zonasTotal + encargosTotal + cabanasTotal + mazmorrasTotal + laberintosTotal + poisTotal;
    const porcentaje = total > 0 ? Math.min(100, Math.round((hecho / total) * 100)) : 0;

    return {
      porcentaje,
      hecho,
      total,
      capitulos: { hechos: capsHechos, total: capsTotal },
      pueblos: { hechos: pueblosHechos, total: pueblosTotal },
      zonasDominadas: { hechos: zonasDominadas, total: zonasTotal },
      campeones: { hechos: campeonesAbatidos, total: campeonesTotal },
      encargos: { hechos: encargosHechos, total: encargosTotal },
      cabanas: { hechos: cabanasHechas, total: cabanasTotal },
      mazmorras: { hechos: mazmorrasHechas, total: mazmorrasTotal },
      laberintos: { hechos: laberintosHechos, total: laberintosTotal },
      pois: { hechos: poisHechos, total: poisTotal },
      especiesBestiario
    };
  }

  function listCount(obj) {
    return obj && typeof obj === 'object' ? Object.keys(obj).length : 0;
  }

  const api = {
    CAMPAIGN_ID,
    VENTANA_RACHA_MS,
    esValdris,
    limpiarNombreEspecie,
    claveEspecie,
    metaCazaDeZona,
    registrarCazaZona,
    registrarPoiDescubierto,
    multiplicadorZonaDominada,
    resumenMaestriaZonas,
    bonoRachaCaza,
    actualizarRachaCaza,
    rachaVigente,
    registrarBestiario,
    bonoConocimientoEspecie,
    listaBestiario,
    desbloquearViajeRapido,
    destinosViajeRapido,
    puedeViajarRapido,
    campamentoCercano,
    progresoGlobalValdris
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ValdrisJuegoLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
