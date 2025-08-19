// Classe Dashboard : interface d'administration pour gérer les modèles 3D et générer du code d'intégration
export class Dashboard {
      // On reçoit un objet viewer (classe qui gère le rendu 3D)
  constructor(viewer3D) {
    this.viewer = viewer3D;
    this.isVisible = false;// état de visibilité du tableau de bord
    // Sélection du premier modèle disponible (ou null si aucun)
    this.selectedModel = Object.keys(this.viewer.availableModels)[0] || null; 

// Création de l'interface utilisateur et ajout des événements
this.setupUI();
this.setupEventListeners();

// Ajout d’un système d’onglets (Gestion des modèles / Code d'intégration)
this.tabs = document.createElement('div');
this.tabs.className = 'dashboard-tabs';
this.tabs.innerHTML = `
  <button class="tab-btn active" data-tab="models"><i class="fas fa-cube"></i> Modèles</button>
  <button class="tab-btn" data-tab="integration"><i class="fas fa-code"></i> Code</button>
`;
this.container.prepend(this.tabs);

// Logique des onglets → affichage/masquage des sections
this.tabs.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const tab = e.target.dataset.tab;
    document.querySelectorAll('.dashboard-section').forEach(sec => {
      sec.style.display = sec.dataset.tab === tab ? 'block' : 'none';
    });
    this.tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  });
});
  }

 /**
   * Création de l'interface principale du tableau de bord
   */
  setupUI() {
    this.container = document.createElement('div');
    this.container.className = 'dashboard-panel';

     // Titre du tableau de bord
    const title = document.createElement('h2');
    title.textContent = "Administration Web3D";
    this.container.appendChild(title);

    // Section pour gérer les modèles (upload, liste, suppression)
    this.createModelManagementSection();

    // Section pour générer le code d'intégration HTML+CSS+JS
    this.createIntegrationSection();

    document.body.appendChild(this.container);
  }

    /**
   * Section de gestion des modèles : upload et liste des modèles disponibles
   */
  createModelManagementSection() {
    const section = document.createElement('div');
    section.className = 'dashboard-section';
    section.dataset.tab = "models"; 

   // Titre de la section
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = "Gestion des Modèles";
    section.appendChild(sectionTitle);

    // Bloc pour uploader un modèle GLB/GLTF
    const uploadGroup = document.createElement('div');
    uploadGroup.className = 'dashboard-group';
    
    const uploadLabel = document.createElement('label');
    uploadLabel.textContent = "Uploader un modèle (GLB/GLTF):";
    uploadGroup.appendChild(uploadLabel);

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = '.glb,.gltf';
    this.fileInput.className = 'dashboard-control';
    uploadGroup.appendChild(this.fileInput);

    this.uploadButton = document.createElement('button');
    this.uploadButton.textContent = "Uploader";
    this.uploadButton.className = 'dashboard-button';
    uploadGroup.appendChild(this.uploadButton);

    section.appendChild(uploadGroup);

    // Bloc pour afficher la liste des modèles disponibles
    const listGroup = document.createElement('div');
    listGroup.className = 'dashboard-group';

    const listLabel = document.createElement('label');
    listLabel.textContent = "Modèles disponibles:";
    listGroup.appendChild(listLabel);

    this.modelList = document.createElement('div');
    this.modelList.className = 'model-list';
    this.updateModelList(); // mise à jour dynamique de la liste
    listGroup.appendChild(this.modelList);

    section.appendChild(listGroup);
    this.container.appendChild(section);
  }

    /**
   * Section d’intégration : génère le code complet (HTML, CSS, JS) pour réutiliser un modèle
   */
  createIntegrationSection() {
    const section = document.createElement('div');
    section.className = 'dashboard-section';
    section.dataset.tab = "integration";

    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = "Code d'intégration complet (HTML+CSS+JS)";
    section.appendChild(sectionTitle);

    // Sélecteur pour choisir le modèle dont on veut générer le code
    const selectGroup = document.createElement('div');
    selectGroup.className = 'dashboard-group';

    const selectLabel = document.createElement('label');
    selectLabel.textContent = "Choisir un modèle :";
    selectGroup.appendChild(selectLabel);

    this.integrationModelSelect = document.createElement('select');
    this.integrationModelSelect.className = 'dashboard-control';
    this.updateModelSelect();
    selectGroup.appendChild(this.integrationModelSelect);

    section.appendChild(selectGroup);

    // Zone d’affichage du code complet
    this.codeContainer = document.createElement('div');
    this.codeContainer.className = 'dashboard-group';
    section.appendChild(this.codeContainer);

    // Met à jour le code pour le modèle par défaut
    this.updateIntegrationCode();

    this.container.appendChild(section);
  }

    /**
   * Génère un bloc de code affiché dans un textarea (avec bouton copier)
   */
  createCodeBlock(labelText, codeContent) {
    const group = document.createElement('div');
    group.className = 'dashboard-group';

    const label = document.createElement('label');
    label.textContent = `${labelText} :`;
    group.appendChild(label);

    const textarea = document.createElement('textarea');
    textarea.className = 'dashboard-code';
    textarea.readOnly = true;
    textarea.value = codeContent;
    group.appendChild(textarea);

     // Bouton pour copier le code
    const copyBtn = document.createElement('button');
    copyBtn.className = 'dashboard-button small';
    copyBtn.textContent = "Copier";
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeContent).then(() => {
        copyBtn.textContent = "Copié !";
        setTimeout(() => copyBtn.textContent = "Copier", 2000);
      });
    });
    group.appendChild(copyBtn);

    return group;
  }

    /**
   * Met à jour et affiche le code HTML+CSS+JS d’intégration pour un modèle sélectionné
   */
  updateIntegrationCode() {
    const modelName = this.integrationModelSelect.value;
    const modelPath = this.viewer.availableModels[modelName];
    this.codeContainer.innerHTML = '';

    const fileName = modelPath.split('/').pop();

 // Ici on génère une page HTML complète avec Three.js et GLTFLoader
    const fullCode = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Visualiseur 3D - ${fileName}</title>
<style>
body { margin:0; padding:0; font-family:Arial,sans-serif; background:#f5f5f5; display:flex; flex-direction:column; align-items:center; min-height:100vh; }
#web3d-container { width:100%; height:70vh; margin:20px auto; background:#f0f0f0; border:1px solid #ddd; box-shadow:0 2px 10px rgba(0,0,0,0.1); }
.controls-panel { background:white; padding:15px; border-radius:8px; margin:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1); display:flex; flex-wrap:wrap; gap:15px; align-items:center; }
.control-group { display:flex; flex-direction:column; gap:5px; }
label { font-weight:bold; font-size:14px; }
button { padding:8px 15px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; transition:0.3s; }
button:hover { background:#45a049; }
input[type="color"] { width:50px; height:30px; cursor:pointer; }
</style>
</head>
<body>
<h1 id="model-title"></h1>

<div id="web3d-container"></div>
<div class="controls-panel">
  <div class="control-group">
    <label>Contrôles :</label>
    <button id="reset-view">Réinitialiser la vue</button>
  </div>
  <div class="control-group">
    <label>Couleur :</label>
    <input type="color" id="model-color" value="#00ffcc">
  </div>
</div>

<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.155.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.155.0/examples/jsm/"
  }
}
</script>

<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('web3d-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0xf0f0f0);
container.appendChild(renderer.domElement);

// OrbitControls(rotation, zoom, pan caméra)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5,10,7.5);
scene.add(directionalLight);

let currentModel = null;
let currentColor = new THREE.Color(0x00ffcc);

// Charger le modèle depuis URL ou fallback

const titleParam = new URLSearchParams(window.location.search).get('title') || 'Visualiseur 3D';
const urlParams = new URLSearchParams(window.location.search);
const modelFile = urlParams.get('model') || './${fileName}';

document.getElementById('model-title').textContent = titleParam;

const loader = new GLTFLoader();
loader.load(
  "https://cdn.jsdelivr.net/gh/YAMACHUI/Web3d-commerce/public/assets/models/${fileName}", 
  (gltf) => {
      currentModel = gltf.scene;
      scene.add(currentModel);

      // Appliquer couleur
      currentModel.traverse(child => {
          if(child.isMesh){
              child.material.color.copy(currentColor);
              child.material.needsUpdate = true;
          }
      });

      // Position caméra initiale
      camera.position.set(3, 3, 3);
      controls.target.set(0, 0, 0);
      controls.update();
  },
  undefined,
  (err) => {
      console.error(err);
      alert("Erreur chargement: "+modelFile);
  }
);

// Couleur dynamique
document.getElementById('model-color').addEventListener('input', (e) => {
    currentColor.set(e.target.value);
    if(currentModel){
        currentModel.traverse(child => {
            if(child.isMesh){
                child.material.color.copy(currentColor);
                child.material.needsUpdate = true;
            }
        });
    }
});

// Réinitialiser la vue
document.getElementById('reset-view').addEventListener('click', () => {
    if(currentModel){
        const box = new THREE.Box3().setFromObject(currentModel);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());

        // Replacer la caméra à une distance adaptée
        camera.position.copy(center.clone().add(new THREE.Vector3(size, size, size)));
        camera.lookAt(center);

        // Recentrer OrbitControls
        controls.target.copy(center);
        controls.update();
    }
});


function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camera);
}
animate();

window.addEventListener('resize', ()=>{
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
</script>
</body>
</html>
</html>`;

  // Zone affichant le code complet
    const codeGroup = document.createElement('div');
    codeGroup.className = 'dashboard-group';

   // Bouton pour copier tout le code
    const textarea = document.createElement('textarea');
    textarea.className = 'dashboard-code';
    textarea.readOnly = true;
    textarea.value = fullCode;
    textarea.style.height = '400px';
    codeGroup.appendChild(textarea);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'dashboard-button';
    copyBtn.textContent = "Copier le code complet";
    copyBtn.addEventListener('click', () => {
      textarea.select();
      document.execCommand('copy');
      copyBtn.textContent = "Copié !";
      setTimeout(()=>copyBtn.textContent="Copier le code complet",2000);
    });
    codeGroup.appendChild(copyBtn);

    this.codeContainer.appendChild(codeGroup);
  }

    /**
   * Met à jour la liste des modèles affichés
   */
  updateModelList() {
    this.modelList.innerHTML = '';
    Object.keys(this.viewer.availableModels).forEach(modelName => {
      const modelItem = document.createElement('div');
      modelItem.className = 'model-item';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = modelName;
      modelItem.appendChild(nameSpan);

      // Bouton pour supprimer un modèle
      const deleteButton = document.createElement('button');
      deleteButton.textContent = "Supprimer";
      deleteButton.className = 'dashboard-button small';
      deleteButton.addEventListener('click', () => this.deleteModel(modelName));
      modelItem.appendChild(deleteButton);

      this.modelList.appendChild(modelItem);
    });
  }

    /**
   * Met à jour le select (dropdown) pour choisir un modèle dans la section intégration
   */
  updateModelSelect() {
    this.integrationModelSelect.innerHTML = '';
    Object.keys(this.viewer.availableModels).forEach(modelName => {
      const option = document.createElement('option');
      option.value = modelName;
      option.textContent = modelName;
      this.integrationModelSelect.appendChild(option);
    });
  }

    /**
   * Upload d’un nouveau modèle GLB/GLTF
   */
  async uploadModel() {
    if (!this.fileInput || !this.fileInput.files || this.fileInput.files.length === 0) {
      alert("Aucun fichier sélectionné !");
      return;
    }

    const file = this.fileInput.files[0];
    const validTypes = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(glb|gltf)$/i)) {
      alert("Format de fichier invalide. Seuls les fichiers GLB/GLTF sont acceptés.");
      return;
    }

    let modelName = prompt("Nommez votre modèle (max 30 caractères) :", file.name.replace(/\.[^/.]+$/, "").substring(0, 30));
    if (!modelName || modelName.trim() === "") {
      alert("Le nom ne peut pas être vide");
      return;
    }

    try {
       // Création d’une URL temporaire pour lire le fichier localement
      const objectURL = URL.createObjectURL(file);
      this.viewer.availableModels[modelName] = objectURL;

      // Mise à jour des listes et du code
      this.updateModelList();
      this.updateModelSelect();
      this.updateIntegrationCode();

      alert(`Modèle "${modelName}" ajouté avec succès ! (⚠ Non sauvegardé, disparaîtra au rechargement)`);
    } catch (error) {
      console.error("Erreur d'upload:", error);
      alert(`Échec de l'upload: ${error.message}`);
    } finally {
      this.fileInput.value = "";
    }
  }

    /**
   * Supprimer un modèle de la liste
   */
  deleteModel(modelName) {
    if (confirm(`Supprimer le modèle "${modelName}" ?`)) {
      delete this.viewer.availableModels[modelName];
      this.updateModelList();
      this.updateModelSelect();
      this.updateIntegrationCode();
    }
  }

    /**
   * Affiche ou masque le tableau de bord
   */
  toggleVisibility(visible) {
    this.isVisible = visible;
    this.container.style.display = visible ? 'block' : 'none';
  }

    /**
   * Ajout des écouteurs d’événements
   */
  setupEventListeners() {
    this.uploadButton.addEventListener('click', () => this.uploadModel());
    if (this.integrationModelSelect) {
      this.integrationModelSelect.addEventListener('change', () => this.updateIntegrationCode());
    }
  }
}
