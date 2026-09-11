import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import {
  Squelette,
  SqueletteCartes,
  SqueletteEnTete,
  SqueletteFormulaire,
  SqueletteIndicateurs,
  SqueletteListe,
  SqueletteTableau,
  ZoneEnChargement,
} from '../../noyau/composants/Squelette';

/**
 * Le squelette d attente : ce qu il promet, et ce qu il ne dit pas.
 *
 * La feuille du composant se lit dans la source plutot que dans le DOM : jsdom ne calcule ni les
 * requetes media ni les animations, et un test qui pretendrait les observer mentirait.
 */
const SOURCE = readFileSync('noyau/composants/Squelette.tsx', 'utf8');

/** Les commentaires citent ce qu ils expliquent : une garde lit le CODE, jamais eux. */
const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('Squelette, le bloc', () => {
  it('est masque aux technologies d assistance', () => {
    const { container } = render(<Squelette />);
    expect(container.querySelector('.ai5d-squelette')).toHaveAttribute('aria-hidden', 'true');
  });

  it('prend la hauteur, la largeur et le rayon qu on lui donne', () => {
    const { container } = render(<Squelette hauteur="2rem" largeur="6rem" rayon="plein" />);
    const bloc = container.querySelector('.ai5d-squelette') as HTMLElement;
    expect(bloc.style.height).toBe('2rem');
    expect(bloc.style.width).toBe('6rem');
    expect(bloc.style.borderRadius).toBe('var(--rayon-plein)');
  });

  it('prend la teinte de la BORDURE, jamais une surface', () => {
    // En theme clair, `--surface-2` et `--surface-3` valent le meme blanc : un squelette pose sur
    // une carte y serait invisible, et la page paraitrait vide au lieu d arriver.
    expect(SOURCE).toContain('background: var(--bordure)');
    expect(CODE).not.toContain('--surface-3');
  });

  it('cesse de pulser sous mouvement reduit', () => {
    expect(SOURCE).toContain('@media (prefers-reduced-motion: reduce)');
    expect(SOURCE).toMatch(
      /prefers-reduced-motion: reduce\)\s*\{\s*\.ai5d-squelette \{ animation: none/,
    );
  });
});

describe('ZoneEnChargement, la seule voix de l ecran', () => {
  it('annonce une fois, pour tous les blocs qu elle contient', () => {
    render(
      <ZoneEnChargement>
        <Squelette />
        <Squelette />
        <Squelette />
      </ZoneEnChargement>,
    );
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByText('Chargement en cours')).toBeInTheDocument();
  });

  it('porte aria-busy et aria-live, et accepte son libelle', () => {
    render(
      <ZoneEnChargement libelle="Vos organisations arrivent">
        <Squelette />
      </ZoneEnChargement>,
    );
    const zone = screen.getByRole('status');
    expect(zone).toHaveAttribute('aria-busy', 'true');
    expect(zone).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Vos organisations arrivent')).toBeInTheDocument();
  });
});

describe('les six formes', () => {
  it('l en-tete annonce une intention puis un titre', () => {
    const { container } = render(<SqueletteEnTete />);
    expect(container.querySelector('[data-forme="en-tete"]')).toBeInTheDocument();
    expect(container.querySelectorAll('.ai5d-squelette')).toHaveLength(2);
  });

  it('la grille de cartes rend le nombre demande', () => {
    const { container } = render(<SqueletteCartes nombre={3} />);
    // Quatre blocs par carte : vignette, surtitre, titre, description.
    expect(container.querySelectorAll('.ai5d-squelette')).toHaveLength(12);
  });

  it('le tableau donne a sa premiere colonne le double de largeur', () => {
    const { container } = render(<SqueletteTableau lignes={2} colonnes={3} />);
    const premiere = container.querySelectorAll('.ai5d-squelette')[0] as HTMLElement;
    const seconde = container.querySelectorAll('.ai5d-squelette')[1] as HTMLElement;
    expect(premiere.style.flexGrow).toBe('2');
    expect(seconde.style.flexGrow).toBe('1');
  });

  it('le tableau rend AUSSI des cartes quand l ecran en rend sous 1024 px', () => {
    const { container } = render(<SqueletteTableau avecCartesMobile />);
    expect(container.querySelector('[data-forme="tableau-compact"]')).toBeInTheDocument();
    expect(container.querySelector('[data-forme="tableau"]')).toBeInTheDocument();
    // Les deux coexistent : c est la feuille qui en masque une a chaque palier.
    expect(SOURCE).toContain('@media (min-width: 1024px)');
  });

  it('le tableau ordinaire ne rend qu une forme', () => {
    const { container } = render(<SqueletteTableau />);
    expect(container.querySelector('[data-forme="tableau-compact"]')).not.toBeInTheDocument();
  });

  it('la liste porte un rond quand ses lignes sont des personnes, et pas sinon', () => {
    const avec = render(<SqueletteListe lignes={1} />);
    const rond = avec.container.querySelectorAll('.ai5d-squelette')[0] as HTMLElement;
    expect(rond.style.borderRadius).toBe('var(--rayon-plein)');

    const sans = render(<SqueletteListe lignes={1} avecAvatar={false} />);
    const premier = sans.container.querySelectorAll('.ai5d-squelette')[0] as HTMLElement;
    expect(premier.style.borderRadius).not.toBe('var(--rayon-plein)');
  });

  it('les indicateurs recoivent leur disposition, jamais une valeur devinee', () => {
    const { container } = render(<SqueletteIndicateurs nombre={3} colonnes="repeat(3, 1fr)" />);
    const grille = container.querySelector('[data-forme="indicateurs"]') as HTMLElement;
    expect(grille.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    expect(container.querySelectorAll('.ai5d-squelette')).toHaveLength(3);
  });

  it('le formulaire rend une etiquette et un champ par ligne, puis un bouton', () => {
    const { container } = render(<SqueletteFormulaire champs={2} />);
    // Deux par champ, plus le bouton.
    expect(container.querySelectorAll('.ai5d-squelette')).toHaveLength(5);
  });
});

describe('ce que le systeme ne fait pas', () => {
  it('n ecrit aucun espacement en pixels : la garde du sprint 17 le refusera', () => {
    expect(CODE).not.toMatch(/(padding|margin|gap)[A-Za-z]*:\s*'?\d+px/);
  });

  it('ne depend pas de Next', () => {
    expect(SOURCE).not.toContain("from 'next/");
  });
});
