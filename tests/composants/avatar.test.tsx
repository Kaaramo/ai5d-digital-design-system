import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Avatar, initiales } from '../../noyau/composants/Avatar';

/**
 * `Avatar` — la photo d'une personne, ou ses initiales.
 *
 * Les cas qui comptent ne sont pas ceux du rendu nominal : ce sont le repli sur une photo
 * cassée, et la règle des deux premiers mots. Les deux se trompent silencieusement.
 */

describe('initiales', () => {
  it('prend une lettre par mot, deux au plus', () => {
    expect(initiales('Aminata Diallo')).toBe('AD');
    expect(initiales('Karamo')).toBe('K');
  });

  it('prend les deux PREMIERS mots, jamais le premier et le dernier', () => {
    // « Marie Claire Dupont » donne MC et non MD : c'est le prenom compose qui est le nom
    // d'usage. L'inverse afficherait des initiales que la personne ne reconnait pas.
    expect(initiales('Marie Claire Dupont')).toBe('MC');
  });

  it('met en majuscules', () => {
    expect(initiales('aminata diallo')).toBe('AD');
  });

  it('supporte les espaces multiples et les bords', () => {
    expect(initiales('   Aminata    Diallo   ')).toBe('AD');
  });

  it('rend un point d interrogation sur un nom vide, jamais rien', () => {
    // Un disque sans rien dedans se lit comme un defaut de chargement, et fait chercher
    // une panne qui n'existe pas.
    expect(initiales('')).toBe('?');
    expect(initiales('   ')).toBe('?');
  });
});

describe('Avatar', () => {
  it('rend les initiales quand il n a pas de photo', () => {
    const { container } = render(<Avatar nom="Aminata Diallo" />);
    expect(screen.getByText('AD')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('traite une image nulle ou vide comme une absence', () => {
    const { rerender } = render(<Avatar nom="Aminata Diallo" image={null} />);
    expect(screen.getByText('AD')).toBeInTheDocument();

    rerender(<Avatar nom="Aminata Diallo" image="" />);
    expect(screen.getByText('AD')).toBeInTheDocument();
  });

  it('rend la photo quand il en a une', () => {
    /*
      On la cherche par sa BALISE, et non par son role.

      Une image decorative porte `alt=""`, ce qui lui donne le role `presentation` et non
      `img` : `getByRole('img')` ne la trouve pas, meme avec `hidden`. C'est le comportement
      correct, et c'est celui qu'on veut ; le test doit s'y conformer, pas l'inverse.
    */
    const { container } = render(
      <Avatar nom="Aminata Diallo" image="https://exemple.test/a.jpg" />,
    );
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', 'https://exemple.test/a.jpg');
    expect(screen.queryByText('AD')).toBeNull();
  });

  it("ne s'annonce jamais comme une image aux lecteurs d ecran", () => {
    // Le nom complet est toujours a cote, en toutes lettres. Une image qui s'annoncerait
    // ferait entendre deux fois la meme personne.
    render(<Avatar nom="Aminata Diallo" image="https://exemple.test/a.jpg" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('img', { hidden: true })).toBeNull();
  });

  it('retombe sur les initiales quand la photo ne charge pas', () => {
    /*
      LE CAS QUI JUSTIFIE LE COMPOSANT.

      Une URL peut mourir : objet supprime, domaine de medias en panne, reseau d'entreprise
      qui filtre les images distantes. Sans ce repli, il reste un trou a la place de
      quelqu'un, et rien ne le signale.
    */
    const { container } = render(
      <Avatar nom="Aminata Diallo" image="https://exemple.invalid/a.jpg" />,
    );
    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    fireEvent.error(image as HTMLImageElement);

    expect(screen.getByText('AD')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('est decoratif dans ses deux etats', () => {
    // Le nom complet est toujours a cote, en toutes lettres. Le faire annoncer ferait
    // entendre deux fois la meme chose.
    const { container, rerender } = render(<Avatar nom="Aminata Diallo" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');

    rerender(<Avatar nom="Aminata Diallo" image="https://exemple.test/a.jpg" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstChild).toHaveAttribute('alt', '');
  });

  it('se NOMME quand il est le seul marqueur d identite', () => {
    /*
      Ce n est pas un confort. Mesure sur le portail : sous 768 px, le rail disparait avec le
      nom et l adresse, et le disque devient le seul marqueur d identite de la coquille.
      Retire de l arbre d accessibilite, avec une infobulle que le doigt ne declenche pas, il
      ne disait plus rien du tout.

      Quelqu un qui tient un compte personnel et un compte employeur au meme nom pouvait
      demander la suppression du mauvais compte.
    */
    render(<Avatar nom="Awa Ndiaye" decoratif={false} />);
    const disque = screen.getByRole('img', { name: /Awa Ndiaye/ });
    expect(disque).toBeInTheDocument();
    expect(disque).not.toHaveAttribute('aria-hidden');
  });

  it('se nomme aussi quand il porte une photo', () => {
    // Le cas est le meme, et il serait facile de ne corriger que la moitie qui se voyait.
    const { container } = render(
      <Avatar nom="Awa Ndiaye" image="https://exemple.test/a.jpg" decoratif={false} />,
    );
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('alt', 'Connecté en tant que Awa Ndiaye');
    expect(image).not.toHaveAttribute('aria-hidden');
  });

  it('accepte des initiales fournies, pour un objet qui n est pas une personne', () => {
    /*
      Une organisation saute ses mots de liaison : « Institut de la Vision » donne IV, et non
      ID. Une personne ne le fait pas : « Jean de La Fontaine » est un nom a particule, et
      sauter le « de » y perdrait une lettre du nom. Les deux regles sont justes, chacune
      pour son objet.
    */
    render(<Avatar nom="Institut de la Vision" lettres="IV" />);
    expect(screen.getByText('IV')).toBeInTheDocument();
    expect(screen.queryByText('ID')).toBeNull();
  });

  it('developpe le nom au survol, dans les deux etats', () => {
    // Les initiales seules ne disent rien a qui ne les a pas choisies.
    const { container, rerender } = render(<Avatar nom="Awa Ndiaye" />);
    expect(container.firstChild).toHaveAttribute('title', 'Awa Ndiaye');

    rerender(<Avatar nom="Awa Ndiaye" image="https://exemple.test/a.jpg" />);
    expect(container.firstChild).toHaveAttribute('title', 'Awa Ndiaye');
  });

  it('applique le diametre demande, dans les deux etats', () => {
    const { container, rerender } = render(<Avatar nom="Aminata Diallo" taille={96} />);
    expect(container.firstChild).toHaveStyle({ width: '96px', height: '96px' });

    rerender(<Avatar nom="Aminata Diallo" image="https://exemple.test/a.jpg" taille={96} />);
    expect(container.firstChild).toHaveStyle({ width: '96px', height: '96px' });
  });

  it('laisse le consommateur surcharger le style, comme les autres composants', () => {
    const { container } = render(<Avatar nom="Aminata Diallo" style={{ opacity: '0.5' }} />);
    expect(container.firstChild).toHaveStyle({ opacity: '0.5' });
  });

  it("n'ecrit aucune couleur en dur : tout passe par des jetons", () => {
    const { container } = render(<Avatar nom="Aminata Diallo" />);
    const style = (container.firstChild as HTMLElement).getAttribute('style') ?? '';
    expect(style).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(style).toContain('var(--surface-1)');
  });
});
