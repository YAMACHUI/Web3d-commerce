// Import du chargeur GLTF fourni par Three.js pour lire les fichiers .glb / .gltf
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// Import de la librairie Three.js principale
import * as THREE from 'three';

// Fonction asynchrone qui charge un modèle
// - scene : la scène Three.js dans laquelle on va ajouter le modèle
// - path : chemin du fichier .glb / .gltf
// - availableMaterials : liste des matériaux disponibles (optionnel)
// - productVariants : variantes du produit (optionnel)
export async function loadModel(scene, path, availableMaterials={}, productVariants={}) {

  // On retourne une Promesse car le chargement est asynchrone
  return new Promise((resolve, reject) => {
    // Création d'un chargeur de modèles GLTF
    const loader =new GLTFLoader();
  
  // Lancement du chargement du modèle via le loader
  loader.load(
    path, // chemin du modèle à charger

    //Callback quand le modèle est chargé avec succès
    (gltf)=> {

      // Objet qui contiendra tous les matériaux utilisés dans le modèle
      const materials={};

       // Création d'un matériau par défaut si le modèle n'a pas de matériau
      const defaultMaterial=new THREE.MeshStandardMaterial({
        color:0x00ffcc,  // couleur turquoise
        metalness:0.5,   // rendu métallique moyen
        roughness:0.5     // rugosité moyenne
      });

      // On stocke le matériau par défaut sous le nom "default"
      materials['default'] = defaultMaterial;

      // Objet qui contiendra les variantes du modèle
      const variants={};
      // On crée une première variante "default" en clonant la scène originale
      variants['default'] =gltf.scene.clone()

      /// Parcours récursif de tous les objets dans la scène du modèle
        gltf.scene.traverse((child) => {
          // Vérifie si l’objet est une Mesh (géométrie 3D avec matériau)
        if (child.isMesh) {

        // Sauvegarde le matériau original avant de le modifier
         const originalMaterial=child.material

         // Crée un clone du matériau original ou un nouveau matériau par défaut
        const material = originalMaterial.name 
          ? originalMaterial.clone() 
          : new THREE.MeshStandardMaterial({
              color: 0x00ffcc,
              metalness: 0.1,
              roughness: 0.5
            });

    // Enregistre le matériau sous son nom ou "default"
    const materialName = originalMaterial.name || 'default';
    materials[materialName] = material;

        
    // Applique le matériau à l'objet
      child.material = material;
      
      // Active les ombres (le mesh projette et reçoit des ombres)
      child.castShadow = true;
      child.receiveShadow = true;

      // Stocke des infos personnalisées dans userData
            // => utilisé plus tard pour savoir si la couleur ou matériau peut changer
      child.userData = {
        canChangeColor: true,
        canChangeMaterial: true,
        ...child.userData  // garde aussi les anciennes infos s’il y en avait
    };
        }
      });
      scene.add(gltf.scene);

        // Résout la promesse et retourne un objet avec :
        // - le modèle 3D
        // - les matériaux disponibles
        // - les variantes définies
      resolve({
        model:gltf.scene,
        materials,
        variants:productVariants,
      })
    },

    //Callback de progression (affiche % du chargement)
    (xhr) => {
  console.log(`Model ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
    },

    // Callback en cas d’erreur de chargement
    (error) => {
        console.error('Erreur de chargement du modèle :', error);
        reject(error);
      }
  );
});
}