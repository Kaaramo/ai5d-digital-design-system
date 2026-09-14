'use client';

import type { ReactNode } from 'react';
import { Bouton } from './Bouton';
import { ID_STYLE_BOITE, STYLE_BOITE, useDialogueModal } from './dialogue';

/**
 * La boîte de confirmation d'une action grave.
 *
 * ── ELLE EST UN `<dialog>` NATIF ────────────────────────────────────────────
 * Voir `dialogue.ts`. Elle était une `div` dans Compte, qu'on traversait à la tabulation et
 * qu'Échap ne fermait pas ; elle ne pouvait pas monter dans le système tant qu'elle ne garantissait
 * pas ce qu'un dialogue promet. Le document derrière elle est inerte, Échap annule, le focus revient
 * à l'élément qui l'a ouverte.
 *
 * ── `role="alertdialog"` ET NON `dialog` ────────────────────────────────────
 * Elle interrompt pour une action irréversible, et un lecteur d'écran doit l'annoncer sans attendre.
 *
 * ── LE FOCUS VA SUR « ANNULER », JAMAIS SUR L ACTION ────────────────────────
 * Un Entrée tapé par réflexe, dans la seconde qui suit l'ouverture, ne doit pas supprimer quoi que
 * ce soit.
 *
 * ── UN CLIC HORS DE LA BOÎTE NE LA FERME PAS ────────────────────────────────
 * Une action grave ne s'annule pas par accident, et ne se valide pas davantage. L'élément natif ne
 * ferme pas au clic sur le voile, et rien ici ne l'y invite.
 *
 * Les propriétés publiques sont celles de Compte, inchangées.
 */
export function BoiteConfirmation({
  phrase,
  action,
  variante = 'danger',
  enCours,
  onAnnuler,
  onConfirmer,
  children,
}: {
  phrase: string;
  action: string;
  /** `danger` par défaut. `primaire` pour une action grave mais non destructrice. */
  variante?: 'danger' | 'primaire';
  enCours: boolean;
  onAnnuler: () => void;
  onConfirmer: () => void;
  /** Un champ de saisie ou un sélecteur, quand la confirmation demande un choix. */
  children?: ReactNode;
}) {
  const reference = useDialogueModal('[data-boite="annuler"]');

  return (
    <>
      <style id={ID_STYLE_BOITE} dangerouslySetInnerHTML={{ __html: STYLE_BOITE }} />

      <dialog
        ref={reference}
        className="ai5d-boite"
        role="alertdialog"
        aria-label={action}
        style={{ maxWidth: '420px' }}
        onCancel={(evenement) => {
          // Échap émet `cancel` : on ferme sans agir. C'est le produit qui démonte la boîte.
          evenement.preventDefault();
          onAnnuler();
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--police-corps)',
            fontSize: 'var(--taille-md)',
            lineHeight: 'var(--interligne-corps)',
            color: 'var(--texte-fort)',
          }}
        >
          {phrase}
        </p>

        {children === undefined ? null : (
          <div style={{ marginTop: 'var(--espace-4)' }}>{children}</div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--espace-3)',
            marginTop: 'var(--espace-6)',
          }}
        >
          <Bouton variante="discret" onClick={onAnnuler} data-boite="annuler">
            Annuler
          </Bouton>
          <Bouton
            variante={variante}
            chargement={enCours}
            onClick={onConfirmer}
            data-boite="action"
          >
            {action}
          </Bouton>
        </div>
      </dialog>
    </>
  );
}
