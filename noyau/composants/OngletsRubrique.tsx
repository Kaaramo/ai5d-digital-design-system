import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icone } from './Icone';
import type { ComposantLien } from './LiensRail';

/**
 * La navigation entre les sous-pages d'une rubrique.
 *
 * ── ELLE N'EST PAS `BarreOnglets`, ET LA CONFUSION SERAIT COÛTEUSE ──────────
 * `BarreOnglets` est une barre BASSE et FIXE de coquille mobile, qui disparaît au palier
 * tablette parce qu'au-delà l'appareil se pose et qu'une bande de 56 px en bas de l'écran
 * est du gaspillage. Celle-ci est HAUTE, dans le flux du document, et présente à tous les
 * paliers.
 *
 * Deux composants portant le mot « onglet » pour deux rôles opposés, c'est assumé : le nom
 * dit ce que la chose EST, et ces deux choses sont différentes. Le jour où quelqu'un
 * cherchera « les onglets », il trouvera les deux et lira ce paragraphe.
 *
 * ── CE SONT DES LIENS, PAS UN `tablist` ─────────────────────────────────────
 * Le motif ARIA `tablist` promet des panneaux qui apparaissent sans navigation, et un
 * lecteur d'écran qui l'entend attend les flèches pour circuler. Ici la page change
 * vraiment : chaque onglet est une route rendue au serveur, qui se met en signet et revient
 * par le bouton Retour du navigateur.
 *
 * On emploie donc `nav` et `aria-current="page"`, et les flèches ne font rien, ce qui est
 * exactement le comportement attendu d'une liste de liens. Annoncer un `tablist` qui
 * navigue serait une promesse fausse.
 *
 * ── L'ÉTAT ACTIF PASSE PAR TROIS SIGNAUX ────────────────────────────────────
 * La couleur d'action, la graisse semi-grasse, et le trait de 2 px. Les trois ensemble, ou
 * l'information n'atteint pas tout le monde : près d'un homme sur douze ne distingue pas
 * correctement le rouge du vert, et un trait de 2 px seul se rate au balayage. C'est la
 * même règle que celle écrite dans `BarreOnglets`, et pour la même raison.
 *
 * ── LE DÉBORDEMENT SE VOIT PAR UN FONDU, MESURÉ PAR LE NAVIGATEUR ──────────
 * Trois onglets de deux mots ne tiennent pas sur un téléphone de 390 px. Le conteneur
 * défile, et son ascenseur est masqué.
 *
 * La 0.6.0 y posait un dégradé fixe de 24 px ; la 0.6.3 l'a retiré, parce qu'un voile posé sans
 * mesure se dessinait aussi là où rien ne débordait, et qu'une mesure au montage aurait fait de ce
 * composant un module client. La 1.2.0 le rend, sans mesure ni script : c'est la frise de défilement
 * du conteneur, sous `@supports (animation-timeline: scroll())`, qui choisit le bord. Quand rien ne
 * déborde, la frise est inactive et aucun masque ne s'applique. Sans prise en charge, le dernier
 * onglet coupé net par le bord reste le signal, comme en 0.6.3. Décision 007.
 *
 * L'onglet actif est amené dans la vue au premier affichage par `scroll-initial-target`, sous
 * `@supports`, pour la même raison : un `scrollIntoView` demanderait un effet, donc une directive
 * client, et ferait tomber tout appelant serveur qui passe des icônes.
 *
 * Constaté le 26 septembre 2026 (Playwright 1.57) : Chromium 143 fait les deux, WebKit 26 le fondu
 * seul, Firefox 144 aucun des deux.
 *
 * ── LE LIEN DU PRODUIT, L'APPUI ET L'ATTENTE, EN v1.2.0 ────────────────────
 * Avec `Lien`, changer d'onglet ne recharge plus le document. L'appui pose la surface de sélection
 * sans transition ; une navigation en attente, selon le protocole de `lien.ts`, fait pulser un trait
 * bas, que l'onglet actif ne montre jamais. La borne passe de cinq à six : une session à distance du
 * Portail a six sous-pages, et fusionner le badge et l'attestation confondrait deux objets.
 *
 * ── LE COMPOSANT NE DÉDUIT PAS L'ACTIF, IL LE REÇOIT ────────────────────────
 * Déduire le chemin courant demanderait un routeur, donc une dépendance à un framework,
 * dans un système qui n'en a aucune. Le consommateur lit son chemin et passe un
 * identifiant.
 *
 * Avertissement à son intention, écrit ici parce que c'est ici qu'on le lira : sous Next
 * App Router, il doit le faire dans un composant CLIENT. Un gabarit partagé n'est pas
 * rejoué quand on passe d'une route sœur à l'autre, et l'onglet actif resterait figé sur la
 * première sous-page ouverte.
 */

export interface OngletRubrique {
  /** Identifiant stable. C'est lui que compare `actif`. */
  id: string;
  /** Le libellé. Deux mots au plus. */
  libelle: string;
  /** L'adresse de la sous-page. Toujours fournie : ce sont des liens. */
  href: string;
  /** Une icône Lucide, importée par le consommateur. Facultative. */
  icone?: LucideIcon | undefined;
}

export interface ProprietesOngletsRubrique {
  /** Deux à six. En dessous de deux, il n'y a rien à choisir. */
  onglets: OngletRubrique[];
  /** L'`id` de l'onglet courant. Un identifiant inconnu n'en marque aucun. */
  actif: string;
  /** Le nom de la navigation pour les lecteurs d'écran. */
  etiquette?: string | undefined;
  /** Le lien du routeur du produit ; `a` par défaut. Avec lui, changer d'onglet ne recharge pas le document. */
  Lien?: ComposantLien | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** La hauteur d'un onglet. Elle porte le plancher tactile de la charte. */
export const HAUTEUR_ONGLETS = 44;

/**
 * Deux à six onglets. Comme `BarreOnglets`, le composant ne lève pas au-delà : la borne est écrite,
 * exportée et testée.
 */
export const ONGLETS_RUBRIQUE_MIN = 2;
export const ONGLETS_RUBRIQUE_MAX = 6;

const ID_STYLE = 'ai5d-onglets-rubrique';

/*
  La prose vit dans le commentaire au-dessus, jamais dans la chaîne ci-dessous : un accent
  grave dans un gabarit littéral le TERMINE, et la prose de ce système cite volontiers du
  code entre accents graves.

  Le masque du fondu ne lit que l opacite : la teinte choisie n apparait jamais. Le trait
  d attente se place a -2 px pour recouvrir exactement la bordure basse de 2 px de l onglet,
  comme le trait actif ; la valeur est nommee hors echelle dans la garde d espacement.
*/
const STYLE_ONGLETS = `
.ai5d-onglets-r {
  display: flex;
  align-items: stretch;
  gap: var(--espace-6);
  border-bottom: 1px solid var(--bordure);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-padding-inline: var(--espace-6);
}
.ai5d-onglets-r::-webkit-scrollbar { display: none; }

.ai5d-onglets-r__lien {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--espace-2);
  flex: 0 0 auto;
  height: 44px;
  padding: 0 var(--espace-1);
  white-space: nowrap;
  text-decoration: none;
  font-family: var(--police-corps);
  font-size: var(--taille-sm);
  font-weight: var(--graisse-normale);
  color: var(--texte-faible);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition:
    color var(--duree-courte) var(--courbe-entree),
    background var(--mouvement-retour);
}

@media (hover: hover) {
  .ai5d-onglets-r__lien:hover { color: var(--texte-fort); }
}

.ai5d-onglets-r__lien:active { background: var(--surface-selection); border-radius: var(--rayon-sm); transition: none; }

.ai5d-onglets-r__lien:focus-visible {
  outline: 2px solid var(--action);
  outline-offset: 2px;
  border-radius: var(--rayon-sm);
}

.ai5d-onglets-r__lien[aria-current='page'] {
  color: var(--action);
  font-weight: var(--graisse-semi);
  border-bottom-color: var(--action);
}

.ai5d-onglets-r__lien::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--bordure-forte);
  opacity: 0;
  pointer-events: none;
}
.ai5d-onglets-r__lien:is([data-en-attente], :has([data-en-attente])):not([aria-current='page'])::after { opacity: 1; animation: ai5d-onglets-attente 1200ms ease-in-out infinite alternate; }

@keyframes ai5d-onglets-attente {
  from { opacity: 0.4; }
  to { opacity: 1; }
}

@supports (animation-timeline: scroll()) {
  .ai5d-onglets-r {
    animation: ai5d-onglets-fondu linear both;
    animation-timeline: scroll(self inline);
  }
  @keyframes ai5d-onglets-fondu {
    0% {
      mask-image: linear-gradient(to left, transparent, var(--encre) var(--espace-6));
    }
    1%, 99% {
      mask-image: linear-gradient(to right, transparent, var(--encre) var(--espace-6), var(--encre) calc(100% - var(--espace-6)), transparent);
    }
    100% {
      mask-image: linear-gradient(to right, transparent, var(--encre) var(--espace-6));
    }
  }
}

@supports (scroll-initial-target: nearest) {
  .ai5d-onglets-r__lien[aria-current='page'] { scroll-initial-target: nearest; }
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-onglets-r__lien { transition: none; }
  .ai5d-onglets-r__lien:is([data-en-attente], :has([data-en-attente])):not([aria-current='page'])::after { animation: none; opacity: 1; }
}
`;

export function OngletsRubrique({
  onglets,
  actif,
  etiquette = 'Sous-pages de la rubrique',
  Lien,
  className,
  style,
}: ProprietesOngletsRubrique) {
  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_ONGLETS }} />

      <nav
        aria-label={etiquette}
        className={className === undefined ? 'ai5d-onglets-r' : `ai5d-onglets-r ${className}`}
        style={style}
      >
        {onglets.map((onglet) => {
          /*
            `undefined` et non `false` : `aria-current="false"` est une valeur VALIDE qui
            signifie « ce n'est pas l'element courant », et certains lecteurs d'ecran
            l'annoncent. L'attribut doit disparaitre, pas valoir faux.
          */
          const courant = onglet.id === actif ? 'page' : undefined;
          const contenu: ReactNode = (
            <>
              {onglet.icone === undefined ? null : <Icone nom={onglet.icone} taille={16} />}
              <span>{onglet.libelle}</span>
            </>
          );

          return Lien === undefined ? (
            <a
              key={onglet.id}
              href={onglet.href}
              className="ai5d-onglets-r__lien"
              aria-current={courant}
            >
              {contenu}
            </a>
          ) : (
            <Lien
              key={onglet.id}
              href={onglet.href}
              className="ai5d-onglets-r__lien"
              aria-current={courant}
            >
              {contenu}
            </Lien>
          );
        })}
      </nav>
    </>
  );
}
