import type { ReactNode } from 'react';
import { Pastille, type TonSemantique } from './Pastille';

/**
 * Une pastille d etat, precedee d un point.
 *
 * ── POURQUOI UN POINT EN PLUS ───────────────────────────────────────────────
 * La `Pastille` du systeme sert a deux choses differentes : etiqueter une categorie
 * (« Bêta », « Nouveau ») et dire un ETAT courant (« Active », « Inactive »). Les deux
 * ont la meme forme, et sur l ecran de securite la seconde se lisait comme la premiere :
 * un badge decoratif a cote d un titre, plutot que la reponse a « est-ce que ma
 * protection est en marche ».
 *
 * Le point est la convention etablie du statut, celle des tableaux de bord et des pages
 * d etat de service. Il ne remplace pas le mot, il le prefixe.
 *
 * ── LE MOT RESTE, TOUJOURS ──────────────────────────────────────────────────
 * Pres d un homme sur douze ne distingue pas correctement le rouge du vert. Une
 * information portee par la seule couleur ne lui parvient pas, et un point seul est
 * exactement cela. Le point est un renfort, jamais le message.
 *
 * ── `currentColor` ET NON UNE COULEUR CHOISIE ICI ───────────────────────────
 * La pastille pose deja la couleur de son ton sur son texte. Le point l herite, ce qui
 * garantit qu il ne pourra jamais diverger d elle : ajouter un ton au systeme le colore
 * sans toucher a ce fichier.
 */
export function PastilleEtat({ ton, children }: { ton: TonSemantique; children: ReactNode }) {
  return (
    <Pastille ton={ton} style={{ gap: 'var(--espace-2)' }}>
      <span
        aria-hidden="true"
        style={{
          width: '6px',
          height: '6px',
          borderRadius: 'var(--rayon-plein)',
          background: 'currentColor',
        }}
      />
      {children}
    </Pastille>
  );
}
