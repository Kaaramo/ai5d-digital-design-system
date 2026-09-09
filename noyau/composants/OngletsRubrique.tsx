import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icone } from './Icone';

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
 * On emploie donc `nav` et `aria-current="page"`, et les flèches ne font rien — ce qui est
 * exactement le comportement attendu d'une liste de liens. Annoncer un `tablist` qui
 * navigue serait une promesse fausse.
 *
 * ── L'ÉTAT ACTIF PASSE PAR TROIS SIGNAUX ────────────────────────────────────
 * La couleur d'action, la graisse semi-grasse, et le trait de 2 px. Les trois ensemble, ou
 * l'information n'atteint pas tout le monde : près d'un homme sur douze ne distingue pas
 * correctement le rouge du vert, et un trait de 2 px seul se rate au balayage. C'est la
 * même règle que celle écrite dans `BarreOnglets`, et pour la même raison.
 *
 * ── LE DÉBORDEMENT SE VOIT, ET C'EST LE DERNIER ONGLET COUPÉ QUI LE DIT ─────
 * Trois onglets de deux mots ne tiennent pas sur un téléphone de 390 px. Le conteneur
 * défile, et son ascenseur est masqué.
 *
 * La 0.6.0 y ajoutait un dégradé de 24 px collé au bord droit, censé dire qu'il reste
 * quelque chose derrière. **Il a été retiré en 0.6.3, après l'avoir vu à l'écran.**
 *
 * Un dégradé posé sans mesure se dessine TOUJOURS, y compris sur un écran de 1440 px où
 * rien ne déborde : il y apparaissait comme une bande claire qui coupait le filet et le
 * trait de l'onglet actif. Le rendre conditionnel demanderait de mesurer la largeur au
 * montage, donc un état, donc de faire de ce composant un module client — un coût
 * disproportionné pour un ornement.
 *
 * Ce qui signale le débordement est donc le dernier onglet **coupé net par le bord**. C'est
 * ce que font les réglages d'iOS, GitHub et Stripe, et c'est suffisant : l'œil reconnaît un
 * mot tronché comme la promesse d'un défilement.
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
  /** Deux à cinq. En dessous de deux, il n'y a rien à choisir. */
  onglets: OngletRubrique[];
  /** L'`id` de l'onglet courant. Un identifiant inconnu n'en marque aucun. */
  actif: string;
  /** Le nom de la navigation pour les lecteurs d'écran. */
  etiquette?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/** La hauteur d'un onglet. Elle porte le plancher tactile de la charte. */
export const HAUTEUR_ONGLETS = 44;

const ID_STYLE = 'ai5d-onglets-rubrique';

/*
  La prose vit dans le commentaire au-dessus, jamais dans la chaîne ci-dessous : un accent
  grave dans un gabarit littéral le TERMINE, et la prose de ce système cite volontiers du
  code entre accents graves.
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
}
.ai5d-onglets-r::-webkit-scrollbar { display: none; }

.ai5d-onglets-r__lien {
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
  transition: color var(--duree-courte) var(--courbe-entree);
}

.ai5d-onglets-r__lien:hover { color: var(--texte-fort); }

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

@media (prefers-reduced-motion: reduce) {
  .ai5d-onglets-r__lien { transition: none; }
}
`;

export function OngletsRubrique({
  onglets,
  actif,
  etiquette = 'Sous-pages de la rubrique',
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
        {onglets.map((onglet) => (
          <a
            key={onglet.id}
            href={onglet.href}
            className="ai5d-onglets-r__lien"
            /*
              `undefined` et non `false` : `aria-current="false"` est une valeur VALIDE qui
              signifie « ce n'est pas l'element courant », et certains lecteurs d'ecran
              l'annoncent. L'attribut doit disparaitre, pas valoir faux.
            */
            aria-current={onglet.id === actif ? 'page' : undefined}
          >
            {onglet.icone === undefined ? null : <Icone nom={onglet.icone} taille={16} />}
            <span>{onglet.libelle}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
