/**
 * Les outils communs aux composants qui rendent un lien : `Bouton` avec une adresse, `LigneLien`.
 *
 * Module pur : ni JSX, ni directive, ni import. Il s'importe aussi bien d'un composant serveur que
 * d'un module client, et ses constantes y valent ce qu'elles valent ici.
 *
 * ── DEUX CAS OÙ LE LIEN DU ROUTEUR N'EST JAMAIS EMPLOYÉ ─────────────────────
 * Un téléchargement : un routeur client ne télécharge pas, il naviguerait vers le fichier. Un nouvel
 * onglet : il charge un document entier de toute façon. Dans les deux cas, un `<a>` natif, même quand
 * le produit a fourni son lien. C'est décidé ici, une fois, pour tous les composants.
 *
 * ── LE PROTOCOLE D'ATTENTE ──────────────────────────────────────────────────
 * Le système ne connaît pas le routeur, donc ni l'instant où une navigation part ni celui où elle
 * aboutit. Il offre une convention : un lien est « en attente » quand il porte `data-en-attente`, ou
 * quand il contient un élément qui le porte. La seconde forme existe parce que, sous Next, l'état d'un
 * lien ne se lit que dans l'un de ses descendants. Les feuilles le voient par
 * `:is([data-en-attente], :has([data-en-attente]))`, écrit tel quel dans chacune.
 *
 * Le système ne pose pas `aria-busy` sur un lien en attente : il ne voit que le CSS, et l'annonce
 * d'une navigation en cours appartient à l'indicateur du produit.
 */

/** L'attribut qui dit qu'une navigation part de ce lien et n'a pas encore abouti. */
export const ATTRIBUT_EN_ATTENTE = 'data-en-attente';

/** Lu par les lecteurs d'écran après le libellé d'un lien qui ouvre un nouvel onglet. */
export const MENTION_NOUVEL_ONGLET = '(s’ouvre dans un nouvel onglet)';

/** La classe qui retire un texte de l'écran sans le retirer de l'arbre d'accessibilité. */
export const CLASSE_HORS_ECRAN = 'ai5d-hors-ecran';

/** L'identifiant stable sous lequel un composant injecte la feuille de cette classe. */
export const ID_STYLE_HORS_ECRAN = 'ai5d-hors-ecran';

/**
 * Le texte hors écran occupe un pixel, et sa marge négative d'un pixel est nommée hors échelle dans
 * les exceptions de la garde d'espacement : c'est une construction, pas un pas de l'échelle.
 */
export const STYLE_HORS_ECRAN = `
.ai5d-hors-ecran {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}
`;

/**
 * Le `rel` d'un lien : celui du produit, complété de `noopener` et `noreferrer` quand le lien ouvre
 * un nouvel onglet. Sans doublon, casse comprise : `rel` se compare sans elle.
 */
export function relSur(rel: string | undefined, target: string | undefined): string | undefined {
  if (target !== '_blank') return rel;

  const jetons = (rel ?? '').split(/\s+/).filter((jeton) => jeton !== '');
  const presents = new Set(jetons.map((jeton) => jeton.toLowerCase()));
  for (const requis of ['noopener', 'noreferrer']) {
    if (!presents.has(requis)) jetons.push(requis);
  }
  return jetons.join(' ');
}

/** Vrai quand le lien doit être un `<a>` natif, quel que soit le lien du produit. */
export function lienNatif(options: { download?: unknown; target?: string | undefined }): boolean {
  const telechargement = options.download !== undefined && options.download !== false;
  return telechargement || options.target === '_blank';
}
