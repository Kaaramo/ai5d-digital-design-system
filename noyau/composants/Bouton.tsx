import type { ButtonHTMLAttributes, CSSProperties } from 'react';

/**
 * Le bouton du registre applicatif.
 *
 * Sa hauteur vient de `--hauteur-controle`, c'est-à-dire du profil de densité : c'est
 * par ici que la densité entre dans les composants. Sur un appareil tactile, le plancher
 * de 44 px s'applique automatiquement, sans que ce fichier ait à le savoir.
 *
 * Un seul bouton primaire par vue. C'est une règle de la charte, pas une préférence :
 * deux actions bleues sur un même écran, et l'œil ne sait plus laquelle est la sortie.
 *
 * ── POURQUOI LES COULEURS SONT SORTIES DU STYLE EN LIGNE, EN v0.4.0 ──────────
 * Elles y étaient depuis le premier jour, et c'est ce qui rendait tout état impossible :
 * une pseudo-classe posée dans une feuille perd toujours contre un attribut `style`. Le
 * jeton `--action-survol` était déclaré depuis la v0.1.0 et **n'a jamais été employé nulle
 * part**. Aucun test ne pouvait le voir, parce que rien n'était cassé : il ne se passait
 * simplement rien au survol, sur tous les boutons de tous les produits.
 *
 * Le style en ligne garde ce qui dépend des propriétés reçues : la hauteur selon la
 * taille, la largeur pleine, l'opacité d'un bouton inactif. Ce qui en sort, ce sont les
 * couleurs et les états, et rien d'autre.
 *
 * Un consommateur peut toujours passer `style` : il gagne, comme avant. C'est la seule
 * façon de ne rien casser chez les produits qui s'en servaient déjà.
 *
 * ── LA VARIANTE `danger` NE COMPTE PAS DANS LA RÈGLE DU BOUTON PRIMAIRE ──────
 * Une action destructrice et une action d'avancement ne se disputent pas le même regard :
 * l'une est ce qu'on est venu faire, l'autre est ce qu'on veut être sûr de ne pas faire
 * par mégarde. Un écran de suppression porte donc légitimement un `primaire` et un
 * `danger`. Les gardes des produits qui comptent les boutons primaires doivent l'exclure.
 *
 * Elle porte `--texte-sur-erreur` et non `--texte-sur-action` : en mode sombre, `--erreur`
 * vaut un rouge clair, et du blanc dessus tombe à 2,89. Voir la note dans `jetons.css`.
 *
 * ── L'ÉTAT `chargement`, EN v0.5.0 ──────────────────────────────────────────
 * Il estompait le bouton à 60 %, le désactivait, posait `aria-busy`, et rien d'autre. Il
 * disait « ce bouton est indisponible » là où il fallait dire « votre demande est partie ».
 *
 * Il rend désormais trois points animés, et accepte un `libelleChargement` qui remplace le
 * libellé, donc le nom accessible. L'information ne passe JAMAIS par l'animation :
 * `prefers-reduced-motion` la supprime, les points se figent, et le libellé porte tout.
 *
 * ── LA VARIANTE `neutre`, AJOUTÉE EN v0.4.0 ─────────────────────────────────
 * Pour un bouton qui doit être visible sans revendiquer l'action : la connexion par un
 * fournisseur tiers, posée au-dessus du vrai bouton de l'écran. En `secondaire`, elle
 * portait le bleu de l'action dans son trait et dans son texte, et deux boutons pleine
 * largeur cerclés de bleu se disputaient l'œil sur le seul écran où il ne faut pas
 * hésiter.
 *
 * La règle « un seul bouton primaire par vue » vise l'unicité du REGARD, pas la valeur
 * littérale d'un attribut.
 */

export type VarianteBouton = 'primaire' | 'secondaire' | 'neutre' | 'discret' | 'danger';
export type TailleBouton = 'sm' | 'md' | 'lg';

export interface ProprietesBouton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBouton | undefined;
  taille?: TailleBouton | undefined;
  /** Le bouton reste lisible et garde son libellé : la mise en page ne saute pas. */
  chargement?: boolean | undefined;
  /**
   * Le libellé affiché PENDANT le chargement, à la place du libellé normal.
   *
   * Absent, le bouton garde son libellé : c'est le comportement d'avant la v0.5.0, et
   * aucun produit consommateur ne change de rendu.
   *
   * Il nomme l'ACTION, jamais l'attente. « Connexion en cours » et non « Veuillez
   * patienter » : le second ne dit rien que l'estompage ne disait déjà.
   *
   * L'argument historique contre le changement de libellé visait la LARGEUR : un bouton
   * ajusté à son texte change de taille quand le texte change, et la colonne saute. Il
   * reste vrai, et c'est pourquoi cette propriété est optionnelle. Sur un bouton
   * `pleineLargeur`, le texte se recentre sans rien déplacer.
   */
  libelleChargement?: string | undefined;
  /** Occupe toute la largeur disponible. Le registre `CarteAuth` s'en sert. */
  pleineLargeur?: boolean | undefined;
}

const HAUTEURS: Record<TailleBouton, string> = {
  sm: 'calc(var(--hauteur-controle) - 8px)',
  md: 'var(--hauteur-controle)',
  lg: 'calc(var(--hauteur-controle) + 8px)',
};

const TAILLES_TEXTE: Record<TailleBouton, string> = {
  sm: 'var(--taille-sm)',
  md: 'var(--taille-md)',
  lg: 'var(--taille-md)',
};

const ID_STYLE = 'ai5d-bouton';

/**
 * Les couleurs et les états, hors du style en ligne.
 *
 * `:focus-visible` et non `:focus` : un anneau qui apparaît au clic de souris est du
 * bruit, un anneau qui n'apparaît pas au clavier est un mur.
 *
 * L'appui est un déplacement d'un pixel, jamais un changement d'échelle : un `scale` sur
 * un bouton pleine largeur fait bouger toute la colonne, et sur un écran de 440 px cela
 * se voit.
 *
 * Chaque règle de survol est gardée par `:not(:disabled)`. Un bouton en chargement
 * réagirait sinon à la souris tout en refusant le clic, ce qui est la pire des deux
 * réponses possibles.
 */
const STYLE_BOUTON = `
.ai5d-bouton {
  background: transparent;
  color: var(--action);
  border: 1px solid transparent;
  transition:
    background var(--duree-courte) var(--courbe-entree),
    border-color var(--duree-courte) var(--courbe-entree),
    color var(--duree-courte) var(--courbe-entree),
    opacity var(--duree-courte) var(--courbe-entree),
    transform var(--duree-courte) var(--courbe-sortie);
}

.ai5d-bouton[data-variante='primaire'] {
  background: var(--action);
  color: var(--texte-sur-action);
  border-color: var(--action);
}
.ai5d-bouton[data-variante='secondaire'] {
  background: transparent;
  color: var(--action);
  border-color: var(--action);
}
.ai5d-bouton[data-variante='neutre'] {
  background: var(--surface-2);
  color: var(--texte-fort);
  border-color: var(--bordure-forte);
}
.ai5d-bouton[data-variante='danger'] {
  background: var(--erreur);
  color: var(--texte-sur-erreur);
  border-color: var(--erreur);
}

.ai5d-bouton:not(:disabled):hover[data-variante='primaire'] {
  background: var(--action-survol);
  border-color: var(--action-survol);
}
.ai5d-bouton:not(:disabled):hover[data-variante='secondaire'],
.ai5d-bouton:not(:disabled):hover[data-variante='discret'] {
  background: var(--info-fond);
}
.ai5d-bouton:not(:disabled):hover[data-variante='neutre'] {
  background: var(--surface-chaude);
  border-color: var(--texte-faible);
}
.ai5d-bouton:not(:disabled):hover[data-variante='danger'] {
  background: var(--erreur-survol);
  border-color: var(--erreur-survol);
}

.ai5d-bouton:not(:disabled):active { transform: translateY(1px); }

.ai5d-bouton:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }
.ai5d-bouton[data-variante='danger']:focus-visible { outline-color: var(--erreur); }

.ai5d-bouton__points {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.ai5d-bouton__point {
  width: 4px;
  height: 4px;
  border-radius: var(--rayon-plein);
  background: currentColor;
  opacity: 0.35;
  animation: ai5d-bouton-point 1200ms infinite ease-in-out;
}
.ai5d-bouton__point:nth-child(2) { animation-delay: 160ms; }
.ai5d-bouton__point:nth-child(3) { animation-delay: 320ms; }

@keyframes ai5d-bouton-point {
  0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-bouton:not(:disabled):active { transform: none; }
  .ai5d-bouton__point { animation: none; opacity: 1; }
}
`;

/**
 * Trois points, décoratifs.
 *
 * `aria-hidden` : l'information est dans le libellé de chargement et dans `aria-busy`.
 * Un lecteur d'écran qui annoncerait trois points n'apprendrait rien à personne.
 *
 * `currentColor`, jamais un jeton. Le bouton primaire porte `--texte-sur-action`, le
 * `danger` porte `--texte-sur-erreur`, le `neutre` porte `--texte-fort` : trois points
 * figés sur une seule de ces valeurs seraient faux sur deux boutons sur trois.
 */
function PointsDeChargement() {
  return (
    <span className="ai5d-bouton__points" aria-hidden="true">
      <span className="ai5d-bouton__point" />
      <span className="ai5d-bouton__point" />
      <span className="ai5d-bouton__point" />
    </span>
  );
}

export function Bouton({
  variante = 'primaire',
  taille = 'md',
  chargement = false,
  libelleChargement,
  pleineLargeur = false,
  disabled,
  className,
  style,
  children,
  type = 'button',
  ...reste
}: ProprietesBouton) {
  const inactif = disabled === true || chargement;

  const styleBouton: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: HAUTEURS[taille],
    // Le plancher tactile s'applique deja sur --hauteur-controle ; on le rappelle
    // ici pour la taille sm, qui soustrait 8 px.
    minHeight: 'var(--cible-tactile)',
    minWidth: 'var(--cible-tactile)',
    padding: '0 20px',
    width: pleineLargeur ? '100%' : undefined,
    fontFamily: 'var(--police-corps)',
    fontSize: TAILLES_TEXTE[taille],
    fontWeight: 'var(--graisse-semi)',
    lineHeight: 1,
    borderRadius: 'var(--rayon-md)',
    cursor: inactif ? 'not-allowed' : 'pointer',
    opacity: inactif ? 0.6 : 1,
    ...style,
  };

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_BOUTON }} />

      <button
        type={type}
        className={className === undefined ? 'ai5d-bouton' : `ai5d-bouton ${className}`}
        style={styleBouton}
        disabled={inactif}
        aria-busy={chargement || undefined}
        data-variante={variante}
        data-taille={taille}
        {...reste}
      >
        {chargement && libelleChargement !== undefined ? libelleChargement : children}
        {chargement ? <PointsDeChargement /> : null}
      </button>
    </>
  );
}
