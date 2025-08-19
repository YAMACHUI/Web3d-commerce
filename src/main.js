import './styles/main.css';
import { Viewer3D } from './components/Viewer3D';
// Importe la classe ProductConfiguration (interface utilisateur pour choisir modèle & couleur)
import { ProductConfiguration } from './components/ProductConfiguration';
// Importe la classe Dashboard (panneau d'administration pour gérer l'affichage des infos)
import { Dashboard } from './components/Dashboard';

// Initialize the 3D viewer
const viewer = new Viewer3D('viewer-container');

// Initialize the product configuration UI
new ProductConfiguration(viewer);

// Initialize the admin dashboard
const dashboard = new Dashboard(viewer);

// Add toggle button for dashboard
const toggleButton = document.createElement('button');
toggleButton.textContent = "Administration";
// Applique une classe CSS pour le style du bouton
toggleButton.className = 'admin-toggle';
// Ajoute un "écouteur d’événement" : au clic, on inverse la visibilité du dashboard
toggleButton.addEventListener('click', () => {
  dashboard.toggleVisibility(!dashboard.isVisible);
});
// Ajoute le bouton au corps du document (il devient visible dans la page)
document.body.appendChild(toggleButton);