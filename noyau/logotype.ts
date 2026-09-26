/**
 * La recette du logotype AI5D, hors du DOM.
 *
 * Dans une page, le logotype est un composant (`composants/Logotype.tsx`), et le « 5 » y est toujours
 * bleu et incliné. Dans un PDF, une image de partage ou un courriel, chaque produit le recomposait à
 * sa façon : le Portail en Fraunces bleu, Compte en Fraunces à l'encre, et aucun n'inclinait le « 5 ».
 * Ce module écrit la composition une fois ; le composant la lit, et ne peut plus en diverger.
 *
 * ── AUCUNE COULEUR ICI ──────────────────────────────────────────────────────
 * Chaque morceau porte un RÔLE. Le consommateur associe `lettres` à son encre (`texte-fort` à
 * l'écran, l'encre sur papier) et `cinq` à son bleu d'action, dans le fichier que son produit réserve
 * aux couleurs d'un format sans CSS (`pdf/jetons.ts`, `emails/jetons.ts` dans le Portail). Un nom de
 * jeton n'aurait aucun sens dans un PDF.
 *
 * ── LES LIMITES, ÉCRITES ────────────────────────────────────────────────────
 * Un client de messagerie qui ignore `transform`, Outlook de bureau notamment, redresse le « 5 ».
 * Aucune recette n'y peut rien ; le bleu, lui, passe partout. Le tracé vectoriel des lettres, qui
 * lèverait cette limite, n'est pas livré : il n'a pas de deuxième consommateur, et il demande un
 * outillage de polices que ce dépôt n'a pas. Il appartient au lot L4. Décision 008.
 *
 * Module pur, sans JSX, sans directive, sans import.
 */

/** Le rôle d'un morceau : le consommateur l'associe à SES jetons. Aucune couleur ici. */
export type RoleLogotype = 'lettres' | 'cinq';

export interface MorceauLogotype {
  texte: 'AI' | '5' | 'D';
  role: RoleLogotype;
}

export const LOGOTYPE = {
  morceaux: [
    { texte: 'AI', role: 'lettres' },
    { texte: '5', role: 'cinq' },
    { texte: 'D', role: 'lettres' },
  ],
  /** Inter, graisse 700 : un PDF charge `Inter-Bold`, une image de partage Inter 700. */
  famille: 'Inter',
  graisse: 700,
  /** Lettrage en em, identique à `--lettrage-marque`. */
  lettrageEm: -0.02,
  /** Le « 5 » s'incline de -5 degrés autour de son centre, dans toutes les variantes. */
  inclinaisonCinqDeg: -5,
  /** Le nom du produit, quand il suit : « AI5D Portail ». */
  produit: {
    famille: 'Fraunces',
    graisse: 300,
    /** Taille du nom rapportée à celle du logotype. */
    echelle: 0.92,
    /** Écart avant le nom, en em de la taille du logotype. */
    ecartEm: 0.42,
  },
} as const satisfies {
  morceaux: readonly MorceauLogotype[];
  famille: string;
  graisse: number;
  lettrageEm: number;
  inclinaisonCinqDeg: number;
  produit: { famille: string; graisse: number; echelle: number; ecartEm: number };
};

/** Le nom accessible, identique à celui du composant : « AI5D » ou « AI5D Portail ». */
export function nomLogotype(produit?: string): string {
  return produit ? `AI5D ${produit}` : 'AI5D';
}
