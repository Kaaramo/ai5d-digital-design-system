import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import type { ReactNode } from 'react';
import { House, Shield, User } from 'lucide-react';
import { LiensRail, STYLE_LIENS_RAIL, type ComposantLien } from '../../noyau/composants/LiensRail';
import { BarreOnglets } from '../../noyau/composants/BarreOnglets';
import type { Rubrique } from '../../noyau/composants/CoquilleRail';

/**
 * Les liens du rail, et la barre basse qui reçoit désormais le même lien.
 *
 * Ce que ces tests prouvent est structurel : jsdom ne calcule ni le survol ni les requêtes
 * média. Les états visuels se vérifient sur la feuille, et au navigateur à la tâche 16.
 */

const RUBRIQUES: Rubrique[] = [
  { id: 'accueil', libelle: 'Accueil', icone: House, href: '/accueil' },
  { id: 'profil', libelle: 'Profil', icone: User, href: '/profil' },
  { id: 'securite', libelle: 'Sécurité', icone: Shield, href: '/securite' },
];

const SOURCE = readFileSync('noyau/composants/LiensRail.tsx', 'utf8');

/** Les commentaires citent ce qu ils expliquent : une garde lit le CODE, jamais eux. */
function code(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** Un lien de produit reconnaissable, qui prouve que le composant passé est bien employé. */
const LienProduit: ComposantLien = ({ href, className, 'aria-current': courant, children }) => (
  <a href={href} className={className} aria-current={courant} data-lien-produit="oui">
    {children as ReactNode}
  </a>
);

describe('LiensRail', () => {
  it('marque la rubrique active, et elle seule', () => {
    render(<LiensRail rubriques={RUBRIQUES} actif="profil" etiquette="Rubriques" />);

    expect(screen.getByRole('link', { name: 'Profil' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Accueil' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Sécurité' })).not.toHaveAttribute('aria-current');
  });

  it('n active rien pour un identifiant inconnu', () => {
    // Une navigation qui designe une page ou l on n est pas est pire qu une navigation muette.
    const { container } = render(
      <LiensRail rubriques={RUBRIQUES} actif="inexistante" etiquette="Rubriques" />,
    );
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(0);
  });

  it('emploie le composant de lien du produit quand il est fourni', () => {
    const { container } = render(
      <LiensRail rubriques={RUBRIQUES} actif="accueil" Lien={LienProduit} etiquette="Rubriques" />,
    );
    expect(container.querySelectorAll('[data-lien-produit="oui"]')).toHaveLength(3);
  });

  it('retombe sur un lien de document sans composant fourni', () => {
    render(<LiensRail rubriques={RUBRIQUES} actif="accueil" etiquette="Rubriques" />);
    expect(screen.getByRole('link', { name: 'Accueil' })).toHaveAttribute('href', '/accueil');
  });

  it('nomme sa navigation, et garde ses icones decoratives', () => {
    const { container } = render(
      <LiensRail rubriques={RUBRIQUES} actif="accueil" etiquette="Rubriques du compte" />,
    );
    expect(screen.getByRole('navigation', { name: 'Rubriques du compte' })).toBeInTheDocument();
    for (const icone of container.querySelectorAll('svg')) {
      expect(icone).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('porte l actif sur le jeton de selection, et non sur un selecteur par theme', () => {
    expect(STYLE_LIENS_RAIL).toMatch(/\[aria-current='page'\]\s*\{[^}]*--surface-selection/);
    expect(STYLE_LIENS_RAIL).not.toMatch(/\[aria-current='page'\]\s*\{[^}]*--info-fond/);
  });

  it('garde la cible tactile, l anneau de focus et le mouvement reduit', () => {
    expect(STYLE_LIENS_RAIL).toContain('min-height: var(--cible-tactile)');
    expect(STYLE_LIENS_RAIL).toMatch(/:focus-visible\s*\{[^}]*outline: 2px solid var\(--action\)/);
    expect(STYLE_LIENS_RAIL).toMatch(/prefers-reduced-motion: reduce\)\s*\{[^}]*transition: none/);
  });

  it('ne depend ni de Next ni d aucun crochet', () => {
    const utile = code(SOURCE);
    expect(utile).not.toContain("'use client'");
    expect(utile).not.toContain("from 'next/");
    expect(utile).not.toMatch(/\buse[A-Z]\w*\(/);
  });
});

describe('BarreOnglets et le lien du produit', () => {
  const ONGLETS = RUBRIQUES.map(({ id, libelle, icone, href }) => ({ id, libelle, icone, href }));

  it('emploie le lien du produit, et ne recharge donc plus le document', () => {
    const { container } = render(
      <BarreOnglets onglets={ONGLETS} actif="profil" Lien={LienProduit} etiquette="Rubriques" />,
    );
    expect(container.querySelectorAll('[data-lien-produit="oui"]')).toHaveLength(3);
    expect(container.querySelector('[aria-current="page"]')).toHaveTextContent('Profil');
  });

  it('retombe sur un lien de document sans composant fourni', () => {
    const { container } = render(
      <BarreOnglets onglets={ONGLETS} actif="profil" etiquette="Rubriques" />,
    );
    expect(container.querySelectorAll('[data-lien-produit]')).toHaveLength(0);
    expect(container.querySelector('a[href="/profil"]')).toHaveAttribute('aria-current', 'page');
  });
});
