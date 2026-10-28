// Lagos, oasis y arenas movedizas del visor. Son huecos del relieve: el visor los excava en su altura
// (aplicar, dentro de Hgen), así que la malla, los caminos y la decoración los ven igual. La superficie de
// agua se corta sola en la orilla leyendo la profundidad del terreno, y usa las normales y el tono de
// New-Rol (assets/agua/waternormals.jpg). Requiere THREE como global.
(function (root) {
  'use strict';

  // Lagos en praderas y montañas; oasis y arenas movedizas en el desierto
  const TIPO = {
    lagoPradera: { bioma: 'pradera', tipo: 'lago', max: 5, rMin: 16, rMax: 30, nivel: 1.0, prof: [1.8, 2.8], honda: 0x1f5f74, clara: 0x3aa0b8 },
    lagoMontana: { bioma: 'montana', tipo: 'lago', max: 3, rMin: 14, rMax: 24, nivel: 1.2, prof: [3.5, 5.0], honda: 0x173f5c, clara: 0x2f7594 },
    // El oasis queda un poco por debajo del suelo de alrededor: el hueco que se excava lo contiene solo
    oasis: { bioma: 'desierto', tipo: 'oasis', max: 3, rMin: 9, rMax: 14, nivel: -0.3, prof: [1.2, 1.8], honda: 0x1a7f8a, clara: 0x5fd0c4 },
    arenas: { bioma: 'desierto', tipo: 'arenas', max: 6, rMin: 7, rMax: 11, nivel: 0, prof: [0.5, 0.8], honda: 0, clara: 0 }
  };

  // Altura más baja de un anillo de radio r alrededor de (x, z)
  function anilloMin(altura, x, z, r) {
    let menor = Infinity;
    for (let a = 0; a < 16; a++) menor = Math.min(menor, altura(x + Math.cos(a * Math.PI / 8) * r, z + Math.sin(a * Math.PI / 8) * r));
    return menor;
  }

  // Baja por el relieve desde (x, z) hasta un fondo local: ahí es donde puede haber un hueco
  function bajar(altura, x, z) {
    for (let paso = 0; paso < 60; paso++) {
      let mx = x, mz = z, mh = altura(x, z);
      for (let a = 0; a < 8; a++) {
        const nx = x + Math.cos(a * Math.PI / 4) * 6, nz = z + Math.sin(a * Math.PI / 4) * 6, nh = altura(nx, nz);
        if (nh < mh) { mh = nh; mx = nx; mz = nz; }
      }
      if (mx === x && mz === z) break;
      x = mx; z = mz;
    }
    return [x, z];
  }

  function tipoPara(bioma, rng) {
    if (bioma === 'pradera') return 'lagoPradera';
    if (bioma === 'montana') return 'lagoMontana';
    if (bioma === 'desierto') return rng.chance(0.45) ? 'oasis' : 'arenas';
    return null;
  }

  // Radio del cuenco a una altura dada: sigue 16 rayos desde el centro hasta cruzar esa altura.
  // Si algún rayo no la cruza, no hay cuenca cerrada y devuelve null. Se queda en el 80 % del borde.
  function cuenca(altura, x, z, nivel, rMax) {
    let menor = Infinity;
    for (let a = 0; a < 16; a++) {
      const ca = Math.cos(a * Math.PI / 8), sa = Math.sin(a * Math.PI / 8);
      let cruce = null;
      for (let r = 3; r <= rMax * 2; r += 2) {
        if (altura(x + ca * r, z + sa * r) >= nivel) { cruce = r; break; }
      }
      if (cruce === null) return null;
      menor = Math.min(menor, cruce);
    }
    return menor * 0.8;
  }

  // Sitios del mundo. o: { rng, limites, altura(x,z) sin excavar, bioma(x,z), libre(x,z,margen),
  // rioDist(x,z) distancia al río más cercano }. Devuelve [{ tipo, x, z, R, nivel, prof, honda, clara, semilla }]
  function planear(o) {
    const L = o.limites, rng = o.rng;
    const lagos = [], cuenta = {};
    for (let k = 0; k < (o.intentos || 6000); k++) {
      const x0 = L.minX + rng.next() * (L.maxX - L.minX), z0 = L.minZ + rng.next() * (L.maxZ - L.minZ);
      const clave = tipoPara(o.bioma(x0, z0), rng);
      if (!clave || (cuenta[clave] || 0) >= TIPO[clave].max) continue;
      const T = TIPO[clave];
      // Los lagos buscan el fondo de un hueco natural; oasis y arenas se quedan donde cayeron
      const [x, z] = T.tipo === 'lago' ? bajar(o.altura, x0, z0) : [x0, z0];
      if (o.bioma(x, z) !== T.bioma) continue;
      const h0 = o.altura(x, z);
      if (h0 < 1.5) continue;   // no sobre el mar
      const prof = T.prof[0] + rng.next() * (T.prof[1] - T.prof[0]);
      let R;
      if (T.tipo === 'lago') {
        R = cuenca(o.altura, x, z, h0 + T.nivel, T.rMax);
        if (R === null || R < T.rMin) continue;
        R = Math.min(R, T.rMax);
      } else {
        // Oasis y arenas movedizas van en un trozo casi plano: el hueco se excava después
        const pend = Math.hypot(o.altura(x + 3, z) - o.altura(x - 3, z), o.altura(x, z + 3) - o.altura(x, z - 3)) / 6;
        if (pend > 0.25) continue;
        R = T.rMin + rng.next() * (T.rMax - T.rMin);
      }
      if (!o.libre(x, z, R + 40) || o.rioDist(x, z) < R * 1.3 + 30) continue;
      if (lagos.some(l => Math.hypot(l.x - x, l.z - z) < l.R + R + 45)) continue;
      // El oasis no puede quedar más alto que el borde más bajo de su anillo, o el agua se saldría del hueco
      const nivel = T.tipo === 'oasis' ? Math.min(h0 + T.nivel, anilloMin(o.altura, x, z, R * 1.35) - 0.1)
        : T.tipo === 'arenas' ? h0 : h0 + T.nivel;
      lagos.push({
        tipo: T.tipo, clave, x, z, R, prof, nivel,
        honda: T.honda, clara: T.clara,
        semilla: Math.floor(rng.next() * 1e6) + 1
      });
      cuenta[clave] = (cuenta[clave] || 0) + 1;
    }
    return lagos;
  }

  function smooth(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  // Altura con los huecos excavados: en el centro baja hasta el fondo; hacia el borde se funde con el terreno
  function aplicar(lagos, x, z, h) {
    for (const L of lagos) {
      const dx = x - L.x, dz = z - L.z;
      const r = Math.sqrt(dx * dx + dz * dz) / L.R;
      if (r > 1.35) continue;
      const fondo = L.nivel - L.prof * Math.max(0, 1 - r * r);
      const w = 1 - smooth(0.8, 1.35, r);
      h = h + (Math.min(h, fondo) - h) * w;
    }
    return h;
  }

  // ¿Está (x, z) dentro del agua? Para no poner árboles ni rocas en un lago
  function enAgua(lagos, x, z) {
    return lagos.some(L => L.tipo !== 'arenas' && Math.hypot(x - L.x, z - L.z) < L.R * 1.05);
  }

  // Cómo se pinta el agua: el mismo esquema que los ríos (rizo, reflejo del cielo) más las normales de New-Rol
  // y espuma en la orilla. La profundidad viene de una textura con la altura del terreno bajo la superficie.
  const AGUA_FRAG = `
    vec2 uvP = (vMundo - uOrigen) / uLado;
    float prof = texture2D(tProf, uvP).r * 8.0;
    if (prof < 0.03) discard;
    vec2 n1 = texture2D(tNorm, vMundo * 0.035 + vec2(uTime * 0.010, uTime * 0.006)).rg * 2.0 - 1.0;
    vec2 n2 = texture2D(tNorm, vMundo * 0.07 - vec2(uTime * 0.008, uTime * 0.013)).rg * 2.0 - 1.0;
    vec2 n = (n1 + n2) * 0.5;
    vec3 agua = mix(uHonda, uClara, smoothstep(0.0, 4.0, prof));
    agua *= 0.8 + 0.4 * dot(n, vec2(0.7, 0.7)) + 0.1 * n.y;
    float espuma = smoothstep(0.45, 0.0, prof) * (0.55 + 0.45 * n.x * 2.0);
    agua = mix(agua, vec3(0.92, 0.97, 1.0), clamp(espuma, 0.0, 1.0) * 0.8);
    vec3 vista = normalize(cameraPosition - vMundo3);
    float fresnel = 0.03 + 0.97 * pow(1.0 - clamp(vista.y + n.x * 0.08, 0.0, 1.0), 4.0);
    agua = mix(agua, uCielo, clamp(fresnel * 0.85, 0.0, 0.9));
    diffuseColor.rgb = agua;
    diffuseColor.a = mix(0.6, 0.95, smoothstep(0.0, 1.2, prof));`;

  // Superficie de un lago u oasis: plano a su nivel, recortado por la profundidad del terreno
  function agua(THREE, L, altura, opt) {
    const ext = L.R * 1.4, N = 64, lado = 2 * ext;
    const datos = new Uint8Array(N * N * 4);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = L.x - ext + (i + 0.5) * lado / N, z = L.z - ext + (j + 0.5) * lado / N;
      const p = (j * N + i) * 4;
      // Se desvanece fuera del hueco: el agua nunca dibuja el borde cuadrado de su plano
      const fuera = 1 - smooth(1.1 * L.R, 1.38 * L.R, Math.hypot(x - L.x, z - L.z));
      datos[p] = Math.round(Math.max(0, Math.min(1, (L.nivel - altura(x, z)) / 8)) * fuera * 255);
      datos[p + 3] = 255;
    }
    const prof = new THREE.DataTexture(datos, N, N);
    prof.magFilter = prof.minFilter = THREE.LinearFilter;
    prof.wrapS = prof.wrapT = THREE.ClampToEdgeWrapping;
    prof.needsUpdate = true;
    const mat = new THREE.MeshLambertMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false });
    mat.onBeforeCompile = shader => {
      shader.uniforms.tProf = { value: prof };
      shader.uniforms.tNorm = { value: opt.normales };
      shader.uniforms.uOrigen = { value: new THREE.Vector2(L.x - ext, L.z - ext) };
      shader.uniforms.uLado = { value: lado };
      shader.uniforms.uHonda = { value: new THREE.Color(L.honda) };
      shader.uniforms.uClara = { value: new THREE.Color(L.clara) };
      shader.uniforms.uTime = opt.tiempo;
      shader.uniforms.uCielo = opt.cielo;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vMundo;\nvarying vec3 vMundo3;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n  vec4 wp = modelMatrix * vec4(transformed, 1.0);\n  vMundo = wp.xz;\n  vMundo3 = wp.xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vMundo;\nvarying vec3 vMundo3;\nuniform sampler2D tProf;\nuniform sampler2D tNorm;\nuniform vec2 uOrigen;\nuniform float uLado;\nuniform vec3 uHonda;\nuniform vec3 uClara;\nuniform float uTime;\nuniform vec3 uCielo;')
        .replace('#include <color_fragment>', '#include <color_fragment>' + AGUA_FRAG);
    };
    const malla = new THREE.Mesh(new THREE.PlaneGeometry(lado, lado).rotateX(-Math.PI / 2), mat);
    malla.position.set(L.x, L.nivel, L.z);
    return malla;
  }

  // Arenas movedizas: un disco de arena que sigue el cuenco, con anillos que giran hacia dentro
  function arenas(THREE, L, altura, opt) {
    const R = L.R * 1.25, anillos = 12, sectores = 40;
    const pos = [], idx = [];
    for (let a = 0; a <= anillos; a++) for (let s = 0; s < sectores; s++) {
      const r = R * a / anillos, t = s / sectores * Math.PI * 2;
      const x = L.x + Math.cos(t) * r, z = L.z + Math.sin(t) * r;
      pos.push(x, altura(x, z) + 0.05, z);
    }
    const id = (a, s) => a * sectores + (s % sectores);
    for (let a = 0; a < anillos; a++) for (let s = 0; s < sectores; s++) {
      idx.push(id(a, s), id(a + 1, s), id(a, s + 1), id(a, s + 1), id(a + 1, s), id(a + 1, s + 1));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
    mat.onBeforeCompile = shader => {
      shader.uniforms.uCentro = { value: new THREE.Vector2(L.x, L.z) };
      shader.uniforms.uRadio = { value: R };
      shader.uniforms.uTime = opt.tiempo;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vMundo;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n  vMundo = (modelMatrix * vec4(transformed, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vMundo;\nuniform vec2 uCentro;\nuniform float uRadio;\nuniform float uTime;')
        .replace('#include <color_fragment>', `#include <color_fragment>
          float rr = length(vMundo - uCentro) / uRadio;
          float angulo = atan(vMundo.y - uCentro.y, vMundo.x - uCentro.x);
          float ondas = 0.5 + 0.5 * sin(rr * 16.0 - uTime * 0.6 + 0.9 * sin(angulo * 3.0 + uTime * 0.2));
          float grano = 0.5 + 0.5 * sin(vMundo.x * 0.9 + sin(vMundo.y * 0.7));
          vec3 claro = vec3(0.80, 0.66, 0.42), oscuro = vec3(0.50, 0.38, 0.22);
          vec3 col = mix(oscuro, claro, smoothstep(0.15, 1.0, rr));
          col *= 0.82 + 0.22 * ondas;
          col *= 0.94 + 0.06 * grano;
          diffuseColor.rgb = col;`);
    };
    return new THREE.Mesh(geo, mat);
  }

  // Palmeras del oasis: tronco inclinado y nueve hojas que cuelgan, todo instanciado (dos llamadas)
  function palmeras(THREE, L, altura) {
    let s = L.semilla;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const puntos = [];
    const n = 7 + Math.floor(rnd() * 4);
    for (let k = 0; k < n; k++) {
      const a = rnd() * Math.PI * 2, r = L.R * (1.05 + rnd() * 0.35);
      const x = L.x + Math.cos(a) * r, z = L.z + Math.sin(a) * r;
      const y = altura(x, z);
      if (y < L.nivel + 0.25) continue;   // solo en tierra firme
      puntos.push({ x, y, z, ry: rnd() * Math.PI * 2, s: 0.8 + rnd() * 0.4 });
    }
    if (!puntos.length) return [];
    const troncoGeo = new THREE.CylinderGeometry(0.16, 0.26, 6.5, 8, 6).translate(0, 3.25, 0);
    const hojaGeo = new THREE.PlaneGeometry(3.0, 0.8, 8, 1).rotateX(Math.PI / 2).translate(1.5, 0, 0);
    const p = hojaGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setY(i, 0.25 * x - 0.12 * x * x);   // sale algo hacia arriba y cae
    }
    hojaGeo.computeVertexNormals();
    const troncos = new THREE.InstancedMesh(troncoGeo, new THREE.MeshLambertMaterial({ color: 0x7a5a3a }), puntos.length);
    const hojas = new THREE.InstancedMesh(hojaGeo, new THREE.MeshLambertMaterial({ color: 0x3f7d3a, side: THREE.DoubleSide }), puntos.length * 9);
    const m = new THREE.Matrix4(), pos = new THREE.Vector3(), esc = new THREE.Vector3(), q = new THREE.Quaternion(), eu = new THREE.Euler();
    puntos.forEach((c, i) => {
      esc.set(c.s, c.s, c.s);
      m.compose(pos.set(c.x, c.y - 0.1, c.z), q.setFromEuler(eu.set(0, c.ry, 0)), esc);
      troncos.setMatrixAt(i, m);
      for (let k = 0; k < 9; k++) {
        m.compose(pos.set(c.x, c.y + 6.4 * c.s, c.z), q.setFromEuler(eu.set(0, c.ry + k * Math.PI * 2 / 9, 0)), esc);
        hojas.setMatrixAt(i * 9 + k, m);
      }
    });
    troncos.instanceMatrix.needsUpdate = true;
    hojas.instanceMatrix.needsUpdate = true;
    return [troncos, hojas];
  }

  // Todo lo que se ve de los sitios: agua o arena y, en los oasis, palmeras
  function crear(THREE, lagos, opt) {
    const grupo = new THREE.Group();
    lagos.forEach(L => {
      if (L.tipo === 'arenas') { grupo.add(arenas(THREE, L, opt.altura, opt)); return; }
      grupo.add(agua(THREE, L, opt.altura, opt));
      if (L.tipo === 'oasis') palmeras(THREE, L, opt.altura).forEach(malla => grupo.add(malla));
    });
    return grupo;
  }

  const api = { planear, aplicar, enAgua, crear };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LagosLib = api;
})(typeof window !== 'undefined' ? window : globalThis);
