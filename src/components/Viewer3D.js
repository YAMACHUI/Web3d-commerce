import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { loadModel } from '../utils/modelLoader';

export class Viewer3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();

    // Propriétés principales
    this.modelColors = {};
    this.availableModels = {
      'First Model': './assets/models/First.glb',
      'Second Model': './assets/models/second.glb',
      'Third Model': './assets/models/bois.glb',
      'Human Model':'./assets/models/Dying.glb',
      'Aerien Model':'./assets/models/bird.glb'
    };
    
    this.currentModel = null;
    this.currentModelName = null;
    this.currentColor = 0x00ffcc;
    this.onModelChanged = () => {};

    THREE.ColorManagement.enabled = true;

    // Initialisation
    this.initRenderer();
    this.initCamera();
    this.initLights();
    this.initControls();
    this.setupEventListeners();
    this.animate();
    
     // Charger un modèle par défaut
    this.loadSelectedModel('First Model');
  }

  /** Initialisation du rendu WebGL */
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setSize(this.container.clientWidth, 500);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.setClearColor(0xffffff);
  }

  /**Initialisation de la caméra */
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / 500,
      0.1,
      1000
    );
    this.camera.position.z = 7;
  }

  /**Initialisation des lumières */
  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);
  }
  
  /**  Initialisation des contrôles utilisateur */
  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
  }

  /**Chargement d’un modèle */
  async loadSelectedModel(modelName) {
    if (this.currentModelName === modelName) return;
    
    // Sauvegarder la couleur du modèle courant avant de changer
    if (this.currentModelName) {
      this.modelColors[this.currentModelName] = this.currentColor;
    }

    const modelPath = this.availableModels[modelName];
    if (!modelPath) {
      console.error('Model path not found for:', modelName);
      return;
    }

    // Retirer le modèle actuel
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
    }

    try {
      const { model } = await loadModel(this.scene, modelPath);
      this.currentModel = model;
      this.currentModelName = modelName;
      
      // Restaurer la couleur précédente ou utiliser la couleur par défaut
      this.currentColor = this.modelColors[modelName] || 0x00ffcc;
      this.changeColor(this.currentColor);
      
      // Notifier l’UI
      this.onModelChanged(this.currentColor);
      
      // Réinitialiser la caméra
      this.resetCamera();
    } catch(error) {
      console.error('Failed to load model:', error);
      this.createFallbackModel();
    }
  }

  /**Modèle de secours (cube rouge) */
  createFallbackModel() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.currentModel = mesh;
  }

   /**Réinitialiser la caméra selon la taille du modèle */
  resetCamera() {
    if (this.currentModel) {
      const box = new THREE.Box3().setFromObject(this.currentModel);
      const size = box.getSize(new THREE.Vector3()).length();
      this.camera.position.z = size * 1.5;
    } else {
      this.camera.position.z = 3;
    }
    this.controls.reset();
  }

  /**Changer la couleur du modèle */
  changeColor(colorHex) {
    this.currentColor = colorHex;

    if (this.currentModelName) {
      this.modelColors[this.currentModelName] = colorHex;
    }
    
    if (this.currentModel) {
      this.currentModel.traverse((child) => {
        if (child.isMesh && child.userData.canChangeColor !== false) {
          child.material.color.setHex(colorHex);
        }
      });
    }
  }

  /**Gestion des événements (resize, etc.) */
  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / 500;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, 500);
    });
  }

   /**Boucle d’animation */
animate() {
  const animateLoop = () => {
    requestAnimationFrame(animateLoop);
    
    if (this.currentModel) {
      this.currentModel.rotation.y += 0.01; // rotation automatique
    }
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
  animateLoop();
}
}