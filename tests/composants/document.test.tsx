import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import type { ReactNode } from 'react';
import { BlocDocument } from '../../noyau/composants/BlocDocument';
import { DeplierDocument } from '../../noyau/composants/DeplierDocument';
import type { Document } from '../../noyau/composants/document';
import { GabaritDocument, STYLE_DOCUMENT } from '../../noyau/composants/GabaritDocument';
import type { ComposantLien } from '../../noyau/composants/LiensRail';
import { SommaireDocument } from '../../noyau/composants/SommaireDocument';

/**
 * Le gabarit de document, et les tests du sprint 15 de Compte montés avec lui.
 *
 * Les tests de Compte rendaient les vraies conditions et la vraie politique. Le système ne les a
 * pas, et ne doit pas les avoir : ils rendent ici un document de démonstration qui porte les cinq
 * formes de bloc et trois sections. Ce qui est vérifié est la STRUCTURE du gabarit, pas un texte.
 *
 * jsdom ne connaît ni `matchMedia` ni `::details-content`. `matchMedia` est simulé ; ce que la
 * feuille fait à l'écran se prouve au navigateur, à la tâche 16 du sprint 17.
 */

const DOCUMENT: Document = {
  surtitre: 'Protection des données',
  titre: 'Politique de confidentialité',
  sousTitre: 'Ce que nous faisons de vos données, et pourquoi.',
  version: null,
  sections: [
    {
      id: 'responsable',
      numero: '01',
      titre: 'Qui est responsable',
      blocs: [{ type: 'paragraphe', texte: 'Un paragraphe.' }],
    },
    {
      id: 'donnees',
      numero: '02',
      titre: 'Les données',
      blocs: [
        { type: 'sous-titre', texte: 'Finalité' },
        { type: 'liste', entrees: ['un', 'deux'] },
        { type: 'tableau', entetes: ['Donnée', 'Durée'], lignes: [['Adresse', 'Trois ans']] },
      ],
    },
    {
      id: 'droits',
      numero: '03',
      titre: 'Vos droits',
      blocs: [{ type: 'encart', texte: 'Un rappel.' }],
    },
  ],
};

function code(chemin: string): string {
  return readFileSync(chemin, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function simulerLargeur(bureau: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((requete: string) => ({
    matches: bureau,
    media: requete,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

/** Un lien de produit reconnaissable. */
const LienProduit: ComposantLien = ({ href, className, children }) => (
  <a href={href} className={className} data-lien-produit="oui">
    {children as ReactNode}
  </a>
);

beforeEach(() => {
  // Un TELEPHONE par defaut : sans ancre, les sections restent dans l etat du HTML servi.
  simulerLargeur(false);
});

afterEach(() => {
  cleanup();
  window.location.hash = '';
});

describe('GabaritDocument, le bandeau', () => {
  it('rend le surtitre, le titre et l intention du document', () => {
    render(<GabaritDocument document={DOCUMENT} pied={null} accueil="/" />);
    expect(screen.getByText(DOCUMENT.surtitre)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(DOCUMENT.titre);
    expect(screen.getByText(DOCUMENT.sousTitre)).toBeInTheDocument();
  });

  it('n annonce ni version ni date de mise a jour', () => {
    const { container } = render(
      <GabaritDocument document={{ ...DOCUMENT, version: '2026-09' }} pied={null} accueil="/" />,
    );
    const bandeau = container.querySelector('.ai5d-bandeau-document');
    // L assertion exige d abord le bandeau : sans lui, un texte vide passerait a vide.
    expect(bandeau).not.toBeNull();
    expect(bandeau?.textContent ?? '').not.toMatch(/version|2026-09|mise à jour/i);
  });

  it('ramene a l accueil DU PRODUIT, par son lien, et s annonce comme tel', () => {
    const { container } = render(
      <GabaritDocument document={DOCUMENT} pied={null} accueil="/accueil" Lien={LienProduit} />,
    );
    const lien = screen.getByRole('link', { name: 'Retour à l’accueil' });
    expect(lien).toHaveAttribute('href', '/accueil');
    expect(lien).toHaveAttribute('data-lien-produit', 'oui');
    expect(container.querySelector('.ai5d-bandeau-document__logo')).toBe(lien);
  });

  it('retombe sur un lien de document sans composant fourni', () => {
    render(<GabaritDocument document={DOCUMENT} pied={null} accueil="/" />);
    expect(screen.getByRole('link', { name: 'Retour à l’accueil' })).toHaveAttribute('href', '/');
  });

  it('ne code plus ni le routeur ni l adresse de l accueil', () => {
    const source = code('noyau/composants/GabaritDocument.tsx');
    expect(source).not.toContain("from 'next/");
    expect(source).not.toContain('href="/"');
  });

  it('laisse un ecran remplacer l en-tete, avec un seul titre de premier niveau', () => {
    const { container } = render(
      <GabaritDocument
        document={DOCUMENT}
        pied={null}
        accueil="/"
        entete={{ surtitre: 'Conditions', titre: 'Nos conditions ont changé', intention: 'i' }}
      />,
    );
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Nos conditions ont changé',
    );
  });
});

describe('GabaritDocument, les sections', () => {
  it('rend une section repliable par entree, fermee dans le HTML, avec son ancre', () => {
    // Fermee : c est l etat juste sur telephone, sans rien executer, et donc sans clignotement.
    const { container } = render(<GabaritDocument document={DOCUMENT} pied={null} accueil="/" />);
    for (const section of DOCUMENT.sections) {
      const element = container.querySelector(`#${section.id}`);
      expect(element?.tagName, section.id).toBe('DETAILS');
      expect(element?.hasAttribute('data-depliable'), section.id).toBe(true);
      expect(element?.hasAttribute('open'), section.id).toBe(false);
    }
  });

  it('garde un titre de second niveau par section, dans le summary', () => {
    const { container } = render(<GabaritDocument document={DOCUMENT} pied={null} accueil="/" />);
    expect(container.querySelectorAll('summary h2')).toHaveLength(DOCUMENT.sections.length);
  });

  it('ne produit aucune entree de sommaire sans cible', () => {
    // Une entree qui ne mene nulle part promet une navigation et la refuse en silence.
    const { container } = render(<GabaritDocument document={DOCUMENT} pied={null} accueil="/" />);
    const ancres = [...container.querySelectorAll('nav a')].map((a) => a.getAttribute('href'));
    expect(ancres).toHaveLength(DOCUMENT.sections.length);
    for (const ancre of ancres) {
      expect(container.querySelector(ancre as string), ancre ?? '').not.toBeNull();
    }
  });

  it('rend le pied qu on lui confie', () => {
    render(<GabaritDocument document={DOCUMENT} pied={<p>pied de page</p>} accueil="/" />);
    expect(screen.getByText('pied de page')).toBeInTheDocument();
  });

  it('declare une piste de lecture qui peut se reduire, et des ancres qui respirent', () => {
    expect(STYLE_DOCUMENT).toContain('minmax(0, 720px)');
    expect(STYLE_DOCUMENT).toContain('scroll-margin-top');
  });

  it('rend les sections visibles sur ordinateur et a l impression, par ::details-content', () => {
    expect(STYLE_DOCUMENT).toContain('@media (min-width: 1024px)');
    expect(STYLE_DOCUMENT).toContain('details[data-depliable]::details-content');
    expect(STYLE_DOCUMENT).toContain('@media print');
  });

  it('prefixe toutes ses classes : une feuille injectee partout ne pose pas de nom commun', () => {
    const classes = [...STYLE_DOCUMENT.matchAll(/\.([a-z][\w-]*)/g)]
      .map((m) => m[1] ?? '')
      .filter((nom) => !['webkit-details-marker'].includes(nom) && !/^\d/.test(nom));
    for (const nom of classes) expect(nom, nom).toMatch(/^ai5d-/);
  });

  it('monte le module qui pose l etat vrai des sections', () => {
    expect(code('noyau/composants/GabaritDocument.tsx')).toContain('<DeplierDocument />');
  });
});

describe('SommaireDocument', () => {
  it('porte un libelle de navigation, replie par defaut, et se laisse deplier', () => {
    const { container } = render(<SommaireDocument sections={DOCUMENT.sections} />);
    expect(screen.getByRole('navigation', { name: 'Sommaire du document' })).toBeInTheDocument();
    expect(container.querySelector('details')?.hasAttribute('open')).toBe(false);
    expect(container.querySelector('details')?.hasAttribute('data-depliable')).toBe(true);
  });
});

describe('BlocDocument', () => {
  it('enferme un tableau dans un conteneur qui defile', () => {
    const { container } = render(
      <BlocDocument bloc={{ type: 'tableau', entetes: ['A', 'B'], lignes: [['un', 'deux']] }} />,
    );
    const cadre = container.firstElementChild as HTMLElement;
    expect(cadre.style.overflowX).toBe('auto');
    expect(cadre.querySelector('table')).not.toBeNull();
  });

  it('rend une ligne dont deux cellules sont identiques', () => {
    // Une cle tiree du contenu produirait un doublon, que React signale.
    render(
      <BlocDocument
        bloc={{ type: 'tableau', entetes: ['A', 'B'], lignes: [['pareil', 'pareil']] }}
      />,
    );
    expect(screen.getAllByText('pareil')).toHaveLength(2);
  });

  it('rend chaque entree de liste, un encart et un sous-titre', () => {
    const { rerender } = render(<BlocDocument bloc={{ type: 'liste', entrees: ['un', 'deux'] }} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);

    rerender(<BlocDocument bloc={{ type: 'encart', texte: 'attention' }} />);
    expect(screen.getByText('attention')).toBeInTheDocument();

    rerender(<BlocDocument bloc={{ type: 'sous-titre', texte: 'un titre' }} />);
    expect(screen.getByText('un titre')).toBeInTheDocument();
  });

  it('rend l encart en citation, et le tableau sans cadre', () => {
    // Verifie sur le code : jsdom abandonne sans le dire une bordure qui porte une variable.
    const source = code('noyau/composants/BlocDocument.tsx');
    const encart = source.slice(source.indexOf("case 'encart'"), source.indexOf("case 'tableau'"));
    expect(encart).toContain("borderLeft: '2px solid var(--bordure-forte)'");
    expect(encart).not.toContain('background');

    const tableau = source.slice(source.indexOf("case 'tableau'"));
    expect(tableau).not.toContain('borderRadius');
    expect(tableau).toContain("borderTop: '1px solid var(--bordure)'");
  });
});

describe('DeplierDocument', () => {
  function Page() {
    return (
      <>
        <details data-depliable id="qui">
          <summary>01 Qui</summary>
          <p>un</p>
        </details>
        <details data-depliable id="resiliation">
          <summary>02 Résiliation</summary>
          <p id="clause">deux</p>
        </details>
        <details id="etranger">
          <summary>un details qui ne se laisse pas plier</summary>
        </details>
        <DeplierDocument />
      </>
    );
  }

  function ouverts(): string[] {
    return [...document.querySelectorAll('details')].filter((d) => d.open).map((d) => d.id);
  }

  it('ouvre toutes les sections repliables sur ordinateur', () => {
    simulerLargeur(true);
    render(<Page />);
    expect(ouverts()).toEqual(['qui', 'resiliation']);
  });

  it('n ouvre rien sur telephone sans ancre', () => {
    render(<Page />);
    expect(ouverts()).toEqual([]);
  });

  it('ouvre, sur telephone, la section qui contient la cible de l ancre', () => {
    window.location.hash = '#clause';
    render(<Page />);
    expect(ouverts()).toEqual(['resiliation']);
  });

  it('ignore un fragment qui ne designe aucune section, et un details etranger', () => {
    window.location.hash = '#inconnu';
    const { unmount } = render(<Page />);
    expect(ouverts()).toEqual([]);
    unmount();

    window.location.hash = '#etranger';
    render(<Page />);
    expect(ouverts()).toEqual([]);
  });

  it('ouvre la nouvelle section a un changement d ancre', () => {
    render(<Page />);
    window.location.hash = '#resiliation';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(ouverts()).toEqual(['resiliation']);
  });

  it('rouvre une section refermee sur ordinateur, et laisse la fermer sur telephone', () => {
    simulerLargeur(true);
    const { unmount } = render(<Page />);
    const section = document.getElementById('qui') as HTMLDetailsElement;
    section.open = false;
    section.dispatchEvent(new Event('toggle'));
    expect(section.open).toBe(true);
    unmount();

    simulerLargeur(false);
    window.location.hash = '#qui';
    render(<Page />);
    const surTelephone = document.getElementById('qui') as HTMLDetailsElement;
    surTelephone.open = false;
    surTelephone.dispatchEvent(new Event('toggle'));
    expect(surTelephone.open).toBe(false);
  });

  it('lit le palier bureau dans la meme constante que la feuille', () => {
    const source = code('noyau/composants/DeplierDocument.tsx');
    expect(source).toContain("from '../paliers'");
    expect(source).not.toContain('1024px');
  });
});
