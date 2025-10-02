# Dashboard Tennis de Table - Club Saint-Pierre

## Description
Site web dynamique one-page pour afficher les informations du club de tennis de table sur une TV. Reproduit fidèlement le design de la maquette fournie avec des fonctionnalités de mise à jour en temps réel.

## Fonctionnalités

### 🏓 Affichage Dynamique
- **Derniers résultats** : Score des matchs avec détails des victoires par joueur
- **Joueur du mois** : Statistiques du meilleur joueur du mois
- **Matchs du jour** : Liste des rencontres programmées
- **Meilleures performances** : Classement des joueurs par points

### ⚙️ Administration
- Interface d'administration accessible via le bouton ⚙️
- Mise à jour des résultats en temps réel
- Modification du joueur du mois
- Sauvegarde automatique des données

### 🔄 Mise à jour Automatique
- Rafraîchissement automatique toutes les 30 secondes
- Persistance des données via localStorage
- Support des équipes Saint-Pierre A à G

## Utilisation

### Affichage sur TV
1. Ouvrir `index.html` dans un navigateur
2. Passer en mode plein écran (F11)
3. Le dashboard s'affiche automatiquement

### Mise à jour des données
1. Cliquer sur le bouton ⚙️ en bas à droite
2. Modifier les informations dans le panneau d'administration
3. Cliquer sur "Mettre à jour" pour sauvegarder
4. Les changements apparaissent immédiatement

### Structure des données
```json
{
  "equipes": ["Saint-Pierre A", "Saint-Pierre B", ..., "Saint-Pierre G"],
  "derniers_resultats": {
    "equipe1": "Saint-Pierre A",
    "equipe2": "Libramont D", 
    "score1": 13,
    "score2": 3,
    "joueurs": [...]
  },
  "joueur_du_mois": {...},
  "matchs_du_jour": [...],
  "meilleures_perfs": [...]
}
```

## Technologies Utilisées
- **HTML5** : Structure sémantique
- **CSS3** : Design responsive avec Flexbox/Grid
- **JavaScript (Vanilla)** : Logique dynamique
- **localStorage** : Persistance des données
- **JSON** : Format de données

## Installation
Aucune installation requise. Ouvrir directement `index.html` dans un navigateur web moderne.

## Personnalisation
- Modifier les équipes dans `script.js` (variable `dashboardData.equipes`)
- Ajuster les couleurs dans `styles.css`
- Changer l'intervalle de mise à jour automatique (ligne 200 de `script.js`)

## Compatibilité
- Compatible avec tous les navigateurs modernes
- Responsive design pour différentes tailles d'écran
- Optimisé pour l'affichage sur TV (mode plein écran)
