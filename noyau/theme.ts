/**
 * Le theme de l interface : clair, sombre, ou celui de l appareil.
 *
 * ── CE MODULE EST PUR, ET IL DOIT LE RESTER ─────────────────────────────────
 * Il n importe que `couleurs-navigateur.ts`, pur lui aussi. Le selecteur de theme est un composant
 * CLIENT : s il atteignait `next/headers` ou Prisma, meme de loin, la compilation echouerait au premier
 * import.
 *
 * ── TROIS ETATS, ET L ABSENCE D ATTRIBUT EN EST UN ──────────────────────────
 *
 *   `clair`    choix explicite. L attribut vaut `light`.
 *   `sombre`   choix explicite. L attribut vaut `dark`.
 *   `systeme`  AUCUN attribut, et le CSS suit `prefers-color-scheme`.
 *
 * Le troisieme n est pas une commodite, c est ce qui evite tout script au chargement. Le
 * systeme de design pose ses trois blocs de variables — dont un sous
 * `@media (prefers-color-scheme: dark)` — et le navigateur choisit seul. Un script en
 * ligne aurait de surcroit reclame la nonce de la politique de securite du contenu, que le
 * middleware renouvelle a chaque requete.
 *
 * ── LE DEFAUT EST `systeme`, ET IL VAUT PARTOUT ─────────────────────────────
 * Chaque produit pose l attribut sur `<html>` depuis son gabarit racine, avec `attributTheme` :
 * le systeme ne le fait pas pour lui. Quelqu un dont l appareil est en sombre ne recoit alors
 * jamais un ecran blanc, pas meme sur une page d entree qu il n a pas encore eu l occasion de
 * regler.
 *
 * ── IL VIENT DE COMPTE ──────────────────────────────────────────────────────
 * `apps/compte/lib/theme.ts`, monte sans changement de valeur au sprint 17 : le cookie de theme
 * doit suivre la personne d un produit a l autre, et deux produits qui lisent le meme cookie
 * avec deux modules differents finiraient par ne plus lire la meme chose.
 *
 * ── LES NOMS SONT FRANCAIS, LES VALEURS SONT CELLES DU SYSTEME ──────────────
 * Le systeme de design ecrit `[data-theme='light']` et `[data-theme='dark']`. On ne
 * traduit pas ses selecteurs : `attributTheme` fait la conversion en un seul endroit, et
 * c est le seul endroit ou les deux vocabulaires se rencontrent.
 */

export const THEMES = ['clair', 'sombre', 'systeme'] as const;

export type Theme = (typeof THEMES)[number];

/**
 * Le cookie qui porte le choix.
 *
 * Jamais `HttpOnly`, et c est deliberé : le selecteur l ecrit lui-meme depuis le client,
 * ce qui evite une route d API de plus a garder dans chaque produit. Un
 * reglage d affichage n est pas un secret.
 *
 * Un an de duree. Le theme n est pas une session : on ne le redemande pas chaque semaine.
 */
export const COOKIE_THEME = 'ai5d-theme';

export const DUREE_COOKIE_THEME_S = 60 * 60 * 24 * 365;

/** Une valeur venue d un cookie n est pas un `Theme`. */
export function estTheme(valeur: unknown): valeur is Theme {
  return typeof valeur === 'string' && (THEMES as readonly string[]).includes(valeur);
}

/**
 * Le theme lu, ou `systeme` faute de mieux.
 *
 * Le repli n est PAS `clair`. Quelqu un dont l appareil est en sombre et dont le cookie a
 * ete perdu doit retrouver le sombre, pas un ecran blanc en pleine nuit. C est le sens
 * meme du troisieme etat.
 */
export function themeOuSysteme(valeur: string | undefined): Theme {
  return estTheme(valeur) ? valeur : 'systeme';
}

/**
 * L attribut a poser sur `<html>`, ou `undefined` pour n en poser aucun.
 *
 * `systeme` ne rend pas la chaine vide mais RIEN. `data-theme=""` satisferait le selecteur
 * `:root:not([data-theme='light'])` du systeme de design tout en n etant ni clair ni
 * sombre : cela marcherait par accident, jusqu au jour ou le systeme resserre son
 * selecteur. L absence, elle, est ce que ses trois blocs attendent.
 */
export function attributTheme(theme: Theme): 'light' | 'dark' | undefined {
  if (theme === 'clair') return 'light';
  if (theme === 'sombre') return 'dark';
  return undefined;
}

/** Le libelle affiche, en francais, majuscule initiale seulement. */
export const LIBELLE_THEME: Record<Theme, string> = {
  clair: 'Clair',
  sombre: 'Sombre',
  systeme: 'Système',
};

/**
 * Les couleurs de `<meta name="theme-color">`, les seules que le systeme ecrive hors d une feuille.
 * Reexportees ici pour s importer par `@ai5d/design-system/theme`, depuis un module sans directive
 * qu un gabarit serveur peut lire (lecon du depot : une constante lue par le serveur ne vit pas dans
 * un module client).
 */
export { COULEURS_NAVIGATEUR } from './couleurs-navigateur';
