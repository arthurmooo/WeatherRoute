# Concept Météo Trajet : La météo synchronisée pour Road Trips

Ce document résume la vision globale du projet **Météo Trajet**, un outil conçu pour transformer l'expérience de conduite sur de longues distances.

## 🌟 Vision
Passer d'une météo statique (par ville) à une **météo dynamique et temporelle**. L'application ne se contente pas de donner le temps qu'il fera à destination, elle prédit les conditions exactes que vous rencontrerez à chaque kilomètre de votre voyage, au moment précis où vous y serez.

## 🎯 Cible Principale
*   **Voyageurs motorisés** : Road trips, vacances, longs trajets.
*   **Sécurité et Confort** : Améliorer la préparation pour éviter les conditions dangereuses (neige, tempêtes) ou simplement profiter des meilleurs panoramas.

## 🛠️ Fonctionnement Clé
1.  **Itinéraire & Temps** : Calcul de la route entre A et B avec une heure de départ précise.
2.  **Synchronisation Temporelle** : Estimation de l'heure de passage sur chaque segment du trajet.
3.  **Extraction Météo** : Récupération des données météo pour chaque point géographique à l'heure H calculée.
4.  **Rapport de Trajet** : Présentation d'une timeline ou d'une carte montrant l'évolution du ciel au fil de la route.

## 🚀 Fonctionnalités Distinctives
*   **Gestion des Pauses** : L'utilisateur peut ajouter des arrêts (ex: "Pause déjeuner 1h"). Le système décale automatiquement toutes les prévisions météo pour la suite du voyage.
*   **Alertes de Conduite** : Notifications en cas de conditions critiques prévues sur le passage (brouillard, vent violent, verglas).
*   **Optimisation de Départ** : Analyse si un départ plus tôt ou plus tard permettrait d'éviter une perturbation majeure.
*   **Routes Panoramiques** : Aide à choisir la "belle route" uniquement si les conditions visuelles (ciel dégagé) sont garanties.

---
*Document créé le 05/01/2026 pour servir de base au développement du MVP.*
