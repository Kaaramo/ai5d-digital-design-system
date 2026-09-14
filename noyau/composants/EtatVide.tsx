import type { LucideIcon } from 'lucide-react';
import { Icone } from './Icone';

/**
 * Ce qu on lit devant une liste sans aucune ligne.
 *
 * ── LE DEFAUT QU IL REMPLACE ────────────────────────────────────────────────
 * Six ecrans de la console portaient chacun leur propre phrase grise, et deux d entre eux
 * posaient `style={{ color: 'var(--texte-faible)' }}` en style EN LIGNE, c est-a-dire une
 * decision de presentation ecrite dans une page. Le jour ou la couleur des textes
 * secondaires change, celles-la seraient restees.
 *
 * Le cout n etait pas seulement visuel. Devant « Aucun point de reception declare. » perdu au
 * milieu d une carte, on ne sait pas si c est NORMAL ou si c est une panne. Sur une console
 * d exploitation, cette hesitation coute une demi-heure de recherche d un defaut qui n existe
 * pas.
 *
 * ── TROIS PARTIES, ET CHACUNE REPOND A UNE QUESTION ─────────────────────────
 * Le titre dit CE QUI est vide. La phrase dit si c est normal. La commande, quand elle
 * existe, dit quoi faire. Un etat vide qui ne repond qu a la premiere laisse les deux autres
 * a la charge du lecteur.
 *
 * ── IL A ATTENDU UN DEUXIEME PRODUIT POUR MONTER ────────────────────────────
 * Ne dans la console de Compte, il n est monte dans le systeme qu au sprint 17, quand AI5D
 * Portail en a demande un. Generaliser avant le second usage avait deja produit un
 * `GabaritPortail` de forme fausse, qu il a fallu ne pas employer.
 */
export function EtatVide({
  icone,
  titre,
  phrase,
  commande,
}: {
  icone: LucideIcon;
  titre: string;
  phrase: string;
  /** La ligne de commande, quand elle est la SEULE voie. Sinon, rien. */
  commande?: string;
}) {
  return (
    <div
      className="ai5d-vide"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--espace-3)',
        padding: 'var(--espace-8) var(--espace-4)',
        textAlign: 'center',
      }}
    >
      {/* Sans `titre`, l icone est decorative. Elle illustre ce que la ligne suivante dit
          deja en toutes lettres ; la nommer la ferait lire deux fois. */}
      <Icone nom={icone} taille={24} />

      <p
        style={{
          margin: 0,
          fontSize: 'var(--taille-md)',
          fontWeight: 'var(--graisse-semi)',
          color: 'var(--texte-fort)',
        }}
      >
        {titre}
      </p>

      <p style={{ margin: 0, fontSize: 'var(--taille-sm)', color: 'var(--texte-faible)' }}>
        {phrase}
      </p>

      {commande === undefined ? null : (
        /*
          UN BLOC, ET NON UN `<code>` AU MILIEU D UNE PHRASE.

          La commande des points de reception se selectionne pour etre collee dans un
          terminal. Noyee dans une phrase, elle se selectionne avec les mots qui l entourent,
          et il faut la nettoyer a la main avant de l executer.
        */
        <code
          style={{
            marginTop: 'var(--espace-2)',
            padding: 'var(--espace-2) var(--espace-3)',
            background: 'var(--surface-1)',
            border: '1px solid var(--bordure)',
            borderRadius: 'var(--rayon-md)',
            fontFamily: 'var(--police-mono)',
            fontSize: 'var(--taille-sm)',
            color: 'var(--texte)',
          }}
        >
          {commande}
        </code>
      )}
    </div>
  );
}
