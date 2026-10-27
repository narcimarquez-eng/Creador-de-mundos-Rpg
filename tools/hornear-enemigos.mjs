// Compila el módulo de generación de enemigos del editor «Enemigo-rpg» a js/enemigos.js (script clásico).
// Three no se incluye: el juego ya lo carga como global (THREE, r128). Ver tools/enemigos-src/.
// Uso: node tools/hornear-enemigos.mjs
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SIN_IMPORT_THREE = /import \* as THREE from 'three';/;

// El editor importa Three como módulo; aquí se sustituye por la global del juego.
const globalThreePlugin = {
  name: 'three-global',
  setup(b) {
    b.onLoad({ filter: /enemyBuilder\.ts$|proceduralTextures\.ts$/ }, async args => {
      const fs = await import('node:fs/promises');
      let texto = await fs.readFile(args.path, 'utf8');
      if (!SIN_IMPORT_THREE.test(texto)) throw new Error('no se encontró el import de three en ' + args.path);
      texto = texto.replace(SIN_IMPORT_THREE, 'const THREE = globalThis.THREE;');
      return { contents: texto, loader: 'ts' };
    });
  },
};

await build({
  entryPoints: [path.join(here, 'enemigos-src', 'entrada.ts')],
  bundle: true,
  format: 'iife',
  globalName: 'EnemyLib',
  target: 'es2018',
  outfile: path.join(here, '..', 'js', 'enemigos.js'),
  plugins: [globalThreePlugin],
  banner: {
    js: [
      '// Generado por tools/hornear-enemigos.mjs desde el editor «Enemigo-rpg». No editar a mano.',
      '// Parche para Three r128: las mallas instanciadas no tienen computeBoundingSphere (el editor lo llama).',
      "if (typeof THREE !== 'undefined' && THREE.InstancedMesh && !THREE.InstancedMesh.prototype.computeBoundingSphere) {",
      '  THREE.InstancedMesh.prototype.computeBoundingSphere = function () {};',
      '}',
      '',
    ].join('\n'),
  },
  logLevel: 'warning',
});
await build({
  entryPoints: [path.join(here, 'enemigos-src', 'catalogo.ts')],
  bundle: true,
  format: 'iife',
  globalName: 'EnemyCatalogModule',
  target: 'es2018',
  outfile: path.join(here, '..', 'js', 'enemigos-catalogo.js'),
  banner: { js: '// Generado por tools/hornear-enemigos.mjs desde el editor «Enemigo-rpg». No editar a mano.\n' },
  footer: { js: "if (typeof window !== 'undefined') window.ENEMY_CATALOG = EnemyCatalogModule.ENEMY_CATALOG;" },
  logLevel: 'warning',
});
console.log('escrito js/enemigos.js y js/enemigos-catalogo.js');
