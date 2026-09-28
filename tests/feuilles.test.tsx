import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { Home, Shield, User } from 'lucide-react';
import {
  BarreOnglets,
  BoiteConfirmation,
  BoiteMotif,
  Bouton,
  CarteAction,
  Champ,
  CoquilleRail,
  GabaritApp,
  GabaritAuth,
  GabaritDocument,
  GabaritSeuil,
  GrilleCartes,
  LiensRail,
  LigneLien,
  ListeDefinitions,
  ListeLignes,
  OngletsRubrique,
  PRECEDENCE_FEUILLES,
  SelecteurTheme,
  SigneAnime,
  Squelette,
  ValeurCopiable,
} from '../noyau/composants';
import { texteFeuille } from './aides/feuille';

/**
 * UNE FEUILLE PAR COMPOSANT, QUEL QUE SOIT LE NOMBRE D INSTANCES (SPEC 1.3.0, §5.1, décision 010).
 *
 * Jusqu à la 1.2.0, chaque instance posait sa propre balise `<style id>` devant elle : cinq cents
 * boutons, cinq cents feuilles et autant d identifiants dupliqués (mesuré le 28 septembre 2026). React
 * 19 hisse et déduplique toute balise qui porte `href` et `precedence`. Ce fichier le prouve au client
 * (jsdom) et au serveur ; le navigateur le confirme sur le banc d essai (docs/preuves/1.3.0/).
 */

const RIEN = () => undefined;

const DOCUMENT = {
  surtitre: 'Protection des données',
  titre: 'Politique de confidentialité',
  sousTitre: 'En vigueur au 28 septembre 2026',
  version: null,
  sections: [],
} as const;

/** Chaque composant qui pose une feuille, et les clés qu il doit poser. */
const CAS: Array<{ nom: string; cles: string[]; element: ReactElement }> = [
  {
    nom: 'BarreOnglets',
    cles: ['ai5d-barre-onglets'],
    element: (
      <BarreOnglets
        onglets={[
          { id: 'a', libelle: 'Accueil', icone: Home },
          { id: 'b', libelle: 'Profil', icone: User },
          { id: 'c', libelle: 'Sécurité', icone: Shield },
        ]}
        actif="a"
      />
    ),
  },
  {
    nom: 'BoiteConfirmation',
    cles: ['ai5d-boite', 'ai5d-bouton'],
    element: (
      <BoiteConfirmation
        phrase="Retirer Aïssatou Camara de la session ?"
        action="Retirer"
        enCours={false}
        onAnnuler={RIEN}
        onConfirmer={RIEN}
      />
    ),
  },
  {
    nom: 'BoiteMotif',
    cles: ['ai5d-boite', 'ai5d-bouton', 'ai5d-champ'],
    element: (
      <BoiteMotif
        phrase="Révoquer l’attestation AI5D-2026-7K3F9Q ?"
        consequence="La page de vérification dira qu’elle est révoquée."
        libelleChamp="Motif"
        action="Révoquer"
        longueurMinimale={10}
        enCours={false}
        onAnnuler={RIEN}
        onValider={RIEN}
      />
    ),
  },
  { nom: 'Bouton', cles: ['ai5d-bouton'], element: <Bouton>Inviter</Bouton> },
  {
    nom: 'Bouton en lien vers un nouvel onglet',
    cles: ['ai5d-bouton', 'ai5d-hors-ecran'],
    element: (
      <Bouton href="https://exemple.invalid" target="_blank">
        Voir la page de vérification
      </Bouton>
    ),
  },
  {
    nom: 'CarteAction',
    cles: ['ai5d-carte-action'],
    element: <CarteAction icone={Shield} titre="Sécurité" action="Gérer" href="/securite" />,
  },
  { nom: 'Champ', cles: ['ai5d-champ'], element: <Champ libelle="Adresse" /> },
  {
    nom: 'CoquilleRail',
    cles: ['ai5d-coquille-rail'],
    element: (
      <CoquilleRail
        produit="Portail"
        navigationRail={<nav aria-label="Rubriques">rail</nav>}
        navigationBarre={<nav aria-label="Barre">barre</nav>}
        rechargerAuRetour={false}
      >
        <p>Contenu</p>
      </CoquilleRail>
    ),
  },
  {
    nom: 'GabaritApp',
    cles: ['ai5d-gabarit-app'],
    element: (
      <GabaritApp produit="Compte">
        <p>Contenu</p>
      </GabaritApp>
    ),
  },
  {
    nom: 'GabaritAuth',
    cles: ['ai5d-gabarit-auth'],
    element: (
      <GabaritAuth produit="Compte">
        <p>Contenu</p>
      </GabaritAuth>
    ),
  },
  {
    nom: 'GabaritDocument',
    cles: ['ai5d-gabarit-document'],
    element: <GabaritDocument document={DOCUMENT} pied={null} accueil="/" />,
  },
  {
    nom: 'GabaritSeuil',
    cles: ['ai5d-gabarit-seuil', 'ai5d-signe-anime'],
    element: <GabaritSeuil marque={<span>AI5D</span>} phrase="Nous préparons votre espace." />,
  },
  {
    nom: 'GrilleCartes',
    cles: ['ai5d-grille-cartes'],
    element: (
      <GrilleCartes>
        <p>Une carte</p>
      </GrilleCartes>
    ),
  },
  {
    nom: 'LiensRail',
    cles: ['ai5d-liens-rail'],
    element: (
      <LiensRail
        rubriques={[{ id: 'accueil', libelle: 'Accueil', icone: Home, href: '/' }]}
        actif="accueil"
        etiquette="Rubriques"
      />
    ),
  },
  {
    nom: 'LigneLien externe',
    cles: ['ai5d-ligne-lien', 'ai5d-hors-ecran'],
    element: <LigneLien href="https://exemple.invalid" titre="Rejoindre la session" externe />,
  },
  {
    nom: 'ListeDefinitions',
    cles: ['ai5d-definitions'],
    element: <ListeDefinitions elements={[{ libelle: 'Numéro', valeur: 'AI5D-2026-7K3F9Q' }]} />,
  },
  {
    nom: 'ListeLignes',
    cles: ['ai5d-liste-lignes'],
    element: (
      <ListeLignes>
        <span>Une ligne</span>
      </ListeLignes>
    ),
  },
  {
    nom: 'OngletsRubrique',
    cles: ['ai5d-onglets-rubrique'],
    element: (
      <OngletsRubrique
        onglets={[
          { id: 'a', libelle: 'Participants', href: '/a' },
          { id: 'b', libelle: 'Ressources', href: '/b' },
        ]}
        actif="a"
      />
    ),
  },
  {
    nom: 'SelecteurTheme',
    cles: ['ai5d-selecteur-theme'],
    element: <SelecteurTheme theme="clair" />,
  },
  {
    nom: 'SigneAnime',
    cles: ['ai5d-signe-anime'],
    element: <SigneAnime marque={<span>AI5D</span>} />,
  },
  { nom: 'Squelette', cles: ['ai5d-squelette'], element: <Squelette /> },
  {
    nom: 'ValeurCopiable',
    cles: ['ai5d-valeur-copiable', 'ai5d-hors-ecran', 'ai5d-bouton', 'ai5d-champ'],
    element: (
      <ValeurCopiable
        valeur="https://portail.ai5d.technology/badge/7K3F9Q"
        libelle="Adresse de votre badge"
        messageEchec="Sélectionnez l’adresse ci-dessus pour la copier."
      />
    ),
  },
];

/** Les clés de la balise unique qu un rendu serveur pose, dans l ordre de `data-href`. */
function clesServeur(html: string): string[] {
  return (/<style data-precedence="ai5d" data-href="([^"]*)">/.exec(html)?.[1] ?? '').split(' ');
}

describe('au client, cinq cents boutons posent une seule feuille', () => {
  it('une balise ai5d-bouton dans document.head, aucune dans le conteneur', () => {
    const { container } = render(
      <div>
        {Array.from({ length: 500 }, (_, i) => (
          <Bouton key={i} variante="discret" taille="sm">{`Ligne ${i + 1}`}</Bouton>
        ))}
      </div>,
    );
    expect(container.querySelectorAll('button')).toHaveLength(500);
    expect(container.querySelectorAll('style')).toHaveLength(0);
    expect(document.querySelectorAll('style[data-href~="ai5d-bouton"]')).toHaveLength(1);
    expect(texteFeuille('ai5d-bouton')).toContain('.ai5d-bouton {');
  });

  it('la feuille hissée ne porte aucun identifiant, et nomme sa précédence', () => {
    render(<Bouton>Inviter</Bouton>);
    const balise = document.head.querySelector('style[data-href~="ai5d-bouton"]');
    expect(balise?.getAttribute('data-precedence')).toBe(PRECEDENCE_FEUILLES);
    expect(balise?.hasAttribute('id')).toBe(false);
  });
});

describe('au serveur, toutes les feuilles du système tiennent dans une balise', () => {
  it('cinq cents boutons et un champ : une balise, deux clés, un sélecteur > intact', () => {
    const html = renderToString(
      <div>
        {Array.from({ length: 500 }, (_, i) => (
          <Bouton key={i}>{`Ligne ${i + 1}`}</Bouton>
        ))}
        <Champ libelle="Rechercher une personne" />
      </div>,
    );
    expect(html.match(/<style/g)).toHaveLength(1);
    expect(clesServeur(html)).toEqual(['ai5d-bouton', 'ai5d-champ']);
    expect(html).not.toMatch(/<style[^>]* id=/);
    // Le rendu serveur n échappe que `<style` et `</style` : un combinateur d enfant passe tel quel.
    expect(html).toContain(
      '.ai5d-bouton:is([data-en-attente], :has([data-en-attente])) .ai5d-bouton__points--attente',
    );
  });

  it('PRECEDENCE_FEUILLES vaut ai5d', () => {
    expect(PRECEDENCE_FEUILLES).toBe('ai5d');
  });
});

describe('chaque composant, rendu deux fois, ne pose qu une feuille par clé', () => {
  for (const { nom, cles, element } of CAS) {
    it(nom, () => {
      const html = renderToString(
        <>
          {element}
          {element}
        </>,
      );
      expect(html.match(/<style/g), nom).toHaveLength(1);
      expect([...clesServeur(html)].sort()).toEqual([...cles].sort());
      expect(html).not.toMatch(/<style[^>]* id=/);
    });
  }
});
