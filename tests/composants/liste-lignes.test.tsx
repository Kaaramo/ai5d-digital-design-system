import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { LigneLien } from '../../noyau/composants/LigneLien';
import { ListeLignes, STYLE_LISTE_LIGNES } from '../../noyau/composants/ListeLignes';

describe('ListeLignes (1.2.0)', () => {
  it('rend une liste nommee, un element par ligne rendue, et aucun pour un enfant absent', () => {
    const avecSupport = false;
    render(
      <ListeLignes etiquette="Mes ressources">
        <LigneLien href="/programme" titre="Programme" />
        {null}
        {avecSupport && <LigneLien href="/support" titre="Support" />}
        <LigneLien href="/replay" titre="Replay" />
      </ListeLignes>,
    );
    const liste = screen.getByRole('list', { name: 'Mes ressources' });
    expect(liste.tagName).toBe('UL');
    expect(liste).toHaveAttribute('role', 'list');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('trace les filets entre les lignes, et aux bords sauf demande contraire', () => {
    const { container, rerender } = render(
      <ListeLignes>
        <LigneLien href="/programme" titre="Programme" />
      </ListeLignes>,
    );
    expect(container.querySelector('ul')).toHaveAttribute('data-bords');

    rerender(
      <ListeLignes bordsExterieurs={false}>
        <LigneLien href="/programme" titre="Programme" />
      </ListeLignes>,
    );
    expect(container.querySelector('ul')).not.toHaveAttribute('data-bords');

    const css = STYLE_LISTE_LIGNES.replace(/\s+/g, ' ');
    expect(css).toContain('.ai5d-liste-lignes { list-style: none; margin: 0; padding: 0; }');
    expect(css).toContain('.ai5d-liste-lignes > li + li { border-top: 1px solid var(--bordure); }');
    expect(css).toContain(
      '.ai5d-liste-lignes[data-bords] { border-top: 1px solid var(--bordure); border-bottom: 1px solid var(--bordure); }',
    );
  });

  it('reste rendable par un composant serveur', () => {
    expect(
      readFileSync('noyau/composants/ListeLignes.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(false);
  });
});
