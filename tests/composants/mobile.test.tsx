import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home, Shield, Package, Grid3x3, User } from 'lucide-react';
import { readFileSync } from 'node:fs';
import {
  BarreOnglets,
  CarteAction,
  GabaritApp,
  HAUTEUR_BARRE_ONGLETS,
  HAUTEUR_ENTETE,
  ONGLETS_MAX,
  ONGLETS_MIN,
  TAILLE_PASTILLE_ICONE,
} from '../../noyau/composants';
import type { Onglet } from '../../noyau/composants';
import { BUREAU, TABLETTE } from '../../noyau/paliers';

/**
 * jsdom n'evalue pas les requetes media. Ces tests lisent donc la regle CSS injectee par
 * le composant : ils prouvent que la regle est ECRITE, pas qu'elle s'applique a 768 px.
 * Le rendu se verifie a l'ecran, et nulle part ailleurs. C'est dit aussi dans PALIERS.md.
 */
function styleInjecte(id: string): string {
  const balise = document.getElementById(id);
  expect(balise, `la feuille ${id} n est pas injectee`).not.toBeNull();
  return balise?.innerHTML ?? '';
}

const ONGLETS: Onglet[] = [
  { id: 'accueil', libelle: 'Accueil', icone: Home },
  { id: 'securite', libelle: 'Sécurité', icone: Shield },
  { id: 'produits', libelle: 'Produits', icone: Package },
  { id: 'plus', libelle: 'Plus', icone: Grid3x3 },
];

describe('BarreOnglets', () => {
  it('rend un onglet par entree, avec son icone ET son mot', () => {
    render(<BarreOnglets onglets={ONGLETS} actif="accueil" />);
    for (const onglet of ONGLETS) {
      expect(screen.getByText(onglet.libelle)).toBeInTheDocument();
    }
    // Une icone par onglet, decorative : le mot est juste en dessous.
    const nav = screen.getByRole('navigation');
    expect(nav.querySelectorAll('svg')).toHaveLength(ONGLETS.length);
  });

  it('borne le nombre d onglets entre trois et cinq', () => {
    // Sous trois, deux liens tiennent dans l en-tete. Au-dela de cinq, chaque cible
    // descend sous 70 px de large sur un telephone de 390 px.
    expect(ONGLETS_MIN).toBe(3);
    expect(ONGLETS_MAX).toBe(5);
    expect(ONGLETS.length).toBeGreaterThanOrEqual(ONGLETS_MIN);
    expect(ONGLETS.length).toBeLessThanOrEqual(ONGLETS_MAX);
  });

  it('marque l onglet actif par aria-current, et lui seul', () => {
    render(<BarreOnglets onglets={ONGLETS} actif="securite" />);
    const actifs = screen.getByRole('navigation').querySelectorAll('[aria-current="page"]');
    expect(actifs).toHaveLength(1);
    expect(actifs[0]?.textContent).toContain('Sécurité');
  });

  it('ne signale JAMAIS l etat actif par la seule couleur', () => {
    // La regle du systeme : aucune information portee par la seule couleur. Ici, l etat
    // actif porte aussi aria-current et une graisse de libelle differente.
    const css = (() => {
      render(<BarreOnglets onglets={ONGLETS} actif="accueil" />);
      return styleInjecte('ai5d-barre-onglets');
    })();
    expect(css).toContain('font-weight: var(--graisse-normale)');
    expect(css).toMatch(/\[aria-current\][\s\S]*?font-weight: var\(--graisse-semi\)/);
  });

  it('respecte le plancher tactile sur chaque onglet', () => {
    render(<BarreOnglets onglets={ONGLETS} actif="accueil" />);
    expect(styleInjecte('ai5d-barre-onglets')).toContain('min-height: var(--cible-tactile)');
  });

  it('reserve la zone sure du bas, sans quoi le dernier onglet est inatteignable', () => {
    render(<BarreOnglets onglets={ONGLETS} actif="accueil" />);
    expect(styleInjecte('ai5d-barre-onglets')).toContain(
      'padding-bottom: var(--zone-sure-basse, 0px)',
    );
  });

  it('disparait a partir du palier tablette', () => {
    render(<BarreOnglets onglets={ONGLETS} actif="accueil" />);
    const css = styleInjecte('ai5d-barre-onglets');
    expect(css).toContain(`@media (min-width: ${TABLETTE}px)`);
    expect(css).toMatch(new RegExp(`@media \\(min-width: ${TABLETTE}px\\)[\\s\\S]*?display: none`));
  });

  it('rend des boutons sans href, des liens avec', async () => {
    const choisir = vi.fn();
    const { rerender } = render(
      <BarreOnglets onglets={ONGLETS} actif="accueil" onChoisir={choisir} />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(ONGLETS.length);

    await userEvent.click(screen.getByRole('button', { name: /Produits/ }));
    expect(choisir).toHaveBeenCalledWith('produits');

    const avecLiens = ONGLETS.map((o) => ({ ...o, href: `/${o.id}` }));
    rerender(<BarreOnglets onglets={avecLiens} actif="accueil" />);
    expect(screen.getAllByRole('link')).toHaveLength(ONGLETS.length);
  });

  it('porte un nom de navigation, modifiable', () => {
    const { rerender } = render(<BarreOnglets onglets={ONGLETS} actif="accueil" />);
    expect(screen.getByRole('navigation')).toHaveAccessibleName('Navigation principale');
    rerender(<BarreOnglets onglets={ONGLETS} actif="accueil" etiquette="Sections du compte" />);
    expect(screen.getByRole('navigation')).toHaveAccessibleName('Sections du compte');
  });

  it("n'ecrit aucune couleur en dur", () => {
    const source = readFileSync('noyau/composants/BarreOnglets.tsx', 'utf8');
    const declarations = source
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('*') && !l.trimStart().startsWith('//'))
      .join('\n');
    expect(declarations).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
    expect(declarations).not.toMatch(/\brgba?\(/);
  });
});

describe('GabaritApp', () => {
  it('rend les trois reperes de structure', () => {
    render(
      <GabaritApp produit="Compte" onglets={ONGLETS} actif="accueil">
        <p>Contenu</p>
      </GabaritApp>,
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('reserve la hauteur de la barre plus la zone sure sous le contenu', () => {
    // Sans cette reserve, le dernier element de la page se glisse SOUS la barre. Le
    // defaut ne se voit pas tant qu on teste sur des pages courtes.
    const { container } = render(
      <GabaritApp onglets={ONGLETS} actif="accueil">
        <p>Contenu</p>
      </GabaritApp>,
    );
    const racine = container.querySelector('[data-gabarit="app"]');
    expect(racine?.getAttribute('style')).toContain(
      `--reserve-barre: calc(${HAUTEUR_BARRE_ONGLETS}px + var(--zone-sure-basse, 0px))`,
    );
    expect(styleInjecte('ai5d-gabarit-app')).toContain('var(--reserve-barre, 0px)');
  });

  it('ne reserve rien et ne rend aucune barre sans onglets', () => {
    const { container } = render(
      <GabaritApp produit="Compte">
        <p>Contenu</p>
      </GabaritApp>,
    );
    expect(screen.queryByRole('navigation')).toBeNull();
    const racine = container.querySelector('[data-gabarit="app"]');
    expect(racine?.getAttribute('style') ?? '').not.toContain('--reserve-barre');
  });

  it('remet la reserve a zero au palier tablette, ou la barre disparait', () => {
    const { container } = render(
      <GabaritApp onglets={ONGLETS} actif="accueil">
        <p>Contenu</p>
      </GabaritApp>,
    );
    const feuilles = [...container.querySelectorAll('style')].map((s) => s.innerHTML).join('\n');
    expect(feuilles).toMatch(
      new RegExp(`@media \\(min-width: ${TABLETTE}px\\)[\\s\\S]*?--reserve-barre: 0px`),
    );
  });

  it('plafonne et centre le contenu au palier bureau', () => {
    render(
      <GabaritApp onglets={ONGLETS} actif="accueil">
        <p>Contenu</p>
      </GabaritApp>,
    );
    const css = styleInjecte('ai5d-gabarit-app');
    expect(css).toContain(`@media (min-width: ${BUREAU}px)`);
    expect(css).toContain('max-width: var(--contenu-max)');
    expect(css).toContain('margin-inline: auto');
  });

  it('cale la hauteur d en-tete sur la constante, zone sure comprise', () => {
    render(
      <GabaritApp>
        <p>Contenu</p>
      </GabaritApp>,
    );
    expect(styleInjecte('ai5d-gabarit-app')).toContain(
      `height: calc(${HAUTEUR_ENTETE}px + var(--zone-sure-haute, 0px))`,
    );
  });

  it('utilise dvh et jamais vh : la barre d URL mobile fausse vh', () => {
    render(
      <GabaritApp>
        <p>Contenu</p>
      </GabaritApp>,
    );
    const css = styleInjecte('ai5d-gabarit-app');
    expect(css).toContain('min-height: 100dvh');
    expect(css).not.toMatch(/\d+vh\b/);
  });

  it('porte le logotype et le nom du produit', () => {
    render(
      <GabaritApp produit="Compte">
        <p>Contenu</p>
      </GabaritApp>,
    );
    expect(screen.getByRole('banner').textContent).toContain('Compte');
  });

  it('accueille les actions de droite fournies par le produit', () => {
    render(
      <GabaritApp produit="Compte" actions={<button type="button">Mon compte</button>}>
        <p>Contenu</p>
      </GabaritApp>,
    );
    expect(screen.getByRole('button', { name: 'Mon compte' })).toBeInTheDocument();
  });
});

describe('CarteAction', () => {
  it('rend la pastille, le titre, la description et l action', () => {
    render(
      <CarteAction
        icone={User}
        titre="Profil"
        description="Gérez vos informations personnelles."
        action="Mon profil"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Profil' })).toBeInTheDocument();
    expect(screen.getByText('Gérez vos informations personnelles.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mon profil' })).toBeInTheDocument();
  });

  it('laisse l icone decorative : le titre porte l information', () => {
    const { container } = render(<CarteAction icone={User} titre="Profil" action="Mon profil" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('rend le bouton pleine largeur sous le palier compact, naturel au-dela', () => {
    render(<CarteAction icone={User} titre="Profil" action="Mon profil" />);
    const css = styleInjecte('ai5d-carte-action');
    expect(css).toContain('.ai5d-carte-action__action > * { width: 100%; }');
    expect(css).toMatch(/@media \(min-width: 640px\)[\s\S]*?width: auto/);
  });

  it('donne a la pastille une largeur figee, legitime sous le plancher de 320 px', () => {
    expect(TAILLE_PASTILLE_ICONE).toBeLessThan(320);
    render(<CarteAction icone={User} titre="Profil" action="Mon profil" />);
    expect(styleInjecte('ai5d-carte-action')).toContain(`width: ${TAILLE_PASTILLE_ICONE}px`);
  });

  it('appelle onAction au clic', async () => {
    const agir = vi.fn();
    render(<CarteAction icone={User} titre="Profil" action="Mon profil" onAction={agir} />);
    await userEvent.click(screen.getByRole('button', { name: 'Mon profil' }));
    expect(agir).toHaveBeenCalledOnce();
  });

  it('rend un lien quand href est fourni, et non un bouton', () => {
    render(<CarteAction icone={User} titre="Profil" action="Mon profil" href="/profil" />);
    expect(screen.getByRole('link', { name: 'Mon profil' })).toHaveAttribute('href', '/profil');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('est secondaire par defaut : un seul primaire par vue', () => {
    render(<CarteAction icone={User} titre="Profil" action="Mon profil" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-variante', 'secondaire');
  });

  it('ne teinte pas son fond : la differenciation se fait par le nom', () => {
    // Le motif de reference donne une couleur a chaque section. La charte mere l interdit,
    // et le vert comme le jaune sont des jetons semantiques : les rendre decoratifs les
    // viderait de leur sens partout ailleurs.
    render(<CarteAction icone={User} titre="Profil" action="Mon profil" />);
    const css = styleInjecte('ai5d-carte-action');
    expect(css).not.toMatch(/--reussite|--attention|--erreur/);
    expect(css).toContain('background: var(--surface-chaude)');
  });

  it("n'ecrit aucune couleur en dur", () => {
    const source = readFileSync('noyau/composants/CarteAction.tsx', 'utf8');
    const declarations = source
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('*') && !l.trimStart().startsWith('//'))
      .join('\n');
    expect(declarations).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
    expect(declarations).not.toMatch(/\brgba?\(/);
  });
});
