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
import { readdirSync, readFileSync } from 'node:fs';
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
  ['neutre', 'Inscription confirmée'],
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

/*
  LES PIECES DE LA 1.2.0, AVEC LES VRAIES FEUILLES DES COMPOSANTS.

  Pour elles, la page ne recopie pas la feuille : elle lit les constantes STYLE_ des composants et
  resout leurs rares interpolations numeriques (TABLETTE, LARGEUR_RAIL_TABLETTE, 480...) depuis les
  constantes exportees du noyau. Seul le balisage est reproduit. Une interpolation inconnue fait
  echouer la generation, plutot que d ecrire une feuille fausse.
*/
const FEUILLES_DES_COMPOSANTS = [
  'noyau/composants/lien.ts',
  'noyau/composants/Bouton.tsx',
  'noyau/composants/OngletsRubrique.tsx',
  'noyau/composants/CoquilleRail.tsx',
  'noyau/composants/SelecteurTheme.tsx',
  'noyau/composants/LigneLien.tsx',
  'noyau/composants/ListeLignes.tsx',
  'noyau/composants/ListeDefinitions.tsx',
  'noyau/composants/ValeurCopiable.tsx',
];

function constantesNumeriques() {
  const valeurs = new Map();
  for (const dossier of ['noyau', 'noyau/composants']) {
    for (const fichier of readdirSync(dossier)) {
      if (!/\.tsx?$/.test(fichier)) continue;
      const source = readFileSync(`${dossier}/${fichier}`, 'utf8');
      for (const [, nom, valeur] of source.matchAll(/export const ([A-Z_]+) = (\d+);/g)) {
        valeurs.set(nom, valeur);
      }
    }
  }
  return valeurs;
}

function feuillesDesComposants() {
  const constantes = constantesNumeriques();
  return FEUILLES_DES_COMPOSANTS.map((chemin) => {
    const source = readFileSync(chemin, 'utf8');
    const feuilles = [...source.matchAll(/const STYLE_[A-Z_]+ = `([\s\S]*?)`;/g)].map((m) => m[1]);
    if (feuilles.length === 0) throw new Error(`${chemin} : aucune feuille STYLE_ trouvee`);
    return feuilles
      .map((css) =>
        css.replace(/\$\{([A-Z_]+)\}/g, (_, nom) => {
          const valeur = constantes.get(nom);
          if (valeur === undefined) throw new Error(`${chemin} : constante ${nom} introuvable`);
          return valeur;
        }),
      )
      .join('\n');
  }).join('\n');
}

/* Le style en ligne d un Bouton, recopie des formules de Bouton.tsx : la hauteur vient de la densite. */
function styleBouton(hauteur) {
  return `display: inline-flex; align-items: center; justify-content: center; gap: var(--espace-2); height: ${hauteur}; min-height: var(--cible-tactile); min-width: var(--cible-tactile); padding: 0 20px; font-family: var(--police-corps); font-size: var(--taille-md); font-weight: var(--graisse-semi); line-height: 1; border-radius: var(--rayon-md); cursor: pointer;`;
}

const POINTS_BOUTON =
  '<span class="ai5d-bouton__points ai5d-bouton__points--attente" aria-hidden="true"><span class="ai5d-bouton__point"></span><span class="ai5d-bouton__point"></span><span class="ai5d-bouton__point"></span></span>';

function boutonsEnLien() {
  const variantes = ['primaire', 'secondaire', 'neutre', 'discret', 'danger', 'danger-contour'];
  const rangees = variantes
    .map(
      (variante) => `
      <div class="rangee">
        <a class="ai5d-bouton" href="#" data-variante="${variante}" data-taille="md" style="${styleBouton('var(--hauteur-controle)')}">Voir ma formation${POINTS_BOUTON}</a>
        <a class="ai5d-bouton" href="#" data-variante="${variante}" data-taille="md" data-en-attente="" style="${styleBouton('var(--hauteur-controle)')}">En attente${POINTS_BOUTON}</a>
        <a class="ai5d-bouton" role="link" aria-disabled="true" data-variante="${variante}" data-taille="md" style="${styleBouton('var(--hauteur-controle)')} cursor: not-allowed; opacity: 0.6;">Désactivé</a>
      </div>`,
    )
    .join('');
  const tailles = [
    ['sm', 'calc(var(--hauteur-controle) - 8px)'],
    ['md', 'var(--hauteur-controle)'],
    ['lg', 'calc(var(--hauteur-controle) + 8px)'],
  ]
    .map(
      ([taille, hauteur]) =>
        `<a class="ai5d-bouton" href="#" data-variante="primaire" data-taille="${taille}" style="${styleBouton(hauteur)}">${taille}${POINTS_BOUTON}</a>`,
    )
    .join(' ');
  return `${rangees}<div class="rangee">${tailles}</div>`;
}

const ONGLETS = ['Vue d’ensemble', 'Annonces', 'Ressources', 'Replays', 'Attestation', 'Badge'];

/* Six onglets : le cinquieme est actif, le troisieme en attente de navigation. */
function onglets() {
  const liens = ONGLETS.map((libelle, index) => {
    const actif = index === 4 ? ' aria-current="page"' : '';
    const attente = index === 2 ? ' data-en-attente=""' : '';
    return `<a class="ai5d-onglets-r__lien" href="#"${actif}${attente}><span>${libelle}</span></a>`;
  }).join('');
  return `<nav class="ai5d-onglets-r" aria-label="Sous-pages de la session">${liens}</nav>`;
}

function rangeesOnglets() {
  const defilees = ['debut', 'milieu', 'fin']
    .map(
      (position) => `
      <div class="specimen-colonne-390" data-specimen="onglets-${position}" data-defiler="${position}">${onglets()}</div>`,
    )
    .join('');
  return `${defilees}
      <div class="specimen-colonne-390" data-specimen="onglets-initial">${onglets()}</div>`;
}

const THEMES_DU_SELECTEUR = [
  ['clair', 'Clair'],
  ['sombre', 'Sombre'],
  ['systeme', 'Système'],
];

function selecteurTheme(libelles) {
  const segments = THEMES_DU_SELECTEUR.map(([valeur, mot]) => {
    const coche = valeur === 'sombre';
    return libelles
      ? `<button type="button" role="radio" aria-checked="${coche}" class="ai5d-theme__segment"><span class="ai5d-theme__icone specimen-icone" aria-hidden="true"></span><span>${mot}</span></button>`
      : `<button type="button" role="radio" aria-checked="${coche}" aria-label="${mot}" title="${mot}" class="ai5d-theme__segment"><span class="specimen-icone" aria-hidden="true"></span></button>`;
  }).join('');
  return `<div class="ai5d-theme" role="radiogroup" aria-label="Thème de l’interface"${libelles ? ' data-libelles=""' : ''}>${segments}</div>`;
}

function selecteursTheme() {
  return `
      <div class="rangee" data-specimen="theme-icones">${selecteurTheme(false)}</div>
      <div class="specimen-pied-288" data-specimen="theme-288">${selecteurTheme(true)}</div>
      <div class="specimen-pied-216" data-specimen="theme-216">${selecteurTheme(true)}</div>`;
}

function piedsCoquille() {
  return `
      <div class="ai5d-coquille-rail specimen-coquille" data-coquille="rail" data-mode="complet" data-pied="complet">
        <footer class="ai5d-coquille-rail__pied-contenu">
          <div class="ai5d-coquille-rail__colonne">
            <div class="ai5d-coquille-rail__pied-compact">
              <span class="specimen-libelle">Thème</span>
              ${selecteurTheme(true)}
            </div>
            <div class="rangee"><a class="lien" href="#">Confidentialité</a><a class="lien" href="#">Mentions légales</a></div>
          </div>
        </footer>
      </div>`;
}

/* Le style en ligne de TitreSection, recopie de TitreSection.tsx. */
function styleTitre(taille) {
  return `margin: 0; font-family: var(--police-titre); font-weight: var(--graisse-normale); font-size: ${taille}; line-height: var(--interligne-titre); letter-spacing: var(--lettrage-titre); color: var(--texte-fort); text-wrap: balance; overflow-wrap: break-word;`;
}

function titres() {
  return `
      <div class="specimen-titres">
        <h1 style="${styleTitre('var(--taille-2xl)')}">IA générative et relation client</h1>
        <h2 style="${styleTitre('var(--taille-xl)')}">Mes autres formations</h2>
        <h3 style="${styleTitre('var(--taille-lg)')}">Ressources de la session</h3>
      </div>`;
}

const CHEVRON =
  '<span class="ai5d-ligne__fin"><span class="specimen-chevron" aria-hidden="true">›</span></span>';
const POINTS_LIGNE =
  '<span class="ai5d-ligne__attente" aria-hidden="true"><span class="ai5d-ligne__point"></span><span class="ai5d-ligne__point"></span><span class="ai5d-ligne__point"></span></span>';
const NOUVEL_ONGLET = '<span class="ai5d-hors-ecran"> (s’ouvre dans un nouvel onglet)</span>';

/* Trois lignes : une destination, un fichier au survol, un lien sortant a l appui. Puis une en attente. */
function lignes() {
  return `
      <ul role="list" class="ai5d-liste-lignes" data-bords="">
        <li><a class="ai5d-ligne" href="#"><span class="ai5d-ligne__corps"><span class="ai5d-ligne__titre" data-en-titre="">IA générative et relation client</span><span class="ai5d-ligne__description">Du 13 au 15 octobre 2026, présentiel</span></span>${CHEVRON}${POINTS_LIGNE}</a></li>
        <li><a class="ai5d-ligne" href="#" download data-force="survol"><span class="ai5d-ligne__corps"><span class="ai5d-ligne__titre">Support du jour 1</span><span class="ai5d-ligne__meta">PDF · 2,4 Mo</span></span>${POINTS_LIGNE}</a></li>
        <li><a class="ai5d-ligne" href="#" target="_blank" rel="noopener noreferrer" data-force="appui"><span class="ai5d-ligne__corps"><span class="ai5d-ligne__titre">Rejoindre la session</span><span class="ai5d-ligne__meta" data-mono="">AI5D-2026-7K3F9Q</span></span>${POINTS_LIGNE}${NOUVEL_ONGLET}</a></li>
      </ul>
      <ul role="list" class="ai5d-liste-lignes">
        <li><a class="ai5d-ligne" href="#" data-en-attente=""><span class="ai5d-ligne__corps"><span class="ai5d-ligne__titre">Ressources</span><span class="ai5d-ligne__description">La page suivante arrive</span></span>${CHEVRON}${POINTS_LIGNE}</a></li>
      </ul>`;
}

const FAITS = [
  ['Session', 'Orange Guinée · octobre 2026', false],
  ['Dates', 'Du 13 au 15 octobre 2026, présentiel', false],
  ['Émise le', '19 octobre 2026', false],
  ['Numéro', 'AI5D-2026-7K3F9Q', true],
];

function definitions(colonnes) {
  const elements = FAITS.map(
    ([libelle, valeur, mono]) =>
      `<div class="ai5d-definitions__element"><dt>${libelle}</dt><dd${mono ? ' data-mono=""' : ''}>${valeur}</dd></div>`,
  ).join('');
  return `<div class="ai5d-definitions specimen-bloc" data-colonnes="${colonnes}"><dl class="ai5d-definitions__liste">${elements}</dl></div>`;
}

function valeurCopiable(etat) {
  const libelle = etat === 'succes' ? 'Lien copié' : 'Copier le lien';
  const annonce =
    etat === 'echec'
      ? '<p class="ai5d-copiable__echec">Sélectionnez l’adresse ci-dessus pour la copier.</p>'
      : '';
  return `
      <div class="ai5d-copiable specimen-bloc">
        <div class="ai5d-copiable__rangee">
          <div class="champ ai5d-copiable__champ"><label>Adresse de votre badge</label><input value="https://portail.ai5d.technology/badge/7K3F9Q" readonly style="font-family: var(--police-mono); font-weight: var(--graisse-moyenne); font-size: var(--taille-md);" /></div>
          <button type="button" class="ai5d-bouton" data-variante="neutre" data-taille="md" style="${styleBouton('var(--hauteur-controle)')}"><span class="specimen-icone" aria-hidden="true"></span>${libelle}</button>
        </div>
        <div class="ai5d-copiable__annonce" aria-live="polite">${annonce}</div>
      </div>`;
}

function mesure() {
  return `
      <div class="mesure-bloc">height: var(--hauteur-controle)</div>
      <div class="mesure-ligne">min-height: var(--ligne-liste)</div>`;
}

/* Une fois, hors des planches : la selection sur les trois surfaces, et le curseur de saisie. */
function selection() {
  return `
<section class="specimen-selection" data-specimen="selection" aria-label="Sélection de texte et curseur">
  <p class="surface-papier">Sur le papier : attestation AI5D-2026-7K3F9Q, délivrée le 19 octobre 2026.</p>
  <p class="surface-carte">Sur une carte : attestation AI5D-2026-7K3F9Q, délivrée le 19 octobre 2026.</p>
  <p class="surface-menu">Sur un menu : attestation AI5D-2026-7K3F9Q, délivrée le 19 octobre 2026.</p>
  <label class="specimen-curseur">Numéro d’attestation <input value="AI5D-2026-7K3F9Q" /></label>
</section>`;
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

    <div class="grille">
      <div class="colonne">
        <h3>Boutons en lien</h3>
        ${boutonsEnLien()}

        <h3>Onglets de rubrique</h3>
        ${rangeesOnglets()}

        <h3>Sélecteur de thème</h3>
        ${selecteursTheme()}

        <h3>Pied de coquille</h3>
        ${piedsCoquille()}
      </div>

      <div class="colonne">
        <h3>Titres</h3>
        ${titres()}

        <h3>Lignes</h3>
        ${lignes()}

        <h3>Définitions, une colonne</h3>
        ${definitions(1)}

        <h3>Valeur copiable</h3>
        ${valeurCopiable('repos')}
        ${valeurCopiable('succes')}
        ${valeurCopiable('echec')}

        <h3>Mesure du plancher</h3>
        ${mesure()}
      </div>
    </div>

    <h3>Définitions, deux colonnes dès 480 px de conteneur</h3>
    ${definitions(2)}

    <h3>Onglets, sans débordement</h3>
    <div data-specimen="onglets-large">${onglets()}</div>
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

const STYLE_SPECIMENS = `
/* Les aides de la page, pour les pieces de la 1.2.0. Aucune ne remplace la feuille d un composant. */
.neutre { color: var(--texte-faible); background: var(--surface-chaude); }
.bandeau.neutre { border: 1px solid currentColor; }
.specimen-colonne-390 { width: 390px; max-width: 100%; margin-bottom: 12px; }
.specimen-pied-288 { width: 288px; max-width: 100%; margin-bottom: 12px; }
.specimen-pied-216 { width: 216px; margin-bottom: 12px; }
.specimen-bloc { margin-bottom: 16px; }
.specimen-icone { display: inline-block; flex: 0 0 auto; width: 16px; height: 16px; border: 1.75px solid currentColor; border-radius: var(--rayon-plein); }
.specimen-chevron { font-size: var(--taille-lg); line-height: 1; }
.specimen-libelle { font-size: var(--taille-sm); font-weight: var(--graisse-semi); color: var(--texte-faible); }
.specimen-coquille.ai5d-coquille-rail { min-height: 0; }
.specimen-titres { display: flex; flex-direction: column; gap: 12px; }
.specimen-titres :is(h1, h2, h3) { text-transform: none; }
.ai5d-copiable__champ.champ { margin-bottom: 0; }
.ai5d-copiable__champ.champ input { width: 100%; }

/* Les etats que le pointeur pose d ordinaire, forces pour la capture. */
.ai5d-ligne[data-force='survol'] { background: var(--surface-chaude); }
:root[data-theme='dark'] .ai5d-ligne[data-force='survol'] { background: var(--surface-3); }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .ai5d-ligne[data-force='survol'] { background: var(--surface-3); }
}
.ai5d-ligne[data-force='appui'] { background: var(--surface-selection); }

.mesure-bloc, .mesure-ligne {
  display: flex; align-items: center; margin-bottom: 8px; padding: 0 12px;
  background: var(--surface-chaude); border: 1px dashed var(--bordure-forte); border-radius: var(--rayon-md);
  font-family: var(--police-mono); font-size: var(--taille-xs); color: var(--texte-faible);
}
.mesure-bloc { height: var(--hauteur-controle); }
.mesure-ligne { min-height: var(--ligne-liste); }

.specimen-selection { max-width: var(--contenu-max); margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 12px; }
.specimen-selection p { margin: 0; padding: 12px 16px; border: 1px solid var(--bordure); border-radius: var(--rayon-md); color: var(--texte-fort); }
.surface-papier { background: var(--surface-1); }
.surface-carte { background: var(--surface-2); }
.surface-menu { background: var(--surface-3); }
.specimen-curseur { display: flex; flex-direction: column; gap: 6px; font-size: var(--taille-sm); color: var(--texte); }
.specimen-curseur input { height: var(--hauteur-controle); padding: 0 14px; background: var(--surface-2); color: var(--texte-fort); border: 1px solid var(--bordure-forte); border-radius: var(--rayon-md); font-family: var(--police-mono); font-size: var(--taille-md); }
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

/* Les rangees d onglets a une position de defilement imposee : debut, milieu, fin. */
function defiler() {
  for (const cadre of document.querySelectorAll('[data-defiler]')) {
    const rangee = cadre.querySelector('.ai5d-onglets-r');
    if (rangee === null) continue;
    const maximum = rangee.scrollWidth - rangee.clientWidth;
    const position = cadre.dataset.defiler;
    rangee.scrollLeft = position === 'fin' ? maximum : position === 'milieu' ? maximum / 2 : 0;
  }
}
window.addEventListener('load', defiler);
window.addEventListener('resize', defiler);
`;

async function main() {
  const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI5D Digital Design System — spécimens du noyau</title>
<style>${STYLE}</style>
<style>${feuillesDesComposants()}</style>
<style>${STYLE_SPECIMENS}</style>
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
${selection()}
<script>${SCRIPT}</script>
</body>
</html>
`;

  await mkdir('specimens', { recursive: true });
  await writeFile('specimens/composants.html', page, 'utf8');
  console.log(
    'specimens/composants.html ecrit : 4 densites, 3 themes, les pieces de la 1.2.0 avec les feuilles des composants, aucun appel reseau.',
  );
}

main().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
