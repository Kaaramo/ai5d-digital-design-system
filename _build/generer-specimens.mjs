/**
 * Engendre specimens/composants.html — la preuve visuelle du noyau.
 *
 * La page affiche chaque composant dans tous ses états, dans les quatre densités, en
 * clair et en sombre. Elle n'appelle aucun réseau : les polices sont servies depuis
 * noyau/polices, et c'est précisément ce qu'il faut vérifier dans l'onglet Réseau.
 *
 * Les composants sont en React et cette page est statique : on ne les rend donc pas,
 * on reproduit leur balisage à partir des mêmes jetons. La duplication est assumée et
 * bornée — la page sert à voir, les tests servent à prouver.
 */
import { mkdir, writeFile } from 'node:fs/promises';

const DENSITES = [
  ['aere', 'AÉRÉ', 'Académie', 'lecture, apprentissage, respiration'],
  ['equilibre', 'ÉQUILIBRÉ', 'Compte', 'gestion, sécurité, paramètres'],
  ['modere', 'MODÉRÉ', 'Cercle', 'communauté, interactions, flux'],
  ['compact', 'COMPACT', 'Lab', 'données, workflows, outils'],
];

const TONS = [
  ['information', 'Information'],
  ['reussite', 'Adresse vérifiée'],
  ['attention', 'Adresse non confirmée'],
  ['erreur', 'Trop de tentatives'],
];

function logotype(produit) {
  // Les lettres suivent --texte-fort, comme le composant : le logotype se retourne
  // avec le theme sans que la page ait a le savoir.
  return `<span class="logo"
    ><b>AI</b><b class="cinq">5</b><b>D</b>${produit ? `<i>${produit}</i>` : ''}</span>`;
}

function boutons() {
  return ['primaire', 'secondaire', 'discret']
    .map(
      (variante) => `
      <div class="rangee">
        <button class="bouton ${variante}">Se connecter</button>
        <button class="bouton ${variante}" data-survol>Survolé</button>
        <button class="bouton ${variante}" disabled>Désactivé</button>
        <button class="bouton ${variante}" disabled aria-busy="true">En cours</button>
      </div>`,
    )
    .join('');
}

function champs() {
  return `
    <div class="champ">
      <label>Adresse professionnelle</label>
      <input value="vous@entreprise.com" readonly />
      <span class="aide">Nous ne la transmettons à personne.</span>
    </div>
    <div class="champ">
      <label>Mot de passe</label>
      <input class="focus" value="••••••••••••" readonly />
      <span class="aide">Champ actif</span>
    </div>
    <div class="champ">
      <label>Courriel</label>
      <input class="erreur" value="vous@" readonly />
      <span class="message-erreur">Adresse ou mot de passe incorrect.</span>
    </div>`;
}

function bandeaux() {
  return TONS.map(
    ([ton, texte]) => `
      <div class="bandeau ${ton}">
        <span class="puce"></span>
        <div><b>${texte}</b><br />Le texte porte le sens ; la couleur ne fait que l'accompagner.</div>
      </div>`,
  ).join('');
}

function pastilles() {
  return TONS.map(([ton, texte]) => `<span class="pastille ${ton}">${texte}</span>`).join(' ');
}

function planche(densite, etiquette, produit, usage) {
  return `
  <section class="planche" data-densite="${densite}">
    <header class="entete">
      <span class="overline">${etiquette}</span>
      <h2>${produit}</h2>
      <p>${usage}</p>
    </header>

    <div class="grille">
      <div class="colonne">
        <h3>Boutons</h3>
        ${boutons()}

        <h3>Pastilles</h3>
        <div class="rangee">${pastilles()}</div>

        <h3>Champs</h3>
        ${champs()}
      </div>

      <div class="colonne">
        <h3>Cartes</h3>
        <div class="carte">
          <div class="carte-entete">
            <span class="pastille reussite">Cet appareil</span>
            <span class="mono">IL Y A 2 MINUTES</span>
          </div>
          <div class="carte-titre">Chrome sur Windows</div>
          <p class="carte-texte">Dakar, Sénégal · ouverte le 2 septembre</p>
          <div class="carte-pied"><span class="mono">SESSION EN COURS</span><span class="lien">FERMER</span></div>
        </div>
        <div class="carte plate"><b>Carte plate</b><br />Sans élévation, pour une liste.</div>

        <h3>Bandeaux</h3>
        ${bandeaux()}

        <h3>Typographie</h3>
        <div class="display">Un compte. Tout AI5D.</div>
        <p class="corps">Inter compose l'interface et les textes longs. Fraunces signe, et ne
          compose jamais un paragraphe.</p>
        <div class="mono">AI5D-7F3K-92QX</div>
      </div>
    </div>
  </section>`;
}

const STYLE = `
@import '../noyau/ai5d.preset.css';

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--surface-1);
  color: var(--texte);
  font-family: var(--police-corps);
  line-height: var(--interligne-corps);
}
.barre {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 14px 24px;
  background: var(--surface-2); border-bottom: 1px solid var(--bordure);
}
.logo { display: inline-flex; align-items: baseline; font-size: 22px; letter-spacing: var(--lettrage-marque); color: var(--texte-fort); }
.logo b { font-weight: var(--graisse-forte); }
.logo .cinq { color: var(--action); display: inline-block; transform: rotate(-5deg); }
.logo i { font-family: var(--police-titre); font-weight: var(--graisse-legere); font-style: normal; margin-left: 9px; }

.themes { display: flex; gap: 8px; }
.themes button {
  height: 36px; padding: 0 14px; cursor: pointer;
  background: transparent; color: var(--action);
  border: 1px solid var(--action); border-radius: var(--rayon-md);
  font-family: var(--police-corps); font-size: var(--taille-sm);
}
.themes button[aria-pressed='true'] { background: var(--action); color: var(--texte-sur-action); }

.planche { padding: var(--rythme-section) 24px; border-bottom: 1px solid var(--bordure); max-width: var(--contenu-max); margin: 0 auto; }
.entete { margin-bottom: 24px; }
.overline { font-family: var(--police-mono); font-size: var(--taille-xs); letter-spacing: var(--lettrage-overline); text-transform: uppercase; color: var(--action); }
.entete h2 { margin: 6px 0 2px; font-family: var(--police-titre); font-weight: var(--graisse-normale); font-size: var(--taille-2xl); color: var(--texte-fort); letter-spacing: var(--lettrage-titre); }
.entete p { margin: 0; color: var(--texte-faible); font-size: var(--taille-sm); }

.grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; }
.colonne { min-width: 0; }
h3 { margin: 28px 0 12px; font-size: var(--taille-sm); font-weight: var(--graisse-semi); color: var(--texte-faible); text-transform: uppercase; letter-spacing: var(--lettrage-overline); }
h3:first-child { margin-top: 0; }
.rangee { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 10px; }

.bouton {
  display: inline-flex; align-items: center; justify-content: center;
  height: var(--hauteur-controle); min-height: var(--cible-tactile); padding: 0 20px;
  font-family: var(--police-corps); font-size: var(--taille-md); font-weight: var(--graisse-semi);
  border-radius: var(--rayon-md); cursor: pointer;
}
.bouton.primaire { background: var(--action); color: var(--texte-sur-action); border: 1px solid var(--action); }
.bouton.primaire[data-survol] { background: var(--action-survol); border-color: var(--action-survol); }
.bouton.secondaire { background: transparent; color: var(--action); border: 1px solid var(--action); }
.bouton.discret { background: transparent; color: var(--action); border: 1px solid transparent; }
.bouton[disabled] { opacity: .6; cursor: not-allowed; }

.champ { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.champ label { font-size: var(--taille-sm); font-weight: var(--graisse-moyenne); color: var(--texte); }
.champ input {
  height: var(--hauteur-controle); padding: 0 14px;
  background: var(--surface-2); color: var(--texte-fort);
  font-family: var(--police-corps); font-size: var(--taille-md);
  border: 1px solid var(--bordure-forte); border-radius: var(--rayon-md);
}
.champ input.focus { border-color: var(--action); outline: 2px solid var(--action); outline-offset: 2px; }
.champ input.erreur { border-color: var(--erreur); }
.aide { font-size: var(--taille-sm); color: var(--texte-faible); }
.message-erreur { font-size: var(--taille-sm); color: var(--erreur); }

.carte {
  padding: var(--padding-carte); margin-bottom: 12px;
  background: var(--surface-2); border: 1px solid var(--bordure);
  border-radius: var(--rayon-lg); box-shadow: var(--elevation-2);
}
.carte.plate { box-shadow: var(--elevation-0); }
.carte-entete { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.carte-titre { font-family: var(--police-titre); font-size: var(--taille-lg); color: var(--texte-fort); }
.carte-texte { margin: 4px 0 14px; font-size: var(--taille-sm); color: var(--texte-faible); }
.carte-pied { display: flex; justify-content: space-between; }
.lien { color: var(--action); font-family: var(--police-mono); font-size: var(--taille-xs); letter-spacing: var(--lettrage-mono); }

.pastille { display: inline-flex; padding: 2px 10px; border-radius: var(--rayon-plein); font-size: var(--taille-xs); font-weight: var(--graisse-moyenne); }
.bandeau { display: flex; gap: 12px; padding: 14px 16px; margin-bottom: 10px; border-radius: var(--rayon-md); font-size: var(--taille-sm); }
.bandeau .puce { flex: 0 0 20px; height: 20px; border-radius: var(--rayon-plein); border: 1.75px solid currentColor; margin-top: 2px; }

.information { color: var(--info); background: var(--info-fond); }
.reussite    { color: var(--reussite); background: var(--reussite-fond); }
.attention   { color: var(--attention); background: var(--attention-fond); }
.erreur      { color: var(--erreur); background: var(--erreur-fond); }
.bandeau.information, .bandeau.reussite, .bandeau.attention, .bandeau.erreur { border: 1px solid currentColor; }
.bandeau div { color: var(--texte); }

.display { font-family: var(--police-titre); font-weight: var(--graisse-legere); font-size: var(--taille-3xl); line-height: var(--interligne-serre); color: var(--texte-fort); letter-spacing: var(--lettrage-titre); }
.corps { font-size: var(--taille-md); color: var(--texte); max-width: 46ch; }
.mono { font-family: var(--police-mono); font-size: var(--taille-sm); letter-spacing: var(--lettrage-mono); color: var(--texte-faible); }
`;

const SCRIPT = `
const racine = document.documentElement;
for (const bouton of document.querySelectorAll('.themes button')) {
  bouton.addEventListener('click', () => {
    const theme = bouton.dataset.theme;
    if (theme === 'systeme') racine.removeAttribute('data-theme');
    else racine.setAttribute('data-theme', theme);
    for (const autre of document.querySelectorAll('.themes button')) {
      autre.setAttribute('aria-pressed', String(autre === bouton));
    }
  });
}
`;

async function main() {
  const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI5D Digital Design System — spécimens du noyau</title>
<style>${STYLE}</style>
</head>
<body>
<div class="barre">
  ${logotype('Design System')}
  <div class="themes">
    <button data-theme="systeme" aria-pressed="true">Système</button>
    <button data-theme="light" aria-pressed="false">Clair</button>
    <button data-theme="dark" aria-pressed="false">Sombre</button>
  </div>
</div>
${DENSITES.map((d) => planche(...d)).join('\n')}
<script>${SCRIPT}</script>
</body>
</html>
`;

  await mkdir('specimens', { recursive: true });
  await writeFile('specimens/composants.html', page, 'utf8');
  console.log('specimens/composants.html ecrit : 4 densites, 3 themes, aucun appel reseau.');
}

main().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
