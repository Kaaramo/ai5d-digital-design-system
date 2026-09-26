import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import type {
  AnchorHTMLAttributes,
  ComponentProps,
  MouseEventHandler,
  ReactNode,
  TouchEventHandler,
} from 'react';
import { Bouton, type ProprietesBoutonAction } from '../../noyau/composants/Bouton';
import type { ComposantLien } from '../../noyau/composants/LiensRail';
import {
  ATTRIBUT_EN_ATTENTE,
  CLASSE_HORS_ECRAN,
  MENTION_NOUVEL_ONGLET,
  lienNatif,
  relSur,
} from '../../noyau/composants/lien';
import { Bouton as Bouton110 } from '../instantanes/Bouton-1.1.0';

/**
 * `Bouton` rendu en lien (SPEC 1.2.0, §5.2).
 *
 * Deux produits naviguaient par un script depuis un `<button>`, parce que le bouton du système n'en
 * savait pas plus. Ce qui se garde ici : un appel sans adresse rend le bouton de la 1.1.0 au caractère
 * près ; un lien reçoit tout ce qu'un bouton porte ; le téléchargement et le nouvel onglet ne passent
 * jamais par le routeur ; un lien inerte ne navigue pas, ne prend pas le focus, ne transmet pas le clic.
 */

function feuille(): string {
  return document.getElementById('ai5d-bouton')?.innerHTML ?? '';
}

/** Un lien de produit qui retient ce qu'il reçoit, et le transmet tout entier, comme `Link` de Next. */
function espion() {
  const recus: Array<ComponentProps<ComposantLien>> = [];
  const Lien: ComposantLien = (proprietes) => {
    recus.push(proprietes);
    const { children, ...reste } = proprietes;
    return (
      <a data-lien-produit="" {...reste}>
        {children}
      </a>
    );
  };
  return { Lien, recus };
}

describe('Bouton sans adresse : exactement le bouton de la 1.1.0', () => {
  const CAS: ProprietesBoutonAction[] = [
    {},
    { variante: 'secondaire' },
    { variante: 'neutre', taille: 'sm' },
    { variante: 'danger', taille: 'lg' },
    { variante: 'danger-contour', pleineLargeur: true },
    { chargement: true },
    { chargement: true, libelleChargement: 'Connexion en cours' },
    { disabled: true },
    { type: 'submit', className: 'ma-classe', 'aria-label': 'Envoyer le formulaire' },
    { style: { marginTop: 'var(--espace-4)' } },
  ];

  for (const [index, cas] of CAS.entries()) {
    it(`cas ${index + 1} : ${JSON.stringify(cas)}`, () => {
      const avant = render(<Bouton110 {...cas}>Envoyer</Bouton110>).container.querySelector(
        'button',
      );
      const apres = render(<Bouton {...cas}>Envoyer</Bouton>).container.querySelector('button');
      expect(apres).not.toBeNull();
      expect(apres?.outerHTML).toBe(avant?.outerHTML);
    });
  }
});

describe('Bouton avec une adresse : un lien, avec les classes et les etats d un bouton', () => {
  it('rend le lien du produit, et lui transmet classe, style, variante et taille', () => {
    const { Lien, recus } = espion();
    render(
      <Bouton href="/formations/ia-relation-client" Lien={Lien} pleineLargeur>
        Voir ma formation
      </Bouton>,
    );
    const lien = screen.getByRole('link', { name: 'Voir ma formation' });
    expect(lien).toHaveAttribute('data-lien-produit');
    expect(lien).toHaveAttribute('href', '/formations/ia-relation-client');

    expect(recus).toHaveLength(1);
    expect(recus[0]?.className).toBe('ai5d-bouton');
    expect(recus[0]?.style?.height).toBe('var(--hauteur-controle)');
    expect(recus[0]?.style?.width).toBe('100%');
    expect(recus[0]).toMatchObject({ 'data-variante': 'primaire', 'data-taille': 'md' });
  });

  it('sans lien du produit, rend un a natif avec la classe, la variante et la hauteur', () => {
    render(<Bouton href="/formations">Mes formations</Bouton>);
    const lien = screen.getByRole('link', { name: 'Mes formations' });
    expect(lien.tagName).toBe('A');
    expect(lien).toHaveClass('ai5d-bouton');
    expect(lien).toHaveAttribute('data-variante', 'primaire');
    expect(lien.style.height).toContain('--hauteur-controle');
    expect(lien.style.minHeight).toContain('--cible-tactile');
  });

  it('garde la hauteur de densite dans les trois tailles', () => {
    for (const taille of ['sm', 'md', 'lg'] as const) {
      const { container, unmount } = render(
        <Bouton href="/formations" taille={taille}>
          Voir
        </Bouton>,
      );
      const lien = container.querySelector('a');
      expect(lien).toHaveAttribute('data-taille', taille);
      expect(lien?.style.height).toContain('--hauteur-controle');
      unmount();
    }
  });

  it('avec download, ignore le lien du produit : un routeur client ne telecharge pas', () => {
    const { Lien, recus } = espion();
    render(
      <Bouton variante="neutre" href="/api/sessions/7K3F9Q/calendrier.ics" download Lien={Lien}>
        Ajouter à mon calendrier
      </Bouton>,
    );
    const lien = screen.getByRole('link', { name: 'Ajouter à mon calendrier' });
    expect(recus).toHaveLength(0);
    expect(lien).not.toHaveAttribute('data-lien-produit');
    expect(lien).toHaveAttribute('download');
  });

  it('transmet un nom de fichier en download tel quel', () => {
    render(
      <Bouton href="/attestation.pdf" download="attestation-AI5D-2026-7K3F9Q.pdf">
        Télécharger
      </Bouton>,
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'download',
      'attestation-AI5D-2026-7K3F9Q.pdf',
    );
  });

  it('avec download={false}, reste un lien du routeur', () => {
    const { Lien, recus } = espion();
    render(
      <Bouton href="/formations" download={false} Lien={Lien}>
        Mes formations
      </Bouton>,
    );
    expect(recus).toHaveLength(1);
  });

  it('avec target _blank : a natif, rel complete, mention du nouvel onglet lue et hors ecran', () => {
    const { Lien, recus } = espion();
    render(
      <Bouton variante="discret" href="https://exemple.invalid/session" target="_blank" Lien={Lien}>
        Rejoindre la session
      </Bouton>,
    );
    const lien = screen.getByRole('link', {
      name: `Rejoindre la session ${MENTION_NOUVEL_ONGLET}`,
    });
    expect(recus).toHaveLength(0);
    expect(lien).toHaveAttribute('target', '_blank');
    expect(lien).toHaveAttribute('rel', 'noopener noreferrer');
    expect(lien.querySelector(`.${CLASSE_HORS_ECRAN}`)).toHaveTextContent(MENTION_NOUVEL_ONGLET);
    expect(document.getElementById('ai5d-hors-ecran')).not.toBeNull();
  });

  it('complete le rel du produit sans doublon, quelle que soit sa casse', () => {
    render(
      <Bouton href="https://exemple.invalid" target="_blank" rel="NoOpener external">
        Voir
      </Bouton>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'NoOpener external noreferrer');
  });

  it('desactive : aucune adresse, lien indisponible, hors de la tabulation, aucun clic transmis', async () => {
    const clic = vi.fn();
    render(
      <>
        <Bouton href="/formations" disabled onClick={clic}>
          Voir ma formation
        </Bouton>
        <button type="button">Suivant</button>
      </>,
    );
    const lien = screen.getByText('Voir ma formation').closest('a');
    expect(lien).not.toBeNull();
    expect(lien).not.toHaveAttribute('href');
    expect(lien).toHaveAttribute('role', 'link');
    expect(lien).toHaveAttribute('aria-disabled', 'true');
    expect(lien?.style.opacity).toBe('0.6');
    expect(lien?.style.cursor).toBe('not-allowed');

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Suivant' })).toHaveFocus();

    if (lien !== null) fireEvent.click(lien);
    expect(clic).not.toHaveBeenCalled();
  });

  it('en chargement : aucune adresse, occupe, pleine opacite, trois points, libelle de chargement', () => {
    const { container } = render(
      <Bouton href="/formations" chargement libelleChargement="Ouverture de la formation">
        Voir ma formation
      </Bouton>,
    );
    const lien = container.querySelector('a');
    expect(lien).not.toHaveAttribute('href');
    expect(lien).toHaveAttribute('aria-busy', 'true');
    expect(lien).toHaveAttribute('aria-disabled', 'true');
    expect(lien?.style.opacity).toBe('1');
    expect(lien?.style.cursor).toBe('progress');
    expect(lien).toHaveTextContent('Ouverture de la formation');
    expect(
      container.querySelectorAll(
        '.ai5d-bouton__points:not(.ai5d-bouton__points--attente) .ai5d-bouton__point',
      ),
    ).toHaveLength(3);
  });

  it('ne transmet jamais type a un lien', () => {
    const { Lien, recus } = espion();
    render(
      <Bouton href="/formations" type="button" Lien={Lien}>
        Voir
      </Bouton>,
    );
    expect(recus[0]).not.toHaveProperty('type');

    render(
      <Bouton href="/formations" type="button">
        Voir aussi
      </Bouton>,
    );
    expect(screen.getByRole('link', { name: 'Voir aussi' })).not.toHaveAttribute('type');
  });

  it('rend ses points d attente, masques, que le protocole montre', () => {
    const { container } = render(<Bouton href="/formations">Voir</Bouton>);
    const points = container.querySelector('.ai5d-bouton__points--attente');
    expect(points).toHaveAttribute('aria-hidden', 'true');
    expect(points?.querySelectorAll('.ai5d-bouton__point')).toHaveLength(3);
    expect(ATTRIBUT_EN_ATTENTE).toBe('data-en-attente');

    const css = feuille().replace(/\s+/g, ' ');
    expect(css).toContain('.ai5d-bouton__points--attente { display: none; }');
    expect(css).toContain(
      '.ai5d-bouton:is([data-en-attente], :has([data-en-attente])) .ai5d-bouton__points--attente { display: inline-flex; }',
    );
  });

  it('un bouton d action ne rend aucun point au repos', () => {
    const { container } = render(<Bouton>Envoyer</Bouton>);
    expect(container.querySelectorAll('.ai5d-bouton__point')).toHaveLength(0);
  });

  it('se rend au serveur, sans JavaScript : un vrai lien', () => {
    // Compte : « Revenir au portail » redevient un lien que le clic du milieu ouvre (US-S04).
    const html = renderToStaticMarkup(
      <Bouton href="/" pleineLargeur>
        Revenir au portail
      </Bouton>,
    );
    expect(html).toContain('<a ');
    expect(html).toContain('href="/"');
    expect(readFileSync('noyau/composants/Bouton.tsx', 'utf8').startsWith("'use client';")).toBe(
      false,
    );
  });
});

describe('la feuille du bouton, qu il soit bouton ou lien', () => {
  it('garde tout survol par (hover: hover) : au doigt, il restait colle apres le toucher', () => {
    render(<Bouton>Envoyer</Bouton>);
    const brut = feuille();
    expect(brut).toContain('@media (hover: hover) {');
    expect(brut.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}/, '')).not.toContain(':hover');
  });

  it('exclut du survol et de l appui tout element inerte, bouton ou lien', () => {
    render(<Bouton>Envoyer</Bouton>);
    const css = feuille().replace(/\s+/g, ' ');
    const regles = css.split('}').filter((r) => r.includes(':hover') || r.includes(':active'));
    expect(regles.length).toBeGreaterThan(0);
    for (const regle of regles) {
      expect(regle, regle).toContain(":not(:disabled):not([aria-disabled='true'])");
    }
  });

  it('ne souligne jamais un bouton en lien', () => {
    render(<Bouton>Envoyer</Bouton>);
    expect(feuille().replace(/\s+/g, ' ')).toMatch(/\.ai5d-bouton \{[^}]*text-decoration: none;/);
  });
});

describe('lien.ts', () => {
  it('relSur ne touche pas un lien qui reste dans l onglet', () => {
    expect(relSur(undefined, undefined)).toBeUndefined();
    expect(relSur('external', '_self')).toBe('external');
  });

  it('relSur ajoute noopener et noreferrer a un nouvel onglet, sans doublon', () => {
    expect(relSur(undefined, '_blank')).toBe('noopener noreferrer');
    expect(relSur('noopener', '_blank')).toBe('noopener noreferrer');
    expect(relSur('  external   noreferrer ', '_blank')).toBe('external noreferrer noopener');
  });

  it('lienNatif decide une fois quand le lien du routeur n est jamais employe', () => {
    expect(lienNatif({ download: true })).toBe(true);
    expect(lienNatif({ download: 'fichier.ics' })).toBe(true);
    expect(lienNatif({ download: '' })).toBe(true);
    expect(lienNatif({ download: false })).toBe(false);
    expect(lienNatif({})).toBe(false);
    expect(lienNatif({ target: '_blank' })).toBe(true);
    expect(lienNatif({ target: '_self' })).toBe(false);
  });

  it('la mention du nouvel onglet est la formulation de reference', () => {
    expect(MENTION_NOUVEL_ONGLET).toBe('(s’ouvre dans un nouvel onglet)');
  });
});

describe('ComposantLien accepte tous les attributs d un lien (SPEC 1.2.0, §5.0.3)', () => {
  it('le Link de Next reste assignable sous exactOptionalPropertyTypes', () => {
    /*
      Trouve par la montee de Compte, le 26 septembre 2026 : Next redeclare href, onClick,
      onMouseEnter et onTouchStart SANS `| undefined` (next/dist/client/link.d.ts, 16.3.5). Sous
      exactOptionalPropertyTypes, que Compte et le Portail activent, un ComposantLien qui aurait
      promis les attributs d un <a> tels quels, gestionnaires compris, refusait Link. Cette replique
      recopie la forme de Link ; le jour ou elle ne compile plus, la directive ci-dessous n existe pas
      et tsc echoue.
    */
    type ProprietesDeLinkNext = Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      'href' | 'onClick' | 'onMouseEnter' | 'onTouchStart'
    > & {
      href: string | { pathname: string };
      as?: string;
      replace?: boolean;
      scroll?: boolean;
      prefetch?: boolean | 'auto' | null;
      onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
      onTouchStart?: TouchEventHandler<HTMLAnchorElement>;
      onClick?: MouseEventHandler<HTMLAnchorElement>;
      children?: ReactNode | undefined;
    };
    const LinkDeNext = ({ href, children, ...reste }: ProprietesDeLinkNext) => (
      <a href={typeof href === 'string' ? href : href.pathname} {...reste}>
        {children}
      </a>
    );
    const lien: ComposantLien = LinkDeNext;
    expect(lien).toBe(LinkDeNext);
  });

  it('un lien qui accepte les attributs d un a, comme Link de Next, reste assignable', () => {
    const LienLarge = ({
      children,
      ...reste
    }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) => (
      <a {...reste}>{children}</a>
    );
    const lien: ComposantLien = LienLarge;
    expect(lien).toBe(LienLarge);
  });

  it('un lien type sur une forme etroite, sans etat courant, reste assignable', () => {
    const LienEtroit = ({
      href,
      className,
      children,
    }: {
      href: string;
      className?: string | undefined;
      children: ReactNode;
    }) => (
      <a href={href} className={className}>
        {children}
      </a>
    );
    const lien: ComposantLien = LienEtroit;
    expect(lien).toBe(LienEtroit);
  });

  it('un lien type sur l ancienne forme, etat courant limite a page, ne compile plus', () => {
    /*
      Constate par tsc le 26 septembre 2026 : `aria-current` d un lien admet aussi `true`, `step`,
      `location`. Un produit qui aurait type son lien ainsi le type par `ComponentProps<ComposantLien>`,
      et le journal de la 1.2.0 le dit. Le jour ou cette ligne compile de nouveau, la directive echoue
      et quelqu un relit ce paragraphe.
    */
    const LienAncien = ({
      href,
      children,
    }: {
      href: string;
      'aria-current'?: 'page' | undefined;
      children: ReactNode;
    }) => <a href={href}>{children}</a>;
    // @ts-expect-error aria-current d un lien est plus large que la seule valeur page
    const lien: ComposantLien = LienAncien;
    expect(lien).toBe(LienAncien);
  });
});
