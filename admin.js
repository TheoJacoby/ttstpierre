(function() {
    const KEY = 'pingDashboardData';
    const DEFAULTS = window.dashboardDefaults || {};

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }

    function save(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    function ensureDefaults(data) {
        // Merge minimal defaults if missing
        const merged = { ...DEFAULTS, ...data };
        if (!Array.isArray(merged.equipes)) {
            merged.equipes = [
                "Saint-Pierre A","Saint-Pierre B","Saint-Pierre C",
                "Saint-Pierre D","Saint-Pierre E","Saint-Pierre F","Saint-Pierre G"
            ];
        }
        merged.equipes_data = merged.equipes_data || {};
        merged.matchs_du_jour = merged.matchs_du_jour || [];
        merged.joueur_du_mois = merged.joueur_du_mois || { nom:'', victoires:0, performances:0, points:0, mois:'', genre:'H' };
        merged.meilleures_perfs = merged.meilleures_perfs || [];
        return merged;
    }

    // UI Helpers
    function el(tag, props={}, children=[]) {
        const e = document.createElement(tag);
        Object.assign(e, props);
        children.forEach(c => e.appendChild(c));
        return e;
    }

    function playerRow(data = { nom:'', victoires:0, highlight:false }) {
        const name = el('input', { value: data.nom, placeholder:'Nom du joueur' });
        const wins = el('input', { type:'number', min:0, value: data.victoires, className:'score' });
        return { root: el('div', { className:'row' }, [name, wins]), get(){
            return { nom: name.value.trim(), victoires: Number(wins.value)||0 };
        }};
    }

    function teamCard(key, t) {
        const title = el('div', { innerHTML: `<span class="badge">${key}</span>` });
        const adv = el('input', { value: t.equipe2 || '', placeholder:'Adversaire' });
        const where = el('select');
        ['domicile','exterieur'].forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; where.appendChild(o); });
        where.value = (t.lieu === 'exterieur') ? 'exterieur' : 'domicile';
        const s1 = el('input', { type:'number', min:0, max:16, value: t.score1 ?? 0, className:'score' });
        const s2 = el('input', { type:'number', min:0, max:16, value: t.score2 ?? 0, className:'score' });
        const normalize = () => { const v = Math.max(0, Math.min(16, Number(s1.value)||0)); s1.value=v; s2.value = 16 - v; };
        s1.addEventListener('input', normalize); s2.addEventListener('input', () => { const v=Math.max(0,Math.min(16, Number(s2.value)||0)); s2.value=v; s1.value=16-v;});
        normalize();

        const playersWrap = el('div', { className:'list' });
        const rows = (t.joueurs||[]).slice(0,4).map(p => playerRow(p));
        while (rows.length < 4) rows.push(playerRow());
        rows.forEach(r => playersWrap.appendChild(r.root));

        const root = el('div', { className:'admin-card' }, [
            title,
            el('div', { className:'row' }, [adv, where]),
            el('div', { className:'row' }, [s1, s2]),
            playersWrap
        ]);

        return { root, get(){
            return {
                equipe1: key,
                equipe2: adv.value.trim(),
                lieu: where.value,
                score1: Number(s1.value)||0,
                score2: Number(s2.value)||0,
                joueurs: rows.map(r => r.get())
            };
        }};
    }

    function matchRow(m = { home:'', away:'', score1:null, score2:null }) {
        const home = el('input', { value:m.home, placeholder:'Équipe à domicile' });
        const away = el('input', { value:m.away, placeholder:'Équipe visiteuse' });
        const s1 = el('input', { type:'number', min:0, max:16, value: m.score1 ?? 0, className:'score' });
        const s2 = el('input', { type:'number', min:0, max:16, value: m.score2 ?? 0, className:'score' });
        const normalize = () => { const v=Math.max(0,Math.min(16, Number(s1.value)||0)); s1.value=v; s2.value=16-v; };
        s1.addEventListener('input', normalize); s2.addEventListener('input', () => { const v=Math.max(0,Math.min(16, Number(s2.value)||0)); s2.value=v; s1.value=16-v;});
        const noRes = el('input', { type:'checkbox' });
        const noResLabel = el('label', { innerText:'Aucun résultat' });
        const row = el('div', { className:'row' }, [home, away, s1, s2, noRes, noResLabel]);
        const syncDisabled = () => { const disabled = noRes.checked; s1.disabled = disabled; s2.disabled = disabled; };
        noRes.addEventListener('change', syncDisabled);
        if (m.score1 === null || m.score2 === null) { noRes.checked = true; }
        syncDisabled();
        normalize();
        return { root: row, get(){ return noRes.checked ? { home:home.value.trim(), away:away.value.trim(), score1:null, score2:null } : { home:home.value.trim(), away:away.value.trim(), score1:Number(s1.value)||0, score2:Number(s2.value)||0 }; }};
    }

    function perfRow(p = { nom:'', points:0 }) {
        const name = el('input', { value:p.nom, placeholder:'Nom' });
        const pts = el('input', { type:'number', value:p.points||0, className:'score' });
        return { root: el('div', { className:'row' }, [name, pts]), get(){ return { nom:name.value.trim(), points:Number(pts.value)||0 }; }};
    }

    // Init
    const data = ensureDefaults(load());

    // Teams editor
    const teamsEditor = document.getElementById('teams-editor');
    const teamCards = [];
    (data.equipes||[]).forEach(eq => {
        const t = data.equipes_data?.[eq] || { equipe1:eq, equipe2:'', score1:8, score2:8, joueurs:[] };
        const card = teamCard(eq, t);
        teamCards.push({ key:eq, card });
        teamsEditor.appendChild(card.root);
    });
    document.getElementById('save-teams').addEventListener('click', () => {
        data.equipes_data = data.equipes_data || {};
        teamCards.forEach(({ key, card }) => { data.equipes_data[key] = card.get(); });
        save(data);
        alert('Derniers résultats sauvegardés');
    });
    document.getElementById('reset-teams').addEventListener('click', () => { location.reload(); });

    // Matches editor
    const matchesEditor = document.getElementById('matches-editor');
    const matchRows = [];
    (data.matchs_du_jour || []).forEach(m => {
        const r = matchRow(m);
        matchRows.push(r);
        matchesEditor.appendChild(r.root);
    });
    document.getElementById('add-match').addEventListener('click', () => {
        const r = matchRow();
        matchRows.push(r);
        matchesEditor.appendChild(r.root);
    });
    document.getElementById('save-matches').addEventListener('click', () => {
        data.matchs_du_jour = matchRows.map(r => r.get());
        save(data);
        alert('Matchs du jour sauvegardés');
    });

    // Player of the month
    const pn = document.getElementById('adm-player-name');
    const pv = document.getElementById('adm-player-vict');
    const pp = document.getElementById('adm-player-perf');
    const ppt = document.getElementById('adm-player-points');
    const pm = document.getElementById('adm-player-month');
    const pg = document.getElementById('adm-player-gender');
    pn.value = data.joueur_du_mois.nom || '';
    pv.value = data.joueur_du_mois.victoires || 0;
    pp.value = data.joueur_du_mois.performances || 0;
    ppt.value = data.joueur_du_mois.points || 0;
    pm.value = data.joueur_du_mois.mois || '';
    pg.value = data.joueur_du_mois.genre || 'H';
    document.getElementById('save-player').addEventListener('click', () => {
        data.joueur_du_mois = { nom: pn.value.trim(), victoires: Number(pv.value)||0, performances: Number(pp.value)||0, points: Number(ppt.value)||0, mois: pm.value.trim(), genre: pg.value };
        save(data);
        alert('Joueur du mois sauvegardé');
    });

    // Perfs editor
    const perfsEditor = document.getElementById('perfs-editor');
    const perfRows = [];
    (data.meilleures_perfs||[]).forEach(p => { const r = perfRow(p); perfRows.push(r); perfsEditor.appendChild(r.root); });
    document.getElementById('add-perf').addEventListener('click', () => { const r = perfRow(); perfRows.push(r); perfsEditor.appendChild(r.root); });
    document.getElementById('save-perfs').addEventListener('click', () => {
        data.meilleures_perfs = perfRows.map(r => r.get());
        save(data);
        alert('Meilleures perfs sauvegardées');
    });

    // Export / Import JSON
    document.getElementById('export-json').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ping-dashboard-data.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    document.getElementById('import-json-input').addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const imported = JSON.parse(text);
            save(imported);
            alert('Import réussi. Rechargement…');
            location.reload();
        } catch (err) {
            alert('Fichier invalide.');
        }
    });
})();


