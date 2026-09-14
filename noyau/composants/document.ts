/**
 * La forme d'un document servi par un produit : conditions, politique de confidentialité, charte.
 *
 * Ces types viennent de `apps/compte/lib/legal/types.ts`, où ils décrivaient les deux documents
 * juridiques de Compte. Ils montent avec `GabaritDocument` au sprint 17 : un deuxième produit, AI5D
 * Portail, sert lui aussi des documents, et deux copies d'un même type divergent à la première
 * correction.
 *
 * ── POURQUOI DES DONNÉES TYPÉES ET NON DU MARKDOWN ──────────────────────────
 * Un produit n'a pas à embarquer un moteur de rendu Markdown pour quelques pages, et un parseur
 * maison serait pire : il faudrait le tester sur du texte juridique. Le texte vit en données,
 * découpé en blocs de cinq formes.
 *
 * ── LE GRAS N'EST PAS UN BALISAGE ───────────────────────────────────────────
 * Un balisage maison dans une chaîne serait un parseur déguisé. Un segment mis en valeur devient
 * un bloc `sous-titre` en tête du paragraphe, ou le paragraphe se scinde.
 *
 * ── CINQ INTERFACES NOMMÉES ─────────────────────────────────────────────────
 * Elles se lisent mieux et se citent par leur nom dans une signature. Elles ne font gagner aucun
 * temps de compilation : Compte l'a mesuré, avant et après, et le gain était nul.
 */

export interface BlocParagraphe {
  readonly type: 'paragraphe';
  readonly texte: string;
}

export interface BlocSousTitre {
  readonly type: 'sous-titre';
  readonly texte: string;
}

export interface BlocListe {
  readonly type: 'liste';
  readonly entrees: readonly string[];
}

export interface BlocTableau {
  readonly type: 'tableau';
  readonly entetes: readonly string[];
  readonly lignes: readonly (readonly string[])[];
}

export interface BlocEncart {
  readonly type: 'encart';
  readonly texte: string;
}

export type Bloc = BlocParagraphe | BlocSousTitre | BlocListe | BlocTableau | BlocEncart;

export interface Section {
  /**
   * L'ancre.
   *
   * STABLE : elle circule dans des liens que des tiers gardent. Quelqu'un qui cite
   * « /conditions#organisations » dans un avis doit retrouver la même clause dans deux ans.
   */
  readonly id: string;
  readonly numero: string;
  readonly titre: string;
  readonly blocs: readonly Bloc[];
}

export interface Document {
  /**
   * La famille du document, en capitales au-dessus du titre : « Protection des données »,
   * « Conditions d'utilisation ». Le bandeau nomme ce qu'on lit avant de dire lequel.
   */
  readonly surtitre: string;
  readonly titre: string;
  readonly sousTitre: string;
  /**
   * L'identifiant du texte accepté, quand on y consent : `null` pour un document dont on est
   * seulement informé. Il n'est pas affiché : c'est ce que le compte enregistre, pas ce qu'on lit.
   */
  readonly version: string | null;
  readonly sections: readonly Section[];
}

/** Ce que le bandeau affiche. Le document le fournit, ou l'écran qui le rend le remplace. */
export interface EnteteDocument {
  surtitre: string;
  titre: string;
  intention: string;
}
