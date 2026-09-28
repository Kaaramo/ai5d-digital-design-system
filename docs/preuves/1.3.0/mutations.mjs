/**
 * Chaque test et chaque garde de la 1.3.0, vus echouer (SPEC 1.3.0, §10 ; lecon du depot : « avant de
 * fixer ce qu une garde tolere, la lancer telle quelle et lire ce qu elle trouve »).
 *
 * Le plan ecrit chaque test AVANT son implementation, et donne la commande qui le voit echouer ; elle
 * ne se lance qu a la tache 17, apres la verification d un bloc (regle de Karamo, « Le moment des
 * tests »). Chaque mutation remet l etat d AVANT la tache : un fichier retire, ou le texte de la 1.2.0
 * restitue. Le fichier est sauvegarde, mute, le test vise lance, et le fichier restaure dans tous les
 * cas. Une mutation qui ne fait rien rougir est un test qui ne garde rien.
 *
 *   node docs/preuves/1.3.0/mutations.mjs           toutes
 *   node docs/preuves/1.3.0/mutations.mjs T10       celles d une tache
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';

const MUTATIONS = [
  {
    tache: 'T2',
    nom: 'le bouton pose de nouveau sa feuille a chaque instance, forme de la 1.2.0',
    fichier: 'noyau/composants/Bouton.tsx',
    avant: '{feuille(ID_STYLE, STYLE_BOUTON)}',
    apres: '<style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_BOUTON }} />',
    tests: ['tests/feuilles.test.tsx', 'gardes/gardes.test.ts'],
  },
  {
    tache: 'T2',
    nom: 'la fonction feuille n existe pas encore',
    fichier: 'noyau/composants/feuille.ts',
    retirer: true,
    tests: ['tests/feuilles.test.tsx'],
  },
  {
    tache: 'T3',
    nom: 'la garde accepte toute balise, precedence ou non',
    fichier: 'gardes/index.ts',
    avant: 'if (!/(?<![\\w-])precedence\\s*=/.test(balise) || !/(?<![\\w-])href\\s*=/.test(balise)) {',
    apres: 'if (false) {',
    tests: ['gardes/gardes.test.ts'],
  },
  {
    tache: 'T4',
    nom: 'le survol sombre retombe sur la selection, forme de la 1.2.0',
    fichier: 'noyau/jetons.css',
    avant: '  --surface-selection: var(--surface-3);\n  --surface-survol: var(--surface-1);',
    apres: '  --surface-selection: var(--surface-3);\n  --surface-survol: var(--surface-3);',
    tests: ['tests/jetons.test.ts'],
  },
  {
    tache: 'T4',
    nom: 'une valeur de jeton de la 1.2.0 change',
    fichier: 'noyau/jetons.css',
    avant: '  --surface-chaude: #f4efe7;',
    apres: '  --surface-chaude: #f4efe8;',
    tests: ['tests/non-regression.test.ts'],
  },
  {
    tache: 'T5',
    nom: 'le rail survole sur --surface-1, hors de la garde (hover: hover), forme de la 1.2.0',
    fichier: 'noyau/composants/LiensRail.tsx',
    avant:
      '@media (hover: hover) {\n  .ai5d-liens-rail__lien:hover { background: var(--surface-survol); color: var(--texte-fort); }\n}',
    apres: '.ai5d-liens-rail__lien:hover { background: var(--surface-1); color: var(--texte-fort); }',
    tests: ['tests/composants/liens-rail.test.tsx'],
  },
  {
    tache: 'T6',
    nom: 'le bandeau ne sait pas se fermer',
    fichier: 'noyau/composants/Bandeau.tsx',
    avant: '{onFermer === undefined ? null : (',
    apres: '{true ? null : (',
    tests: ['tests/composants/composants.test.tsx'],
  },
  {
    tache: 'T7',
    nom: 'la rangee du titre passe en flex-wrap meme sans action',
    fichier: 'noyau/composants/EnteteRubrique.tsx',
    avant: "...(action === undefined ? {} : { flexWrap: 'wrap' }),",
    apres: "flexWrap: 'wrap',",
    tests: ['tests/composants/entete-rubrique.test.tsx'],
  },
  {
    tache: 'T8',
    nom: 'l onglet avec compteur perd son nom « Participants, 25 a traiter »',
    fichier: 'noyau/composants/OngletsRubrique.tsx',
    avant: 'aria-label={nom}',
    apres: 'aria-label={undefined}',
    tous: true,
    tests: ['tests/composants/onglets-rubrique.test.tsx'],
  },
  {
    tache: 'T9',
    nom: 'Chiffre ignore compact, et rend la tuile',
    fichier: 'noyau/composants/Chiffre.tsx',
    avant: 'if (proprietes.compact === true) return <ChiffreCompact {...proprietes} />;',
    apres: '',
    tests: ['tests/composants/composants.test.tsx'],
  },
  {
    tache: 'T9',
    nom: 'le squelette compact rend des tuiles de 5rem',
    fichier: 'noyau/composants/Squelette.tsx',
    avant: '  if (compact) {',
    apres: '  if (compact && false) {',
    tests: ['tests/composants/composants.test.tsx'],
  },
  {
    tache: 'T10',
    nom: 'MenuActions n existe pas encore',
    fichier: 'noyau/composants/MenuActions.tsx',
    retirer: true,
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T10',
    nom: 'onChoisir est appele avant que le focus revienne au declencheur',
    fichier: 'noyau/composants/MenuActions.tsx',
    avant: '            fermer();\n            action.onChoisir();',
    apres: '            action.onChoisir();\n            fermer();',
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T10',
    nom: 'les gestes graves ne sont plus ranges a part',
    fichier: 'noyau/composants/MenuActions.tsx',
    avant: 'autres: actions.filter((action) => action.grave !== true),',
    apres: 'autres: [...actions],',
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T11',
    nom: 'EnteteObjet n existe pas encore',
    fichier: 'noyau/composants/EnteteObjet.tsx',
    retirer: true,
    tests: ['tests/composants/entete-objet.test.tsx'],
  },
  {
    tache: 'T11',
    nom: 'le fil d Ariane perd son nom',
    fichier: 'noyau/composants/EnteteObjet.tsx',
    avant: '<nav aria-label={etiquetteFil}>',
    apres: '<nav>',
    tests: ['tests/composants/entete-objet.test.tsx'],
  },
  {
    tache: 'T12',
    nom: 'Selecteur n existe pas encore',
    fichier: 'noyau/composants/Selecteur.tsx',
    retirer: true,
    tests: ['tests/composants/selecteur.test.tsx'],
  },
  {
    tache: 'T12',
    nom: 'l aide reste affichee et citee sous une erreur',
    fichier: 'noyau/composants/Selecteur.tsx',
    avant: "const avecAide = aide !== undefined && aide !== null && aide !== '' && !enErreur;",
    apres: "const avecAide = aide !== undefined && aide !== null && aide !== '';",
    tests: ['tests/composants/selecteur.test.tsx'],
  },
  {
    tache: 'T13',
    nom: 'la remise a zero de la coquille perd par la specificite, forme du brouillon de la SPEC',
    fichier: 'noyau/composants/CoquilleRail.tsx',
    avant: ".ai5d-coquille-rail[data-mode='complet'] { --reserve-barre: 0px; }",
    apres: '.ai5d-coquille-rail { --reserve-barre: 0px; }',
    tests: ['tests/composants/coquille-rail.test.tsx'],
  },
  {
    tache: 'T13',
    nom: 'la reserve du gabarit ne retombe plus a zero au palier tablette',
    fichier: 'noyau/composants/GabaritApp.tsx',
    avant: '.ai5d-app[data-barre] { --reserve-barre: 0px; }',
    apres: '.ai5d-app { --reserve-barre: 0px; }',
    tests: ['tests/composants/mobile.test.tsx'],
  },
  {
    tache: 'T14',
    nom: 'EnteteObjet devient un module client',
    fichier: 'noyau/composants/EnteteObjet.tsx',
    avant: "import { ChevronRight } from 'lucide-react';",
    apres: "'use client';\n\nimport { ChevronRight } from 'lucide-react';",
    tests: ['tests/index.test.ts'],
  },
  {
    tache: 'T15',
    nom: 'le README annonce encore trente-neuf composants',
    fichier: 'README.md',
    avant: '## Les 42 composants',
    apres: '## Les 39 composants',
    tests: ['tests/documentation.test.ts'],
  },
  // Tache 19 : chaque constat de la relecture repare, remis dans l etat ou la relecture l a trouve.
  {
    tache: 'T19',
    nom: 'I1 : la garde 7 n exige que precedence, et laisse passer une feuille sans href',
    fichier: 'gardes/index.ts',
    avant:
      'if (!/(?<![\\w-])precedence\\s*=/.test(balise) || !/(?<![\\w-])href\\s*=/.test(balise)) {',
    apres: 'if (!/(?<![\\w-])precedence\\s*=/.test(balise)) {',
    tests: ['gardes/gardes.test.ts'],
  },
  {
    tache: 'T19',
    nom: 'I1 : la garde 7 laisse passer un href litteral qui contient une espace',
    fichier: 'gardes/index.ts',
    avant: "} else if (/(?<![\\w-])href\\s*=\\s*\\{?\\s*(['\"`])[^'\"`]*\\s[^'\"`]*\\1/.test(balise)) {",
    apres: '} else if (false) {',
    tests: ['gardes/gardes.test.ts'],
  },
  {
    tache: 'T19',
    nom: 'I2 : le repli teste anchor-name, forme de bef1823, et le menu s ouvre en (0, 0) sous Chromium 125 a 128',
    fichier: 'noyau/composants/MenuActions.tsx',
    avant: '? CSS.supports(CONDITION_ANCRE)',
    apres: "? CSS.supports('anchor-name: --a')",
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T19',
    nom: 'I2 : la feuille teste anchor-name, forme de bef1823',
    fichier: 'noyau/composants/MenuActions.tsx',
    avant: '@supports (${CONDITION_ANCRE}) {',
    apres: '@supports (anchor-name: --a) {',
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T19',
    nom: 'I3 : Selecteur ne pose plus sa feuille, la mutation que la relecture a vue rester verte',
    fichier: 'noyau/composants/Selecteur.tsx',
    avant: '{feuille(ID_STYLE_CHAMP, STYLE_CHAMP)}',
    apres: '',
    tests: ['tests/composants/selecteur.test.tsx', 'tests/feuilles.test.tsx'],
  },
  {
    tache: 'T19',
    nom: 'M1 : un lien du menu ne referme plus le menu',
    fichier: 'noyau/composants/MenuActions.tsx',
    avant: ' onClick={() => fermer()}',
    apres: '',
    tous: true,
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T19',
    nom: 'M5 : le fil d EnteteObjet perd role="list"',
    fichier: 'noyau/composants/EnteteObjet.tsx',
    avant: '<ol role="list" className="ai5d-entete-objet__fil">',
    apres: '<ol className="ai5d-entete-objet__fil">',
    tests: ['tests/composants/entete-objet.test.tsx'],
  },
  {
    tache: 'T19',
    nom: 'M6 : la valeur et le libelle de Chiffre compact se collent de nouveau',
    fichier: 'noyau/composants/Chiffre.tsx',
    avant: "{valeur}</span>{' '}",
    apres: '{valeur}</span>',
    tests: ['tests/composants/composants.test.tsx'],
  },
  {
    tache: 'T19',
    nom: 'M7 : Selecteur reprend l ecart --espace-2 sous son libelle, forme de bef1823',
    fichier: 'noyau/composants/Selecteur.tsx',
    avant: "gap: ECART_LIBELLE_CHAMP }}",
    apres: "gap: 'var(--espace-2)' }}",
    tests: ['tests/composants/selecteur.test.tsx'],
  },
  {
    tache: 'T19',
    nom: 'M8 : un defilement dans le menu le referme',
    fichier: 'noyau/composants/MenuActions.tsx',
    avant: '      if (evenement.target instanceof Node && liste.contains(evenement.target)) return;\n',
    apres: '',
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T19',
    nom: 'M8 : le menu n est plus borne a la fenetre',
    fichier: 'noyau/composants/MenuActions.tsx',
    avant: '  max-block-size: calc(100dvh - var(--espace-8));\n  overflow-y: auto;\n',
    apres: '',
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
  {
    tache: 'T19',
    nom: 'M8 : place par l ancre, le menu ne choisit plus le cote le plus grand',
    fichier: 'noyau/composants/MenuActions.tsx',
    avant: '    position-try-order: most-block-size;\n',
    apres: '',
    tests: ['tests/composants/menu-actions.test.tsx'],
  },
];

const demandee = process.argv[2];
const retenues = MUTATIONS.filter(({ tache }) => demandee === undefined || tache === demandee);
const lignes = [];
let sansEffet = 0;

for (const mutation of retenues) {
  const { tache, nom, fichier, tests } = mutation;
  const original = existsSync(fichier) ? readFileSync(fichier, 'utf8') : null;
  if (original === null || (!mutation.retirer && !original.includes(mutation.avant))) {
    lignes.push(`| ${tache} | ${nom} | mutation impossible : texte ou fichier absent (${fichier}) | ECHEC |`);
    sansEffet += 1;
    continue;
  }

  if (mutation.retirer) renameSync(fichier, `${fichier}.mute`);
  else
    writeFileSync(
      fichier,
      mutation.tous
        ? original.replaceAll(mutation.avant, mutation.apres)
        : original.replace(mutation.avant, mutation.apres),
    );

  let rouge = false;
  let sortie = '';
  try {
    sortie = execSync(`pnpm exec vitest run ${tests.join(' ')}`, {
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, CI: 'true', GITHUB_ACTIONS: 'true' },
    });
  } catch (erreur) {
    rouge = true;
    sortie = `${erreur.stdout ?? ''}${erreur.stderr ?? ''}`;
  } finally {
    if (mutation.retirer) renameSync(`${fichier}.mute`, fichier);
    else writeFileSync(fichier, original);
  }

  const propre = sortie.replace(/\u001b\[[0-9;]*m/g, '');
  const resume = [propre.match(/Test Files\s+[^\n]*/)?.[0], propre.match(/Tests\s+[^\n]*/)?.[0]]
    .filter((ligne) => ligne !== undefined)
    .map((ligne) => ligne.replace(/\s+/g, ' ').replaceAll('|', ',').trim())
    .join(' ; ');
  lignes.push(`| ${tache} | ${nom} | ${tests.join(', ')} · ${resume} | ${rouge ? 'rougit' : 'RESTE VERT'} |`);
  if (!rouge) sansEffet += 1;
}

console.log('| Tache | Mutation | Tests lances, et leur resume | Verdict |');
console.log('| ----- | -------- | ---------------------------- | ------- |');
for (const ligne of lignes) console.log(ligne);
console.log('');
console.log(
  sansEffet === 0
    ? `Les ${retenues.length} mutations ont rougi.`
    : `${sansEffet} mutation(s) sans effet ou impossibles.`,
);
const reste = execSync('git status --short -- noyau gardes README.md', { encoding: 'utf8' });
console.log(`Etat apres restauration : ${reste.trim() === '' ? 'aucun changement' : `\n${reste}`}`);
process.exitCode = sansEffet === 0 ? 0 : 1;
