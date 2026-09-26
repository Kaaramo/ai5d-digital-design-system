/**
 * Fige la 1.1.0, une fois, pour les preuves de la 1.2.0.
 *
 * Un changement de valeur de jeton est majeur (CHANGELOG, en tete), et la 1.2.0 se dit mineure : la
 * preuve doit s executer, pas s affirmer. Ce script lit les fichiers de l etiquette v1.1.0 par Git et
 * ecrit dans tests/instantanes/ :
 *
 *   jetons-1.1.0.json       chaque bloc des quatre feuilles, avec ses declarations
 *   profils-1.1.0.css       la feuille de densites fautive, temoin du test et de la garde
 *   Bouton-1.1.0.tsx        le bouton de la 1.1.0, pour comparer le HTML sans adresse
 *   CoquilleRail-1.1.0.tsx  la coquille de la 1.1.0, pour comparer le HTML sans pied
 *
 * Les tests ne lisent jamais Git : l integration continue clone sans etiquettes. Ils lisent ces
 * fichiers, versionnes. Node 24 retire les types de outils/jetons.ts a l import.
 *
 *   node _build/figer-1.1.0.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { decouperBlocs } from '../outils/jetons.ts';

const ETIQUETTE = 'v1.1.0';
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
  `${DOSSIER}/jetons-1.1.0.json`,
  `${JSON.stringify({ etiquette: ETIQUETTE, fichiers }, null, 2)}\n`,
);
writeFileSync(`${DOSSIER}/profils-1.1.0.css`, lire('densites/profils.css'));
writeFileSync(`${DOSSIER}/Bouton-1.1.0.tsx`, lire('noyau/composants/Bouton.tsx'));
writeFileSync(
  `${DOSSIER}/CoquilleRail-1.1.0.tsx`,
  lire('noyau/composants/CoquilleRail.tsx')
    .replaceAll("from './", "from '../../noyau/composants/")
    .replace("from '../paliers'", "from '../../noyau/paliers'"),
);

console.log(`${ETIQUETTE} figee dans ${DOSSIER} : 4 feuilles, 2 composants.`);
