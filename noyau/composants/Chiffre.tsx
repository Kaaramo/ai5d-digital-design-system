import { Carte } from './Carte';
import { feuille } from './feuille';
import type { ComposantLien } from './LiensRail';

/**
 * Un chiffre d exploitation, avec son libelle et sa cible quand le produit en fixe une.
 *
 * ── AUCUN GRAPHIQUE, ET C EST UN CHOIX ──────────────────────────────────────
 * Une courbe demande une serie, une serie demande une historisation, et une historisation
 * demande une table qu il faudrait purger. Pour sept chiffres qu une personne regarde une
 * fois par semaine, c est une infrastructure entiere pour un usage que rien ne reclame.
 *
 * Un chiffre nu se lit en une seconde, et la question qu il pose - « est-ce que ca monte » -
 * se repond en le comparant a la cible ecrite a cote, pas a une pente.
 *
 * ── LA CIBLE VIENT D UN DOCUMENT, PAS D UNE INTUITION ───────────────────────
 * Quand elle est absente, le chiffre est un simple constat. Quand elle est la, le produit la
 * recopie du document qui la fixe, avec sa reference : c est ce qui permet de discuter le
 * chiffre sans discuter la cible.
 *
 * ── LA FORME COMPACTE, EN v1.3.0 ────────────────────────────────────────────
 * Une ligne et non une tuile : la valeur et le libelle se lisent comme une phrase, « 212
 * inscriptions sur 237 personnes ». Avec `href`, l indicateur entier mene a la liste qu il compte :
 * libelle en bleu d action, souligne au survol ; sans lien, ni l un ni l autre, il ne promet pas un
 * deplacement. Les chiffres sont tabulaires. La valeur est en Fraunces : c est le systeme qui
 * l ecrit, et non un produit.
 */

/** La tuile de la 1.2.0, inchangee. */
interface ProprietesChiffreCarte {
  valeur: string;
  libelle: string;
  /** Recopiee du document du produit quand il en fixe une. Absente sinon. */
  cible?: string;
  /** Le chiffre qui porte l ecran. Un seul par page, sinon plus rien ne ressort. */
  mise?: boolean;
  compact?: false | undefined;
  href?: undefined;
  Lien?: undefined;
}

/** Une ligne : la valeur et le libelle se lisent comme une phrase, sans carte. */
interface ProprietesChiffreCompact {
  valeur: string;
  libelle: string;
  compact: true;
  /** Present : l indicateur entier est un lien vers la liste qu il compte. */
  href?: string | undefined;
  /** Le lien du routeur du produit ; `a` par defaut. */
  Lien?: ComposantLien | undefined;
  cible?: undefined;
  mise?: undefined;
}

export type ProprietesChiffre = ProprietesChiffreCarte | ProprietesChiffreCompact;

const ID_STYLE = 'ai5d-chiffre';

/*
  Le survol souligne le libelle et rien d autre : un changement de fond ferait d une phrase un
  bouton. Seul un indicateur qui porte une adresse reagit.
*/
export const STYLE_CHIFFRE = `
.ai5d-chiffre[data-compact] {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--espace-2);
  border-radius: var(--rayon-sm);
  color: inherit;
  text-decoration: none;
}
.ai5d-chiffre__valeur {
  font-family: var(--police-titre);
  font-weight: var(--graisse-normale);
  font-size: var(--taille-lg);
  line-height: var(--interligne-titre);
  color: var(--texte-fort);
  font-variant-numeric: tabular-nums;
}
.ai5d-chiffre__libelle {
  font-family: var(--police-corps);
  font-size: var(--taille-sm);
  color: var(--texte);
  font-variant-numeric: tabular-nums;
}
.ai5d-chiffre[href] .ai5d-chiffre__libelle { color: var(--action); }
@media (hover: hover) {
  .ai5d-chiffre[href]:hover .ai5d-chiffre__libelle {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
}
.ai5d-chiffre[href]:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }
.ai5d-chiffre[href]:active { background: var(--surface-selection); transition: none; }
`;

function ChiffreCompact({ valeur, libelle, href, Lien }: ProprietesChiffreCompact) {
  const contenu = (
    <>
      {/* L'espace se lit au copier-coller et dans la recherche ; en flex, elle n'est pas rendue. */}
      <span className="ai5d-chiffre__valeur">{valeur}</span>{' '}
      <span className="ai5d-chiffre__libelle">{libelle}</span>
    </>
  );

  return (
    <>
      {feuille(ID_STYLE, STYLE_CHIFFRE)}
      {href === undefined ? (
        <span className="ai5d-chiffre" data-compact="">
          {contenu}
        </span>
      ) : Lien === undefined ? (
        <a className="ai5d-chiffre" data-compact="" href={href}>
          {contenu}
        </a>
      ) : (
        <Lien className="ai5d-chiffre" data-compact="" href={href}>
          {contenu}
        </Lien>
      )}
    </>
  );
}

export function Chiffre(proprietes: ProprietesChiffre) {
  if (proprietes.compact === true) return <ChiffreCompact {...proprietes} />;

  const { valeur, libelle, cible, mise } = proprietes;
  return (
    <Carte>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espace-1)' }}>
        <span
          style={{
            fontFamily: 'var(--police-titre)',
            fontSize: mise === true ? 'var(--taille-2xl)' : 'var(--taille-xl)',
            color: mise === true ? 'var(--action)' : 'var(--texte-fort)',
            lineHeight: 'var(--interligne-titre)',
          }}
        >
          {valeur}
        </span>

        <span style={{ color: 'var(--texte-fort)' }}>{libelle}</span>

        {cible === undefined ? null : (
          <span style={{ color: 'var(--texte-faible)', fontSize: 'var(--taille-xs)' }}>
            {cible}
          </span>
        )}
      </div>
    </Carte>
  );
}
