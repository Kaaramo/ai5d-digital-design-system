import { useState, type CSSProperties } from 'react';

/**
 * La représentation d'une personne : sa photo, ou ses initiales.
 *
 * ── UN SEUL COMPOSANT POUR DEUX ÉTATS ───────────────────────────────────────
 * Le portail Compte portait un `DisqueInitiales` qui ne savait faire que les initiales, et
 * la photo aurait demandé un second composant. Deux composants pour un même objet divergent
 * à la première correction : l'un prend un liseré, l'autre non, et personne ne le voit avant
 * de les mettre côte à côte. Ils sont ici les deux états d'une seule chose.
 *
 * ── UNE PHOTO CASSÉE RETOMBE SUR LES INITIALES ──────────────────────────────
 * Par `onError`, et non par un carré gris. Une URL peut mourir de plusieurs façons : objet
 * supprimé, domaine de médias en panne, réseau d'entreprise qui filtre les images
 * distantes. Le repli garde un visage lisible là où l'absence laisserait un trou à la place
 * de quelqu'un.
 *
 * ── IL EST DÉCORATIF, TOUJOURS ──────────────────────────────────────────────
 * `aria-hidden`, et un `alt` vide sur l'image. Le nom complet est toujours à côté, en
 * toutes lettres, dans un champ ou dans un libellé : c'est la disposition établie partout
 * où cet objet apparaît. Le faire annoncer ferait entendre deux fois la même chose.
 *
 * ── LA TAILLE EST UN NOMBRE LIBRE, ET C'EST VOULU ───────────────────────────
 * `Icone` contraint ses cinq tailles parce qu'une icône mal dimensionnée casse un rythme
 * typographique. Un avatar, lui, se cale sur ce qui l'entoure : 32 px dans un en-tête,
 * 40 px dans une ligne de liste, 96 px dans une carte de profil. Contraindre la liste
 * obligerait à la rouvrir à chaque nouvel emploi.
 */

export interface ProprietesAvatar {
  /** Le nom complet. Il sert à composer les initiales. */
  nom: string;
  /** L'URL de la photo. Absente, nulle ou vide, ce sont les initiales. */
  image?: string | null | undefined;
  /** Le diamètre, en pixels. */
  taille?: number | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/**
 * Deux lettres au plus, prises sur les deux premiers mots du nom.
 *
 * Un nom vide rend un point d'interrogation plutôt qu'un disque vide : un disque sans rien
 * dedans se lit comme un défaut de chargement, et fait chercher une panne qui n'existe pas.
 *
 * Les deux PREMIERS mots, jamais le premier et le dernier. « Marie Claire Dupont » donne
 * « MC » et non « MD » : c'est le prénom composé qui est le nom d'usage, et l'inverse
 * afficherait des initiales que personne ne reconnaît comme les siennes.
 */
export function initiales(nom: string): string {
  const mots = nom
    .trim()
    .split(/\s+/)
    .filter((mot) => mot.length > 0);

  if (mots.length === 0) return '?';

  return mots
    .slice(0, 2)
    .map((mot) => mot[0] ?? '')
    .join('')
    .toUpperCase();
}

export function Avatar({ nom, image, taille = 40, className, style }: ProprietesAvatar) {
  const [cassee, setCassee] = useState(false);

  const aUnePhoto = typeof image === 'string' && image.length > 0 && !cassee;

  const commun: CSSProperties = {
    width: `${taille}px`,
    height: `${taille}px`,
    borderRadius: 'var(--rayon-plein)',
    flexShrink: 0,
  };

  if (aUnePhoto) {
    return (
      <img
        src={image}
        alt=""
        aria-hidden="true"
        onError={() => setCassee(true)}
        className={className}
        style={{ ...commun, display: 'block', objectFit: 'cover', ...style }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        ...commun,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-1)',
        border: '1px solid var(--bordure)',
        color: 'var(--texte-fort)',
        fontFamily: 'var(--police-corps)',
        /*
          La taille du texte suit le diamètre plutôt qu'un jeton.

          Un jeton fixe donnerait des initiales minuscules dans un disque de 96 px et
          débordantes dans un disque de 24. Le rapport de 0,38 tient de 24 à 120 px, mesuré
          sur les trois emplois du portail : deux lettres occupent alors un peu moins de la
          moitié du diamètre, ce qui laisse l'anneau visible.
        */
        fontSize: `${Math.round(taille * 0.38)}px`,
        fontWeight: 'var(--graisse-semi)',
        lineHeight: 1,
        userSelect: 'none',
        ...style,
      }}
    >
      {initiales(nom)}
    </span>
  );
}
