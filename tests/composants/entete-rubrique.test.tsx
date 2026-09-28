import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BookOpen, Shield } from 'lucide-react';
import { EnteteRubrique } from '../../noyau/composants/EnteteRubrique';
import { Bouton } from '../../noyau/composants/Bouton';
import { EnteteRubrique as EnteteRubrique120 } from '../instantanes/EnteteRubrique-1.2.0';

/**
 * `EnteteRubrique` et son action (SPEC 1.3.0, §5.5).
 *
 * L espace participant du Portail ne passe aucune action : son HTML ne doit pas bouger d un
 * caractere. La console en passe une, qui ne doit plus couper le filet.
 */

describe('EnteteRubrique sans action : le HTML de la 1.2.0', () => {
  const CAS = [
    { icone: Shield, titre: 'Sécurité', intention: 'Ce qui protège votre compte.' },
    { icone: BookOpen, titre: 'Mes formations', intention: 'Vos sessions, passées et à venir.' },
  ];

  for (const cas of CAS) {
    it(cas.titre, () => {
      expect(renderToStaticMarkup(<EnteteRubrique {...cas} />)).toBe(
        renderToStaticMarkup(<EnteteRubrique120 {...cas} />),
      );
    });
  }
});

describe('EnteteRubrique avec action', () => {
  function rendre() {
    return render(
      <EnteteRubrique
        icone={BookOpen}
        titre="Formations"
        intention="Les formations du catalogue, et leurs sessions."
        action={<Bouton href="/admin/formations/nouvelle">Nouvelle formation</Bouton>}
      />,
    );
  }

  it('pose l action dans l en-tete, donc au-dessus du filet, a la fin de la rangee du titre', () => {
    const { container } = rendre();
    const entete = container.querySelector('header') as HTMLElement;
    const action = screen.getByRole('link', { name: 'Nouvelle formation' });
    expect(entete).toContainElement(action);
    expect(entete.style.borderBottom).toBe('1px solid var(--bordure)');

    const rangee = screen.getByRole('heading', { level: 1 }).parentElement as HTMLElement;
    expect(rangee.style.flexWrap).toBe('wrap');
    const emplacement = rangee.lastElementChild as HTMLElement;
    expect(emplacement).toContainElement(action);
    expect(emplacement.style.marginInlineStart).toBe('auto');
  });

  it('suit le h1 dans l ordre du document, donc de la tabulation', () => {
    rendre();
    const titre = screen.getByRole('heading', { level: 1 });
    const action = screen.getByRole('link', { name: 'Nouvelle formation' });
    expect(titre.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('garde un seul h1', () => {
    rendre();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
