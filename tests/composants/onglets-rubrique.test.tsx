import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import type { ComponentProps } from 'react';
import { Shield, ShieldCheck, MonitorSmartphone } from 'lucide-react';
import {
  HAUTEUR_ONGLETS,
  ONGLETS_RUBRIQUE_MAX,
  ONGLETS_RUBRIQUE_MIN,
  OngletsRubrique,
  type OngletRubrique,
} from '../../noyau/composants/OngletsRubrique';
import type { ComposantLien } from '../../noyau/composants/LiensRail';

/**
 * `OngletsRubrique` — des liens qui decoupent une rubrique.
 *
 * Trois choses se trompent silencieusement, et ce sont elles qu'on garde ici : l'etat actif
 * porte par la seule couleur, l'annonce d'un `tablist` qui navigue, et un
 * `aria-current="false"` qui reste dans le document.
 */

const TROIS: OngletRubrique[] = [
  { id: 'connexion', libelle: 'Connexion', href: '/securite', icone: Shield },
  {
    id: 'deuxFacteurs',
    libelle: 'Double authentification',
    href: '/securite/deux-facteurs',
    icone: ShieldCheck,
  },
  {
    id: 'appareils',
    libelle: 'Appareils connectés',
    href: '/securite/appareils',
    icone: MonitorSmartphone,
  },
];

describe('OngletsRubrique', () => {
  it('rend un lien par onglet, avec son adresse', () => {
    render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    const liens = screen.getAllByRole('link');
    expect(liens).toHaveLength(3);
    expect(liens[0]).toHaveAttribute('href', '/securite');
    expect(liens[2]).toHaveAttribute('href', '/securite/appareils');
  });

  it('marque l onglet actif, et lui seul', () => {
    render(<OngletsRubrique onglets={TROIS} actif="appareils" />);
    expect(screen.getByRole('link', { name: /Appareils/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Connexion/ })).not.toHaveAttribute('aria-current');
  });

  it("n'ecrit jamais aria-current=false sur les onglets inactifs", () => {
    /*
      `aria-current="false"` est une valeur VALIDE qui signifie « ce n'est pas l'element
      courant », et certains lecteurs d'ecran l'annoncent. L'attribut doit DISPARAITRE.
      Le defaut est invisible a l'oeil et ne casse aucun rendu.
    */
    render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    for (const lien of screen.getAllByRole('link')) {
      const valeur = lien.getAttribute('aria-current');
      expect(valeur === null || valeur === 'page').toBe(true);
    }
  });

  it('rend des liens, jamais un tablist', () => {
    // Un `tablist` promet des panneaux qui apparaissent sans navigation, et un lecteur
    // d'ecran qui l'entend attend les fleches. Ici la page change vraiment.
    render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('un actif inconnu ne marque aucun onglet, et ne leve pas', () => {
    render(<OngletsRubrique onglets={TROIS} actif="rubrique-supprimee" />);
    for (const lien of screen.getAllByRole('link')) {
      expect(lien).not.toHaveAttribute('aria-current');
    }
  });

  it('porte une etiquette de navigation, par defaut ou fournie', () => {
    const { rerender } = render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label');

    rerender(<OngletsRubrique onglets={TROIS} actif="connexion" etiquette="Sécurité" />);
    expect(screen.getByRole('navigation', { name: 'Sécurité' })).toBeInTheDocument();
  });

  it('accepte un onglet sans icone', () => {
    const sansIcone: OngletRubrique[] = [
      { id: 'a', libelle: 'Infos personnelles', href: '/profil' },
      { id: 'b', libelle: 'E-mail', href: '/profil/adresse' },
    ];
    render(<OngletsRubrique onglets={sansIcone} actif="a" />);
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it("l'etat actif ne passe PAS par la seule couleur", () => {
    /*
      La regle vaut pour tout ce systeme, et elle est mesurable ici : la feuille doit poser
      a la fois une couleur, une graisse et un trait sur l'onglet courant. Une regression
      qui retirerait la graisse ou le trait laisserait un rendu qui « marche » pour la
      plupart des gens, et disparaitrait pour les autres.
    */
    render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    const feuille = document.getElementById('ai5d-onglets-rubrique')?.innerHTML ?? '';
    const regleActive = feuille.slice(feuille.indexOf("[aria-current='page']"));

    expect(regleActive).toContain('var(--action)');
    expect(regleActive).toContain('var(--graisse-semi)');
    expect(regleActive).toContain('border-bottom-color');
  });

  it('defile horizontalement, ascenseur masque, quand la place manque', () => {
    render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    const feuille = document.getElementById('ai5d-onglets-rubrique')?.innerHTML ?? '';
    expect(feuille).toContain('overflow-x: auto');
    expect(feuille).toContain('scrollbar-width: none');
  });

  it('ne rend aucun element de voile : le fondu n existe que dans la frise de defilement', () => {
    /*
      La 0.6.0 posait un voile, un degrade fixe de 24 px ; vu a l ecran, il se dessinait aussi la ou
      rien ne debordait, et la 0.6.3 l a retire. La 1.2.0 rend le fondu sans element ni mesure : un
      masque anime par la frise de defilement du conteneur, sous @supports, qui ne s applique pas quand
      rien ne defile. Decision 007.
    */
    const { container } = render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    expect(container.querySelector('.ai5d-onglets-r__voile')).toBeNull();
    expect(screen.getByRole('navigation').children).toHaveLength(TROIS.length);

    const feuille = document.getElementById('ai5d-onglets-rubrique')?.innerHTML ?? '';
    const supports = feuille.indexOf('@supports (animation-timeline: scroll())');
    expect(supports).toBeGreaterThan(-1);
    expect(feuille.indexOf('linear-gradient')).toBeGreaterThan(supports);
  });

  it("n'ecrit aucune couleur en dur dans sa feuille", () => {
    render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    const feuille = document.getElementById('ai5d-onglets-rubrique')?.innerHTML ?? '';
    expect(feuille).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });

  it('conserve la classe fournie par le consommateur', () => {
    render(<OngletsRubrique onglets={TROIS} actif="connexion" className="ma-classe" />);
    expect(screen.getByRole('navigation')).toHaveClass('ai5d-onglets-r', 'ma-classe');
  });

  it('annonce sa hauteur, et la feuille la respecte', () => {
    // Le plancher tactile de la charte. Un consommateur qui reserve de la place sous les
    // onglets doit pouvoir citer la valeur plutot que de la recopier.
    expect(HAUTEUR_ONGLETS).toBe(44);

    render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    const feuille = document.getElementById('ai5d-onglets-rubrique')?.innerHTML ?? '';
    expect(feuille).toContain(`height: ${HAUTEUR_ONGLETS}px`);
  });
});

const SIX: OngletRubrique[] = [
  { id: 'vue', libelle: 'Vue d’ensemble', href: '/sessions/7K3F9Q' },
  { id: 'annonces', libelle: 'Annonces', href: '/sessions/7K3F9Q/annonces' },
  { id: 'ressources', libelle: 'Ressources', href: '/sessions/7K3F9Q/ressources' },
  { id: 'replays', libelle: 'Replays', href: '/sessions/7K3F9Q/replays' },
  { id: 'attestation', libelle: 'Attestation', href: '/sessions/7K3F9Q/attestation' },
  { id: 'badge', libelle: 'Badge', href: '/sessions/7K3F9Q/badge' },
];

function feuilleBrute(): string {
  return document.getElementById('ai5d-onglets-rubrique')?.innerHTML ?? '';
}

function feuille(): string {
  return feuilleBrute().replace(/\s+/g, ' ');
}

describe('OngletsRubrique relie au routeur (1.2.0)', () => {
  it('rend six onglets, et annonce ses bornes', () => {
    render(<OngletsRubrique onglets={SIX} actif="attestation" />);
    expect(screen.getAllByRole('link')).toHaveLength(6);
    expect(ONGLETS_RUBRIQUE_MIN).toBe(2);
    expect(ONGLETS_RUBRIQUE_MAX).toBe(6);
  });

  it('passe chaque onglet par le lien du produit, l etat courant compris', () => {
    const recus: Array<ComponentProps<ComposantLien>> = [];
    const Lien: ComposantLien = (proprietes) => {
      recus.push(proprietes);
      const { children, ...reste } = proprietes;
      return <a {...reste}>{children}</a>;
    };
    render(<OngletsRubrique onglets={SIX} actif="attestation" Lien={Lien} />);

    expect(recus).toHaveLength(6);
    expect(recus.map((recu) => recu.href)).toEqual(SIX.map((onglet) => onglet.href));
    expect(recus.every((recu) => recu.className === 'ai5d-onglets-r__lien')).toBe(true);
    expect(recus.filter((recu) => recu['aria-current'] === 'page')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Attestation' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('un actif inconnu parmi six onglets ne marque rien, et ne leve pas', () => {
    render(<OngletsRubrique onglets={SIX} actif="sous-page-retiree" />);
    for (const lien of screen.getAllByRole('link')) {
      expect(lien).not.toHaveAttribute('aria-current');
    }
  });

  it('montre le debordement par un fondu que le navigateur mesure, sous @supports', () => {
    render(<OngletsRubrique onglets={SIX} actif="vue" />);
    const css = feuille();
    const bloc = css.slice(css.indexOf('@supports (animation-timeline: scroll())'));
    expect(bloc).toContain('animation: ai5d-onglets-fondu linear both;');
    expect(bloc).toContain('animation-timeline: scroll(self inline);');
    // Le raccourci `animation` remet la frise a zero : elle se declare apres lui.
    expect(bloc.indexOf('animation-timeline: scroll(self inline)')).toBeGreaterThan(
      bloc.indexOf('animation: ai5d-onglets-fondu'),
    );
    expect((bloc.match(/mask-image:/g) ?? []).length).toBe(3);
  });

  it('amene l onglet actif dans la vue par le CSS, sans effet ni directive', () => {
    render(<OngletsRubrique onglets={SIX} actif="attestation" />);
    const css = feuille();
    expect(css).toContain(
      "@supports (scroll-initial-target: nearest) { .ai5d-onglets-r__lien[aria-current='page'] { scroll-initial-target: nearest; } }",
    );
    expect(css).toContain('scroll-padding-inline: var(--espace-6);');
    expect(
      readFileSync('noyau/composants/OngletsRubrique.tsx', 'utf8').startsWith("'use client';"),
    ).toBe(false);
  });

  it('pose l appui sans transition, et garde le survol aux pointeurs fins', () => {
    render(<OngletsRubrique onglets={SIX} actif="vue" />);
    const css = feuille();
    expect(css).toContain(
      '.ai5d-onglets-r__lien:active { background: var(--surface-selection); border-radius: var(--rayon-sm); transition: none; }',
    );
    expect(css).toContain('background var(--mouvement-retour)');
    expect(css).toContain(
      '@media (hover: hover) { .ai5d-onglets-r__lien:hover { color: var(--texte-fort); } }',
    );
    expect(feuilleBrute().replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, '')).not.toContain(
      ':hover',
    );
  });

  it('fait pulser un trait d attente, jamais sur l onglet actif, et le fige sous mouvement reduit', () => {
    render(<OngletsRubrique onglets={SIX} actif="vue" />);
    const css = feuille();
    expect(css).toContain(
      ".ai5d-onglets-r__lien:is([data-en-attente], :has([data-en-attente])):not([aria-current='page'])::after { opacity: 1; animation: ai5d-onglets-attente 1200ms ease-in-out infinite alternate; }",
    );
    expect(css).toContain('background: var(--bordure-forte);');
    const reduit = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduit).toContain('::after { animation: none; opacity: 1; }');
  });
});
