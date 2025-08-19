// Classe ProductConfiguration : permet de configurer un produit 3D
// - Choisir le modèle 3D à afficher
// - Modifier la couleur du modèle
export class ProductConfiguration {
  // Référence vers le viewer (classe qui gère Three.js et l'affichage des modèles)
  constructor(viewer3D) {
    this.viewer = viewer3D;
  
  // Création de l'interface utilisateur de configuration
    this.setupUI();
  }

    /**
   * Crée le panneau principal de configuration produit
   */
  setupUI() {
    this.container = document.createElement('div');
    this.container.className = 'product-config-panel';

    //Ajout des contrôles :
    //Sélecteur de modèle
    this.createModelSelector();

    //Sélecteur de couleur
    this.createColorPicker();

     // On ajoute ce panneau dans le body de la page
    document.body.appendChild(this.container);
  }

    /**
   * Crée un sélecteur pour choisir quel modèle charger dans le viewer
   */
  createModelSelector() {
    // Groupe visuel (label + select)
    const modelGroup = document.createElement('div');
    modelGroup.className = 'config-group';

     // Label "Modèle:"
    const modelLabel = document.createElement('label');
    modelLabel.textContent = "Modèle:";
    modelGroup.appendChild(modelLabel);

     // Dropdown (select) contenant la liste des modèles disponibles
    const modelSelect = document.createElement('select');
    modelSelect.className = 'config-control';

     // On parcourt les modèles disponibles dans le viewer et on ajoute chaque modèle comme option
    Object.keys(this.viewer.availableModels).forEach(modelName => {
      const option = document.createElement('option');
      option.value = modelName;
      option.textContent = modelName;
      modelSelect.appendChild(option);
    });

     // Quand l’utilisateur change de modèle → on charge le modèle choisi
    modelSelect.addEventListener('change', (e) => {
      this.viewer.loadSelectedModel(e.target.value);
    });

    // Ajout du select dans le groupe, puis du groupe dans le panneau
    modelGroup.appendChild(modelSelect);
    this.container.appendChild(modelGroup);
  }

    /**
   * Crée un color picker pour changer la couleur du modèle affiché
   */
  createColorPicker() {
    // Groupe visuel (label + input)
    const colorGroup = document.createElement('div');
    colorGroup.className = 'config-group';

    // Label "Couleur:"
    const colorLabel = document.createElement('label');
    colorLabel.textContent = "Couleur:";
    colorGroup.appendChild(colorLabel);

    // Input de type color
    this.colorPicker = document.createElement('input');
    this.colorPicker.type = 'color';
    this.colorPicker.value = '#00ffcc'; // couleur par défaut
    this.colorPicker.className = 'config-control';

    // Quand l’utilisateur change la couleur → on convertit la valeur hexadécimale en entier
    // puis on envoie au viewer pour appliquer la couleur sur le modèle
    this.colorPicker.addEventListener('input', (e) => {
      const hexColor = parseInt(e.target.value.substring(1), 16);
      this.viewer.changeColor(hexColor);
    });
    
     // Synchronisation inverse : si le modèle change dans le viewer,
    // on met à jour la valeur du color picker (utile quand on change de modèle par ex.)
    this.viewer.onModelChanged = (color) => {
      const hexString = '#' + color.toString(16).padStart(6, '0');
      this.colorPicker.value = hexString;
    };
    // Ajout du color picker dans le groupe, puis du groupe dans le panneau
    colorGroup.appendChild(this.colorPicker);
    this.container.appendChild(colorGroup);
  }
}