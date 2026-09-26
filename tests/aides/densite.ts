/**
 * Le calcul, hors navigateur, des valeurs de densité que reçoit la racine d'un document.
 *
 * jsdom ne calcule aucune propriété personnalisée : c'est ce qui a laissé vivre le défaut du plancher
 * tactile de la 0.1.0 à la 1.1.0 (décision 005). Ce résolveur fait, en quelques lignes, ce que fait le
 * navigateur pour `<html data-densite="…">` : appliquer dans l'ordre du fichier les blocs qui visent
 * cet élément, le bloc `(pointer: coarse)` compris au doigt, substituer les `var()`, évaluer `max()` en
 * pixels, et déclarer invalide toute propriété prise dans un cycle.
 *
 * Il ne remplace pas la mesure dans Chromium (`docs/preuves/1.2.0/plancher-tactile.md`) : il la rend
 * rejouable à chaque exécution.
 *
 * Les sélecteurs de la feuille ont tous la même spécificité pour la racine (`:root` et un attribut
 * valent un pseudo-classe ou un attribut chacun) : l'ordre du fichier décide, comme ici.
 */
import type { BlocCss } from '../../outils/jetons';

export const PROFILS = ['aere', 'equilibre', 'modere', 'compact'] as const;
export type Profil = (typeof PROFILS)[number];
export type Pointeur = 'souris' | 'doigt';

/** La valeur d'une propriété invalide au calcul, celle que le navigateur rend vide. */
export const INVALIDE = 'invalide';

const REQUETE_TACTILE = '@media (pointer: coarse)';

/** Vrai quand le bloc s'applique à la racine qui porte `profil`, ou aucun profil. */
function viseLaRacine(bloc: BlocCss, profil: Profil | null, pointeur: Pointeur): boolean {
  if (bloc.chemin.length > 1) return false;
  const regle = bloc.chemin[0];
  if (regle !== undefined && !(regle === REQUETE_TACTILE && pointeur === 'doigt')) return false;

  return bloc.selecteur
    .split(',')
    .map((partie) => partie.replace(/\s+/g, ' ').trim())
    .some(
      (partie) =>
        partie === ':root' ||
        (profil !== null &&
          (partie === '[data-densite]' || partie === `[data-densite='${profil}']`)),
    );
}

/** `max(48px, 44px)` devient `48px` ; toute autre valeur reste telle quelle. */
function evaluer(valeur: string): string {
  const max = /^max\(\s*(-?\d+(?:\.\d+)?)px\s*,\s*(-?\d+(?:\.\d+)?)px\s*\)$/.exec(valeur);
  if (max === null) return valeur;
  return `${Math.max(Number(max[1]), Number(max[2]))}px`;
}

export function valeursEffectives(
  blocs: BlocCss[],
  profil: Profil | null,
  pointeur: Pointeur,
): Map<string, string> {
  const declarees = new Map<string, string>();
  for (const bloc of blocs) {
    if (!viseLaRacine(bloc, profil, pointeur)) continue;
    for (const [nom, valeur] of bloc.declarations) declarees.set(nom, valeur);
  }

  const calculees = new Map<string, string>();

  function calculer(nom: string, enCours: ReadonlySet<string>): string {
    const connue = calculees.get(nom);
    if (connue !== undefined) return connue;
    const brute = declarees.get(nom);
    if (brute === undefined || enCours.has(nom)) return INVALIDE;

    const suite = new Set(enCours).add(nom);
    const invalides: string[] = [];
    const substituee = brute.replace(
      /var\((--[a-z0-9-]+)\)/g,
      (_correspondance: string, autre: string) => {
        const valeur = calculer(autre, suite);
        if (valeur === INVALIDE) invalides.push(autre);
        return valeur;
      },
    );

    const resultat = invalides.length > 0 ? INVALIDE : evaluer(substituee);
    calculees.set(nom, resultat);
    return resultat;
  }

  for (const nom of declarees.keys()) calculer(nom, new Set());
  return calculees;
}
