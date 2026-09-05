import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Shield } from 'lucide-react';
import {
  Bandeau,
  Bouton,
  Carte,
  CarteAuth,
  Champ,
  EPAISSEUR_TRAIT,
  Icone,
  LARGEUR_CARTE_AUTH,
  Logotype,
  Pastille,
} from '../../noyau/composants';

describe('Logotype', () => {
  it('rend les trois parties du mot', () => {
    const { container } = render(<Logotype />);
    expect(container.textContent).toBe('AI5D');
  });

  it('incline le 5 de -5 degres et le laisse bleu', () => {
    render(<Logotype />);
    const cinq = screen.getByText('5');
    expect(cinq.style.transform).toContain('-5deg');
    expect(cinq.style.color).toContain('--action');
  });

  it('garde le 5 bleu meme en variante blanche - interdit de la charte mere', () => {
    render(<Logotype variante="blanc" />);
    expect(screen.getByText('5').style.color).toContain('--action');
    expect(screen.getByText('AI').style.color).toContain('--blanc');
  });

  it('suit le theme par defaut, plutot que de figer une couleur', () => {
    // Le defaut a change apres un rendu reel : fige en encre, le logotype
    // disparaissait en mode sombre sur les pages qui basculent de theme.
    render(<Logotype />);
    expect(screen.getByText('AI').style.color).toContain('--texte-fort');
  });

  it('permet de forcer la couleur pour un fond qui ne depend pas du theme', () => {
    const { rerender } = render(<Logotype variante="encre" />);
    expect(screen.getByText('AI').style.color).toContain('--encre');
    rerender(<Logotype variante="blanc" />);
    expect(screen.getByText('AI').style.color).toContain('--blanc');
  });

  it('affiche le label de produit quand il est fourni', () => {
    render(<Logotype produit="Compte" />);
    expect(screen.getByText('Compte')).toBeInTheDocument();
  });

  it('porte un nom accessible qui inclut le produit', () => {
    render(<Logotype produit="Compte" />);
    expect(screen.getByRole('img', { name: 'AI5D Compte' })).toBeInTheDocument();
  });

  it('porte un nom accessible sans produit', () => {
    render(<Logotype />);
    expect(screen.getByRole('img', { name: 'AI5D' })).toBeInTheDocument();
  });

  it('compose le label en Fraunces, la serif d affichage', () => {
    render(<Logotype produit="Lab" />);
    expect(screen.getByText('Lab').style.fontFamily).toContain('--police-titre');
  });
});

describe('Bouton', () => {
  it('rend un bouton de type button par defaut', () => {
    render(<Bouton>Se connecter</Bouton>);
    const bouton = screen.getByRole('button', { name: 'Se connecter' });
    expect(bouton).toHaveAttribute('type', 'button');
  });

  it('tire sa hauteur du profil de densite', () => {
    render(<Bouton>Valider</Bouton>);
    expect(screen.getByRole('button').style.height).toContain('--hauteur-controle');
  });

  it('respecte le plancher tactile', () => {
    render(<Bouton taille="sm">Petit</Bouton>);
    expect(screen.getByRole('button').style.minHeight).toContain('--cible-tactile');
  });

  it('rend les trois variantes avec des styles distincts', () => {
    const { rerender } = render(<Bouton variante="primaire">A</Bouton>);
    expect(screen.getByRole('button').style.background).toContain('--action');

    rerender(<Bouton variante="secondaire">A</Bouton>);
    expect(screen.getByRole('button').style.background).toBe('transparent');
    expect(screen.getByRole('button').style.color).toContain('--action');

    rerender(<Bouton variante="discret">A</Bouton>);
    expect(screen.getByRole('button').style.border).toContain('transparent');
  });

  it('signale le chargement et desactive, sans perdre son libelle', () => {
    render(<Bouton chargement>Enregistrer</Bouton>);
    const bouton = screen.getByRole('button', { name: 'Enregistrer' });
    expect(bouton).toHaveAttribute('aria-busy', 'true');
    expect(bouton).toBeDisabled();
  });

  it("n'appelle pas onClick quand il est en chargement", async () => {
    const clic = vi.fn();
    render(
      <Bouton chargement onClick={clic}>
        Envoyer
      </Bouton>,
    );
    await userEvent.click(screen.getByRole('button'), { pointerEventsCheck: 0 });
    expect(clic).not.toHaveBeenCalled();
  });

  it('appelle onClick quand il est actif', async () => {
    const clic = vi.fn();
    render(<Bouton onClick={clic}>Envoyer</Bouton>);
    await userEvent.click(screen.getByRole('button'));
    expect(clic).toHaveBeenCalledTimes(1);
  });

  it('conserve la classe fournie par le consommateur', () => {
    render(<Bouton className="ma-classe">A</Bouton>);
    expect(screen.getByRole('button')).toHaveClass('ma-classe');
  });

  it("n'ecrit aucune couleur en dur", () => {
    render(<Bouton>A</Bouton>);
    const style = screen.getByRole('button').getAttribute('style') ?? '';
    expect(style).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });
});

describe('Champ', () => {
  it('lie toujours son libelle a son entree', () => {
    render(<Champ libelle="Adresse professionnelle" />);
    expect(screen.getByLabelText('Adresse professionnelle')).toBeInTheDocument();
  });

  it('engendre des identifiants distincts pour deux champs', () => {
    render(
      <>
        <Champ libelle="Premier" />
        <Champ libelle="Second" />
      </>,
    );
    const premier = screen.getByLabelText('Premier');
    const second = screen.getByLabelText('Second');
    expect(premier.id).not.toBe(second.id);
  });

  it("respecte l'identifiant fourni", () => {
    render(<Champ libelle="Courriel" id="courriel" />);
    expect(screen.getByLabelText('Courriel')).toHaveAttribute('id', 'courriel');
  });

  it("relie l'aide par aria-describedby", () => {
    render(<Champ libelle="Mot de passe" aide="Huit caracteres au minimum." />);
    const entree = screen.getByLabelText('Mot de passe');
    const decritPar = entree.getAttribute('aria-describedby');
    expect(decritPar).toBeTruthy();
    expect(document.getElementById(decritPar as string)?.textContent).toBe(
      'Huit caracteres au minimum.',
    );
  });

  it("ne porte JAMAIS l'erreur par la seule couleur", () => {
    render(<Champ libelle="Courriel" erreur="Adresse ou mot de passe incorrect." />);
    const entree = screen.getByLabelText('Courriel');
    // Trois signaux, pas un : l'attribut, le texte, et le role d'alerte.
    expect(entree).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Adresse ou mot de passe incorrect.');
    expect(entree.style.border).toContain('--erreur');
  });

  it("masque l'aide quand une erreur est presente", () => {
    render(<Champ libelle="Courriel" aide="Votre adresse." erreur="Incorrect." />);
    expect(screen.queryByText('Votre adresse.')).not.toBeInTheDocument();
    expect(screen.getByText('Incorrect.')).toBeInTheDocument();
  });

  it('ne pose pas aria-invalid sans erreur', () => {
    render(<Champ libelle="Courriel" />);
    expect(screen.getByLabelText('Courriel')).not.toHaveAttribute('aria-invalid');
  });

  it('tire sa hauteur du profil de densite', () => {
    render(<Champ libelle="Courriel" />);
    expect(screen.getByLabelText('Courriel').style.height).toContain('--hauteur-controle');
  });
});

describe('Carte', () => {
  it('rend une division par defaut', () => {
    const { container } = render(<Carte>Contenu</Carte>);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('rend un bouton quand elle est cliquable, pour rester atteignable au clavier', () => {
    render(<Carte cliquable>Session Chrome</Carte>);
    expect(screen.getByRole('button', { name: 'Session Chrome' })).toBeInTheDocument();
  });

  it('tire son padding du profil de densite', () => {
    const { container } = render(<Carte>Contenu</Carte>);
    const carte = container.firstElementChild as HTMLElement;
    expect(carte.style.padding).toContain('--padding-carte');
  });

  it('porte une elevation par defaut, et aucune quand elle est plate', () => {
    const { container, rerender } = render(<Carte>A</Carte>);
    expect((container.firstElementChild as HTMLElement).style.boxShadow).toContain('--elevation-2');
    rerender(<Carte plate>A</Carte>);
    expect((container.firstElementChild as HTMLElement).style.boxShadow).toContain('--elevation-0');
  });

  it('reagit au clic quand elle est cliquable', async () => {
    const clic = vi.fn();
    render(
      <Carte cliquable onClick={clic}>
        Ouvrir
      </Carte>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(clic).toHaveBeenCalledTimes(1);
  });
});

describe('Pastille', () => {
  it('affiche toujours du texte', () => {
    render(<Pastille ton="reussite">Actif</Pastille>);
    expect(screen.getByText('Actif')).toBeInTheDocument();
  });

  it('rend les quatre tons avec leur couleur semantique', () => {
    const tons = ['information', 'reussite', 'attention', 'erreur'] as const;
    for (const ton of tons) {
      const { container, unmount } = render(<Pastille ton={ton}>Etat</Pastille>);
      const pastille = container.firstElementChild as HTMLElement;
      expect(pastille.getAttribute('data-ton')).toBe(ton);
      expect(pastille.style.color).toMatch(/var\(--(info|reussite|attention|erreur)\)/);
      unmount();
    }
  });
});

describe('Bandeau', () => {
  it('porte une icone ET un texte, jamais la couleur seule', () => {
    const { container } = render(<Bandeau ton="erreur">Trop de tentatives.</Bandeau>);
    expect(screen.getByText('Trop de tentatives.')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('choisit le role ARIA selon le ton', () => {
    const { rerender } = render(<Bandeau ton="information">Info</Bandeau>);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Bandeau ton="reussite">Fait</Bandeau>);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Bandeau ton="attention">Attention</Bandeau>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Bandeau ton="erreur">Echec</Bandeau>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('affiche son titre et son action', () => {
    render(
      <Bandeau ton="attention" titre="Adresse non verifiee" action={<Bouton>Renvoyer</Bouton>}>
        Verifiez votre boite de reception.
      </Bandeau>,
    );
    expect(screen.getByText('Adresse non verifiee')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Renvoyer' })).toBeInTheDocument();
  });

  it('masque son icone aux lecteurs d ecran, puisque le texte porte le sens', () => {
    const { container } = render(<Bandeau ton="reussite">Adresse verifiee.</Bandeau>);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('Icone', () => {
  it('applique l epaisseur de trait du registre applicatif', () => {
    const { container } = render(<Icone nom={Shield} />);
    expect(container.querySelector('svg')?.getAttribute('stroke-width')).toBe(
      String(EPAISSEUR_TRAIT),
    );
    expect(EPAISSEUR_TRAIT).toBe(1.75);
  });

  it('est decorative par defaut', () => {
    const { container } = render(<Icone nom={Shield} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
  });

  it('devient accessible quand on lui donne un titre', () => {
    render(<Icone nom={Shield} titre="Securite" />);
    expect(screen.getByRole('img', { name: 'Securite' })).toBeInTheDocument();
  });

  it('respecte la taille demandee', () => {
    const { container } = render(<Icone nom={Shield} taille={32} />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('32');
  });
});

describe('CarteAuth', () => {
  it('bloque la largeur de la carte a 420 px, a toutes les tailles', () => {
    const { container } = render(<CarteAuth titre="Content de vous revoir" />);
    const carte = container.querySelector('[data-gabarit="carte-auth"] > div') as HTMLElement;
    // On lit l'attribut brut et non la valeur reparsee : jsdom deforme les fonctions
    // de calcul CSS en les relisant par le CSSOM, et rendrait ce test faussement rouge.
    const style = carte.getAttribute('style') ?? '';
    expect(style).toContain(`width: ${LARGEUR_CARTE_AUTH}`);
    expect(style).toContain(`max-width: ${LARGEUR_CARTE_AUTH}`);
    expect(LARGEUR_CARTE_AUTH).toBe('min(420px, 100% - 32px)');
  });

  it('rend son titre en h1 - c est le titre de la page', () => {
    render(<CarteAuth titre="Content de vous revoir" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Content de vous revoir');
  });

  it('porte le logotype avec le nom du produit', () => {
    render(<CarteAuth titre="Connexion" produit="Compte" />);
    expect(screen.getByRole('img', { name: 'AI5D Compte' })).toBeInTheDocument();
  });

  it('pose le fond de page sur la surface 1', () => {
    const { container } = render(<CarteAuth titre="Connexion" />);
    const page = container.querySelector('[data-gabarit="carte-auth"]') as HTMLElement;
    expect(page.style.background).toContain('--surface-1');
  });

  it('rend son introduction, ses enfants et son pied', () => {
    render(
      <CarteAuth
        titre="Connexion"
        introduction="Un seul compte pour tout AI5D."
        pied={<span>Retour a ai5d.technology</span>}
      >
        <Champ libelle="Adresse professionnelle" />
      </CarteAuth>,
    );
    expect(screen.getByText('Un seul compte pour tout AI5D.')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse professionnelle')).toBeInTheDocument();
    expect(screen.getByText('Retour a ai5d.technology')).toBeInTheDocument();
  });
});
