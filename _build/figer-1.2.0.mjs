/**
 * Fige la 1.2.0, une fois, pour les preuves de la 1.3.0.
 *
 * La 1.3.0 se dit mineure : aucune valeur de jeton ne bouge, et un en-tete de rubrique sans action
 * rend le HTML de la 1.2.0 au caractere pres. Ce script lit les fichiers de l etiquette v1.2.0 par Git
 * et ecrit dans tests/instantanes/ :
 *
 *   jetons-1.2.0.json          chaque bloc des quatre feuilles, avec ses declarations
 *   EnteteRubrique-1.2.0.tsx   l en-tete de la 1.2.0, pour comparer le HTML sans action
 *
 * Les tests ne lisent jamais Git : l integration continue clone sans etiquettes. Node 22 retire les
 * types de outils/jetons.ts a l import.
 *
 *   node _build/figer-1.2.0.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { decouperBlocs } from '../outils/jetons.ts';

const ETIQUETTE = 'v1.2.0';
const DOSSIER = 'tests/instantanes';
const FEUILLES = [
  'noyau/marque.css',
  'noyau/jetons.css',
  'noyau/paliers.css',
  'densites/profils.css',
];

function lire(chemin) {
  return execFileSync('git', ['show', `${ETIQUETTE}:${chemin}`], { encoding: 'utf8' });
}

const fichiers = {};
for (const chemin of FEUILLES) {
  fichiers[chemin] = decouperBlocs(lire(chemin))
    .filter((bloc) => bloc.declarations.size > 0)
    .map((bloc) => ({
      chemin: bloc.chemin,
      selecteur: bloc.selecteur,
      declarations: Object.fromEntries(bloc.declarations),
    }));
}

mkdirSync(DOSSIER, { recursive: true });
writeFileSync(
  `${DOSSIER}/jetons-1.2.0.json`,
  `${JSON.stringify({ etiquette: ETIQUETTE, fichiers }, null, 2)}\n`,
);
writeFileSync(
  `${DOSSIER}/EnteteRubrique-1.2.0.tsx`,
  lire('noyau/composants/EnteteRubrique.tsx').replaceAll(
    "from './",
    "from '../../noyau/composants/",
  ),
);

console.log(`${ETIQUETTE} figee dans ${DOSSIER} : 4 feuilles, 1 composant.`);
