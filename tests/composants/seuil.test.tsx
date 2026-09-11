import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { SigneAnime, STYLE_SIGNE } from '../../noyau/composants/SigneAnime';
import { GabaritSeuil, STYLE_SEUIL } from '../../noyau/composants/GabaritSeuil';

/**
 * Le seuil post-authentification : ce qu il montre, et ce qu il refuse de savoir.
 *
 * jsdom ne calcule ni les animations ni les requetes media : ce qui les concerne se verifie sur la
 * feuille du composant, et la preuve du mouvement se fait au navigateur.
 */
const SOURCE_SIGNE = readFileSync('noyau/composants/SigneAnime.tsx', 'utf8');
const SOURCE_SEUIL = readFileSync('noyau/composants/GabaritSeuil.tsx', 'utf8');

/** Les commentaires citent ce qu ils expliquent : une garde lit le CODE, jamais eux. */
function code(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

describe('SigneAnime, la marque entouree de ses anneaux', () => {
  it('rend la marque qu on lui donne, sans en connaitre aucune', () => {
    const { container } = render(<SigneAnime marque={<svg data-marque="un-produit" />} />);
    expect(container.querySelector('[data-marque="un-produit"]')).toBeInTheDocument();
  });

  it('ne code aucune marque : ni chemin SVG, ni nom de produit', () => {
    const utile = code(SOURCE_SIGNE);
    expect(utile).not.toContain('<path');
    expect(utile).not.toContain('viewBox');
    expect(utile.toLowerCase()).not.toContain('compte');
  });

  it('les deux anneaux tournent en SENS INVERSE', () => {
    // Deux anneaux tournant du meme cote se lisent comme un seul objet epais : c est le
    // contre-mouvement qui donne la profondeur.
    expect(STYLE_SIGNE).toContain('animation: ai5d-signe-rotation 1500ms linear infinite;');
    expect(STYLE_SIGNE).toContain('animation: ai5d-signe-rotation 2000ms linear infinite reverse;');
  });

  it('les anneaux sont decoratifs : ils ne disent rien a personne', () => {
    const { container } = render(<SigneAnime marque={<i />} />);
    const anneaux = container.querySelectorAll('.ai5d-signe__anneau');
    expect(anneaux).toHaveLength(2);
    for (const anneau of anneaux) expect(anneau).toHaveAttribute('aria-hidden', 'true');
  });

  it('ne tourne plus, et n entre plus, sous mouvement reduit', () => {
    expect(STYLE_SIGNE).toContain('@media (prefers-reduced-motion: reduce)');
    expect(STYLE_SIGNE).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^}]*animation: none/);
  });

  it('grandit au palier tablette, sans autre rupture', () => {
    expect(STYLE_SIGNE).toContain('@media (min-width: 768px)');
  });

  it('donne sa taille a l emplacement, aux DEUX paliers, et la marque la remplit', () => {
    /*
      LE SYSTEME NE CONNAIT PAS LA MARQUE, MAIS IL CONNAIT LA PLACE QUI RESTE.

      Sans cette regle, le produit devait deviner la taille de sa marque : Compte en a passe une
      de 72 px, juste dans un signe de 10 rem et trop grande dans un signe de 8 rem. Mesure au
      navigateur le 11 septembre 2026, a 390 px : les coins du cartouche passaient a 5 px de
      l anneau interne, contre 21 px sur grand ecran.

      Un carre inscrit dans un cercle touche par ses COINS. La verification ci-dessous compare
      donc la demi-DIAGONALE de l emplacement au rayon interne, jamais sa demi-largeur.
    */
    expect(STYLE_SIGNE).toMatch(/\.ai5d-signe__marque\s*\{[^}]*width: 3\.5rem/);
    expect(STYLE_SIGNE).toContain('.ai5d-signe__marque > * { width: 100%; height: 100%; }');

    // Le palier ne se lit qu a l interieur de son propre bloc : une recherche sur la feuille
    // entiere trouverait n importe quelle declaration, y compris hors du palier.
    const palier = STYLE_SIGNE.slice(STYLE_SIGNE.indexOf('@media (min-width: 768px)'));
    expect(palier.slice(0, palier.indexOf('@media', 1))).toMatch(
      /\.ai5d-signe__marque\s*\{[^}]*4\.5rem/,
    );
  });

  it('laisse de l air entre la marque et l anneau interne, aux deux paliers', () => {
    // L anneau interne est pose a `inset: var(--espace-2)`, soit 8 px de chaque cote.
    const paliers = [
      { signe: 8 * 16, marque: 3.5 * 16 },
      { signe: 10 * 16, marque: 4.5 * 16 },
    ];

    for (const { signe, marque } of paliers) {
      const rayonInterne = (signe - 2 * 8) / 2;
      const demiDiagonale = (marque / 2) * Math.SQRT2;
      expect(
        rayonInterne - demiDiagonale,
        `${signe} px : la marque touche l anneau`,
      ).toBeGreaterThan(12);
    }
  });
});

describe('GabaritSeuil, l ecran', () => {
  it('annonce sa phrase, et tait sa signature', () => {
    render(<GabaritSeuil marque={<i />} phrase="Votre espace se prepare" signature="AI5D" />);
    const phrase = screen.getByText('Votre espace se prepare');
    expect(phrase).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('AI5D')).toHaveAttribute('aria-hidden', 'true');
  });

  it('rend la marque a travers le signe anime', () => {
    const { container } = render(
      <GabaritSeuil marque={<svg data-marque="produit" />} phrase="x" />,
    );
    expect(container.querySelector('[data-signe="anime"]')).toBeInTheDocument();
    expect(container.querySelector('[data-marque="produit"]')).toBeInTheDocument();
  });

  it('ne s efface que lorsque le produit le demande', () => {
    const { container, rerender } = render(<GabaritSeuil marque={<i />} phrase="x" />);
    expect(container.querySelector('[data-seuil="ecran"]')).not.toHaveAttribute('data-sortie');
    rerender(<GabaritSeuil marque={<i />} phrase="x" sortie />);
    expect(container.querySelector('[data-seuil="ecran"]')).toHaveAttribute('data-sortie');
  });

  it('la signature est facultative', () => {
    const { container } = render(<GabaritSeuil marque={<i />} phrase="x" />);
    expect(container.querySelector('.ai5d-seuil__signature')).not.toBeInTheDocument();
  });

  it('la sortie est un fondu avec une legere mise a l echelle, supprimee sous mouvement reduit', () => {
    expect(STYLE_SEUIL).toContain('.ai5d-seuil[data-sortie]');
    expect(STYLE_SEUIL).toContain('transform: scale(1.02)');
    expect(STYLE_SEUIL).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^}]*transition: none/);
  });
});

describe('ce que le seuil refuse de savoir', () => {
  it('ne depend pas de Next : ni routeur, ni transition, ni delai', () => {
    for (const source of [code(SOURCE_SIGNE), code(SOURCE_SEUIL)]) {
      expect(source).not.toContain("from 'next/");
      expect(source).not.toContain('useRouter');
      expect(source).not.toContain('useTransition');
      expect(source).not.toContain('setTimeout');
    }
  });

  it('n ecrit aucune couleur brute ni aucun espacement en pixels', () => {
    for (const feuille of [STYLE_SIGNE, STYLE_SEUIL]) {
      expect(feuille).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(feuille).not.toMatch(/(padding|margin|gap):\s*[^;]*\b\d+px/);
    }
  });
});
