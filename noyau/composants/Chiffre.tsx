import { Carte } from './Carte';

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
 */
export function Chiffre({
  valeur,
  libelle,
  cible,
  mise,
}: {
  valeur: string;
  libelle: string;
  /** Recopiee du document du produit quand il en fixe une. Absente sinon. */
  cible?: string;
  /** Le chiffre qui porte l ecran. Un seul par page, sinon plus rien ne ressort. */
  mise?: boolean;
}) {
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
