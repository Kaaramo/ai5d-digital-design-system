/**
 * Chaque garde nouvelle de la 1.2.0, vue echouer une fois (SPEC 1.2.0, §10 ; lecon du depot : « avant
 * de fixer ce qu une garde tolere, la lancer telle quelle et lire ce qu elle trouve »).
 *
 * Pour chaque mutation, le fichier est sauvegarde, mute, le test vise lance, et le fichier restaure
 * dans tous les cas. Une mutation qui ne fait rien rougir est une garde qui ne garde rien.
 * M1 est la forme exacte de la 1.1.0, densites/profils.css:79-80 : l ancien code.
 *
 *   node docs/preuves/1.2.0/mutations.mjs
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const MUTATIONS = [
  {
    nom: 'M1 · le plancher relit sa propre propriete, forme de la 1.1.0',
    fichier: 'densites/profils.css',
    avant: 'max(var(--hauteur-controle-profil), 44px)',
    apres: 'max(var(--hauteur-controle), 44px)',
    tests: ['gardes/gardes.test.ts', 'tests/cycles.test.ts', 'tests/densites.test.ts', 'tests/non-regression.test.ts'],
  },
  {
    nom: 'M2 · une valeur de jeton de la 1.1.0 change',
    fichier: 'noyau/jetons.css',
    avant: '--surface-chaude: #f4efe7;',
    apres: '--surface-chaude: #f4efe8;',
    tests: ['tests/non-regression.test.ts'],
  },
  {
    nom: 'M3 · un jeton de mouvement pointe vers une duree inexistante',
    fichier: 'noyau/jetons.css',
    avant: '--mouvement-retour: var(--duree-courte)',
    apres: '--mouvement-retour: var(--duree-rapide)',
    tests: ['tests/jetons.test.ts'],
  },
  {
    nom: 'M4 · un lien sortant perd noreferrer',
    fichier: 'noyau/composants/lien.ts',
    avant: "['noopener', 'noreferrer']",
    apres: "['noopener']",
    tests: ['tests/composants/bouton-lien.test.tsx', 'tests/composants/ligne-lien.test.tsx'],
  },
  {
    nom: 'M5 · OngletsRubrique devient un module client',
    fichier: 'noyau/composants/OngletsRubrique.tsx',
    avant: "import type { CSSProperties, ReactNode } from 'react';",
    apres: "'use client';\n\nimport type { CSSProperties, ReactNode } from 'react';",
    tests: ['tests/index.test.ts', 'tests/composants/onglets-rubrique.test.tsx'],
  },
  {
    nom: 'M6 · l export du logotype pointe dans le vide',
    fichier: 'package.json',
    avant: '"./logotype": "./noyau/logotype.ts"',
    apres: '"./logotype": "./noyau/logotypes.ts"',
    tests: ['tests/exports.test.ts'],
  },
  {
    nom: 'M7 · la couleur du navigateur derive de --surface-1',
    fichier: 'noyau/couleurs-navigateur.ts',
    avant: "clair: '#FAF7F2'",
    apres: "clair: '#FAF7F3'",
    tests: ['tests/composants/theme.test.tsx'],
  },
  {
    nom: 'M8 · la copie avale son echec',
    fichier: 'noyau/composants/ValeurCopiable.tsx',
    avant: "setEtat('echec');",
    apres: "setEtat('repos');",
    tests: ['tests/composants/valeur-copiable.test.tsx'],
  },
  {
    nom: 'M9 · la ligne perd sa hauteur de densite',
    fichier: 'noyau/composants/LigneLien.tsx',
    avant: 'min-height: var(--ligne-liste);',
    apres: 'min-height: auto;',
    tests: ['tests/composants/ligne-lien.test.tsx'],
  },
  {
    nom: 'M10 · un survol de bouton sort de la garde (hover: hover)',
    fichier: 'noyau/composants/Bouton.tsx',
    avant: '@media (hover: hover) {',
    apres: '@media all {',
    tests: ['tests/composants/bouton-lien.test.tsx'],
  },
  {
    nom: 'M11 · la coquille ne se declare plus avec un pied',
    fichier: 'noyau/composants/CoquilleRail.tsx',
    avant: 'data-pied={typePied}',
    apres: '',
    tests: ['tests/composants/coquille-rail.test.tsx'],
  },
  {
    nom: 'M12 · le ton neutre se colore en information',
    fichier: 'noyau/composants/Pastille.tsx',
    avant: "neutre: { texte: 'var(--texte-faible)', fond: 'var(--surface-chaude)' },",
    apres: "neutre: { texte: 'var(--info)', fond: 'var(--info-fond)' },",
    tests: ['tests/composants/composants.test.tsx'],
  },
  {
    nom: 'M13 · la garde distribuee exige de nouveau la forme fautive',
    fichier: 'gardes/index.ts',
    avant: 'max(var(${variable}-profil)',
    apres: 'max(var(${variable})',
    tests: ['gardes/gardes.test.ts'],
  },
];

const lignes = [];
let sansEffet = 0;

for (const { nom, fichier, avant, apres, tests } of MUTATIONS) {
  const original = readFileSync(fichier, 'utf8');
  if (!original.includes(avant)) {
    lignes.push(`| ${nom} | mutation impossible : le texte vise est absent de ${fichier} | ECHEC |`);
    sansEffet += 1;
    continue;
  }

  writeFileSync(fichier, original.replace(avant, apres));
  let rouge = false;
  let sortie = '';
  try {
    sortie = execSync(`pnpm exec vitest run ${tests.join(' ')}`, { encoding: 'utf8', stdio: 'pipe' });
  } catch (erreur) {
    rouge = true;
    sortie = `${erreur.stdout ?? ''}${erreur.stderr ?? ''}`;
  } finally {
    writeFileSync(fichier, original);
  }

  const resume = (sortie.match(/Tests\s+[^\n]*/) ?? ['(aucun resume)'])[0].trim();
  lignes.push(`| ${nom} | ${tests.join(', ')} · ${resume} | ${rouge ? 'rougit' : 'RESTE VERT'} |`);
  if (!rouge) sansEffet += 1;
}

console.log('| Mutation | Tests lances, et leur resume | Verdict |');
console.log('| -------- | ---------------------------- | ------- |');
for (const ligne of lignes) console.log(ligne);
console.log('');
console.log(sansEffet === 0 ? 'Toutes les mutations ont rougi.' : `${sansEffet} mutation(s) sans effet ou impossibles.`);
const reste = execSync('git diff --stat -- noyau densites gardes package.json', { encoding: 'utf8' });
console.log(`Fichiers du produit apres restauration : ${reste.trim() === '' ? 'aucun changement' : reste}`);
process.exitCode = sansEffet === 0 ? 0 : 1;
