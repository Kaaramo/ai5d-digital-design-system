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
        <div><b>${texte}</b><br />Le texte porte le sens ; la couleur ne fait que l’accompagner.</div>
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
  constantes exportees du noyau, et une chaine ecrite dans le fichier meme (CONDITION_ANCRE de
  MenuActions, relecture de la 1.3.0, constat I2). Seul le balisage est reproduit. Une interpolation inconnue fait
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
  'noyau/composants/Champ.tsx',
  'noyau/composants/Bandeau.tsx',
  'noyau/composants/Chiffre.tsx',
  'noyau/composants/MenuActions.tsx',
  'noyau/composants/EnteteObjet.tsx',
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
    const locales = new Map(
      [...source.matchAll(/^(?:export )?const ([A-Z_]+) = '([^']*)';$/gm)].map((m) => [m[1], m[2]]),
    );
    const feuilles = [...source.matchAll(/const STYLE_[A-Z_]+ = `([\s\S]*?)`;/g)].map((m) => m[1]);
    if (feuilles.length === 0) throw new Error(`${chemin} : aucune feuille STYLE_ trouvee`);
    return feuilles
      .map((css) =>
        css.replace(/\$\{([A-Z_]+)\}/g, (_, nom) => {
          const valeur = locales.get(nom) ?? constantes.get(nom);
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

/*
  LES PIECES DE LA 1.3.0, AVEC LES VRAIES FEUILLES DES COMPOSANTS.

  Le balisage reproduit celui des composants ; les etats que le pointeur pose d ordinaire sont forces
  par `data-force`, pour la capture. Le menu est pose ouvert, hors de la couche superieure : une page
  statique ne l ouvre pas. Son comportement se prouve sur le banc d essai (docs/preuves/1.3.0/).
*/
const STYLE_PASTILLE_NEUTRE =
  'display: inline-flex; align-items: center; padding: 2px 10px; background: var(--surface-chaude); color: var(--texte-faible); font-family: var(--police-corps); font-size: var(--taille-xs); font-weight: var(--graisse-moyenne); line-height: 1.6; border-radius: var(--rayon-plein);';

/* Le style en ligne d un Bouton `sm`, recopie des formules de Bouton.tsx. */
function styleBoutonSm() {
  return `${styleBouton('calc(var(--hauteur-controle) - 8px)')} font-size: var(--taille-sm);`;
}

function declencheurMenu(nom) {
  return `<span class="ai5d-menu"><button type="button" class="ai5d-bouton" data-variante="discret" data-taille="sm" aria-haspopup="menu" aria-expanded="true" aria-label="Actions pour ${nom}" style="${styleBoutonSm()}"><span class="specimen-icone" aria-hidden="true"></span></button></span>`;
}

/* Deux gestes, un lien, un filet, un geste grave : l un survole, l autre porte le focus. */
function menuActions() {
  return `
      <div class="specimen-menu" data-specimen="menu">
        ${declencheurMenu('Aïssatou Camara')}
        <div class="ai5d-menu__liste specimen-menu__liste" role="menu" aria-label="Actions pour Aïssatou Camara">
          <button type="button" role="menuitem" tabindex="-1" class="ai5d-menu__element" data-force="survol">Corriger l’adresse</button>
          <a role="menuitem" tabindex="0" class="ai5d-menu__element" href="#" data-force="focus">Voir la fiche</a>
          <button type="button" role="menuitem" tabindex="-1" class="ai5d-menu__element">Renvoyer l’invitation</button>
          <div role="separator" class="ai5d-menu__filet"></div>
          <button type="button" role="menuitem" tabindex="-1" class="ai5d-menu__element" data-grave="">Retirer de la session</button>
        </div>
      </div>`;
}

const ONGLETS_SESSION = [
  ['Vue d’ensemble', undefined],
  ['Participants', 25],
  ['Invitations', 8],
  ['Ressources', 2],
  ['Attestations', undefined],
  ['Journal', undefined],
];

/* Six onglets, trois compteurs ; l onglet actif en porte un, qui reste neutre. */
function ongletsCompteurs() {
  const liens = ONGLETS_SESSION.map(([libelle, compteur], index) => {
    const actif = index === 1 ? ' aria-current="page"' : '';
    if (compteur === undefined) {
      return `<a class="ai5d-onglets-r__lien" href="#"${actif}><span>${libelle}</span></a>`;
    }
    return `<a class="ai5d-onglets-r__lien" href="#"${actif} aria-label="${libelle}, ${compteur} à traiter"><span>${libelle}</span><span class="ai5d-onglets-r__compteur" aria-hidden="true" data-ton="neutre" style="${STYLE_PASTILLE_NEUTRE}">${compteur}</span></a>`;
  }).join('');
  return `<nav class="ai5d-onglets-r" aria-label="Sous-pages de la session">${liens}</nav>`;
}

function rangeesCompteurs() {
  return `
      <div class="specimen-colonne-390" data-specimen="compteurs-390">${ongletsCompteurs()}</div>
      <div data-specimen="compteurs-large">${ongletsCompteurs()}</div>`;
}

/* Un bandeau de chaque ton, avec sa fermeture ; celui d attention porte le focus rendu. */
function bandeauxFermables() {
  return TONS.map(([ton, texte]) => {
    const role = ton === 'attention' || ton === 'erreur' ? 'alert' : 'status';
    const focus = ton === 'attention' ? ' data-force="focus" tabindex="-1"' : '';
    return `
      <div class="ai5d-bandeau bandeau ${ton}" role="${role}" data-ton="${ton}"${focus}>
        <span class="puce"></span>
        <div class="specimen-bandeau-corps"><b>${texte}</b><br />Le retour d’un geste, que la personne ferme quand elle l’a lu.</div>
        <button type="button" class="ai5d-bouton" data-variante="discret" data-taille="sm" aria-label="Fermer ce message" style="${styleBoutonSm()} align-self: flex-start;"><span class="specimen-icone" aria-hidden="true"></span></button>
      </div>`;
  }).join('');
}

/* L en-tete de rubrique et son action, recopie du style en ligne d EnteteRubrique.tsx. */
function enteteRubriqueAction() {
  return `
      <header style="display: flex; flex-direction: column; gap: var(--espace-2); padding-bottom: var(--espace-6); border-bottom: 1px solid var(--bordure);">
        <div style="display: flex; align-items: center; gap: var(--espace-4); flex-wrap: wrap;">
          <span aria-hidden="true" style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--rayon-md); background: var(--surface-1); border: 1px solid var(--bordure); color: var(--texte-fort);"><span class="specimen-icone"></span></span>
          <h1 style="margin: 0; font-family: var(--police-titre); font-size: var(--taille-2xl); font-weight: var(--graisse-normale); line-height: var(--interligne-titre); color: var(--texte-fort);">Formations</h1>
          <div style="margin-inline-start: auto;"><a class="ai5d-bouton" href="#" data-variante="primaire" data-taille="md" style="${styleBouton('var(--hauteur-controle)')}">Nouvelle formation${POINTS_BOUTON}</a></div>
        </div>
        <p style="margin: 0; margin-left: calc(40px + var(--espace-4)); font-family: var(--police-corps); font-size: var(--taille-sm); line-height: var(--interligne-corps); color: var(--texte-faible);">Les formations du catalogue, et leurs sessions.</p>
      </header>`;
}

/* Le pouls : trois Chiffre compacts, deux en lien, l un survole. */
function pouls() {
  return `
      <div class="specimen-pouls" data-specimen="pouls">
        <a class="ai5d-chiffre" data-compact="" href="#"><span class="ai5d-chiffre__valeur">212</span> <span class="ai5d-chiffre__libelle">inscriptions sur 237 personnes</span></a>
        <a class="ai5d-chiffre" data-compact="" href="#" data-force="survol"><span class="ai5d-chiffre__valeur">8</span> <span class="ai5d-chiffre__libelle">invitations non acceptées</span></a>
        <span class="ai5d-chiffre" data-compact=""><span class="ai5d-chiffre__valeur">15</span> <span class="ai5d-chiffre__libelle">octobre, début de la délivrance</span></span>
      </div>`;
}

function enteteObjet() {
  return `
      <header class="ai5d-entete-objet" data-specimen="entete-objet">
        <nav aria-label="Fil d’Ariane"><ol role="list" class="ai5d-entete-objet__fil">
          <li><a class="ai5d-entete-objet__lien" href="#">Sessions</a><span class="specimen-chevron" aria-hidden="true">›</span></li>
          <li><a class="ai5d-entete-objet__lien" href="#">Prompt Engineering</a><span class="specimen-chevron" aria-hidden="true">›</span></li>
        </ol></nav>
        <div class="ai5d-entete-objet__tete">
          <h1 style="${styleTitre('var(--taille-2xl)')}">Cohorte n° 5</h1>
          <span class="pastille information">En cours</span>
          <div class="ai5d-entete-objet__gestes">
            <button type="button" class="ai5d-bouton" data-variante="primaire" data-taille="md" style="${styleBouton('var(--hauteur-controle)')}">Clore la session</button>
            ${declencheurMenu('la session')}
          </div>
        </div>
        <ul role="list" class="ai5d-entete-objet__meta">
          <li><span class="specimen-icone" aria-hidden="true"></span><span>Du 13 au 15 octobre 2026, heure de Conakry</span></li>
          <li><span class="specimen-icone" aria-hidden="true"></span><span>Présentiel, Conakry</span></li>
        </ul>
        <div class="ai5d-entete-objet__indicateurs">${pouls()}</div>
      </header>`;
}

const STYLE_ENTREE =
  'width: 100%; height: var(--hauteur-controle); min-height: var(--cible-tactile); font-family: var(--police-corps); font-size: var(--taille-md); border-radius: var(--rayon-md);';

/* Un Selecteur sous un Champ : meme classe, meme feuille, memes etats. */
function selecteurEtChamp() {
  return `
      <div class="specimen-champs" data-specimen="selecteur">
        <div class="specimen-champ"><label class="specimen-etiquette" for="specimen-adresse">Adresse</label><input id="specimen-adresse" class="ai5d-champ__entree" style="${STYLE_ENTREE} padding: 0 14px;" value="aissatou.camara@exemple.invalid" readonly /></div>
        <div class="specimen-champ"><label class="specimen-etiquette" for="specimen-role">Rôle</label><select id="specimen-role" class="ai5d-champ__entree" style="${STYLE_ENTREE} padding: 0 14px;"><option>Membre</option><option>Administrateur</option></select></div>
        <div class="specimen-champ"><label class="specimen-etiquette" for="specimen-fuseau">Fuseau horaire, en erreur</label><select id="specimen-fuseau" class="ai5d-champ__entree" aria-invalid="true" style="${STYLE_ENTREE} padding: 0 14px;"><option value="" disabled selected>Choisissez un fuseau</option></select><span class="message-erreur" role="alert">Choisissez un fuseau horaire.</span></div>
      </div>`;
}

/* Une table factice sur --surface-2 : une ligne survolee et deux lignes selectionnees, cote a cote. */
function tableSurvol() {
  const ligne = (nom, etat, attributs, coche) =>
    `<div class="specimen-table__ligne"${attributs}><input type="checkbox"${coche ? ' checked' : ''} aria-label="Sélectionner ${nom}" /><span>${nom}</span><span class="specimen-table__etat">${etat}</span></div>`;
  return `
      <div class="specimen-table" data-specimen="survol">
        ${ligne('Aïssatou Camara', 'Inscrite', '', false)}
        ${ligne('Mamadou Diallo', 'Survolée', ' data-force="survol"', false)}
        ${ligne('Fatoumata Bah', 'Sélectionnée', ' data-selectionnee=""', true)}
        ${ligne('Ibrahima Sow', 'Sélectionnée', ' data-selectionnee=""', true)}
      </div>`;
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
        <p class="corps">Inter compose l’interface et les textes longs. Fraunces signe, et ne
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

    <div class="grille">
      <div class="colonne">
        <h3>Menu d’actions, ouvert</h3>
        ${menuActions()}

        <h3>Onglets avec compteurs</h3>
        ${rangeesCompteurs()}

        <h3>Bandeaux qui se ferment</h3>
        ${bandeauxFermables()}
      </div>

      <div class="colonne">
        <h3>En-tête de rubrique, avec son action</h3>
        ${enteteRubriqueAction()}

        <h3>En-tête d’objet</h3>
        ${enteteObjet()}

        <h3>Sélecteur et champ</h3>
        ${selecteurEtChamp()}

        <h3>Survol et sélection</h3>
        ${tableSurvol()}
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

.themes { display: flex; flex-wrap: wrap; gap: 8px; }
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

.grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 32px; }
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

/* Les aides de la page, pour les pieces de la 1.3.0. */
.specimen-menu { display: flex; flex-direction: column; align-items: flex-end; max-width: 20rem; margin-bottom: 16px; }
.specimen-menu__liste.ai5d-menu__liste { position: static; display: flex; flex-direction: column; margin-block-start: var(--espace-1); }
.specimen-bandeau-corps { flex: 1; min-width: 0; color: var(--texte); }
.ai5d-bandeau.bandeau { align-items: flex-start; }
.specimen-pouls { display: flex; flex-wrap: wrap; gap: var(--espace-6); }
.specimen-champs { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
.specimen-champ { display: flex; flex-direction: column; gap: 6px; }
.specimen-etiquette { font-size: var(--taille-sm); font-weight: var(--graisse-moyenne); color: var(--texte); }
.specimen-table { background: var(--surface-2); border: 1px solid var(--bordure); border-radius: var(--rayon-md); overflow: hidden; }
.specimen-table__ligne { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--bordure); color: var(--texte-fort); font-size: var(--taille-sm); }
.specimen-table__ligne:last-child { border-bottom: 0; }
.specimen-table__etat { margin-left: auto; color: var(--texte-faible); }

/* Les etats que le pointeur pose d ordinaire, forces pour la capture. */
.ai5d-menu__element[data-force='survol'] { background: var(--surface-survol); }
.ai5d-menu__element[data-force='focus'] { background: var(--surface-survol); outline: 2px solid var(--action); outline-offset: -2px; }
.ai5d-bandeau[data-force='focus'] { outline: 2px solid var(--action); outline-offset: 2px; }
.ai5d-chiffre[data-force='survol'] .ai5d-chiffre__libelle { text-decoration: underline; text-underline-offset: 0.2em; }
.specimen-table__ligne[data-force='survol'] { background: var(--surface-survol); }
.specimen-table__ligne[data-selectionnee] { background: var(--surface-selection); }
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
    'specimens/composants.html ecrit : 4 densites, 3 themes, les pieces de la 1.2.0 et de la 1.3.0 avec les feuilles des composants, aucun appel reseau.',
  );
}

main().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
