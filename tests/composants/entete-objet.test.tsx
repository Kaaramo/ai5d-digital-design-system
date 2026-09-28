import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import type { ComponentProps } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { EnteteObjet } from '../../noyau/composants/EnteteObjet';
import { Bouton } from '../../noyau/composants/Bouton';
import { Chiffre } from '../../noyau/composants/Chiffre';
import { PastilleEtat } from '../../noyau/composants/PastilleEtat';
import type { ComposantLien } from '../../noyau/composants/LiensRail';
import { texteFeuille } from '../aides/feuille';

/**
 * `EnteteObjet` (SPEC 1.3.0, §5.8). Monté sur le constat de Compte, `EnteteConsole.tsx:25-34`.
 */

function rendre(Lien?: ComposantLien) {
  return render(
    <EnteteObjet
      fil={[
        { libelle: 'Sessions', href: '/admin/sessions' },
        { libelle: 'Prompt Engineering', href: '/admin/formations/prompt-engineering' },
      ]}
      titre="Cohorte n° 5"
      etat={<PastilleEtat ton="information">En cours</PastilleEtat>}
      metadonnees={[
        { icone: CalendarDays, texte: 'Du 13 au 15 octobre 2026, heure de Conakry' },
        { icone: MapPin, texte: 'Présentiel, Conakry' },
      ]}
      action={<Bouton variante="primaire">Clore la session</Bouton>}
      menu={<Bouton variante="discret">Actions de la session</Bouton>}
      indicateurs={<Chiffre compact valeur="212" libelle="inscriptions sur 237 personnes" />}
      {...(Lien === undefined ? {} : { Lien })}
    />,
  );
}

describe('EnteteObjet', () => {
  it('a un seul h1, le titre, rendu par TitreSection', () => {
    rendre();
    const titres = screen.getAllByRole('heading', { level: 1 });
    expect(titres).toHaveLength(1);
    expect(titres[0]).toHaveTextContent('Cohorte n° 5');
    expect(titres[0]?.style.fontFamily).toBe('var(--police-titre)');
  });

  it('porte un fil d Ariane nomme, en liste ordonnee, qui s arrete au parent', () => {
    rendre();
    const fil = screen.getByRole('navigation', { name: 'Fil d’Ariane' });
    expect(fil.querySelector('ol')).not.toBeNull();
    const liens = within(fil).getAllByRole('link');
    expect(liens.map((lien) => lien.textContent)).toEqual(['Sessions', 'Prompt Engineering']);
    expect(fil.querySelector('[aria-current]')).toBeNull();
    expect(within(fil).queryByText('Cohorte n° 5')).toBeNull();
    // Relecture de la 1.3.0, constat M5 : `list-style: none` retire la sémantique de liste sous
    // Safari et VoiceOver ; `role="list"` la rend, comme aux métadonnées.
    expect(fil.querySelector('ol')).toHaveAttribute('role', 'list');
    const chevrons = fil.querySelectorAll('svg');
    expect(chevrons.length).toBeGreaterThan(0);
    for (const chevron of chevrons) {
      expect(chevron).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('passe le fil par le lien du produit', () => {
    const recus: Array<ComponentProps<ComposantLien>> = [];
    const Lien: ComposantLien = (proprietes) => {
      recus.push(proprietes);
      const { children, ...reste } = proprietes;
      return <a {...reste}>{children}</a>;
    };
    rendre(Lien);
    expect(recus.map((recu) => recu.href)).toEqual([
      '/admin/sessions',
      '/admin/formations/prompt-engineering',
    ]);
  });

  it('range l etat apres le titre, puis l action et le menu a la fin de la meme rangee', () => {
    rendre();
    const titre = screen.getByRole('heading', { level: 1 });
    const rangee = titre.parentElement as HTMLElement;
    expect(rangee).toHaveClass('ai5d-entete-objet__tete');
    const enfants = [...rangee.children];
    expect(enfants[0]).toBe(titre);
    expect(enfants[1]).toHaveTextContent('En cours');
    const gestes = enfants[2] as HTMLElement;
    expect(gestes).toHaveClass('ai5d-entete-objet__gestes');
    expect(
      within(gestes)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Clore la session', 'Actions de la session']);
    const css = texteFeuille('ai5d-entete-objet').replace(/\s+/g, ' ');
    expect(css).toContain('.ai5d-entete-objet__tete { display: flex; flex-wrap: wrap;');
    expect(css).toContain('margin-inline-start: auto;');
  });

  it('pose ses metadonnees en liste, icones decoratives', () => {
    rendre();
    const [fil, liste] = screen.getAllByRole('list') as [HTMLElement, HTMLElement];
    expect(fil.tagName).toBe('OL');
    expect(liste.tagName).toBe('UL');
    const elements = within(liste).getAllByRole('listitem');
    expect(elements.map((element) => element.textContent)).toEqual([
      'Du 13 au 15 octobre 2026, heure de Conakry',
      'Présentiel, Conakry',
    ]);
    const icones = liste.querySelectorAll('svg');
    expect(icones.length).toBeGreaterThan(0);
    for (const icone of icones) {
      expect(icone).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('ferme l en-tete par un filet, et rend les indicateurs tels que le produit les passe', () => {
    const { container } = rendre();
    expect(container.querySelector('header')).toHaveClass('ai5d-entete-objet');
    expect(texteFeuille('ai5d-entete-objet')).toContain('border-bottom: 1px solid var(--bordure);');
    expect(screen.getByText('inscriptions sur 237 personnes')).toBeInTheDocument();
  });

  it('sans fil, sans metadonnees, sans gestes : rien de vide', () => {
    const { container } = render(<EnteteObjet titre="Orange Guinée" />);
    expect(container.querySelector('nav')).toBeNull();
    expect(container.querySelector('ul')).toBeNull();
    expect(container.querySelector('.ai5d-entete-objet__gestes')).toBeNull();
    expect(container.querySelector('.ai5d-entete-objet__indicateurs')).toBeNull();
  });

  it('reste rendable par un composant serveur', () => {
    expect(
      readFileSync('noyau/composants/EnteteObjet.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(false);
  });
});
