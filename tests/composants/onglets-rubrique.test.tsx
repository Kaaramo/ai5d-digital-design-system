import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Shield, ShieldCheck, MonitorSmartphone } from 'lucide-react';
import {
  HAUTEUR_ONGLETS,
  OngletsRubrique,
  type OngletRubrique,
} from '../../noyau/composants/OngletsRubrique';

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

  it('signale le debordement par un voile, sinon la sous-page est perdue sur telephone', () => {
    const { container } = render(<OngletsRubrique onglets={TROIS} actif="connexion" />);
    const voile = container.querySelector('.ai5d-onglets-r__voile');
    expect(voile).not.toBeNull();
    expect(voile).toHaveAttribute('aria-hidden', 'true');

    const feuille = document.getElementById('ai5d-onglets-rubrique')?.innerHTML ?? '';
    expect(feuille).toContain('overflow-x: auto');
    expect(feuille).toContain('scrollbar-width: none');
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
