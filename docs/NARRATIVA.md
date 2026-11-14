# Diseño Narrativo del Juego Completo — Crónica de Aden

Este documento define la arquitectura narrativa de la rama **`juego-completo`**, conectando **combate**, **farmeo**, **misiones**, **facciones de la plaza** y **exploración** dentro de un mismo hilo argumental coherente.

---

## 1. Premisa central

Tras sobrevivir a una emboscada de criaturas con injertos metálicos en la fragua del **Herrero Brann**, el protagonista y el aldeano **Rowan** (`js/acompanante.js`) descubren que la plaga que asola las rutas de Aden no es natural: parte del cónclave de los **Sabios** está secuestrando aldeanos, alimentando fundiciones clandestinas y monopolizando el acero mientras intenta despertar un **Titán mecánico** bajo el Santuario de Piedra y Luz.

---

## 2. Estructura en 4 Actos (`js/historia.js`)

| Acto | Capítulos | Título | Conflicto y función jugable |
|---|---|---|---|
| **Acto I** | 1–5 | *Emboscada y Forja Clandestina* | Supervivencia y guerrilla. El farmeo recolecta materiales (`belt`, `boots`, `gloves`, `torso`, `helmet`) para que Brann te equipe en secreto. Desbloquea a Rowan (Cap. 3) y el *Impacto sísmico* `Q` (Cap. 4). |
| **Acto II** | 6–10 | *Reliquias y Poder Antiguo* | Infiltración y revelación. Templas hombreras en la *Fuente Arcana* (Cap. 6), forjas tu arma con hierro salvaje (Cap. 7), liberas la *Explosión nova* `E` de los reyes antiguos (Cap. 8), hallas el diario del guarda en la *Cabaña del Ermitaño* (Cap. 9) y rompes el cerco hacia las cumbres (Cap. 10). |
| **Acto III** | 11–14 | *Ruptura del Monopolio y Asalto al Titán* | Contraofensiva. Consagras el *Altar Rúnico* (Cap. 11) para romper el monopolio comercial eclesial (forja y tienda Nv. 12+), derribas la cúpula de élite (Cap. 12), entras al *Santuario de Piedra y Luz* (Cap. 13) y destruyes al *Señor de las Bestias mecánicas* (Cap. 14). |
| **Acto IV** | 15–16 | *Purificación y Liberación de Aden* | Resolución. Purificas el aceite oscuro en la *Fuente Arcana* (Cap. 15) y regresas a la plaza para el juicio público junto a la Erudita Mirel, recibiendo el título de **Campeones de Aden** (Cap. 16). |
| **Epílogo** | Post-16 | *Campeones de Aden* | Endgame abierto: limpieza de cabañas fronterizas (100 monstruos), caza de jefes de zona y exploración de las *Mazmorras Ancestrales*. |

---

## 3. Cómo encaja cada pilar en la trama

### Combate (`js/combat.js`, `js/heroe.js`)
- **Curva de peligro del mapa:** Los caminos entre pueblos escalan de nivel desde el pueblo inicial. Las zonas altas representan territorio controlado por autómatas y bestias alteradas; intentar cruzarlas sin equipo ni nivel refleja la superioridad militar del cónclave.
- **Habilidades con peso dramático:** *Impacto sísmico* (enseñado por Tamsin, aunque Elara advierte que alimenta el despertar subterráneo) y *Explosión nova* (poder real antiguo, cuyo despertar hace brillar los ojos de Rowan con un halo ámbar) unen progresión de combate y misterio.
- **Combate acompañado:** Rowan progresa luchando a tu lado, avisa ante enemigos duros o salud baja y culmina su arco deteniendo el golpe letal del titán en el Cap. 14.

### Farmeo y Economía (`js/equipo.js`, `js/items.js`)
- **Recolección con propósito (Cap. 1–7):** Cada cacería de la Crónica extrae componentes concretos (*correas de cuero y placas, tendones, garras, caparazón, astas óseas anti-telepatía, hierro salvaje*) para la fragua clandestina de Brann.
- **Monopolio y apertura económica (Cap. 11):** El bloqueo de forja directa y compra superior antes de nivel 12 / Cap. 11 tiene una explicación política: los Sabios fiscalizan los gremios hasta que consagras el *Altar Rúnico*.
- **Endgame de resistencia:**
  - Las **5 cabañas especiales** (`js/lugares-secretos.js`) encargan abatir 100 monstruos para despejar rutas, costas y cultivos arcanos.
  - Las **Mazmorras Ancestrales** (`js/mazmorras.js`) concentran élites (`×4` y `×8`) y jefes que custodian **hojas de armadura** y **arena de forja** para piezas superiores.

### Misiones y Facciones de la Plaza (`js/mision-zona.js`, `visor-mundo.html`)
1. **La Crónica Principal (`js/historia.js`):** Thriller político y arcano que guía el viaje por el continente.
2. **Encargos de Zona (`js/mision-zona.js`):** Misiones cotidianas de aldeanos (*Doña Hilde, Tomasa Pico, Ferran el Cojo*, etc.) que muestran el impacto humano de la plaga en cada aldea.
3. **Facciones de la plaza (`visor-mundo.html`):**
   - **Hermana Ysolde (`guru-3`):** Agente doble dentro del cónclave; entrena tus runas y técnicas en la plaza bajo cobertura, desvía patrullas en el Cap. 3, libera la Nova en el Cap. 8 y rompe abiertamente con los Sabios en el Acto III–IV.
   - **Comandante Kaelen (`serv-comandante`):** Recibe pruebas incriminatorias conforme avanzas en los capítulos de la Crónica para poner a la guarnición del lado del pueblo.
   - **Varek "El Ojo Tuerto", Madre Cynthia y Saelen el Desollador:** Submundo clandestino que prospera en las grietas del bloqueo de los Sabios.

---

## 4. Evolución implementada en la rama `juego-completo`

- **Portada de Juego Completo (`#modal-portada`):** Al abrir `visor-mundo.html`, una pantalla de título muestra el nombre del mundo, el Acto/capítulo activo y las opciones de *Continuar Aventura*, *Nueva Aventura*, *Gestionar Partidas* o entrar al *Visor Libre* (`?zona=` y `?visor=1` omiten la portada para entradas directas).
- **Prólogo narrativo en 2 pasos (`#modal-prologo`):** Al crear una partida nueva (`crearPartida`), se muestra primero la *Emboscada en la Fragua de Brann* —enlazada con el Capítulo 1— y después el *Juramento en la Plaza* para elegir compañero (*Rowan, Lyra, Elian o Brenda*), persistiendo correctamente `prologoVisto` en cada ranura.
- **Hitos dramáticos de Actos II–IV (`HistoriaLib.HITOS_NARRATIVOS`):** Al cerrar los capítulos clave (`5`, `8`, `10`, `11`, `14`, `16`), el modal de capítulo (`#cap-hito`) resalta las transiciones de Acto, la ruptura de la Hermana Ysolde, la caída del monopolio de los Sabios y el Juicio Público de la Erudita Mirel.
- **Conexión narrativa de Cabañas y Mazmorras (`LugaresSecretosLib.contextoCabana`, `MazmorrasLib.contextoNarrativoMazmorra`):** Cada una de las 5 cabañas fronterizas y cada Mazmorra Ancestral contextualizan sus objetivos de farmeo (100 criaturas, élites `×4`/`×8` y arena de forja) dentro del conflicto de Aden, junto al conteo explícito de pruebas para el Comandante Kaelen.
- **Títulos persistentes, encargos vecinales y compañero reactivo (`HeroeLib.limpiarHeroe`, `MisionZonaLib.contextoNarrativoZona`, `AcompananteLib.darConsejoGuia`):** El título honorífico **Campeones de Aden** se guarda y luce en la ficha del héroe y la portada; los encargos de aldea y la guía táctica del acompañante reflejan el Acto actual.
- **Diálogos dinámicos por Acto (`HistoriaLib.fraseContextualNpc`):** Los 5 gurús y los NPCs de servicio reaccionan al acto actual (Actos I–IV y Epílogo) y al capítulo activo.
- **Feedback narrativo de farmeo (`HistoriaLib.materialDeCapitulo`):** Al abatir monstruos en capítulos de forja, el HUD y los avisos muestran el material recuperado rumbo al yunque de Brann.
- **Visibilidad del Acto y del Monopolio:** La Crónica (`#cronica`), el HUD de misión (`#mision`) y las tiendas de **Brann** y **Tovi** reflejan explícitamente el Acto actual y el estado del monopolio de los Sabios (Cap. 11).

---

## 5. Mundo Oficial Propio: *Valdris · Tierras del Sol Quebrado* y Generador de Historia

En lugar de depender de un mundo aleatorio genérico, la rama `juego-completo` incluye un mundo diseñado a mano (`mundos/valdris.mundo.json` y `js/mundo-campana.js`, construido y validado por `tools/construir-mundo-oficial.mjs`) junto con un **Generador de Historia** (`HistoriaLib.generarHistoriaParaMundo(world)`):

### Geografía de Valdris (Semilla `271828`)
- **7 Pueblos escalonados por región:**
  1. **Albaferro** (`t_1`, Nv. 1 · inicio): ciudad forjadora donde sobrevive el yunque secreto de Brann.
  2. **Puerto Brisal** (`t_2`, Nv. 3): puerto mercante de la bahía bajo vigilancia inquisitorial.
  3. **Robledal Sombrío** (`t_3`, Nv. 5): aldea del bosque cuya savia se tiñó de gris.
  4. **Limoquieto** (`t_4`, Nv. 8): enclave palustre donde boticarios y desertores ocultan registros alquímicos.
  5. **Ámbar de Dunas** (`t_5`, Nv. 11): ciudad caravana del desierto dorado ligada al Altar Rúnico.
  6. **Atalaya de Escarcha** (`t_6`, Nv. 14): bastión nórdico en la taiga.
  7. **Trono de Ceniza** (`t_7`, Nv. 18): fortaleza volcánica junto al cráter final.
- **8 Caminos en tierra firme**, **12 Zonas de combate** con enemigos reales de `ENEMY_GLB_INDEX` y **3 Laberintos diseñados** (`z_4` *Laberinto del Seto Maldito*, `z_7` *Cañón del Pacto de Arena* y `z_10` *Garganta de Obsidiana*), coronados por **Aurelio, Titán del Sol Quebrado** en el *Cráter del Sol Quebrado* (`z_12`).
- **3 Mazmorras Ancestrales:** *Cripta de las Raíces Negras* (Nv. 8), *Catacumbas del Sol Enterrado* (Nv. 13) y *Sanctum del Trono Quebrado* (Nv. 18).

### Generador de Historia (`HistoriaLib.generarHistoriaParaMundo`)
- Genera un objeto `world.historia` completo (prólogo, 4 Actos, epílogo, 16 capítulos, hitos y diálogos contextuales de NPCs) adaptado a los nombres reales de pueblos, zonas, laberintos, lugares secretos, mazmorras y jefes de cualquier mundo.
- Disponible automáticamente al crear un mundo nuevo y bajo demanda en el editor (`index.html` → **✨ Generar Historia**), además de venir pregenerado en la campaña oficial de **Valdris** (que se carga por defecto en `index.html` y `visor-mundo.html`).

