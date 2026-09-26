import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { decouperBlocs, type BlocCss } from '../outils/jetons';
import { INVALIDE, PROFILS, valeursEffectives } from './aides/densite';

/**
 * AUCUNE VALEUR DE LA 1.1.0 NE CHANGE.
 *
 * Un changement de valeur de jeton est majeur (CHANGELOG, en tete) : il change le rendu de tous les
 * produits. La 1.2.0 se dit mineure ; cette preuve s execute au lieu de s affirmer (SPEC 1.2.0, §6.2).
 *
 * L instantane a ete engendre une fois depuis l etiquette v1.1.0 par `_build/figer-1.1.0.mjs`, puis
 * versionne. Le test ne lit jamais Git : l integration continue clone sans etiquettes.
 *
 * Trois feuilles se comparent declaration par declaration, bloc par bloc : aucune valeur declaree n a
 * le droit de bouger, et une propriete absente fait echouer. La feuille de densites se compare par sa
 * valeur EFFECTIVE, puisque le correctif du plancher change sa forme et rien d autre.
 */

interface BlocFige {
  chemin: string[];
  selecteur: string;
  declarations: Record<string, string>;
}

interface Instantane {
  etiquette: string;
  fichiers: Record<string, BlocFige[]>;
}

const INSTANTANE = JSON.parse(
  readFileSync('tests/instantanes/jetons-1.1.0.json', 'utf8'),
) as Instantane;

const DENSITES = 'densites/profils.css';

const VARIABLES = [
  '--rythme-section',
  '--padding-carte',
  '--hauteur-controle',
  '--ligne-liste',
  '--interligne-corps',
  '--contenu-max',
] as const;

function cle(chemin: string[], selecteur: string): string {
  return [...chemin, selecteur].join(' » ');
}

function indexer(blocs: BlocCss[]): Map<string, Map<string, string>> {
  const index = new Map<string, Map<string, string>>();
  for (const bloc of blocs) {
    const ou = cle(bloc.chemin, bloc.selecteur);
    const declarations = index.get(ou) ?? new Map<string, string>();
    for (const [nom, valeur] of bloc.declarations) declarations.set(nom, valeur);
    index.set(ou, declarations);
  }
  return index;
}

function versBlocs(figes: BlocFige[]): BlocCss[] {
  return figes.map(({ chemin, selecteur, declarations }) => ({
    chemin,
    selecteur,
    declarations: new Map(Object.entries(declarations)),
  }));
}

describe(`aucune valeur de ${INSTANTANE.etiquette} ne change`, () => {
  it('l instantane porte les quatre feuilles', () => {
    expect(Object.keys(INSTANTANE.fichiers).sort()).toEqual([
      'densites/profils.css',
      'noyau/jetons.css',
      'noyau/marque.css',
      'noyau/paliers.css',
    ]);
  });

  for (const [fichier, figes] of Object.entries(INSTANTANE.fichiers)) {
    if (fichier === DENSITES) continue;

    it(`${fichier} garde chaque declaration, bloc par bloc`, () => {
      expect(figes.length).toBeGreaterThan(0);
      const actuels = indexer(decouperBlocs(readFileSync(fichier, 'utf8')));
      for (const bloc of figes) {
        const ou = cle(bloc.chemin, bloc.selecteur);
        for (const [nom, valeur] of Object.entries(bloc.declarations)) {
          expect(actuels.get(ou)?.get(nom), `${fichier} · ${ou} · ${nom}`).toBe(valeur);
        }
      }
    });
  }

  describe(`${DENSITES}, par la valeur effective`, () => {
    const avant = versBlocs(INSTANTANE.fichiers[DENSITES] ?? []);
    const apres = decouperBlocs(readFileSync(DENSITES, 'utf8'));

    it('l instantane de la feuille de densites n est pas vide', () => {
      expect(avant.length).toBeGreaterThan(0);
    });

    for (const profil of [null, ...PROFILS]) {
      const nom = profil ?? 'sans profil';

      it(`${nom} : a la souris, les six valeurs sont celles de la 1.1.0`, () => {
        const v110 = valeursEffectives(avant, profil, 'souris');
        const v120 = valeursEffectives(apres, profil, 'souris');
        for (const variable of VARIABLES) {
          expect(v110.get(variable), `1.1.0 · ${variable}`).not.toBe(INVALIDE);
          expect(v120.get(variable), `1.2.0 · ${variable}`).toBe(v110.get(variable));
        }
      });

      it(`${nom} : au doigt, les deux hauteurs passent d invalide au plancher`, () => {
        const v110 = valeursEffectives(avant, profil, 'doigt');
        const v120 = valeursEffectives(apres, profil, 'doigt');
        const souris = valeursEffectives(apres, profil, 'souris');
        for (const variable of ['--hauteur-controle', '--ligne-liste']) {
          expect(v110.get(variable), `1.1.0 · ${variable}`).toBe(INVALIDE);
          const attendu = `${Math.max(Number.parseFloat(souris.get(variable) ?? '0'), 44)}px`;
          expect(v120.get(variable), `1.2.0 · ${variable}`).toBe(attendu);
        }
        for (const variable of [
          '--rythme-section',
          '--padding-carte',
          '--interligne-corps',
          '--contenu-max',
        ]) {
          expect(v120.get(variable), variable).toBe(v110.get(variable));
        }
      });
    }
  });
});
