'use client';

import { useEffect, useState } from 'react';

/**
 * Un temps relatif en francais, calcule AU CLIENT.
 *
 * ── POURQUOI PAS AU SERVEUR ─────────────────────────────────────────────────
 * Calcule au serveur, il gele : une page rendue a quatorze heures afficherait
 * « IL Y A 2 MINUTES » a quinze heures, et la personne lirait une information fausse sans
 * moyen de le savoir.
 *
 * ── POURQUOI LE HTML PORTE LA DATE ABSOLUE ──────────────────────────────────
 * Le premier rendu ecrit la date absolue dans un `<time dateTime>`, et le client la
 * remplace apres montage. Cela evite l ecart d hydratation entre le fuseau du serveur et
 * celui du navigateur, et laisse une information juste a qui n a pas de JavaScript.
 *
 * ── LES CAPITALES VIENNENT DU CSS ───────────────────────────────────────────
 * `text-transform` et non `toUpperCase()`. Le resultat visuel est le meme, mais un
 * lecteur d ecran epellerait des capitales reelles lettre par lettre.
 *
 * ── LE LETTRAGE EST CELUI DU SYSTEME ────────────────────────────────────────
 * Il s ecrivait `0.08em` dans Compte, un litteral voisin de `--lettrage-overline` (0,06 em) sans
 * etre lui. Deux capitales espacees differemment sur un meme ecran se voient. Il prend le jeton :
 * c est l une des trois differences voulues de la migration.
 */

const FORMAT = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

const PALIERS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** L unite la plus grande sous le seuil. « Il y a 2 heures », jamais « il y a 120 minutes ». */
export function formaterTempsRelatif(quand: Date, maintenant: Date): string {
  const secondes = Math.round((quand.getTime() - maintenant.getTime()) / 1000);
  const absolu = Math.abs(secondes);

  for (const [unite, taille] of PALIERS) {
    if (absolu >= taille) return FORMAT.format(Math.round(secondes / taille), unite);
  }

  return FORMAT.format(Math.round(secondes), 'second');
}

export function TempsRelatif({ quand }: { quand: Date }) {
  const [relatif, setRelatif] = useState<string | null>(null);

  useEffect(() => {
    setRelatif(formaterTempsRelatif(quand, new Date()));
  }, [quand]);

  return (
    <time
      dateTime={quand.toISOString()}
      style={{
        fontFamily: 'var(--police-corps)',
        fontSize: 'var(--taille-xs)',
        letterSpacing: 'var(--lettrage-overline)',
        textTransform: 'uppercase',
        color: 'var(--texte-faible)',
        whiteSpace: 'nowrap',
      }}
    >
      {relatif ?? quand.toLocaleDateString('fr-FR', { dateStyle: 'long' })}
    </time>
  );
}
