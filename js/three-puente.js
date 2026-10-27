// Puente para la prueba con Three r186: el resto del juego espera THREE como global (como con r128).
// Los módulos ES no exponen sus exportaciones como global, así que aquí se reúnen en window.THREE.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

window.THREE = Object.assign({}, THREE, { OrbitControls, GLTFLoader });
