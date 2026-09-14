'use client';

import { useState } from 'react';
import { Bouton } from './Bouton';
import { Champ } from './Champ';
import { ID_STYLE_BOITE, STYLE_BOITE, useDialogueModal } from './dialogue';

/**
 * La saisie d'un motif obligatoire, avant un geste d'exploitation.
 *
 * ── CE N EST PAS `BoiteConfirmation`, ET LES DEUX DOIVENT COEXISTER ─────────
 * La confirmation demande « êtes-vous sûr ». Le motif demande « pourquoi ».
 *
 * La première protège du geste accidentel : on la lit une fois, on clique, elle a fait son travail.
 * Le second produit une TRACE, relue des mois plus tard par quelqu'un qui n'était pas là. Les
 * fondre ferait une boîte dont on cliquerait le bouton sans lire, et le motif deviendrait « ok » en
 * trois semaines.
 *
 * ── ELLE EST UN `<dialog>` NATIF ────────────────────────────────────────────
 * Voir `dialogue.ts`. Échap ferme sans agir, et le motif saisi est perdu sans question : on n'ouvre
 * pas une seconde boîte pour confirmer l'abandon de la première.
 *
 * ── LE BOUTON EST ABSENT TANT QUE LE MOTIF MANQUE, JAMAIS GRISÉ ─────────────
 * Un bouton grisé se lit comme un refus du système, alors qu'il n'attend qu'une phrase. Le voir
 * APPARAÎTRE dit la condition sans avoir à l'écrire.
 *
 * ── LA CONSÉQUENCE EST ANNONCÉE, PAS SUGGÉRÉE ───────────────────────────────
 * `consequence` nomme ce qui va se produire, avec ses chiffres : « ses 3 sessions ouvertes seront
 * fermées immédiatement ». On nomme la conséquence.
 *
 * Les propriétés publiques et les bornes du motif sont celles de Compte, inchangées.
 */
export function BoiteMotif({
  phrase,
  consequence,
  libelleChamp,
  action,
  longueurMinimale,
  variante = 'danger',
  enCours,
  onAnnuler,
  onValider,
}: {
  phrase: string;
  consequence: string;
  libelleChamp: string;
  action: string;
  /** La longueur minimale du motif, fixée par le produit selon la gravité du geste. */
  longueurMinimale: number;
  variante?: 'danger' | 'primaire';
  enCours: boolean;
  onAnnuler: () => void;
  onValider: (motif: string) => void;
}) {
  const [motif, setMotif] = useState('');
  const suffisant = motif.trim().length >= longueurMinimale;
  const reference = useDialogueModal('input');

  return (
    <>
      <style id={ID_STYLE_BOITE} dangerouslySetInnerHTML={{ __html: STYLE_BOITE }} />

      <dialog
        ref={reference}
        className="ai5d-boite"
        role="alertdialog"
        aria-label={action}
        style={{ maxWidth: '480px' }}
        onCancel={(evenement) => {
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

        <p
          style={{
            margin: 'var(--espace-3) 0 0',
            fontFamily: 'var(--police-corps)',
            fontSize: 'var(--taille-sm)',
            lineHeight: 'var(--interligne-corps)',
            color: 'var(--texte-faible)',
          }}
        >
          {consequence}
        </p>

        <div style={{ marginTop: 'var(--espace-6)' }}>
          <Champ
            libelle={libelleChamp}
            value={motif}
            onChange={(evenement) => setMotif(evenement.target.value)}
            autoComplete="off"
            aide={`${longueurMinimale} caractères au minimum. Le motif est consigné dans le journal.`}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--espace-3)',
            marginTop: 'var(--espace-6)',
          }}
        >
          <Bouton variante="discret" onClick={onAnnuler}>
            Annuler
          </Bouton>

          {/*
            LE BOUTON N EXISTE PAS TANT QUE LE MOTIF EST TROP COURT.

            Il n est pas rendu puis desactive : il est ABSENT du document. `disabled` n apparait ici
            que pendant l ecriture en cours, un etat temporaire de la page et non un droit.
          */}
          {suffisant ? (
            <Bouton
              variante={variante}
              chargement={enCours}
              onClick={() => onValider(motif.trim())}
            >
              {action}
            </Bouton>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
