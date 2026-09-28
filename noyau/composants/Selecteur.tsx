'use client';

/*
  `useId` est un crochet : la directive est obligatoire, comme pour `Champ` (tests/index.test.ts).
*/
import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ID_STYLE_CHAMP, STYLE_CHAMP } from './Champ';
import { feuille } from './feuille';

/**
 * Le menu déroulant du système, sur un `<select>` NATIF, jamais un menu dessiné.
 *
 * ── POURQUOI IL MONTE, EN v1.3.0 ────────────────────────────────────────────
 * Compte en écrit un (`apps/compte/components/Selecteur.tsx:19-35`, relu le 28 septembre 2026), rendu
 * sept fois ; le Portail en écrit un autre (`components/champs/Selecteur.tsx`). Deux produits, deux
 * copies qui divergeaient déjà : décision 012. L'API est celle du Portail, élargie de ce que Compte
 * emploie : `libelleMasque` pour une ligne de membre, `invite` avant le premier choix.
 *
 * ── UN SELECT NATIF ─────────────────────────────────────────────────────────
 * Le clavier, le lecteur d'écran et la liste plein écran d'un téléphone viennent avec lui.
 *
 * ── IL RÉAGIT COMME `Champ` ─────────────────────────────────────────────────
 * Même classe, même feuille (une seule, sous la même clé), mêmes états : un `<select>` posé sous un
 * `<input>` a la même bordure, le même survol et le même anneau. L'ossature d'accessibilité est celle
 * de `Champ` : libellé lié, `aria-describedby` vers l'erreur puis l'aide, erreur en `role="alert"`
 * sous le contrôle ; l'aide disparaît quand une erreur s'affiche, et n'est alors plus citée.
 */

export interface OptionSelecteur {
  valeur: string;
  libelle: string;
  /** Les options d'un même groupe se suivent dans un `<optgroup>`, dans l'ordre de leur premier. */
  groupe?: string | undefined;
}

export interface ProprietesSelecteur {
  libelle: string;
  valeur: string;
  onChange: (valeur: string) => void;
  options: readonly OptionSelecteur[];
  nom: string;
  aide?: ReactNode | undefined;
  erreur?: string | undefined;
  obligatoire?: boolean | undefined;
  id?: string | undefined;
  desactive?: boolean | undefined;
  /** Masqué à l'œil, jamais absent de l'arbre d'accessibilité (Compte, ligne de membre). */
  libelleMasque?: boolean | undefined;
  /** Première option vide, non choisissable une fois une valeur posée (Compte). */
  invite?: string | undefined;
}

/** Le texte hors écran, sans la classe : le libellé masqué reste lu, et la feuille de `Champ` suffit. */
const LIBELLE_MASQUE: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
};

const LIBELLE: CSSProperties = {
  fontFamily: 'var(--police-corps)',
  fontSize: 'var(--taille-sm)',
  fontWeight: 'var(--graisse-moyenne)',
  color: 'var(--texte)',
};

const MESSAGE: CSSProperties = { fontFamily: 'var(--police-corps)', fontSize: 'var(--taille-sm)' };

export function Selecteur({
  libelle,
  valeur,
  onChange,
  options,
  nom,
  aide,
  erreur,
  obligatoire = false,
  id,
  desactive = false,
  libelleMasque = false,
  invite,
}: ProprietesSelecteur) {
  const engendre = useId();
  const identifiant = id ?? `selecteur-${engendre}`;
  const idErreur = `${identifiant}-erreur`;
  const idAide = `${identifiant}-aide`;
  const enErreur = erreur !== undefined && erreur !== '';
  const avecAide = aide !== undefined && aide !== null && aide !== '' && !enErreur;
  const decritPar = [enErreur ? idErreur : null, avecAide ? idAide : null]
    .filter((partie): partie is string => partie !== null)
    .join(' ');

  const sansGroupe = options.filter((option) => option.groupe === undefined);
  const groupes = new Map<string, OptionSelecteur[]>();
  for (const option of options) {
    if (option.groupe === undefined) continue;
    groupes.set(option.groupe, [...(groupes.get(option.groupe) ?? []), option]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espace-2)' }}>
      {feuille(ID_STYLE_CHAMP, STYLE_CHAMP)}

      <label htmlFor={identifiant} style={libelleMasque ? LIBELLE_MASQUE : LIBELLE}>
        {libelle}
      </label>

      <select
        id={identifiant}
        name={nom}
        className="ai5d-champ__entree"
        value={valeur}
        disabled={desactive}
        onChange={(evenement) => onChange(evenement.target.value)}
        aria-invalid={enErreur || undefined}
        aria-required={obligatoire || undefined}
        aria-describedby={decritPar === '' ? undefined : decritPar}
        style={{
          width: '100%',
          height: 'var(--hauteur-controle)',
          minHeight: 'var(--cible-tactile)',
          paddingInline: 'var(--espace-4)',
          fontFamily: 'var(--police-corps)',
          fontSize: 'var(--taille-md)',
          borderRadius: 'var(--rayon-md)',
          // L'estompage du Portail, en ligne : la feuille de `Champ` ne connaît pas l'état désactivé,
          // et l'y ajouter changerait le rendu de tous les champs.
          opacity: desactive ? 0.6 : undefined,
          cursor: desactive ? 'not-allowed' : undefined,
        }}
      >
        {invite === undefined ? null : (
          <option value="" disabled>
            {invite}
          </option>
        )}
        {sansGroupe.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
        {[...groupes].map(([groupe, liste]) => (
          <optgroup key={groupe} label={groupe}>
            {liste.map((option) => (
              <option key={option.valeur} value={option.valeur}>
                {option.libelle}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {enErreur ? (
        <span id={idErreur} role="alert" style={{ ...MESSAGE, color: 'var(--erreur)' }}>
          {erreur}
        </span>
      ) : null}
      {avecAide ? (
        <span id={idAide} style={{ ...MESSAGE, color: 'var(--texte-faible)' }}>
          {aide}
        </span>
      ) : null}
    </div>
  );
}
