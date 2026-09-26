/**
 * Les deux seules couleurs du système écrites hors d'une feuille.
 *
 * `<meta name="theme-color">` colore la barre d'adresse d'un navigateur de téléphone, et n'accepte
 * pas de variable CSS. Sans cet export, chaque produit devrait écrire une valeur hexadécimale, ce que
 * `verifierAucuneCouleurEnDur` lui interdit, à raison.
 *
 * Elles valent `--surface-1` dans chaque thème ; `tests/composants/theme.test.tsx` les confronte à
 * `jetons.css`. Module pur, sans import : `noyau/theme.ts` le réexporte, et un gabarit serveur le lit.
 */
export const COULEURS_NAVIGATEUR = {
  clair: '#FAF7F2',
  sombre: '#0B1620',
} as const;
