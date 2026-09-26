import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { LOGOTYPE, nomLogotype } from '../noyau/logotype';
import { lireJetons } from '../outils/jetons';

/** Le code sans ses commentaires : un commentaire a le droit de nommer une couleur ou un jeton. */
function code(chemin: string): string {
  return readFileSync(chemin, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('la recette du logotype (1.2.0)', () => {
  it('compose trois morceaux, dans l ordre, le cinq au milieu', () => {
    expect(LOGOTYPE.morceaux.map((morceau) => morceau.texte)).toEqual(['AI', '5', 'D']);
    expect(LOGOTYPE.morceaux.map((morceau) => morceau.role)).toEqual([
      'lettres',
      'cinq',
      'lettres',
    ]);
  });

  it('se compose en Inter 700, le cinq incline de -5 degres', () => {
    expect(LOGOTYPE.famille).toBe('Inter');
    expect(LOGOTYPE.graisse).toBe(700);
    expect(LOGOTYPE.inclinaisonCinqDeg).toBe(-5);
  });

  it('compose le nom du produit en Fraunces 300, a 0,92 de la taille, apres 0,42 em', () => {
    expect(LOGOTYPE.produit).toEqual({
      famille: 'Fraunces',
      graisse: 300,
      echelle: 0.92,
      ecartEm: 0.42,
    });
  });

  it('a le lettrage de --lettrage-marque', () => {
    expect(`${LOGOTYPE.lettrageEm}em`).toBe(
      lireJetons('noyau/jetons.css', ':root').get('--lettrage-marque'),
    );
  });

  it('ne contient aucune couleur, ni valeur ni nom de jeton, et n importe rien', () => {
    const source = code('noyau/logotype.ts');
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(source).not.toMatch(/\b(?:rgba?|hsla?)\s*\(/);
    expect(source).not.toContain('var(--');
    for (const jeton of [
      '--action',
      '--encre',
      '--blanc',
      '--texte',
      '--marque',
      '--surface',
      '--info',
    ]) {
      expect(source, jeton).not.toContain(jeton);
    }
    expect(source).not.toMatch(/^\s*import /m);
  });

  it('dit le nom accessible du composant', () => {
    expect(nomLogotype()).toBe('AI5D');
    expect(nomLogotype('Portail')).toBe('AI5D Portail');
    expect(nomLogotype('')).toBe('AI5D');
  });

  it('est lue par le composant, qui n ecrit plus ses nombres en dur', () => {
    const source = code('noyau/composants/Logotype.tsx');
    expect(source).toContain("from '../logotype'");
    for (const litteral of ['0.92', '0.42', '-5deg']) {
      expect(source, litteral).not.toContain(litteral);
    }
  });
});
