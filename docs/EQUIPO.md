# Equipo, objetos, armaduras y drops

Implementado en `js/armaduras.js`, `js/equipo.js` y `js/heroe.js`. Pruebas en `test/armaduras.test.js` y `test/equipo.test.js`.

## Clases de armadura y grados (D · C · B · A · S · SR)
El sistema organiza las armaduras en **3 clases** y **6 grados** con al menos **3 conjuntos completos del selector (`ARMOR_LOOKS`) por cada clase y grado** (**54 conjuntos**, 270 piezas en `estudio-armaduras/catalogo.json`):

- **Pesada (`pesada`, Guerrero)**: multiplicador de defensa ×1,35, +Vida máxima y +Reducción de daño físico (y +Reflejo desde nivel 15).
- **Ligera (`ligera`, Cazador y Pícaro)**: multiplicador de defensa ×1,00, +Probabilidad de crítico, +Velocidad de movimiento y +Velocidad de ataque (y -Enfriamiento de esquiva desde nivel 12).
- **Mago (`mago`, Mago)**: multiplicador de defensa ×0,72, +Maná máximo, +Poder Mágico y +Regeneración de maná (y +Escudo arcano desde nivel 15).

Grados por nivel:
- **D** (Nv 1–7, ×1,00) · **C** (Nv 8–14, ×1,15) · **B** (Nv 15–22, ×1,35) · **A** (Nv 23–30, ×1,60) · **S** (Nv 31–39, ×1,90) · **SR** (Nv 40–50, ×2,30).

## Habilidades propias de cada conjunto
Cada conjunto de 5 piezas (`helmet`, `torso`, `gloves`, `pants`, `boots`) posee **3 habilidades temáticas**:
1. **1 pieza (Pasiva)**: bonificación inmediata al equipar cualquier pieza del conjunto.
2. **3 piezas (Conjunto)**: bonificación táctica de medio conjunto.
3. **5 piezas (Suprema)**: bonificación completa al vestir el diseño íntegro.

En `visor-mundo.html`, el visor dedicado de armaduras (botón `🛡️ Armaduras`, tecla `U`, o pestaña en Crónica `C` y botón en Héroe `P`) muestra las 3 clases, los 54 diseños ilustrados con su paleta PBR real, la vista previa 3D interactiva del estudio y sus habilidades.

## Objetos
Un objeto es una **instancia** de una pieza del catálogo (`estudio-armaduras/catalogo.json`):
`{ uid, piezaId, ranura, idx, nombre, nivel, grado, tipoArmadura, armorLook, setId, setNombre, estado, statsArmadura, ataque | defensa }`.

- **Estado** de 0 (malo) a 1 (perfecto). Sus estadísticas van de la mitad al total de la base de la pieza.
- Base: arma `ataque = (2 + 1,5 × nivel) × multGrado`; armadura calculada en `ArmadurasLib.statsDePieza(pieza, estado)` según clase, nivel y grado.

## Inicio
- Armadura inicial acorde a la profesión (`pesada_D_1` torso 1 para Guerrero, `ligera_D_1` torso 2 para Cazador/Pícaro, `mago_D_1` torso 21 para Mago) con estado perfecto.
- Arma básica de nivel 1 acorde a la profesión (y escudo inicial para Guerrero).

## Drops
- Monstruo normal: 12 % de probabilidad de soltar algo. El jefe suelta siempre.
- **Hasta nivel 5**: caen piezas de armadura de nivel ≤ el del monstruo (priorizando cotas si existen), cada una con estado aleatorio.
- **Desde nivel 6**: caen armaduras de su rango y armas.
- **Niveles del catálogo**: de 1 a 48+. Las armas se reparten dentro de su familia (`legado`, `espada`, `mandoble`, `hacha`, `maza`, `daga`, `lanza`, `baculo`, `cetro`, `arco`).

## Herrero y Mercader
- Herrero: fabrica una pieza de nivel ≤ nivel del héroe con estado perfecto (`12 × nivel` de oro) o forja hojas con arena (`2 × nivel` de arena).
- Mercader: vende piezas de nivel ≤ nivel del héroe con calidad estándar (`0,75`).
