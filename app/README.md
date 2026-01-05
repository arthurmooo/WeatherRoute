# Météo Trajet (MVP)

Une application web qui permet aux vacanciers de visualiser les conditions météo exactes qu'ils rencontreront le long de leur route, synchronisées avec leur heure de passage.

Promesse : **"Partez au meilleur moment, roulez sous le meilleur ciel."**

## 🚀 Fonctionnalités Actuelles (Phase 2 terminée)

### 1. Recherche d'itinéraire
- Saisie avec autocomplétion (villes de France et d'Europe).
- Calcul d'itinéraire voiture via OpenRouteService.
- Affichage du tracé et des statistiques (durée, distance).

### 2. Météo Synchronisée
- Découpage du trajet en segments de 30 minutes.
- Récupération de la météo précise (Open-Meteo) pour chaque segment à l'heure estimée de passage.

### 3. Optimisateur de Départ
- Définition d'une plage horaire de départ (ex: 8h - 14h).
- Analyse météo pour chaque heure de départ possible.
- **Scoring intelligent** (0-100) prenant en compte : pluie, orages, brouillard, vent, soleil.
- Suggestion du meilleur créneau.

## 🛠️ Installation & Démarrage

### Pré-requis
- Node.js 18+
- Une clé API [OpenRouteService](https://openrouteservice.org/) (Gratuit).

### Installation

```bash
cd app
npm install
```

### Configuration
Créer un fichier `.env` dans le dossier `app` :

```env
VITE_ORS_API_KEY=votre_cle_api_ici
```

### Lancement

```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.

### Tests

Pour lancer les tests unitaires (notamment l'algorithme de scoring météo) :

```bash
npm run test
# ou
npx vitest
```

## 🏗️ Architecture Technique
- **Frontend** : React + TypeScript + Vite
- **State** : Zustand
- **Map** : MapLibre GL / React-Map-GL
- **APIs** : OpenRouteService (Route), Open-Meteo (Météo)
- **Tests** : Vitest

## 📅 Roadmap

- [x] **Phase 1** : Squelette & APIs (Routing + Météo de base)
- [x] **Phase 2** : Algorithme Core & Optimisateur de départ
- [ ] **Phase 3** : Comparaison Modes (Train vs Voiture) & UI Polish
- [ ] **Phase 4** : Déploiement & Optimisations finales
