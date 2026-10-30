// Puente para la prueba con Three r186: el resto del juego espera THREE como global (como con r128).
// Los módulos ES no exponen sus exportaciones como global, así que aquí se reúnen en window.THREE.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader as BaseGLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

class GLTFLoader extends BaseGLTFLoader {
  constructor(manager) {
    super(manager);
    this.setMeshoptDecoder(MeshoptDecoder);
  }
}

window.THREE = Object.assign({}, THREE, { OrbitControls, GLTFLoader, MeshoptDecoder });
