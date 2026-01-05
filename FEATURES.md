# Fonctionnalités et Idées pour Météo Trajet

Ce document recense les fonctionnalités potentielles pour enrichir le concept, classées par priorité.

## 1. Comparateur d'Itinéraires "Confort vs Temps"
Au lieu de proposer uniquement le trajet le plus rapide, l'application propose des alternatives basées sur la météo (ex: "15 min de plus, mais 100% de soleil vs 50% de pluie").

*   **User Story** : "En tant que conducteur en vacances, je veux comparer visuellement plusieurs itinéraires non seulement sur la durée, mais sur le 'score météo' global, afin de choisir la route la moins stressante et la plus agréable, même si elle est légèrement plus longue."
*   **Priorité** : 🔴 **Haute**

## 2. Score de Risque Dynamique (Risk Score)
Un indicateur synthétique de dangerosité (ex: note sur 100 ou code couleur) calculé pour chaque itinéraire et horaire de départ proposé.

*   **Facteurs analysés** :
    *   **Intempéries** : Intensité des précipitations (mm/h), probabilité d'orage.
    *   **Conditions au sol** : Risque de neige, verglas (basé sur température sol + humidité).
    *   **Visibilité** : Brouillard, brume dense.
    *   **Vent** : Rafales latérales dangereuses (notamment pour camions/caravanes).
*   **User Story** : "En tant que conducteur prudent, je veux voir un 'Score de Risque' immédiat à côté de chaque option de départ, agrégant neige, orage et visibilité, afin d'annuler ou reporter mon trajet si le score est trop élevé."
*   **Priorité** : 🔴 **Haute** (Cœur de la promesse sécurité)

## 3. Mode "Zone Blanche" (Offline-First)
Anticipation de la perte de réseau. Les données météo de tout le corridor du trajet sont téléchargées au départ pour garantir l'accès aux infos critiques.

*   **User Story** : "En tant que voyageur en montagne ou zones reculées, je veux accéder à mes prévisions de trajet minute par minute même sans réseau mobile, afin de rester informé des dangers potentiels sans dépendre de la 4G."
*   **Priorité** : 🔴 **Haute**

## 4. Suggestions d'Arrêts "Météo-Compatibles"
L'algorithme suggère des types d'arrêts adaptés à la météo prévue à l'heure de passage (ex: pique-nique si grand soleil, restaurant couvert ou musée si orage).

*   **User Story** : "En tant que planificateur de voyage familial, je veux que l'application me suggère des lieux de pause adaptés aux conditions prévues à mon heure d'arrivée (extérieur vs intérieur), afin d'éviter de me retrouver sous la pluie avec les enfants lors du déjeuner."
*   **Priorité** : 🟠 **Moyenne**

## 5. Calcul d'Impact d'Autonomie (Focus Véhicule Électrique)
La météo (vent de face, températures glaciales) impacte drastiquement l'autonomie des véhicules. Cette feature ajuste l'estimation de consommation.

*   **User Story** : "En tant que conducteur de véhicule électrique, je veux voir l'impact du vent et de la température sur mon autonomie estimée pour ce trajet spécifique, afin de prévoir mes arrêts recharge avec plus de sécurité et éviter la panne sèche."
*   **Priorité** : 🟠 **Moyenne**

## 6. Notification de "Fenêtre de Tir" (Départ Intelligent)
Si l'utilisateur a prévu de partir à 09h00, l'app surveille et notifie si les prévisions changent drastiquement, suggérant un décalage de dernière minute.

*   **User Story** : "En tant que conducteur flexible, je veux recevoir une alerte proactive si décaler mon départ de +/- 30 minutes me permet d'éviter un gros orage, afin de ne pas avoir à revérifier l'application manuellement toutes les 5 minutes avant de partir."
*   **Priorité** : 🟢 **Basse**

## 7. Timeline Visuelle "Le Serpent Météo" (UI Core)
Une représentation linéaire ultra-simple du trajet entier sous forme de barre colorée.

*   **Pourquoi Must Have ?** Le conducteur doit comprendre l'état de son trajet en un coup d'œil (ex: "C'est vert tout le long" ou "Attention, zone rouge au tiers du parcours"). C'est l'interface principale.
*   **User Story** : "En tant que conducteur, je veux visualiser mon trajet sous forme d'une barre de couleur (Vert/Orange/Rouge) pour identifier instantanément les zones problématiques sans lire de texte."
*   **Priorité** : 🔴 **Haute** (Indispensable UX)

## 8. Export vers Navigateur (Deep Linking GPS)
L'application ne remplacera pas Waze ou Google Maps pour le guidage pur. Une fois l'horaire idéal validé, un bouton doit lancer le GPS tiers avec l'itinéraire pré-rempli.

*   **Pourquoi Must Have ?** Pour éviter la friction de devoir retaper l'adresse dans Waze après avoir vu la météo. Sans ça, l'usage est trop lourd.
*   **User Story** : "Une fois mon départ validé sur Météo Trajet, je veux cliquer sur 'Partir' pour lancer automatiquement mon itinéraire sur Waze ou Google Maps."
*   **Priorité** : 🔴 **Haute**

## 9. Profil de Véhicule Personnalisé (Moto / Voiture / Caravane)
La définition d'une "mauvaise météo" dépend totalement du véhicule. 40km/h de vent en voiture c'est OK, en moto ou caravane c'est dangereux.

*   **Pourquoi Must Have ?** Le "Risk Score" est inutile s'il n'est pas contextualisé.
*   **User Story** : "En tant que motard, je veux que l'application considère 'Pluie modérée' comme un risque élevé (Rouge), alors qu'un conducteur de voiture le verrait en risque faible (Vert)."
*   **Priorité** : 🔴 **Haute**

## 10. Monitoring Temps Réel & Recalcul (En Route)
La météo change pendant que vous roulez (surtout sur 6h de route). Si une cellule orageuse se forme *pendant* le trajet (ce qui n'était pas prévu initialement), l'app doit prévenir.

*   **Pourquoi Must Have ?** La promesse est la sécurité. Si la prévision de départ devient fausse à mi-chemin et que l'app ne dit rien, la promesse est rompue.
*   **User Story** : "Pendant que je conduis, je veux recevoir une notification vocale si les prévisions pour la fin de mon trajet se dégradent brutalement par rapport à ce qui était prévu au départ."
*   **Priorité** : 🔴 **Hight**
