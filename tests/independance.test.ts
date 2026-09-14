import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * DEUX PROPRIÉTÉS QUE LA 1.0.0 PROMET À TOUS LES PRODUITS.
 *
 * Elles étaient vérifiées fichier par fichier, dans les tests de chaque composant. Un composant
 * ajouté sans son test les aurait traversées. Ces gardes balaient le dépôt entier.
 */

/** Tous les fichiers de code sous un dossier. */
function sources(dossier: string): string[] {
  const sortie: string[] = [];
  for (const entree of readdirSync(dossier)) {
    const complet = join(dossier, entree);
    if (statSync(complet).isDirectory()) sortie.push(...sources(complet));
    else if (/\.(ts|tsx)$/.test(entree)) sortie.push(complet);
  }
  return sortie;
}

/** Le code sans ses commentaires : un commentaire a le droit de citer ce qu il interdit. */
function code(chemin: string): string {
  return readFileSync(chemin, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

describe('le systeme ne depend d aucun cadriciel', () => {
  /*
    LA CONDITION POUR SERVIR TOUS LES PRODUITS.

    La coquille de Compte importait `next/link` et lisait `usePathname()`. Remontee telle quelle, elle
    n aurait servi qu aux produits Next. La navigation passe donc en emplacements, decision 003, et
    aucun fichier du noyau ni des gardes ne doit importer Next, meme pour une commodite.
  */
  it('aucun fichier du noyau ni des gardes n importe Next', () => {
    const fichiers = [...sources('noyau'), ...sources('gardes')];
    expect(fichiers.length).toBeGreaterThan(0);

    for (const fichier of fichiers) {
      expect(code(fichier), `${fichier} importe Next`).not.toMatch(/from ['"]next(\/|['"])/);
    }
  });
});

describe('le jeton de selection existe dans chaque theme', () => {
  /*
    `--surface-selection` porte l etat actif du rail, de la barre basse et du selecteur de theme. S il
    manquait a un seul bloc, `var(--surface-selection)` deviendrait invalide dans ce theme, en silence :
    la pastille active disparaitrait, sans erreur ni avertissement. C est exactement le defaut qu il
    corrige.
  */
  const JETONS = readFileSync('noyau/jetons.css', 'utf8');

  /** Le contenu d un bloc, a partir de son selecteur, jusqu a son accolade fermante. */
  function bloc(ouverture: string): string {
    const debut = JETONS.indexOf(ouverture);
    expect(debut, `le bloc ${ouverture} est introuvable`).toBeGreaterThanOrEqual(0);

    let profondeur = 0;
    for (let i = JETONS.indexOf('{', debut); i < JETONS.length; i += 1) {
      if (JETONS[i] === '{') profondeur += 1;
      if (JETONS[i] === '}') {
        profondeur -= 1;
        if (profondeur === 0) return JETONS.slice(debut, i + 1);
      }
    }
    return '';
  }

  it.each([
    [':root {', 'var(--info-fond)'],
    ['@media (prefers-color-scheme: dark)', 'var(--surface-3)'],
    [":root[data-theme='dark']", 'var(--surface-3)'],
    [":root[data-theme='light']", 'var(--info-fond)'],
  ])('dans %s, il vaut %s', (ouverture, valeur) => {
    expect(bloc(ouverture)).toContain(`--surface-selection: ${valeur};`);
  });
});
