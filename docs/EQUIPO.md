# Equipo, objetos y drops

Implementado en `js/equipo.js`. Pruebas en `test/equipo.test.js`.

## Objetos
Un objeto es una **instancia** de una pieza del catálogo (`estudio-armaduras/catalogo.json`, copia de `armaduras-glb/piezas/catalogo.json`):
`{ uid, piezaId, ranura, idx, nombre, nivel, estado, ataque | defensa }`.

- **Estado** de 0 (malo) a 1 (perfecto). Sus estadísticas van de la mitad al total de la base de la pieza.
- Varias cotas pueden tener el mismo nombre con distinto estado.
- Base: armadura `defensa = 1 + 0,5 × nivel`; arma `ataque = 2 + 1,5 × nivel`.

## Inicio
- Cota inicial (capa interior, `underlayer.2`) con estado perfecto.
- Arma básica: la de menor ataque de nivel 1. Basta para derrotar monstruos de nivel 1 a 3.

## Drops
- Monstruo normal: 5 % de probabilidad de soltar algo. El jefe suelta siempre.
- **Hasta nivel 5**: solo caen cotas de nivel ≤ el del monstruo, cada una con un estado aleatorio.
- **Desde nivel 6**: caen armaduras de su rango (5 niveles por debajo) y armas.
- **Armas**: caen primero las de menor ataque. Se abren más con el nivel del monstruo (`1 + nivel/3` opciones).

## Herrero
Fabrica una pieza de nivel ≤ nivel del héroe con estado perfecto. Cuesta 12 de oro × nivel.

## Daño
El ataque del arma equipada se suma al daño base del héroe (`CombatLib.heroDamage`).
