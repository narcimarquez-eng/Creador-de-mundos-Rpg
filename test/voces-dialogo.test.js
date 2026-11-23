// Pruebas del sistema de doblaje TTS en español (dialogos_voces.json, js/voces.js e integración en visor-mundo.html).
// Ejecutar: node test/voces-dialogo.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const Voces = require('../js/voces.js');

let n = 0;
async function t(nombre, fn) {
  await fn();
  n++;
  console.log('ok -', nombre);
}

function crearMockAudio(modoAutoplayBloqueado = false) {
  const instancias = [];
  let bloqueado = modoAutoplayBloqueado;

  class FakeAudio {
    constructor(src) {
      this.src = src;
      this.volume = 1;
      this.currentTime = 0;
      this.paused = true;
      this.onended = null;
      this.onerror = null;
      this.playCalls = 0;
      this.pauseCalls = 0;
      instancias.push(this);
    }
    play() {
      this.playCalls++;
      if (bloqueado) {
        const err = new Error('play() failed because the user didn\'t interact with the document first');
        err.name = 'NotAllowedError';
        return Promise.reject(err);
      }
      this.paused = false;
      return Promise.resolve();
    }
    pause() {
      this.pauseCalls++;
      this.paused = true;
    }
  }

  return {
    FakeAudio,
    instancias,
    setBloqueado(v) { bloqueado = v; }
  };
}

(async () => {
  await t('dialogos_voces.json tiene estructura válida, sin duplicados ni marcadores sin resolver', () => {
    const jsonPath = path.join(raiz, 'dialogos_voces.json');
    assert.ok(fs.existsSync(jsonPath), 'Falta dialogos_voces.json');
    const lista = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    assert.ok(Array.isArray(lista) && lista.length >= 250, 'Se esperaban al menos 250 diálogos');
    const ids = new Set();
    const rutas = new Set();
    for (const item of lista) {
      assert.strictEqual(typeof item.id, 'string');
      assert.strictEqual(typeof item.personaje, 'string');
      assert.strictEqual(typeof item.texto, 'string');
      assert.strictEqual(typeof item.archivo_audio, 'string');
      assert.ok(item.id.length > 0 && item.personaje.length > 0 && item.texto.length > 0);
      assert.ok(item.archivo_audio.startsWith('assets/audio/voces/') && item.archivo_audio.endsWith('.ogg'));
      assert.ok(!/\{[^}]+\}/.test(item.texto), `Marcador sin resolver en ${item.id}: ${item.texto}`);
      assert.ok(!/<[^>]+>/.test(item.texto), `Etiqueta HTML residual en ${item.id}: ${item.texto}`);
      assert.ok(!ids.has(item.id), `ID duplicado: ${item.id}`);
      assert.ok(!rutas.has(item.archivo_audio), `Ruta duplicada: ${item.archivo_audio}`);
      ids.add(item.id);
      rutas.add(item.archivo_audio);
    }
  });

  await t('Todos los archivos .ogg referenciados existen y tienen cabecera OggS válida', () => {
    const lista = JSON.parse(fs.readFileSync(path.join(raiz, 'dialogos_voces.json'), 'utf8'));
    for (const item of lista) {
      const p = path.join(raiz, item.archivo_audio);
      assert.ok(fs.existsSync(p), `Falta audio ${item.archivo_audio}`);
      const buf = fs.readFileSync(p);
      assert.ok(buf.length > 512, `Audio vacío o corrupto: ${item.archivo_audio}`);
      assert.strictEqual(buf.slice(0, 4).toString('ascii'), 'OggS', `Cabecera no OGG en ${item.archivo_audio}`);
    }
  });

  await t('js/voces.js reproduce por ID, texto normalizado y prefijo, deteniendo el audio anterior', async () => {
    const mock = crearMockAudio(false);
    global.Audio = mock.FakeAudio;

    const lista = JSON.parse(fs.readFileSync(path.join(raiz, 'dialogos_voces.json'), 'utf8'));
    await Voces.cargarDesdeArray(lista);
    Voces.activar(true);
    Voces.setVolumen(0.8);

    const ok1 = await Voces.hablarPorId('prologo_01', { prioridad: 'alta' });
    assert.strictEqual(ok1, true);
    assert.strictEqual(mock.instancias.length, 1);
    assert.strictEqual(mock.instancias[0].src, 'assets/audio/voces/prologo_01.ogg');
    assert.strictEqual(mock.instancias[0].volume, 0.8);
    assert.strictEqual(Voces.estaHablando(), true);

    // Un diálogo ambiental de prioridad baja NO interrumpe el modal actual
    const okBaja = await Voces.hablarPorId('acomp_ambiente_01', { prioridad: 'baja' });
    assert.strictEqual(okBaja, false);
    assert.strictEqual(mock.instancias.length, 1);
    assert.strictEqual(mock.instancias[0].paused, false);

    // Un diálogo modal de prioridad alta SÍ detiene el anterior y reinicia currentTime
    const brannItem = lista.find(x => x.id === 'herrero_brann_acto_1');
    const okTexto = await Voces.hablarTexto(brannItem.texto + ' Para un Mago como tú reservo hebras rúnicas.', { prioridad: 'alta' });
    assert.strictEqual(okTexto, true);
    assert.strictEqual(mock.instancias[0].pauseCalls, 1);
    assert.strictEqual(mock.instancias[0].currentTime, 0);
    assert.strictEqual(mock.instancias[1].src, 'assets/audio/voces/herrero_brann_acto_1.ogg');

    Voces.detener();
    assert.strictEqual(Voces.estaHablando(), false);
  });

  await t('js/voces.js gestiona el desbloqueo tras NotAllowedError y cancela pendientes al detener()', async () => {
    const mock = crearMockAudio(true);
    global.Audio = mock.FakeAudio;

    await Voces.hablarPorId('prologo_02', { prioridad: 'alta' });
    // Esperar a que la promesa rechazada de play() guarde el pendiente
    await new Promise(r => setTimeout(r, 15));
    assert.strictEqual(Voces.estado().tienePendiente, true);

    // Al primer gesto del usuario, desbloquear() reproduce el pendiente
    mock.setBloqueado(false);
    const reanudado = Voces.desbloquear();
    assert.strictEqual(reanudado, true);
    assert.strictEqual(mock.instancias[mock.instancias.length - 1].src, 'assets/audio/voces/prologo_02.ogg');
    assert.strictEqual(Voces.estado().tienePendiente, false);

    // Si estaba pendiente y el usuario cierra el modal (detener), no debe sonar después
    mock.setBloqueado(true);
    await Voces.hablarPorId('cap_01_encargo', { prioridad: 'alta' });
    await new Promise(r => setTimeout(r, 15));
    assert.strictEqual(Voces.estado().tienePendiente, true);
    Voces.detener();
    assert.strictEqual(Voces.estado().tienePendiente, false);
    mock.setBloqueado(false);
    assert.strictEqual(Voces.desbloquear(), false);

    // Mutear con activar(false) detiene y bloquea nuevas voces
    Voces.activar(false);
    assert.strictEqual(await Voces.hablarPorId('prologo_01', { prioridad: 'alta' }), false);
    Voces.activar(true);
  });

  await t('visor-mundo.html integra js/voces.js y todos los puntos de diálogo', () => {
    const html = fs.readFileSync(path.join(raiz, 'visor-mundo.html'), 'utf8');
    assert.ok(html.includes('src="js/voces.js'), 'Falta script js/voces.js');
    assert.ok(html.includes('reproducirVozDialogo('), 'Falta helper reproducirVozDialogo');
    assert.ok(html.includes("paso === 2 ? 'prologo_02' : 'prologo_01'"), 'Falta voz en prólogo');
    assert.ok(html.includes("'_texto', r.texto"), 'Falta voz en mostrarCapitulo');
    assert.ok(html.includes("'_encargo', o.encargo"), 'Falta voz en mostrarEncargo');
    assert.ok(html.includes('interactuarConAcompanante(true)'), 'mostrarEncargo debe silenciar el aviso del compañero');
    assert.ok(html.includes('window.Voces.detener()'), 'Falta Voces.detener() al cerrar modales');
    assert.ok(html.includes('window.Voces.desbloquear'), 'Falta Voces.desbloquear en interacción');
    assert.ok(html.includes('window.Voces.activar'), 'Falta sincronización de silencio en botón de sonido');
    assert.ok(html.includes('Voces.hablarSkill('), 'Falta hook de Voces.hablarSkill en useSkill');
    assert.ok(!html.includes('Voces.hablarCompaneroSkill('), 'El acompañante no debe relatar sus skills en visor-mundo.html');
  });

  await t('voces_skills.json tiene 91 entradas válidas (79 skills reales + 12 acompañante) y todos sus .ogg existen con cabecera OggS', () => {
    const jsonPath = path.join(raiz, 'voces_skills.json');
    assert.ok(fs.existsSync(jsonPath), 'Falta voces_skills.json');
    const lista = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    assert.strictEqual(lista.length, 91, 'Se esperaban 91 entradas en voces_skills.json');
    const ids = new Set();
    for (const item of lista) {
      assert.ok(item.id && item.personaje && item.texto && item.archivo_audio);
      assert.ok(item.archivo_audio.startsWith('assets/audio/voces/skills/') && item.archivo_audio.endsWith('.ogg'));
      assert.ok(!ids.has(item.id), `ID duplicado en voces_skills.json: ${item.id}`);
      ids.add(item.id);
      const p = path.join(raiz, item.archivo_audio);
      assert.ok(fs.existsSync(p), `Falta audio skill ${item.archivo_audio}`);
      const buf = fs.readFileSync(p);
      assert.ok(buf.length > 512, `Audio vacío o corrupto: ${item.archivo_audio}`);
      assert.strictEqual(buf.slice(0, 4).toString('ascii'), 'OggS', `Cabecera no OGG en ${item.archivo_audio}`);
    }
  });

  await t('Voces.hablarSkill y hablarCompaneroSkill reproducen el nombre exacto de cada skill y respetan cooldowns', async () => {
    const mock = crearMockAudio(false);
    global.Audio = mock.FakeAudio;

    const dialogos = JSON.parse(fs.readFileSync(path.join(raiz, 'dialogos_voces.json'), 'utf8'));
    const skills = JSON.parse(fs.readFileSync(path.join(raiz, 'voces_skills.json'), 'utf8'));
    await Voces.cargarDesdeArray(dialogos);
    Voces.agregarEntradas(skills);
    Voces.activar(true);
    Voces.detener();
    Voces.resetCooldownsCombate();

    // Ataques básicos no disparan voz de skill
    assert.strictEqual(await Voces.hablarSkill('attack', 'guerrero'), false);
    assert.strictEqual(await Voces.hablarSkill('disparo', 'cazador'), false);

    // Cada skill reproduce su archivo exacto sk_<skillId>.ogg
    assert.strictEqual(await Voces.hablarSkill('bw_bolt', 'cazador'), true);
    assert.strictEqual(mock.instancias[mock.instancias.length - 1].src, 'assets/audio/voces/skills/sk_bw_bolt.ogg');
    assert.strictEqual(await Voces.hablarSkill('bola_fuego', 'mago'), false, 'Debe respetar cooldown tras skill reciente');

    Voces.resetCooldownsCombate();
    assert.strictEqual(await Voces.hablarSkill('nova', 'mago'), true);
    assert.strictEqual(mock.instancias[mock.instancias.length - 1].src, 'assets/audio/voces/skills/sk_nova.ogg');

    // Con sinCooldown, un diálogo modal (prioridad alta) no es interrumpido por una skill (prioridad baja)
    await Voces.hablarPorId('prologo_01', { prioridad: 'alta' });
    assert.strictEqual(await Voces.hablarSkill('sismo', 'guerrero', { sinCooldown: true }), false);
    Voces.detener();

    // Acompañante mapea correctamente los 4 arquetipos y respeta cooldown
    Voces.resetCooldownsCombate();
    assert.strictEqual(await Voces.hablarCompaneroSkill('elian', 'cura'), true);
    assert.strictEqual(mock.instancias[mock.instancias.length - 1].src, 'assets/audio/voces/skills/comp_elian_cura.ogg');
    assert.strictEqual(await Voces.hablarCompaneroSkill('lyra', 'ataque'), false, 'Debe respetar cooldown del acompañante');
    Voces.detener();
  });

  await t('sfx/prompts.json, sfx/manifest.json y generar_sfx_colab.ipynb son válidos y consistentes', () => {
    const prompts = JSON.parse(fs.readFileSync(path.join(raiz, 'sfx/prompts.json'), 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(path.join(raiz, 'sfx/manifest.json'), 'utf8'));
    const nb = JSON.parse(fs.readFileSync(path.join(raiz, 'generar_sfx_colab.ipynb'), 'utf8'));

    assert.ok(Array.isArray(prompts.sonidos) && prompts.sonidos.length >= 28);
    const ids = new Set(prompts.sonidos.map(s => s.id));
    for (const reqId of ['fuego_bola', 'fuego_explosion', 'hielo_lanza', 'hielo_ventisca', 'escudo_magico', 'sombra_paso', 'veneno_burbuja', 'arco_disparo', 'flecha_impacto', 'lluvia_flechas']) {
      assert.ok(ids.has(reqId), `Falta prompt ${reqId} en sfx/prompts.json`);
    }
    for (const [clave, rutas] of Object.entries(manifest)) {
      assert.ok(Array.isArray(rutas) && rutas.length > 0, `Entrada vacía en manifest: ${clave}`);
      for (const r of rutas) {
        assert.ok(fs.existsSync(path.join(raiz, r)), `Falta archivo de manifest: ${r}`);
      }
    }
    assert.ok(Array.isArray(nb.cells) && nb.cells.length >= 4, 'Notebook Colab incompleto');
  });

  await t('generar_voces_chatterbox_colab.ipynb y tools/generar-voces-chatterbox.py son válidos y completos', () => {
    const scriptPath = path.join(raiz, 'tools/generar-voces-chatterbox.py');
    const nbPath = path.join(raiz, 'generar_voces_chatterbox_colab.ipynb');
    assert.ok(fs.existsSync(scriptPath), 'Falta tools/generar-voces-chatterbox.py');
    assert.ok(fs.existsSync(nbPath), 'Falta generar_voces_chatterbox_colab.ipynb');
    const py = fs.readFileSync(scriptPath, 'utf8');
    assert.ok(
      py.includes('ChatterboxMultilingualTTS') &&
      py.includes('PERFILES_EMOCION') &&
      (py.includes('language_id="es"') || py.includes('"language_id": "es"'))
    );
    const nb = JSON.parse(fs.readFileSync(nbPath, 'utf8'));
    assert.strictEqual(nb.metadata.colab.gpuType, 'T4');
    assert.ok(Array.isArray(nb.cells) && nb.cells.length >= 6);
  });

  console.log(`\nTodas las pruebas de voces pasaron (${n}/${n}).`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
