import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import type { ComponentProps } from 'react';
import { FileText } from 'lucide-react';
import { Icone } from '../../noyau/composants/Icone';
import { LigneLien, STYLE_LIGNE_LIEN } from '../../noyau/composants/LigneLien';
import type { ComposantLien } from '../../noyau/composants/LiensRail';

const css = STYLE_LIGNE_LIEN.replace(/\s+/g, ' ');

function espion() {
  const recus: Array<ComponentProps<ComposantLien>> = [];
  const Lien: ComposantLien = (proprietes) => {
    recus.push(proprietes);
    const { children, ...reste } = proprietes;
    return <a {...reste}>{children}</a>;
  };
  return { Lien, recus };
}

describe('LigneLien (1.2.0)', () => {
  it('rend un seul element interactif : la ligne entiere est une cible', () => {
    const { container } = render(
      <LigneLien
        href="/formations/7K3F9Q"
        titre="IA générative et relation client"
        description="Du 13 au 15 octobre 2026"
        meta="Présentiel"
        debut={<Icone nom={FileText} taille={20} />}
      />,
    );
    expect(
      container.querySelectorAll('a, button, input, select, textarea, [tabindex]'),
    ).toHaveLength(1);

    const lien = screen.getByRole('link');
    expect(lien).toHaveClass('ai5d-ligne');
    expect(lien).toHaveAttribute('href', '/formations/7K3F9Q');
    expect(lien.querySelector('.ai5d-ligne__debut')).not.toBeNull();
    expect(lien.querySelector('.ai5d-ligne__titre')).toHaveTextContent(
      'IA générative et relation client',
    );
    expect(lien.querySelector('.ai5d-ligne__description')).toHaveTextContent(
      'Du 13 au 15 octobre 2026',
    );
    expect(lien.querySelector('.ai5d-ligne__meta')).toHaveTextContent('Présentiel');
  });

  it('porte un chevron par defaut, et ses points d attente, tous deux decoratifs', () => {
    render(<LigneLien href="/ressources" titre="Ressources" description="Trois fichiers" />);
    const lien = screen.getByRole('link', { name: /Ressources/ });
    expect(lien.querySelector('.ai5d-ligne__fin svg')).toHaveAttribute('aria-hidden', 'true');
    expect(lien.querySelector('.ai5d-ligne__attente')).toHaveAttribute('aria-hidden', 'true');
    expect(lien.querySelectorAll('.ai5d-ligne__point')).toHaveLength(3);
  });

  it('avec download : a natif, telechargement, aucun chevron, meme avec un lien du produit', () => {
    const { Lien, recus } = espion();
    render(
      <LigneLien
        href="/ressources/support-jour-1.pdf"
        titre="Support du jour 1"
        meta="PDF · 2,4 Mo"
        download
        Lien={Lien}
      />,
    );
    const lien = screen.getByRole('link');
    expect(recus).toHaveLength(0);
    expect(lien).toHaveAttribute('download');
    expect(lien.querySelector('.ai5d-ligne__fin')).toBeNull();
  });

  it('externe : a natif, nouvel onglet, rel complet, mention lue, aucun chevron', () => {
    const { Lien, recus } = espion();
    render(
      <LigneLien
        href="https://exemple.invalid/replay"
        titre="Replay du jour 1"
        externe
        Lien={Lien}
      />,
    );
    const lien = screen.getByRole('link', { name: /s’ouvre dans un nouvel onglet/ });
    expect(recus).toHaveLength(0);
    expect(lien).toHaveAttribute('target', '_blank');
    expect(lien).toHaveAttribute('rel', 'noopener noreferrer');
    expect(lien.querySelector('.ai5d-ligne__fin')).toBeNull();
  });

  it('passe par le lien du produit sinon, avec sa classe et son style', () => {
    const { Lien, recus } = espion();
    render(
      <LigneLien
        href="/formations"
        titre="Mes formations"
        Lien={Lien}
        className="ma-ligne"
        style={{ marginTop: 'var(--espace-2)' }}
      />,
    );
    expect(recus).toHaveLength(1);
    expect(recus[0]?.className).toBe('ai5d-ligne ma-ligne');
    expect(recus[0]?.style).toEqual({ marginTop: 'var(--espace-2)' });
  });

  it('garde une fin fournie, meme avec download', () => {
    render(<LigneLien href="/programme.pdf" titre="Programme" download fin={<span>PDF</span>} />);
    expect(screen.getByRole('link').querySelector('.ai5d-ligne__fin')).toHaveTextContent('PDF');
  });

  it('rend la meta en chasse fixe, et le titre en Fraunces, sur demande', () => {
    const { container } = render(
      <LigneLien
        href="/verifier"
        titre="IA générative et relation client"
        titreEnTitre
        meta="AI5D-2026-7K3F9Q"
        metaMono
      />,
    );
    expect(container.querySelector('.ai5d-ligne__meta')).toHaveAttribute('data-mono');
    expect(container.querySelector('.ai5d-ligne__titre')).toHaveAttribute('data-en-titre');
    expect(css).toContain(
      '.ai5d-ligne__meta[data-mono] { font-family: var(--police-mono); font-weight: var(--graisse-moyenne); }',
    );
    expect(css).toContain(
      '.ai5d-ligne__titre[data-en-titre] { font-family: var(--police-titre); font-size: var(--taille-lg); font-weight: var(--graisse-normale); line-height: var(--interligne-titre); }',
    );
  });
});

describe('la feuille de LigneLien', () => {
  it('tient la hauteur de densite : le premier composant qui lit --ligne-liste', () => {
    expect(css).toContain('min-height: var(--ligne-liste);');
  });

  it('pose l appui sans transition, et relache en --mouvement-retour', () => {
    expect(css).toContain(
      '.ai5d-ligne:active { background: var(--surface-selection); transition: none; }',
    );
    expect(css).toContain('transition: background var(--mouvement-retour);');
  });

  it('garde le survol aux pointeurs fins : surface chaude en clair, surface 3 en sombre', () => {
    expect(STYLE_LIGNE_LIEN.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, '')).not.toContain(
      ':hover',
    );
    expect(css).toContain('.ai5d-ligne:hover { background: var(--surface-chaude); }');
    expect(css).toContain(
      ":root[data-theme='dark'] .ai5d-ligne:hover { background: var(--surface-3); }",
    );
    expect(css).toContain(
      ":root:not([data-theme='light']) .ai5d-ligne:hover { background: var(--surface-3); }",
    );
  });

  it('montre l attente par le protocole, chevron retire, points figes sous mouvement reduit', () => {
    expect(css).toContain(
      '.ai5d-ligne:is([data-en-attente], :has([data-en-attente])) .ai5d-ligne__attente { display: inline-flex; }',
    );
    expect(css).toContain(
      '.ai5d-ligne:is([data-en-attente], :has([data-en-attente])) .ai5d-ligne__fin { display: none; }',
    );
    expect(css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))).toContain(
      '.ai5d-ligne__point { animation: none; opacity: 1; }',
    );
  });

  it('porte l anneau de focus de 2 px en couleur d action', () => {
    expect(css).toContain(
      '.ai5d-ligne:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }',
    );
  });

  it('n ecrit aucune couleur en dur, et reste rendable par un composant serveur', () => {
    expect(STYLE_LIGNE_LIEN).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(readFileSync('noyau/composants/LigneLien.tsx', 'utf8').startsWith("'use client';")).toBe(
      false,
    );
  });
});
