'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Check, Copy } from 'lucide-react';
import { Bouton } from './Bouton';
import { Champ } from './Champ';
import { DUREE_SUCCES_COPIE_MS } from './copie';
import { Icone } from './Icone';
import { CLASSE_HORS_ECRAN, ID_STYLE_HORS_ECRAN, STYLE_HORS_ECRAN } from './lien';

/**
 * Une valeur qui se copie d'un geste, ou se sélectionne quand la copie échoue.
 *
 * ── L'ÉCHEC N'EST JAMAIS AVALÉ ──────────────────────────────────────────────
 * C'est le défaut que Compte a payé : `writeText(…).catch(() => undefined)` laissait croire une clé
 * copiée. Ici, si la promesse est rejetée, ou si le presse-papiers manque (page non sécurisée,
 * navigateur intégré d'une application), le champ prend le focus, toute la valeur est sélectionnée, et
 * `messageEchec` s'affiche et s'annonce. Il est obligatoire parce qu'il nomme ce qu'il faut
 * sélectionner, « l'adresse », « la clé », ce qu'une phrase générique ne peut pas.
 *
 * ── LE SUCCÈS SE DIT DEUX SECONDES ──────────────────────────────────────────
 * `libelleSucces` et une coche pendant `DUREE_SUCCES_COPIE_MS`, puis le repos ; un second clic relance
 * la minuterie, nettoyée au démontage. L'annonce est polie, jamais une alerte : une copie n'interrompt
 * personne.
 *
 * ── LA VALEUR À 16 PX ───────────────────────────────────────────────────────
 * En chasse fixe par défaut, mais à `--taille-md` : sous 16 px, un téléphone iOS agrandit la page au
 * focus du champ.
 *
 * Presse-papiers en écriture seulement, sur un geste de la personne ; aucune lecture.
 */

export interface ProprietesValeurCopiable {
  /** La valeur, affichée en clair dans un champ en lecture seule. */
  valeur: string;
  /** Le libellé du champ. */
  libelle: string;
  /** Ce qu'on lit quand la copie échoue : il nomme le geste manuel. Obligatoire. */
  messageEchec: string;
  /** « Copier » par défaut. */
  libelleBouton?: string | undefined;
  /** « Copié » par défaut ; affiché pendant `DUREE_SUCCES_COPIE_MS`. */
  libelleSucces?: string | undefined;
  /** La valeur en JetBrains Mono. Vrai par défaut. */
  mono?: boolean | undefined;
}

type EtatCopie = 'repos' | 'succes' | 'echec';

const ID_STYLE = 'ai5d-valeur-copiable';

export const STYLE_COPIABLE = `
.ai5d-copiable { container-type: inline-size; display: flex; flex-direction: column; gap: var(--espace-2); }
.ai5d-copiable__rangee { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--espace-2); }
.ai5d-copiable__champ { flex: 1 1 16rem; min-width: 0; }
.ai5d-copiable__echec {
  margin: 0;
  font-family: var(--police-corps); font-size: var(--taille-sm);
  font-weight: var(--graisse-normale); color: var(--texte-faible);
}
@container (max-width: 24rem) {
  .ai5d-copiable__rangee { flex-direction: column; align-items: stretch; }
  .ai5d-copiable__rangee .ai5d-bouton { width: 100%; }
}
`;

/** La valeur en chasse fixe. Absente, le champ garde sa police : on ne la remplace pas par rien. */
const STYLE_VALEUR_MONO: CSSProperties = {
  fontFamily: 'var(--police-mono)',
  fontWeight: 'var(--graisse-moyenne)',
  fontSize: 'var(--taille-md)',
};

export function ValeurCopiable({
  valeur,
  libelle,
  messageEchec,
  libelleBouton = 'Copier',
  libelleSucces = 'Copié',
  mono = true,
}: ProprietesValeurCopiable) {
  const identifiant = `valeur-copiable-${useId()}`;
  const [etat, setEtat] = useState<EtatCopie>('repos');
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (minuterie.current !== null) clearTimeout(minuterie.current);
    },
    [],
  );

  function arreterMinuterie(): void {
    if (minuterie.current === null) return;
    clearTimeout(minuterie.current);
    minuterie.current = null;
  }

  function echouer(): void {
    setEtat('echec');
    const champ = document.getElementById(identifiant);
    if (!(champ instanceof HTMLInputElement)) return;
    champ.focus();
    champ.select();
  }

  async function copier(): Promise<void> {
    arreterMinuterie();
    const pressePapiers = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
    if (pressePapiers === undefined) {
      echouer();
      return;
    }
    try {
      await pressePapiers.writeText(valeur);
    } catch {
      echouer();
      return;
    }
    setEtat('succes');
    minuterie.current = setTimeout(() => {
      minuterie.current = null;
      setEtat('repos');
    }, DUREE_SUCCES_COPIE_MS);
  }

  const succes = etat === 'succes';

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_COPIABLE }} />
      <style id={ID_STYLE_HORS_ECRAN} dangerouslySetInnerHTML={{ __html: STYLE_HORS_ECRAN }} />

      <div className="ai5d-copiable">
        <div className="ai5d-copiable__rangee">
          <Champ
            id={identifiant}
            libelle={libelle}
            value={valeur}
            readOnly
            spellCheck={false}
            autoComplete="off"
            onFocus={(evenement) => evenement.currentTarget.select()}
            className="ai5d-copiable__champ"
            style={mono ? STYLE_VALEUR_MONO : undefined}
          />
          <Bouton variante="neutre" onClick={() => void copier()}>
            <Icone nom={succes ? Check : Copy} taille={16} />
            {succes ? libelleSucces : libelleBouton}
          </Bouton>
        </div>

        <div className="ai5d-copiable__annonce" aria-live="polite">
          {succes ? <span className={CLASSE_HORS_ECRAN}>{libelleSucces}</span> : null}
          {etat === 'echec' ? <p className="ai5d-copiable__echec">{messageEchec}</p> : null}
        </div>
      </div>
    </>
  );
}
