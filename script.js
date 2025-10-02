// Données par défaut
let dashboardData = {
    equipes: [
        "Saint-Pierre A", "Saint-Pierre B", "Saint-Pierre C", 
        "Saint-Pierre D", "Saint-Pierre E", "Saint-Pierre F", "Saint-Pierre G"
    ],
    // Données pour chaque équipe
    equipes_data: {
        "Saint-Pierre A": {
            equipe1: "Saint-Pierre A",
            equipe2: "Libramont D",
            score1: 13,
            score2: 3,
            joueurs: [
                { nom: "Denis", victoires: 3 },
                { nom: "Antoine", victoires: 4},
                { nom: "Rémi", victoires: 3 },
                { nom: "Benja", victoires: 3 }
            ]
        },
        "Saint-Pierre B": {
            equipe1: "Saint-Pierre B",
            equipe2: "Ochamps A",
            score1: 8,
            score2: 8,
            joueurs: [
                { nom: "Marc", victoires: 2 },
                { nom: "Pierre", victoires: 3},
                { nom: "Luc", victoires: 2 },
                { nom: "Paul", victoires: 1 }
            ]
        },
        "Saint-Pierre C": {
            equipe1: "Saint-Pierre C",
            equipe2: "Bastogne B",
            score1: 12,
            score2: 4,
            joueurs: [
                { nom: "Jean", victoires: 4 },
                { nom: "Michel", victoires: 4 },
                { nom: "André", victoires: 3 },
                { nom: "Claude", victoires: 4 }
            ]
        },
        "Saint-Pierre D": {
            equipe1: "Saint-Pierre D",
            equipe2: "Arlon C",
            score1: 6,
            score2: 10,
            joueurs: [
                { nom: "François", victoires: 1 },
                { nom: "Bernard", victoires: 2 },
                { nom: "Henri", victoires: 2 },
                { nom: "Robert", victoires: 1 }
            ]
        },
        "Saint-Pierre E": {
            equipe1: "Saint-Pierre E",
            equipe2: "Libramont F",
            score1: 11,
            score2: 5,
            joueurs: [
                { nom: "Louis", victoires: 3 },
                { nom: "Marcel", victoires: 3 },
                { nom: "Georges", victoires: 2 },
                { nom: "Albert", victoires: 3 }
            ]
        },
        "Saint-Pierre F": {
            equipe1: "Saint-Pierre F",
            equipe2: "Ochamps C",
            score1: 7,
            score2: 9,
            joueurs: [
                { nom: "Philippe", victoires: 2 },
                { nom: "Daniel", victoires: 2 },
                { nom: "Patrick", victoires: 2 },
                { nom: "Serge", victoires: 1 }
            ]
        },
        "Saint-Pierre G": {
            equipe1: "Saint-Pierre G",
            equipe2: "Bastogne D",
            score1: 14,
            score2: 2,
            joueurs: [
                { nom: "Yves", victoires: 4 },
                { nom: "Gérard", victoires: 4 },
                { nom: "Maurice", victoires: 4 },
                { nom: "René", victoires: 4 }
            ]
        }
    },
    derniers_resultats: {
        equipe1: "Saint-Pierre A",
        equipe2: "Libramont D",
        score1: 13,
        score2: 3,
        joueurs: [
            { nom: "Denis", victoires: 3 },
            { nom: "Antoine", victoires: 4 },
            { nom: "Rémi", victoires: 3 },
            { nom: "Benja", victoires: 3 }
        ]
    },
    joueur_du_mois: {
        nom: "Antoine Guebs",
        victoires: 12,
        performances: 5,
        points: 64,
        mois: "septembre"
    },
    matchs_du_jour: [
        { home: "Saint-Pierre A", away: "Ochamps A", score1: null, score2: null },
        { home: "Libramont E", away: "Saint-Pierre B", score1: null, score2: null },
        { home: "Saint-Pierre A", away: "Ochamps A", score1: null, score2: null },
        { home: "Libramont E", away: "Saint-Pierre B", score1: null, score2: null },
        { home: "Saint-Pierre A", away: "Ochamps A", score1: null, score2: null },
        { home: "Libramont E", away: "Saint-Pierre B", score1: null, score2: null }
    ],
    meilleures_perfs: [
        { nom: "Florian Vincent", points: 36 },
        { nom: "Mathis Jacoby", points: 36 },
        { nom: "Rémi Vuidar", points: 36 }
    ]
};

// Variables pour la rotation
let currentEquipeIndex = 0;
let rotationInterval;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    normalizeData();
    saveData();
    updateDisplay();
    startAutoUpdate();
    startRotation();
});

// Charger les données depuis localStorage
function loadData() {
    const savedData = localStorage.getItem('pingDashboardData');
    if (savedData) {
        dashboardData = { ...dashboardData, ...JSON.parse(savedData) };
    }
}

// Migration/normalisation des données (matchs du jour, etc.)
function normalizeData() {
    // Normaliser matchs_du_jour: accepter anciens formats (string)
    if (Array.isArray(dashboardData.matchs_du_jour)) {
        dashboardData.matchs_du_jour = dashboardData.matchs_du_jour.map(item => {
            // Déjà au bon format
            if (item && typeof item === 'object' && 'home' in item && 'away' in item) {
                const score1 = isFinite(item.score1) ? Number(item.score1) : null;
                const score2 = isFinite(item.score2) ? Number(item.score2) : null;
                return { home: item.home, away: item.away, score1, score2 };
            }
            // Ancien format string: "Home - Away"
            if (typeof item === 'string') {
                const parts = item.split(' - ');
                const home = parts[0] || '';
                const away = parts[1] || '';
                return { home, away, score1: null, score2: null };
            }
            // Fallback
            return { home: '', away: '', score1: null, score2: null };
        });
    }
    // Valeur par défaut pour le lieu (domicile) pour chaque équipe
    if (dashboardData.equipes_data) {
        Object.keys(dashboardData.equipes_data).forEach(key => {
            const e = dashboardData.equipes_data[key];
            if (e && !e.lieu) {
                e.lieu = 'domicile';
            }
        });
    }
    // Valeur par défaut pour le genre du joueur du mois
    if (dashboardData.joueur_du_mois && !dashboardData.joueur_du_mois.genre) {
        dashboardData.joueur_du_mois.genre = 'H';
    }
}

// Sauvegarder les données dans localStorage
function saveData() {
    localStorage.setItem('pingDashboardData', JSON.stringify(dashboardData));
}

// Mettre à jour l'affichage
function updateDisplay() {
    updateDerniersResultats();
    updateJoueurDuMois();
    updateMatchsDuJour();
    updateMeilleuresPerfs();
}

// Mettre à jour la section "Derniers résultats"
function updateDerniersResultats(equipeData = null) {
    const resultat = equipeData || dashboardData.derniers_resultats;
    
    const isAway = resultat.lieu === 'exterieur';
    const leftTeam = isAway ? resultat.equipe2 : resultat.equipe1;
    const rightTeam = isAway ? resultat.equipe1 : resultat.equipe2;
    const leftScore = isAway ? resultat.score2 : resultat.score1;
    const rightScore = isAway ? resultat.score1 : resultat.score2;

    document.getElementById('team1').textContent = leftTeam;
    document.getElementById('team2').textContent = rightTeam;
    document.getElementById('score').textContent = `${leftScore} - ${rightScore}`;
    
    const playerResults = document.getElementById('player-results');
    playerResults.innerHTML = '';
    
    resultat.joueurs.slice(0, 4).forEach(joueur => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-result';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'player-name';
        nameSpan.textContent = joueur.nom;
        
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'player-score';
        const n = Number(joueur.victoires) || 0;
        scoreSpan.textContent = `${n} victoire${n === 1 ? '' : 's'}`;
        
        playerDiv.appendChild(nameSpan);
        playerDiv.appendChild(scoreSpan);
        
        // Pas d'icône flèche
        
        playerResults.appendChild(playerDiv);
    });
}

// Mettre à jour la section "Joueur du mois"
function updateJoueurDuMois() {
    const joueur = dashboardData.joueur_du_mois;
    
    document.getElementById('player-name').textContent = joueur.nom;
    const v = Number(joueur.victoires)||0;
    const genre = joueur.genre === 'F' ? 'la' : 'le';
    document.getElementById('victories').textContent = `${v} victoire${v===1?'':'s'}`;
    document.getElementById('performances').textContent = `${joueur.performances} perf${Number(joueur.performances)===1?'':'s'}`;
    document.getElementById('points').textContent = `+ ${joueur.points} points`;
    
    // Mettre à jour l'avatar selon le genre
    const photoEl = document.getElementById('player-photo');
    if (photoEl) {
        photoEl.textContent = (joueur.genre === 'F') ? '👩' : '👨';
    }
    
    // Mettre à jour le titre avec le mois
    const title = document.querySelector('.left-column .card:nth-child(2) .card-title');
    title.textContent = `${joueur.genre === 'F' ? 'Joueuse' : 'Joueur'} du mois (${joueur.mois})`;
}

// Mettre à jour la section "Matchs du jour"
function updateMatchsDuJour() {
    const matchesList = document.getElementById('matches-list');
    matchesList.innerHTML = '';
    
    dashboardData.matchs_du_jour.forEach((m, idx) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match-item';
        const home = (m && m.home) ? m.home : '';
        const away = (m && m.away) ? m.away : '';
        const hasScore = (m && m.score1 !== null && m.score2 !== null && isFinite(m.score1) && isFinite(m.score2));
        if (!hasScore) {
            // Si pas de résultat, n'affiche pas la ligne
            // Mais garder l'édition accessible via admin.html
            return;
        }
        const homeSpan = document.createElement('span'); homeSpan.textContent = home;
        const scoreSpan = document.createElement('span'); scoreSpan.className = 'match-score-inline';
        scoreSpan.textContent = `${m.score1} - ${m.score2}`;
        const awaySpan = document.createElement('span'); awaySpan.textContent = away;
        matchDiv.appendChild(homeSpan);
        matchDiv.appendChild(scoreSpan);
        matchDiv.appendChild(awaySpan);
        matchDiv.addEventListener('click', () => openMatchEditor(idx));
        matchesList.appendChild(matchDiv);
    });
}

// Mettre à jour la section "Meilleures performances"
function updateMeilleuresPerfs() {
    const performancesList = document.getElementById('performances-list');
    performancesList.innerHTML = '';
    
    dashboardData.meilleures_perfs.forEach(perf => {
        const perfDiv = document.createElement('div');
        perfDiv.className = 'performance-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'player-name';
        nameSpan.textContent = perf.nom;
        
        const pointsSpan = document.createElement('span');
        pointsSpan.className = 'points green';
        pointsSpan.textContent = `+ ${perf.points} points`;
        
        perfDiv.appendChild(nameSpan);
        perfDiv.appendChild(pointsSpan);
        performancesList.appendChild(perfDiv);
    });
}

// Fonctions d'administration
function toggleAdmin() {
    const panel = document.getElementById('admin-panel');
    panel.classList.toggle('open');
    
    // Pré-remplir les champs avec les données actuelles
    if (panel.classList.contains('open')) {
        fillAdminFields();
    }
}

function fillAdminFields() {
    const resultat = dashboardData.derniers_resultats;
    const joueur = dashboardData.joueur_du_mois;
    
    document.getElementById('admin-team1').value = resultat.equipe1;
    document.getElementById('admin-score1').value = resultat.score1;
    document.getElementById('admin-score2').value = resultat.score2;
    document.getElementById('admin-team2').value = resultat.equipe2;
    // pas de sélecteur dans le panneau latéral, conservé pour compat
    
    document.getElementById('admin-player-name').value = joueur.nom;
    document.getElementById('admin-victories').value = joueur.victoires;
    document.getElementById('admin-performances').value = joueur.performances;
    document.getElementById('admin-points').value = joueur.points;
}

function updateResults() {
    const equipe1 = document.getElementById('admin-team1').value;
    let score1 = parseInt(document.getElementById('admin-score1').value);
    let score2 = parseInt(document.getElementById('admin-score2').value);
    const equipe2 = document.getElementById('admin-team2').value;
    
    // Contraintes: 0..16 et total 16
    if (isNaN(score1)) score1 = 0;
    if (isNaN(score2)) score2 = 0;
    score1 = Math.max(0, Math.min(16, score1));
    score2 = Math.max(0, Math.min(16, score2));
    const total = score1 + score2;
    if (total !== 16) {
        if (total < 16) {
            score2 = 16 - score1;
        } else {
            // Si dépasse 16, on ajuste le second score
            score2 = Math.max(0, 16 - score1);
        }
    }
    
    dashboardData.derniers_resultats = {
        ...dashboardData.derniers_resultats,
        equipe1: equipe1,
        equipe2: equipe2,
        score1: score1,
        score2: score2
    };
    
    saveData();
    updateDisplay();
    
    // Fermer le panneau d'administration
    document.getElementById('admin-panel').classList.remove('open');
}

function updatePlayerOfMonth() {
    const nom = document.getElementById('admin-player-name').value;
    const victoires = parseInt(document.getElementById('admin-victories').value);
    const performances = parseInt(document.getElementById('admin-performances').value);
    const points = parseInt(document.getElementById('admin-points').value);
    
    dashboardData.joueur_du_mois = {
        ...dashboardData.joueur_du_mois,
        nom: nom,
        victoires: victoires,
        performances: performances,
        points: points
    };
    
    saveData();
    updateDisplay();
    
    // Fermer le panneau d'administration
    document.getElementById('admin-panel').classList.remove('open');
}

// Editeur de score pour un match du jour
function openMatchEditor(index) {
    const matchesList = document.getElementById('matches-list');
    const item = matchesList.children[index];
    const m = dashboardData.matchs_du_jour[index] || { home: '', away: '', score1: null, score2: null };
    
    // Remplacer la ligne entière par un éditeur inline
    const editor = document.createElement('div');
    editor.className = 'match-edit-inputs';
    const in1 = document.createElement('input'); in1.type='number'; in1.min='0'; in1.max='16'; in1.value = m.score1 ?? '';
    const dash = document.createElement('span'); dash.textContent='-';
    const in2 = document.createElement('input'); in2.type='number'; in2.min='0'; in2.max='16'; in2.value = m.score2 ?? '';
    const saveBtn = document.createElement('button'); saveBtn.textContent='OK';
    const noResBtn = document.createElement('button'); noResBtn.textContent="Aucun résultat"; noResBtn.className='cancel';
    const cancelBtn = document.createElement('button'); cancelBtn.textContent='Annuler'; cancelBtn.className='cancel';
    editor.appendChild(in1); editor.appendChild(dash); editor.appendChild(in2); editor.appendChild(saveBtn); editor.appendChild(noResBtn); editor.appendChild(cancelBtn);
    item.textContent = '';
    item.appendChild(editor);
    
    const normalize = () => {
        let s1 = parseInt(in1.value);
        if (isNaN(s1)) s1 = 0;
        s1 = Math.max(0, Math.min(16, s1));
        in1.value = s1;
        in2.value = 16 - s1;
    };
    
    in1.addEventListener('input', normalize);
    in2.addEventListener('input', () => {
        let s2 = parseInt(in2.value);
        if (isNaN(s2)) s2 = 0;
        s2 = Math.max(0, Math.min(16, s2));
        in2.value = s2;
        in1.value = 16 - s2;
    });
    normalize();
    
    saveBtn.addEventListener('click', () => {
        const s1 = parseInt(in1.value);
        const s2 = 16 - s1;
        dashboardData.matchs_du_jour[index] = { ...m, score1: s1, score2: s2 };
        saveData();
        updateMatchsDuJour();
    });
    
    noResBtn.addEventListener('click', () => {
        dashboardData.matchs_du_jour[index] = { ...m, score1: null, score2: null };
        saveData();
        updateMatchsDuJour();
    });
    
    cancelBtn.addEventListener('click', () => {
        updateMatchsDuJour();
    });
}

// Système de rotation des équipes
function startRotation() {
    // Afficher immédiatement l'équipe courante
    displayEquipeByIndex(currentEquipeIndex);
    // Rotation toutes les 10 secondes
    rotationInterval = setInterval(() => {
        rotateToNextEquipe();
    }, 10000);
}

function rotateToNextEquipe() {
    // Passer à l'équipe suivante
    currentEquipeIndex = (currentEquipeIndex + 1) % dashboardData.equipes.length;
    displayEquipeByIndex(currentEquipeIndex);
}

function displayEquipeByIndex(index) {
    const currentEquipe = dashboardData.equipes[index];
    const equipeData = dashboardData.equipes_data[currentEquipe];
    const container = document.querySelector('.results-container');
    container.classList.add('fading');
    setTimeout(() => {
        updateDerniersResultats(equipeData);
        container.classList.remove('fading');
    }, 350);
}

// Mise à jour automatique
function startAutoUpdate() {
    // Mise à jour toutes les 30 secondes
    setInterval(() => {
        // Ici vous pourriez ajouter une logique pour récupérer des données
        // depuis un serveur ou une API externe
        console.log('Mise à jour automatique...');
    }, 30000);
}

// Fonctions utilitaires pour générer des données aléatoires (pour les tests)
function generateRandomMatch() {
    const equipesAdverses = ['Ochamps A', 'Libramont E', 'Libramont D', 'Bastogne A', 'Arlon B'];
    const equipe1 = dashboardData.equipes[Math.floor(Math.random() * dashboardData.equipes.length)];
    const equipe2 = equipesAdverses[Math.floor(Math.random() * equipesAdverses.length)];
    
    return `${equipe1} - ${equipe2}`;
}

function generateRandomScore() {
    // Génère un score totalisant 16, avec bornes 0..16
    const score1 = Math.floor(Math.random() * 17); // 0..16
    const score2 = 16 - score1;
    return { score1, score2 };
}

// Fonction pour simuler un nouveau match (utile pour les tests)
function simulateNewMatch() {
    const equipesAdverses = ['Ochamps A', 'Libramont E', 'Libramont D', 'Bastogne A', 'Arlon B'];
    const equipe1 = dashboardData.equipes[Math.floor(Math.random() * dashboardData.equipes.length)];
    const equipe2 = equipesAdverses[Math.floor(Math.random() * equipesAdverses.length)];
    const scores = generateRandomScore();
    
    dashboardData.derniers_resultats = {
        equipe1: equipe1,
        equipe2: equipe2,
        score1: scores.score1,
        score2: scores.score2,
        joueurs: [
            { nom: "Denis", victoires: Math.floor(Math.random() * 5) + 1 },
            { nom: "Antoine", victoires: Math.floor(Math.random() * 5) + 1 },
            { nom: "Rémi", victoires: Math.floor(Math.random() * 5) + 1 },
            { nom: "Benja", victoires: Math.floor(Math.random() * 5) + 1 }
        ]
    };
    
    saveData();
    updateDisplay();
}

// Exposer les fonctions globalement pour les tests
window.simulateNewMatch = simulateNewMatch;
window.dashboardData = dashboardData;
// Exposer des valeurs par défaut pour l'admin (au cas où localStorage est vide)
window.dashboardDefaults = {
    equipes: [
        "Saint-Pierre A", "Saint-Pierre B", "Saint-Pierre C",
        "Saint-Pierre D", "Saint-Pierre E", "Saint-Pierre F", "Saint-Pierre G"
    ],
    equipes_data: dashboardData.equipes_data,
    matchs_du_jour: dashboardData.matchs_du_jour,
    joueur_du_mois: dashboardData.joueur_du_mois,
    meilleures_perfs: dashboardData.meilleures_perfs
};
