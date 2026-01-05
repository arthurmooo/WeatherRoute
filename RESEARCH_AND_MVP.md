# Étude de Concurrence & Proposition MVP - Météo Trajet

## 🕵️ Analyse de la Concurrence

Le marché de la "Météo sur itinéraire" est dominé par quelques acteurs spécialisés, principalement sur mobile.

### Principaux Concurrents
| App | Points Forts | Points Faibles |
| :--- | :--- | :--- |
| **Weather on the Way** (iOS) | Design ultra-léché, Timeline interactive, Support CarPlay, "Go Now" mode. | Exclusif iOS, Modèle abonnement assez cher, Complexe pour un simple trajet. |
| **Drive Weather** | Très utilisé par les routiers/VRP, curseur temporel (Time Slider) très efficace. | Interface un peu datée ("old school"), beaucoup de publicités en gratuit. |
| **Highway Weather** | Rapport qualité/prix (gratuit pour le planning), alertes de sécurité claires. | Design fonctionnel mais peu inspirant, moins de focus sur le "plaisir de conduire". |

### Best Practices identifiées
1. **Curseur Temporel (Time Slider)** : Pouvoir glisser l'heure de départ et voir la météo s'actualiser en temps réel sur la carte.
2. **Timeline de Trajet** : Une vue verticale simplifiée (Départ -> Points d'intérêt -> Arrivée) parallèle à la carte.
3. **Alertes de Sécurité** : Ne pas juste montrer "Pluie", mais mettre en évidence les zones de danger (verglas, vent violent).
4. **Gestion du "Gap"** : Intégrer les pauses car elles décalent tout le reste de la prévision.

---

## 🚀 Proposition de MVP Minimal (Phase 1)

L'objectif est de valider l'utilité technique avec le moins de friction possible.

### 1. Fonctionnalités "Must-Have"
*   **Recherche simple A -> B** avec heure de départ.
*   **Tracé de l'itinéraire** sur une carte interactive.
*   **Points Météo Synchronisés** : Affichage d'icônes météo (température, ciel) tous les X kilomètres ou toutes les Y heures de conduite.
*   **Timeline Interactive** : Une liste chronologique à côté de la carte résumant les conditions par étape.
*   **Bouton "Pause Express"** : Ajouter +30 min ou +1h au trajet pour décaler instantanément les prévisions.

### 2. Différenciateur (Le "Plus" Météo Trajet)
*   **Score de Trajet** : Une note globale (ex: 8/10) basée sur les conditions (soleil vs pluie).
*   **Optimiseur de Départ Rapide** : "Si vous partez 1h plus tard, vous évitez l'orage à Lyon".

### 3. Stack Technique Suggérée
*   **Frontend** : Vite.js (React) + Tailwind CSS pour un design "premium" et fluide.
*   **Cartographie** : MapLibre GL ou Leaflet (Open Source) pour éviter les coûts élevés de Google Maps au début.
*   **Météo API** : OpenWeatherMap ou Tomorrow.io (excellente pour les données par points géographiques).
*   **Itinéraire** : OSRM (gratuit) ou GraphHopper.

---

## 🛠️ Plan d'Action Immédiat (POC)
1. **Maquette UI** : Designer une interface "Single Page" (Carte pleine largeur + Sidebar escamotable).
2. **Setup Technique** : Initialiser le projet et connecter une API de routing simple.
3. **Logique de Sync** : Développer l'algorithme qui "marche" le long du trajet pour interroger la météo aux bons endroits/moments.
