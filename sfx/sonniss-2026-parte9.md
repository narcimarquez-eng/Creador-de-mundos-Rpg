# Sonniss GDC 2026, parte 9: qué sirve para combate y magia

Revisado a partir de la lista de archivos (347 sonidos). Esta parte trae **unos 25 sonidos útiles** de los 19 efectos
de `sfx/prompts.json`. Faltan sobre todo la **parada con chispa**, el **golpe contra escudo** y un **rayo cercano
limpio**: habrá que buscarlos en otras partes del bundle.

| Efecto del juego | Archivo de la parte 9 (librería) |
|---|---|
| Choque de espadas (parada, bloqueo) | `METLImpt_METAL SWING HIT Weapon Swing To Metallic Body Impact And Resonant Tail 01` (Melee Weapons Pack 2) ⭐ |
| Choque / corte metálico | `WEAPSwrd_Sword Slide Cuts, Metallic, Impact CM4 2` (Historical Weapons Vol. 2) ⭐ |
| Golpe pesado (mandoble, hendidura) | `SWSH_SWING IMPACTS Quick Heavy Weapon Swing To Thud Impact Var 01` (Melee Weapons Pack 2) |
| Espadas trabadas, roce | `METLFric_SWING SCRAPE Swift Melee Weapon Swing With A Long Blade 14` (Melee Weapons Pack 2) |
| Roce metálico tenso (capa) | `DSGNTonl_Metal Scrape Low Tonal LFE 4` (Moaning Metal) |
| Tajo al aire (combo, tajo giratorio) | `DSGNStngr_Action Deploy Units Sword Slice Special Move Layered Swish 04` (Tower Defense Game) |
| Golpe que acierta (capa de impacto) | `FGHTImpt_Combat Punch Impact Light Hit … Quick Smack 05` (Anime Game) · `FGHTImpt_4 x Punch, Body 02` (Cinematic Fight Vol. 1) |
| Rayo: impacto con trueno (Tornillo triple 🌩) | `STORM_Texas Rain Thunder Initial Crash Boom Storm 01 Clap Lightning` (Public Spaces – Storms…); tiene lluvia, recortar el inicio |
| Rayo: carga | `ELECArc_ArcPowerUpDesign04` (Arc) ⭐ |
| Rayo en cadena, chispazos | `ELECArc_ArcDesign15` · `ELECBuzz_Buzz27` (Arc) ⭐ |
| Espada electrificada | `ELECMisc_Impact Electric Tonal Deep Movement Motion Hiss Glitch 01` (Elemental Mutation) + el tajo al aire |
| Trueno lejano (ambiente) | `THUN_Interior Thunder Rumble_JF_INT Storm_01` (Interior Wind Rain and Storms) |
| Explosión nova 💥 | `EffectiveTrailer_Booms_Vol2_011 / 075 / 214` (Effective Trailer Booms Vol. 2) + capa de `magic, energy flow…` |
| Impacto sísmico 🪨 | `Woosh Debris` (Colossal Impacts) + un boom de Trailer Booms |
| Proyectil de báculo | `magic, energy flow, astonishment-001` · `magic, action gesture, evil presence, onslaught-004` (Emotion and Magic) |
| Aliento de fuego | `FIREWhsh_Whoosh Fire Deep Growl Monster Saturated Crisp 03` (Elemental Mutation) ⭐ |
| Aliento de hielo | `ICEBrk_Skill Freeze Whoosh Break Impact Layered Movement Shatter 03` (Tower Defense Game) ⭐ · `ice, surface cracking, fissure, fast, hard-003` (100 kHz Designed Ice) |
| Curación, poción | `MAGAngl_Magic Light Spell Enchantment Potion Effect Tonal Bright 03` (Fantasy Game 2) ⭐ · `DSGNStngr_Power Up Bright Positive … Shimmer 05` (Anime Game) |
| Muerte de enemigo | `EXPLDsgn_Explosion Small Blast Enemy Death Crunchy Boom … 03` (Anime Game) |
| Gritos de esfuerzo del héroe (extra) | Vox Hominis – Human Effort Voices · Anime Fight Voices Vol. 1 y 2 |

⭐ = encaja casi tal cual.

Con la parte 9 descomprimida, `node tools/importar-sonniss.mjs <carpeta> --copiar 3` los saca a `sfx/`.
