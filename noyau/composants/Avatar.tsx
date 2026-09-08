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
 * ── IL EST DÉCORATIF PAR DÉFAUT, ET CE DÉFAUT A UNE EXCEPTION ───────────────
 * `aria-hidden`, et un `alt` vide. Le nom complet est presque toujours à côté, en toutes
 * lettres : le faire annoncer ferait entendre deux fois la même personne.
 *
 * `decoratif={false}` existe pour le cas où il est SEUL, et ce n'est pas un confort.
 * Mesuré sur le portail Compte : sous 768 px, le rail disparaît avec le nom et l'adresse,
 * et le disque devient le seul marqueur d'identité de la coquille. Retiré de l'arbre
 * d'accessibilité, avec une infobulle que le doigt ne déclenche pas, il ne disait plus rien
 * du tout.
 *
 * Quelqu'un qui tient un compte personnel et un compte employeur au même nom n'avait alors,
 * au lecteur d'écran et sur téléphone, aucun moyen de savoir où il se trouvait. Il pouvait
 * demander la suppression du mauvais compte.
 *
 * ── LES INITIALES D'UNE PERSONNE NE SE CALCULENT PAS COMME CELLES D'UNE ORGANISATION ──
 * Une organisation saute ses mots de liaison : « Institut de la Vision » donne IV, et non
 * ID. Une personne ne le fait pas : « Jean de La Fontaine » n'a pas de mot de liaison, il a
 * un nom à particule, et sauter le « de » y perdrait une lettre du nom.
 *
 * Les deux règles sont justes, chacune pour son objet. Le composant applique celle des
 * personnes, et `lettres` laisse l'appelant passer les siennes plutôt que d'en imposer une
 * aux deux.
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
  /**
   * Les initiales, quand elles ne se calculent pas comme celles d'une personne.
   *
   * Voir l'en-tête : une organisation saute ses mots de liaison, une personne non.
   */
  lettres?: string | undefined;
  /**
   * Faux quand l'avatar est le SEUL marqueur d'identité à l'écran.
   *
   * Il porte alors un nom accessible au lieu de disparaître de l'arbre. Voir l'en-tête :
   * ce n'est pas un confort, c'est une correction.
   */
  decoratif?: boolean | undefined;
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

export function Avatar({
  nom,
  image,
  taille = 40,
  lettres,
  decoratif = true,
  className,
  style,
}: ProprietesAvatar) {
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
        alt={decoratif ? '' : `Connecté en tant que ${nom}`}
        aria-hidden={decoratif ? true : undefined}
        title={nom}
        onError={() => setCassee(true)}
        className={className}
        style={{ ...commun, display: 'block', objectFit: 'cover', ...style }}
      />
    );
  }

  return (
    <span
      title={nom}
      aria-hidden={decoratif ? true : undefined}
      role={decoratif ? undefined : 'img'}
      aria-label={decoratif ? undefined : `Connecté en tant que ${nom}`}
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
      {lettres ?? initiales(nom)}
    </span>
  );
}
