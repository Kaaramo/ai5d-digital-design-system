import type { LucideIcon } from 'lucide-react';
import { Icone } from './Icone';

/**
 * L en-tete d une rubrique du portail : une icone encadree, un titre, une phrase
 * d intention, un filet.
 *
 * Deux niveaux de texte ici, la ou un en-tete d ecran d authentification en porte trois. La
 * difference n est pas une inattention : sur un ecran d entree, le surtitre dit ou l on est a
 * quelqu un qui vient d arriver et ne connait pas la maison. Dans une coquille a rail, le
 * logotype coiffe le rail et la rubrique y est surlignee : un troisieme rappel serait du bruit.
 *
 * La phrase d intention dit a quoi sert la rubrique, en une phrase, jamais deux. Elle
 * remplace la ligne d aide que chaque carte porterait sinon.
 *
 * ── LE CADRE DE L ICONE EST NEUTRE, JAMAIS TEINTE PAR RUBRIQUE ──────────────
 * La reference qui a inspire cette disposition pose un disque bleu clair sur Profil et un
 * disque rose sur Securite. Le systeme de design n a pas de jeton de couleur par rubrique,
 * et employer les tons SEMANTIQUES pour cela serait une faute : `--erreur-fond` derriere
 * l icone de Securite poserait un signal d alerte permanent sur une page dont le travail est
 * justement de dire que tout va bien.
 *
 * Le cadre est donc celui d `EnteteCarte`, deja mesure : `--surface-1` est le seul jeton de
 * surface dont l ecart de clarte avec `--surface-2` n est nul dans AUCUN des deux themes, et
 * c est le filet `--bordure` qui porte la separation.
 *
 * ── LE FILET DETACHE L EN-TETE DE CE QUI SUIT ───────────────────────────────
 * Sans lui, les onglets qui viennent juste dessous se lisent comme une troisieme ligne du
 * titre. Il est ici et non dans les onglets : c est l en-tete qui se termine.
 *
 * ── IL RESTE UN COMPOSANT SERVEUR ───────────────────────────────────────────
 * Il RECOIT une icone Lucide et la rend lui-meme. Une icone est un composant React, donc une
 * fonction, et React refuse qu une fonction passe d un composant serveur a un composant
 * client : la passer plus loin ferait rendre 500 a la rubrique entiere.
 *
 * ── LE RETRAIT DE L INTENTION SUIT LE CADRE ─────────────────────────────────
 * Dans Compte, il s ecrivait `calc(40px + var(--espace-4))` : la taille du cadre, recopiee. Le
 * jour ou le cadre change, l intention se decale sans que rien ne le signale. Il se calcule
 * desormais a partir de la meme constante que le cadre, et la garde d espacement du systeme n y
 * voit plus de litteral.
 */

/** Le cote du cadre de l icone. Le retrait de l intention en depend. */
export const TAILLE_CADRE_RUBRIQUE = 40;
export function EnteteRubrique({
  icone,
  titre,
  intention,
}: {
  icone: LucideIcon;
  titre: string;
  intention: string;
}) {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--espace-2)',
        paddingBottom: 'var(--espace-6)',
        borderBottom: '1px solid var(--bordure)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--espace-4)' }}>
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${TAILLE_CADRE_RUBRIQUE}px`,
            height: `${TAILLE_CADRE_RUBRIQUE}px`,
            borderRadius: 'var(--rayon-md)',
            background: 'var(--surface-1)',
            border: '1px solid var(--bordure)',
            color: 'var(--texte-fort)',
          }}
        >
          <Icone nom={icone} taille={20} />
        </span>

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--police-titre)',
            fontSize: 'var(--taille-2xl)',
            fontWeight: 'var(--graisse-normale)',
            lineHeight: 'var(--interligne-titre)',
            color: 'var(--texte-fort)',
          }}
        >
          {titre}
        </h1>
      </div>

      {/*
        L intention est alignee sur le TITRE, et non sur l icone : le cadre plus l ecart qui le
        separe du titre. Sans ce retrait, la phrase commencerait sous l icone et le bloc n aurait
        plus de bord gauche.
      */}
      <p
        style={{
          margin: 0,
          marginLeft: `calc(${TAILLE_CADRE_RUBRIQUE}px + var(--espace-4))`,
          fontFamily: 'var(--police-corps)',
          fontSize: 'var(--taille-sm)',
          lineHeight: 'var(--interligne-corps)',
          color: 'var(--texte-faible)',
        }}
      >
        {intention}
      </p>
    </header>
  );
}
