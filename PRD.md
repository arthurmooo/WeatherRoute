# Product Requirements Document (PRD) - Météo Trajet (MVP)

> [!NOTE]
> **Statut** : DRAFT
> **Dernière mise à jour** : 05/01/2026
> **Objectif** : Validation d'idée / Portfolio / Usage Personnel

## 1. Vue d'ensemble du Produit

**Météo Trajet** est une application web qui permet aux vacanciers de visualiser les conditions météo *exactes* qu'ils rencontreront le long de leur route, synchronisées avec leur heure de passage.

### 1.1 Vision & Proposition de Valeur
Contrairement aux apps météo classiques (statiques) ou aux GPS (focalisés trafic), Météo Trajet répond à la question : *"Quel temps fera-t-il exactement quand je passerai à Lyon dans 3h ?"*

*   **Promesse** : "Partez au meilleur moment, roulez sous le meilleur ciel."
*   **Cible** : Voyageurs Loisirs / Road Trips. (Focus sur le confort visuel et la sécurité, moins sur la vitesse pure).

## 2. Périmètre du MVP (Minimum Viable Product)

Le but est de sortir une version fonctionnelle rapidement avec **0€ de frais récurrents**.

### ✅ IN (Fonctionnalités Clés)

#### 2.1 Core Features (Indispensables)
1.  **Recherche Itinéraire Dynamique** :
    *   Saisie avec autocomplétion (OpenStreetMap).
    *   **Routing "Type Waze/Maps"** : Calcul d'itinéraire réel (pas vol d'oiseau) via API de routing.
    *   Gestion de plusieurs options d'itinéraires si l'API le permet (ex: Plus rapide vs Plus court).
2.  **Météo Synchronisée (Le "Cœur")** :
    *   **Segmentation** : Découpage du trajet en segments de **30 minutes** de conduite.
    *   Récupération météo (Ciel, Température, Précipitations) pour chaque segment à l'heure *estimée* de passage.
3.  **Visualisation "Timeline"** :
    *   Interface scindée : Carte à gauche (desktop) / Haut (mobile) + Timeline verticale à droite/bas.
    *   **Le "Serpent Météo"** : Code couleur simple sur la timeline (🟢 Soleil/Calme -> 🟠 Nuageux/Venteux -> 🔴 Pluie/Orage).
4.  **Optimisateur de Départ (Flexibilité)** :
    *   L'utilisateur définit une **plage de départ** (ex: "Départ entre 8h et 12h" ou "Ce week-end").
    *   L'app calcule le "Score Météo" pour plusieurs créneaux et suggère l'heure de départ optimale.
5.  **Deeplink GPS Avancé** :
    *   Bouton "Ouvrir dans Google Maps" / "Ouvrir dans Waze".
    *   **Points de passage** : Transfert de l'itinéraire complet (pas juste A->B) pour garantir que l'utilisateur suive la route analysée.

### ❌ OUT (Reporté à la V2)
*   **Mode Offline** : Pas de mise en cache complexe pour l'instant. Nécessite réseau actif au lancement.
*   **Comptes Utilisateurs** : Pas de login/sauvegarde de trajets. One-shot usage.
*   **Notifications Push** : Pas d'alertes temps réel pendant la conduite.
*   **Comparateur Multi-Itinéraires "Complexes"** : Comparaison poussée type "Route A (Pluie) vs Route B (Soleil)". On se concentre sur l'optimisation horaire d'abord.
*   **Gestion Avancée Véhicule** : Pas de profil caravane/moto spécifique.

## 3. Spécifications Fonctionnelles

### 3.1 Interface Utilisateur (UI) & UX
*   **Design** : "Holiday & Premium". Couleurs vibrantes, glassmorphisme, icones météo 3D/animées.
*   **Layout** :
    *   **Accueil** : Hero section inspirante + Module "Optimisateur de départ".
    *   **Résultats** : Split view Map / Timeline.

### 3.2 Données & Algorithme
L'algorithme de synchronisation :
1.  **Routing** : Appel API pour géométrie + durée.
2.  **Segmentation** : Découpage temporel strict (toutes les 30 min).
3.  **Météo** : Requête lat/lon pour chaque segment à $T_{passage}$.
4.  **Optimisation** : Si plage horaire sélectionnée, répéter l'opération (version simplifiée) pour trouver le meilleur créneau.

## 4. Architecture Technique (Zero Cost Constraint)

### 4.1 Frontend
*   **Framework** : React (via Vite) + TypeScript.
*   **Styling** : Tailwind CSS (Rapide, flexible, moderne).
*   **State Management** : Zustand (Léger).

### 4.2 Services & APIs (Plan Gratuit)
*   **Cartographie (Tuiles)** :
    *   **CartoDB Voyager** (via Leaflet ou React-Map-GL).
*   **Geocoding & Routing** :
    *   **OpenRouteService** (Plan gratuit : 2000 req/jour). Supporte les waypoints pour l'export.
*   **Météo** :
    *   **Open-Meteo** (Pas de clé API).

## 5. Roadmap d'Implémentation

1.  **Phase 1 : Squelette & APIs**
    *   Setup Vite + Tailwind.
    *   Connexion OpenRouteService.
    *   Connexion Open-Meteo.

2.  **Phase 2 : Algorithme Core**
    *   Implémenter la synchronisation Route <-> Temps (Segments 30min).
    *   Implémenter l'Optimisateur de départ (Algorithme de scoring).

3.  **Phase 3 : UI & Polish**
    *   Design de la Timeline & "Serpent Météo".
    *   Intégration Deeplink Waze/Maps avec waypoints.
    *   Animations.

## 6. Questions Ouvertes / Risques
*   **Limite API** : Open-Meteo est très permissif mais attention à ne pas spammer si on fait 50 points météo par trajet. Il faudra optimiser l'échantillonnage.
*   **Précision** : La météo à +4h est une prévision. Il faudra bien indiquer à l'utilisateur que c'est une *estimation*.

---
> [!IMPORTANT]
> **Validation Requise** : Validez-vous ce périmètre et notamment le choix technique "Open-Meteo + OpenRouteService" pour respecter la contrainte de gratuité ?
