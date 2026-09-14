import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import * as composants from '../noyau/composants';

const DOSSIER = 'noyau/composants';
const index = readFileSync(`${DOSSIER}/index.ts`, 'utf8');

const ATTENDUS = [
  'Avatar',
  'Bandeau',
  'BlocDocument',
  'BarreOnglets',
  'BoiteConfirmation',
  'BoiteMotif',
  'Bouton',
  'Carte',
  'CarteAction',
  'Champ',
  'Chiffre',
  'CoquilleRail',
  'DeplierDocument',
  'Embleme',
  'EnteteCarte',
  'EnteteRubrique',
  'EtatVide',
  'GabaritApp',
  'GabaritAuth',
  'GabaritDocument',
  'GabaritSeuil',
  'GrilleCartes',
  'Icone',
  'LiensRail',
  'Logotype',
  'OngletsRubrique',
  'Pastille',
  'PastilleEtat',
  'RechargeAuRetour',
  'SelecteurTheme',
  'SigneAnime',
  'SommaireDocument',
  'Squelette',
  'TempsRelatif',
] as const;

describe('index des composants', () => {
  it('exporte les trente-quatre composants du noyau', () => {
    for (const nom of ATTENDUS) {
      expect(composants, `${nom} n'est pas exporte`).toHaveProperty(nom);
      expect(typeof composants[nom], `${nom} n'est pas un composant`).toBe('function');
    }
  });

  it("n'oublie aucun fichier de composant", () => {
    const fichiers = readdirSync(DOSSIER)
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => f.replace('.tsx', ''));
    for (const fichier of fichiers) {
      expect(index, `${fichier}.tsx existe mais n'est pas dans l'index`).toContain(
        `from './${fichier}'`,
      );
    }
    expect(fichiers.sort()).toEqual([...ATTENDUS].sort());
  });

  it('exporte aussi les constantes que les consommateurs doivent pouvoir citer', () => {
    expect(composants.EPAISSEUR_TRAIT).toBe(1.75);
    expect(composants.LARGEUR_FORMULAIRE).toBe(440);
    expect(composants.BASCULE_DEUX_COLONNES).toBe(1024);
    expect(composants.LARGEUR_MAX_PANNEAU).toBe(560);
    expect(composants.HAUTEUR_BARRE_ONGLETS).toBe(56);
    expect(composants.HAUTEUR_ENTETE).toBe(56);
    expect(composants.TAILLE_PASTILLE_ICONE).toBe(48);
    expect(composants.HAUTEUR_ONGLETS).toBe(44);
    expect(composants.ONGLETS_MIN).toBe(3);
    expect(composants.ONGLETS_MAX).toBe(5);
    expect(composants.GRILLE_EMBLEME).toBe(240);
    expect(composants.RAYON_CARTOUCHE).toBe(53);
    expect(composants.CONTENEUR_DEUX_COLONNES).toBe(560);
    expect(composants.CONTENEUR_TROIS_COLONNES).toBe(900);
  });

  it("n'exporte aucun composant inter-produits - ils appartiennent a l'ecosysteme", () => {
    for (const interdit of [
      'MenuCompte',
      'SelecteurOrganisation',
      'SelecteurProduit',
      'AccesRefuse',
      'BandeauEnvironnement',
    ]) {
      expect(composants, `${interdit} appartient a la couche ecosysteme`).not.toHaveProperty(
        interdit,
      );
    }
  });
});

describe('la frontiere serveur / client', () => {
  /*
    LA GARDE QUI MANQUAIT, ECRITE APRES QUE LE PORTAIL A RENDU 500 SUR CINQ RUBRIQUES.

    `Avatar` a recu un etat au sprint 11 — le repli sur les initiales quand une photo ne
    charge pas — sans la directive `'use client'`. La coquille du portail est un composant
    SERVEUR qui rend cet avatar : les cinq rubriques sont tombees d un coup.

    Aucun test ne pouvait le voir. En jsdom, un hook fonctionne toujours ; les gardes de
    forme lisent du texte ; le typecheck ne connait pas la frontiere. Il a fallu ouvrir une
    page dans un vrai navigateur.

    ── POURQUOI LA REGLE EST PLUS STRICTE POUR UN SYSTEME QUE POUR UN PRODUIT ─
    Un composant sans directive n est ni serveur ni client : il prend l environnement de
    celui qui l importe. Dans un produit, on connait ses appelants. Dans un SYSTEME, on ne
    les connait pas : le composant marche chez l un et tombe chez l autre, et l appelant qui
    le fait tomber peut n arriver que six mois plus tard.

    `Champ` etait dans ce cas depuis toujours, avec `useId`. Il ne tombait pas parce que
    seuls des formulaires l importaient. C etait une chance, pas une propriete.
  */
  /*
    Écrite sans limite de mot en tête, volontairement : `use` commence toujours un
    identifiant ici, et une séquence d'échappement de plus est une occasion de plus de la
    voir se transformer en caractère de contrôle invisible en traversant l'outillage.

    C'est arrivé à la première écriture de cette ligne. L'expression devenait fausse, ne
    trouvait aucun fichier, et le test qui suit — celui qui vérifie qu'elle trouve quelque
    chose — est précisément ce qui l'a montré.
  */
  /*
    UN CROCHET MAISON EST UN CROCHET.

    La liste nommait les crochets de React. `BoiteConfirmation` appelle `useDialogueModal`, qui en
    appelle deux : la garde n y voyait aucun crochet, et exigeait qu elle retire une directive dont
    elle a besoin. Toute fonction qui commence par `use` et une capitale est un crochet, c est la
    convention que React impose lui-meme.

    Le parametre de type optionnel couvre `useState<Theme>(` : sans lui, `SelecteurTheme` passait
    pour un composant sans etat, et la garde exigeait qu il retire sa directive.
  */
  const HOOKS = /use[A-Z]\w*\s*(<[^>]*>)?\s*\(/;

  /*
    LES COMMENTAIRES SONT RETIRES AVANT LA RECHERCHE.

    Avec un motif large, le commentaire de `CoquilleRail` qui explique pourquoi elle NE lit PAS
    `usePathname()` suffisait a la declarer cliente. Un commentaire a le droit de citer ce qu il
    ecarte ; la garde lit le code.
  */
  function code(source: string): string {
    return source
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
  }

  const fichiers = readdirSync(DOSSIER)
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => {
      const source = readFileSync(`${DOSSIER}/${f}`, 'utf8');
      return { nom: f, source, crochet: HOOKS.test(code(source)) };
    });

  it('tout composant qui emploie un hook declare use client', () => {
    for (const { nom, source, crochet } of fichiers) {
      if (!crochet) continue;
      expect(source.startsWith("'use client';"), `${nom} emploie un hook sans la directive`).toBe(
        true,
      );
    }
  });

  it('la garde porte sur quelque chose : au moins un composant emploie un hook', () => {
    // Sans ce test, le precedent passerait a vide le jour ou l expression reguliere cesse
    // de reconnaitre les hooks.
    expect(fichiers.filter(({ crochet }) => crochet).length).toBeGreaterThan(0);
  });

  it('les composants SANS etat restent utilisables par un composant serveur', () => {
    /*
      L inverse compte autant. Poser `'use client'` sur un composant sans etat enverrait son
      code au navigateur pour rien, et forcerait une frontiere la ou il n en faut aucune.

      `Icone`, `Carte`, `Bandeau` et les gabarits sont rendus par des composants serveur dans
      le portail. La directive les en empecherait.
    */
    for (const { nom, source, crochet } of fichiers) {
      if (crochet) continue;
      expect(
        source.startsWith("'use client';"),
        `${nom} declare use client sans en avoir besoin`,
      ).toBe(false);
    }
  });
});
