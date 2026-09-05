import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  BUREAU,
  COMPACT,
  LARGE,
  PALIERS,
  PLANCHER,
  REFERENCE_MOBILE,
  TABLETTE,
  auDela,
  enDeca,
} from '../noyau/paliers';
import { BASCULE_DEUX_COLONNES, LARGEUR_FORMULAIRE } from '../noyau/composants/GabaritAuth';
import { HAUTEUR_BARRE_ONGLETS } from '../noyau/composants/BarreOnglets';

const CHEMIN = 'noyau/paliers.css';
const css = readFileSync(CHEMIN, 'utf8');

/**
 * Le fichier sans ses commentaires. Un commentaire a le droit de citer la faute qu'il
 * explique : celui qui justifie l'absence d'`overflow-x: hidden` contient forcement les
 * mots `overflow-x: hidden`. Les gardes font la meme distinction.
 */
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('paliers - l echelle', () => {
  it('ordonne les six valeurs strictement', () => {
    expect(PLANCHER).toBeLessThan(REFERENCE_MOBILE);
    expect(REFERENCE_MOBILE).toBeLessThan(COMPACT);
    expect(COMPACT).toBeLessThan(TABLETTE);
    expect(TABLETTE).toBeLessThan(BUREAU);
    expect(BUREAU).toBeLessThan(LARGE);
  });

  it('ne compte que quatre vrais points de bascule', () => {
    // PLANCHER et REFERENCE_MOBILE sont des contraintes, pas des paliers : rien ne s y
    // declenche. Les melanger produirait un jour @media (min-width: 320px).
    expect(Object.keys(PALIERS)).toEqual(['compact', 'tablette', 'bureau', 'large']);
  });

  it('laisse passer le formulaire de GabaritAuth avant d elargir les marges', () => {
    // 440 px de formulaire, plus deux marges de 32 px. Sous 504, le formulaire deborde.
    expect(COMPACT).toBeGreaterThanOrEqual(LARGEUR_FORMULAIRE + 64);
  });

  it('aligne la bascule deux colonnes sur le palier bureau', () => {
    // Les deux valeurs ont ete mesurees separement et se rejoignent. Si l une bouge sans
    // l autre, ce test le dit avant que le decalage n arrive a l ecran.
    expect(BASCULE_DEUX_COLONNES).toBe(BUREAU);
  });
});

describe('paliers - les requetes media', () => {
  it('rend une requete au-dela', () => {
    expect(auDela('tablette')).toBe('(min-width: 768px)');
  });

  it('rend une requete en deca, sans recouvrir la precedente', () => {
    expect(enDeca('tablette')).toBe('(max-width: 767.98px)');
  });

  it('ne recouvre jamais les deux bornes d un meme palier', () => {
    for (const nom of Object.keys(PALIERS) as (keyof typeof PALIERS)[]) {
      const haut = Number(/min-width: (\d+(?:\.\d+)?)px/.exec(auDela(nom))?.[1]);
      const bas = Number(/max-width: (\d+(?:\.\d+)?)px/.exec(enDeca(nom))?.[1]);
      expect(bas).toBeLessThan(haut);
    }
  });
});

describe('paliers - le fichier CSS', () => {
  it('porte les memes nombres que le TypeScript', () => {
    // Une requete media ne peut pas consommer une variable CSS. Les deux fichiers portent
    // donc les memes valeurs en clair, et ce test est le seul lien entre eux.
    expect(css).toContain(`@media (min-width: ${COMPACT}px)`);
    expect(css).toContain(`@media (min-width: ${BUREAU}px)`);
  });

  it('n ecrit ni couleur ni taille de police', () => {
    // Meme regle que pour les densites : les paliers changent l espace, jamais le texte.
    expect(declarations).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
    expect(declarations).not.toMatch(/\brgba?\(/);
    expect(declarations).not.toMatch(/font-size\s*:/);
    expect(declarations).not.toMatch(/font-family\s*:/);
  });

  it('reserve les quatre zones sures, avec un repli', () => {
    // Sans repli, env() rend une valeur vide et la declaration entiere est ignoree.
    for (const cote of ['bottom', 'top', 'left', 'right']) {
      expect(css, `zone sure ${cote}`).toContain(`env(safe-area-inset-${cote}, 0px)`);
    }
  });

  it('declare la hauteur de barre attendue par le composant', () => {
    expect(css).toContain(`--hauteur-barre-onglets: ${HAUTEUR_BARRE_ONGLETS}px`);
  });

  it('elargit la marge de page en deux temps, jamais en un seul', () => {
    const marges = [...css.matchAll(/--marge-page:\s*(\d+)px/g)].map((m) => Number(m[1]));
    expect(marges).toEqual([16, 24, 32]);
  });

  it('ne masque jamais un debordement', () => {
    // overflow-x: hidden cacherait le debordement au lieu de le supprimer, et le suivant
    // passerait inapercu. C est l inverse de ce que le systeme fait partout ailleurs.
    expect(declarations).not.toMatch(/overflow(-x)?\s*:\s*hidden/);
  });

  it('desactive l agrandissement automatique d iOS sans interdire le zoom manuel', () => {
    expect(css).toContain('text-size-adjust: 100%');
    expect(css).not.toContain('user-scalable');
    expect(css).not.toMatch(/maximum-scale/);
  });
});
