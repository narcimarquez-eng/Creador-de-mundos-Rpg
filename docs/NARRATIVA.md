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

- **Diálogos dinámicos por Acto (`HistoriaLib.fraseContextualNpc`):** Los 5 gurús y los NPCs de servicio reaccionan al acto actual (Actos I–IV y Epílogo) y al capítulo activo.
- **Feedback narrativo de farmeo (`HistoriaLib.materialDeCapitulo`):** Al abatir monstruos en capítulos de forja, el HUD y los avisos muestran el material recuperado rumbo al yunque de Brann.
- **Visibilidad del Acto y del Monopolio:** La Crónica (`#cronica`), el HUD de misión (`#mision`) y las tiendas de **Brann** y **Tovi** reflejan explícitamente el Acto actual y el estado del monopolio de los Sabios (Cap. 11).
