import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mail, Shield } from 'lucide-react';
import {
  Bandeau,
  BASCULE_DEUX_COLONNES,
  Bouton,
  Carte,
  Champ,
  CHEMIN_TETE,
  Embleme,
  EPAISSEUR_TRAIT,
  GabaritAuth,
  Icone,
  LARGEUR_FORMULAIRE,
  LARGEUR_MAX_PANNEAU,
  Logotype,
  Pastille,
  TRANSFORME_TETE,
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

  it('rend les cinq variantes avec des styles distincts', () => {
    /*
      Les couleurs ont quitte le style en ligne en v0.4.0 : une pseudo-classe ne peut pas
      battre un attribut `style`, et c'est ce qui rendait tout survol impossible. Ce test
      garde donc la MEME propriete a son nouvel endroit, la feuille injectee, plutot que
      de disparaitre avec l'attribut qu'il lisait.
    */
    const { container } = render(<Bouton variante="primaire">A</Bouton>);
    const css = (container.querySelector('#ai5d-bouton')?.innerHTML ?? '').replace(/\s+/g, ' ');

    expect(css).toContain("[data-variante='primaire'] { background: var(--action);");
    expect(css).toContain("[data-variante='secondaire'] { background: transparent;");
    expect(css).toContain("[data-variante='neutre'] { background: var(--surface-2);");
    expect(css).toContain("[data-variante='danger'] { background: var(--erreur);");
    // `discret` n'a pas de bloc a lui : il herite du fond transparent et du trait
    // transparent de la regle de base, et c'est exactement ce qu'il est.
    expect(css).toContain('.ai5d-bouton { background: transparent;');
  });

  it('marque sa variante dans le DOM, pour la feuille et pour les gardes des produits', () => {
    const { rerender } = render(<Bouton variante="primaire">A</Bouton>);
    expect(screen.getByRole('button').dataset.variante).toBe('primaire');

    rerender(<Bouton variante="secondaire">A</Bouton>);
    expect(screen.getByRole('button').dataset.variante).toBe('secondaire');

    rerender(<Bouton variante="discret">A</Bouton>);
    expect(screen.getByRole('button').dataset.variante).toBe('discret');

    rerender(<Bouton variante="danger">A</Bouton>);
    expect(screen.getByRole('button').dataset.variante).toBe('danger');
  });

  it('la variante danger porte --texte-sur-erreur, jamais --texte-sur-action', () => {
    // Ce n'est pas un detail de nommage. En mode sombre, --erreur vaut un rouge clair,
    // et --texte-sur-action y vaut du blanc : le rapport tombe a 2,89. Le jeton dedie
    // bascule en encre, et le test garde ce choix.
    const { container } = render(<Bouton variante="danger">Supprimer</Bouton>);
    const css = container.querySelector('#ai5d-bouton')?.innerHTML ?? '';
    const regleDanger = css.split('}').find((r) => r.includes("[data-variante='danger'] {")) ?? '';
    expect(regleDanger).toContain('color: var(--texte-sur-erreur)');
    expect(regleDanger).not.toContain('--texte-sur-action');
  });

  it('la variante danger est lisible dans le marquage, pour les gardes des produits', () => {
    // Les produits comptent leurs boutons primaires. Sans `data-variante`, un bouton
    // destructeur serait compte comme un primaire et l'ecran de suppression, qui en
    // porte legitimement un de chaque, echouerait a une garde correcte.
    render(<Bouton variante="danger">Supprimer</Bouton>);
    expect(screen.getByRole('button').dataset.variante).toBe('danger');
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

  it('porte la classe qui rend ses etats atteignables par une feuille', () => {
    render(<Bouton>Envoyer</Bouton>);
    expect(screen.getByRole('button').className).toContain('ai5d-bouton');
  });

  it('n ecrit AUCUNE couleur en style en ligne', () => {
    // C'est la condition meme du survol : un attribut style bat toujours une
    // pseudo-classe. La regression se verrait ici avant de se voir a l'ecran.
    render(<Bouton variante="primaire">Envoyer</Bouton>);
    const bouton = screen.getByRole('button');
    expect(bouton.style.background).toBe('');
    expect(bouton.style.color).toBe('');
    expect(bouton.style.borderColor).toBe('');
  });

  it('injecte la feuille qui porte le survol, le focus et l appui', () => {
    const { container } = render(<Bouton>Envoyer</Bouton>);
    const feuille = container.querySelector('#ai5d-bouton');
    expect(feuille).not.toBeNull();
    const css = feuille?.innerHTML ?? '';
    expect(css).toContain('--action-survol');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('translateY(1px)');
    expect(css).toContain('prefers-reduced-motion');
  });

  it('n applique le survol qu aux boutons actifs', () => {
    const { container } = render(<Bouton>Envoyer</Bouton>);
    const css = container.querySelector('#ai5d-bouton')?.innerHTML ?? '';
    // Un bouton en chargement reagirait sinon a la souris tout en refusant le clic.
    for (const regle of css.split('}').filter((r) => r.includes(':hover'))) {
      expect(regle, regle).toContain(':not(:disabled)');
    }
  });

  it('offre la variante neutre, qui ne revendique pas l action', () => {
    render(<Bouton variante="neutre">Continuer avec Google</Bouton>);
    expect(screen.getByRole('button').dataset.variante).toBe('neutre');
  });

  it('donne au bouton destructeur un anneau rouge, pas bleu', () => {
    const { container } = render(<Bouton variante="danger">Supprimer</Bouton>);
    const css = container.querySelector('#ai5d-bouton')?.innerHTML ?? '';
    expect(css).toContain("[data-variante='danger']:focus-visible");
    expect(css).toContain('outline-color: var(--erreur)');
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

  it('accepte une icone, decorative et jamais annoncee', () => {
    // Elle aide au balayage d un formulaire : une enveloppe et un cadenas se
    // reconnaissent avant d etre lus. Mais un lecteur d ecran n a que le libelle, et
    // c est lui qui doit suffire.
    const { container } = render(<Champ libelle="Adresse" icone={Mail} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByLabelText('Adresse')).toBeInTheDocument();
  });

  it('ouvre le rembourrage a gauche quand une icone est posee', () => {
    // Sans cela, le texte saisi passe sous l icone et devient illisible.
    const { rerender } = render(<Champ libelle="Sans" />);
    const sansIcone = screen.getByLabelText('Sans').style.paddingLeft;
    rerender(<Champ libelle="Avec" icone={Mail} />);
    const avecIcone = screen.getByLabelText('Avec').style.paddingLeft;
    expect(Number.parseInt(avecIcone, 10)).toBeGreaterThan(Number.parseInt(sansIcone, 10));
  });

  it('accueille une commande dans le cadre, a droite', () => {
    // La bascule « Afficher » d un mot de passe. Posee hors du composant, elle se
    // retrouvait sur la ligne du libelle et se lisait comme un second libelle.
    render(<Champ libelle="Mot de passe" commande={<button type="button">Afficher</button>} />);
    expect(screen.getByRole('button', { name: 'Afficher' })).toBeInTheDocument();
    const rembourrage = screen.getByLabelText('Mot de passe').style.paddingRight;
    expect(Number.parseInt(rembourrage, 10)).toBeGreaterThan(14);
  });

  it('un champ nu garde exactement le rendu qu il avait', () => {
    // La retro-compatibilite n est pas une intention : elle se verifie. Un champ sans
    // icone ni commande garde ses 14 px de chaque cote.
    render(<Champ libelle="Nu" />);
    const entree = screen.getByLabelText('Nu');
    expect(entree.style.paddingLeft).toBe('14px');
    expect(entree.style.paddingRight).toBe('14px');
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
    // La bordure rouge vient desormais de la feuille, accrochee a `aria-invalid` : l'etat
    // visuel ne peut donc plus diverger de l'etat annonce.
    const css = document.querySelector('#ai5d-champ')?.innerHTML ?? '';
    expect(css).toContain("[aria-invalid='true']");
    expect(css).toContain('border-color: var(--erreur)');
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

  it('n ecrit plus la bordure en style en ligne : le focus doit pouvoir la changer', () => {
    render(<Champ libelle="Adresse" />);
    const entree = screen.getByLabelText('Adresse');
    expect(entree.style.border).toBe('');
    expect(entree.className).toContain('ai5d-champ__entree');
  });

  it('injecte un anneau de focus decale d un pixel, pas de deux', () => {
    // Le champ a deja une bordure visible : deux pixels laisseraient un lisere de fond
    // entre les deux, et donneraient un halo flou.
    const { container } = render(<Champ libelle="Adresse" />);
    const css = container.querySelector('#ai5d-champ')?.innerHTML ?? '';
    expect(css).toContain('outline-offset: 1px');
    expect(css).toContain(':focus-visible');
  });

  it('donne un anneau ROUGE a un champ en erreur', () => {
    const { container } = render(<Champ libelle="Adresse" erreur="Adresse invalide" />);
    const css = container.querySelector('#ai5d-champ')?.innerHTML ?? '';
    expect(css).toContain("[aria-invalid='true']:focus-visible");
    expect(css).toContain('outline-color: var(--erreur)');
  });

  it('accroche l etat visuel a aria-invalid, pour qu il ne diverge pas de l etat annonce', () => {
    render(<Champ libelle="Adresse" erreur="Adresse invalide" />);
    expect(screen.getByLabelText('Adresse').getAttribute('aria-invalid')).toBe('true');
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

describe('GabaritAuth', () => {
  it('rend deux colonnes : le formulaire et le panneau', () => {
    const { container } = render(
      <GabaritAuth produit="Compte" phrase="Un compte. Tout AI5D.">
        <Champ libelle="Adresse professionnelle" />
      </GabaritAuth>,
    );
    expect(container.querySelector('main.ai5d-auth__principal')).not.toBeNull();
    expect(container.querySelector('aside.ai5d-auth__panneau')).not.toBeNull();
  });

  it('rend le contenu de la colonne de gauche', () => {
    render(
      <GabaritAuth produit="Compte">
        <Champ libelle="Adresse professionnelle" />
      </GabaritAuth>,
    );
    expect(screen.getByLabelText('Adresse professionnelle')).toBeInTheDocument();
  });

  it('masque le panneau aux lecteurs d ecran : il ne porte rien de neuf', () => {
    const { container } = render(<GabaritAuth phrase="Une phrase.">contenu</GabaritAuth>);
    expect(container.querySelector('aside')).toHaveAttribute('aria-hidden', 'true');
  });

  it('porte la phrase dans le panneau, et seulement si on la donne', () => {
    const { container, rerender } = render(
      <GabaritAuth phrase="Un compte. Tout AI5D.">contenu</GabaritAuth>,
    );
    expect(container.querySelector('aside')?.textContent).toContain('Un compte. Tout AI5D.');

    rerender(<GabaritAuth>contenu</GabaritAuth>);
    expect(container.querySelector('aside p')).toBeNull();
  });

  it('affiche le logotype des deux cotes, en blanc sur le panneau d encre', () => {
    const { container } = render(<GabaritAuth produit="Compte">contenu</GabaritAuth>);
    const logotypes = container.querySelectorAll('[role="img"][aria-label="AI5D Compte"]');
    expect(logotypes.length).toBe(2);
  });

  it('bascule a 1024 px, et non a 768 - la mesure est dans l en-tete du composant', () => {
    expect(BASCULE_DEUX_COLONNES).toBe(1024);
    const { container } = render(<GabaritAuth>contenu</GabaritAuth>);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain(`@media (min-width: ${BASCULE_DEUX_COLONNES}px)`);
    // A 768 px le panneau prenait 345 px et laissait 423 px pour un formulaire
    // annonce a 440 px : l'ecran de reinitialisation debordait de 14 px.
    const debut = style.indexOf('@media (min-width: 768px)');
    const suite = style.indexOf('@media', debut + 1);
    const blocIntermediaire = style.slice(debut, suite === -1 ? undefined : suite);
    expect(blocIntermediaire, 'le panneau ne doit pas apparaitre a 768 px').not.toContain(
      'ai5d-auth__panneau',
    );
  });

  it('borne le formulaire a 440 px et le panneau a 45 % plafonne a 560 px', () => {
    const { container } = render(<GabaritAuth>contenu</GabaritAuth>);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain(`max-width: ${LARGEUR_FORMULAIRE}px`);
    expect(style).toContain('width: 45%');
    expect(style).toContain(`max-width: ${LARGEUR_MAX_PANNEAU}px`);
  });

  it('pose min-width 0 sur la colonne, sans quoi le panneau sort de l ecran', () => {
    const { container } = render(<GabaritAuth>contenu</GabaritAuth>);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('min-width: 0');
  });

  it('pose le fond de page sur la surface 1', () => {
    const { container } = render(<GabaritAuth>contenu</GabaritAuth>);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).toContain('background: var(--surface-1)');
  });

  it("n'utilise aucune couleur en dur - la garde du systeme l'a attrape", () => {
    // Ce test existe parce que la premiere version du panneau ecrivait color: #fff.
    // La garde aucune-couleur-en-dur l'a releve avant le premier commit.
    const { container } = render(<GabaritAuth phrase="Une phrase.">contenu</GabaritAuth>);
    const style = container.querySelector('style')?.textContent ?? '';
    expect(style).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(style).toContain('var(--blanc)');
    expect(style).toContain('var(--encre)');
  });
});

describe('Embleme', () => {
  it('rend le cartouche et la silhouette en variante badge', () => {
    const { container } = render(<Embleme />);
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 240 240');
    expect(container.querySelectorAll('rect')).toHaveLength(1);
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });

  it('retire le cartouche en variante nue, et suit la couleur du texte', () => {
    const { container } = render(<Embleme variante="nu" />);
    expect(container.querySelectorAll('rect')).toHaveLength(0);
    for (const chemin of container.querySelectorAll('path')) {
      expect(chemin.getAttribute('fill')).toBe('currentColor');
    }
  });

  it('reprend le pentagone institutionnel sans le modifier', () => {
    // L'interdit de la charte mere : le pentagone ne se redresse pas, ne se recolore pas,
    // ne se recadre pas. Un test le rend verifiable plutot que memorable.
    const { container } = render(<Embleme />);
    const tete = container.querySelectorAll('path')[0];
    expect(tete?.getAttribute('d')).toBe(CHEMIN_TETE);
    expect(tete?.getAttribute('transform')).toBe(TRANSFORME_TETE);
  });

  it('est decoratif par defaut : le nom du produit est ecrit a cote', () => {
    const { container } = render(<Embleme />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('devient annoncable quand on lui donne un titre', () => {
    render(<Embleme titre="Compte AI5D" />);
    expect(screen.getByRole('img', { name: 'Compte AI5D' })).toBeTruthy();
  });

  it('rend la taille demandee, en carre', () => {
    const { container } = render(<Embleme taille={20} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('20');
    expect(svg?.getAttribute('height')).toBe('20');
  });

  it('ne prend jamais le focus : ce n est pas une commande', () => {
    const { container } = render(<Embleme />);
    expect(container.querySelector('svg')?.getAttribute('focusable')).toBe('false');
  });
});
