import type {
  AnchorHTMLAttributes,
  ComponentProps,
  ComponentType,
  MouseEventHandler,
  ReactNode,
} from 'react';
import type { Rubrique } from './CoquilleRail';
import { Icone } from './Icone';

/**
 * Les liens du rail d'une coquille, à partir de 768 px.
 *
 * ── IL NE CONNAÎT NI LE CHEMIN, NI LE ROUTEUR ───────────────────────────────
 * Aucun crochet, aucune directive, aucun import de framework. Il reçoit la rubrique active et le
 * composant de lien du produit. C'est ce qui le rend utilisable par tous les produits : un
 * composant qui lirait `usePathname()` ne servirait qu'à Next, et un produit sur un autre
 * cadriciel devrait le forker.
 *
 * Le produit écrit donc un module client d'une vingtaine de lignes, une seule fois, qui lit son
 * chemin et rend `LiensRail` avec son `Link`. La coquille reçoit l'élément rendu, qui traverse la
 * frontière serveur-client ; jamais le tableau des rubriques, dont les icônes ne la traversent pas.
 *
 * ── POURQUOI LE LIEN VIENT DU PRODUIT ───────────────────────────────────────
 * Un `<a href>` nu redemande le document entier à chaque changement de rubrique : le rail est
 * redessiné, les polices retraversent le réseau, la page clignote. Le lien du routeur ne remplace
 * que le contenu, ce qu'une coquille est censée permettre. `a` reste le repli, pour un produit qui
 * n'a pas de routeur client.
 *
 * ── L'ÉTAT ACTIF ────────────────────────────────────────────────────────────
 * Pastille pleine `--surface-selection`, texte et icône `--action`, graisse semi, et
 * `aria-current="page"`. Le jeton de sélection est réglé par thème dans le système : le rail de
 * Compte choisissait son fond à la main, avec deux blocs de sélecteurs recopiés, parce que ce
 * jeton n'existait pas.
 *
 * L'état ne passe pas que par la couleur : `aria-current` le dit aux lecteurs d'écran, la graisse
 * le dit à qui ne distingue pas le bleu.
 */

/**
 * Le composant de lien du produit. Celui de Next convient tel quel.
 *
 * Il reçoit les attributs d'un `<a>` (voir plus bas pour trois gestionnaires), et il doit les
 * transmettre : un bouton en lien lui passe
 * `style`, `target`, `rel`, `aria-*` et `data-*`, et les perdre rendrait un lien sans hauteur ni
 * variante. Élargi en 1.2.0 ; jusque-là, il ne promettait que l'adresse, la classe et l'état courant.
 *
 * Un composant typé sur l'ancienne forme, avec `'aria-current'?: 'page'`, n'est plus assignable : un
 * lien admet aussi `true`, `step`, `location`… Un produit type le sien par
 * `ComponentProps<ComposantLien>`. Constaté par `tsc` le 26 septembre 2026 ; aucun produit n'était
 * concerné, tous passent `Link` tel quel.
 *
 * ── SAUF TROIS GESTIONNAIRES, ET POUR `Link` ────────────────────────────────
 * Next redéclare `onClick`, `onMouseEnter` et `onTouchStart` SANS `| undefined`. Sous
 * `exactOptionalPropertyTypes`, que Compte et le Portail activent, un type qui promettait les
 * attributs d'un `<a>` tels quels refusait `Link` : trouvé par la montée de Compte, le 26 septembre
 * 2026, avant toute publication. Le système ne transmet jamais `onMouseEnter` ni `onTouchStart`, qui
 * sortent donc du type ; `onClick` y reste, sans `| undefined`, et le système ne le passe que défini.
 */
export type ProprietesLienProduit = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'onClick' | 'onMouseEnter' | 'onTouchStart'
> & {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
};

export type ComposantLien = ComponentType<ProprietesLienProduit>;

export interface ProprietesLiensRail {
  rubriques: Rubrique[];
  /** L'`id` actif. Une valeur inconnue n'en active aucune. */
  actif: string;
  /** Le composant de lien du produit ; `a` par défaut. */
  Lien?: ComposantLien | undefined;
  /** L'étiquette de la navigation, lue par les lecteurs d'écran. */
  etiquette: string;
}

const ID_STYLE = 'ai5d-liens-rail';

/**
 * Le survol change de jeton selon le thème, comme dans le rail de Compte : `--surface-1` se
 * détache du rail en clair et s'y confond en sombre, où `--surface-3` prend le relais. Il n'existe
 * pas de jeton de survol réglé par thème, et en déclarer un sortirait du périmètre de ce sprint.
 */
export const STYLE_LIENS_RAIL = `
.ai5d-liens-rail {
  display: flex; flex-direction: column; gap: var(--espace-1);
}
.ai5d-liens-rail__lien {
  display: flex; align-items: center; gap: var(--espace-3);
  min-height: var(--cible-tactile);
  padding: var(--espace-2) var(--espace-3);
  border-radius: var(--rayon-md);
  color: var(--texte);
  font-family: var(--police-corps); font-size: var(--taille-sm);
  text-decoration: none;
  transition: background var(--duree-courte) var(--courbe-sortie),
              color var(--duree-courte) var(--courbe-sortie);
}
.ai5d-liens-rail__lien:hover { background: var(--surface-1); color: var(--texte-fort); }
.ai5d-liens-rail__lien[aria-current='page'] {
  background: var(--surface-selection);
  color: var(--action);
  font-weight: var(--graisse-semi);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .ai5d-liens-rail__lien:hover { background: var(--surface-3); }
}
:root[data-theme='dark'] .ai5d-liens-rail__lien:hover { background: var(--surface-3); }
/* Le survol ne recouvre pas la pastille active : elle garde son fond de selection. */
.ai5d-liens-rail__lien[aria-current='page']:hover { background: var(--surface-selection); }

/* Au clavier seulement : focus-visible ne se declenche pas au clic de souris. */
.ai5d-liens-rail__lien:focus-visible {
  outline: 2px solid var(--action);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-liens-rail__lien { transition: none; }
}
`;

/** Le repli quand le produit ne fournit pas de composant de lien. */
function LienDocument({ children, ...proprietes }: ComponentProps<ComposantLien>) {
  return <a {...proprietes}>{children}</a>;
}

export function LiensRail({
  rubriques,
  actif,
  Lien = LienDocument,
  etiquette,
}: ProprietesLiensRail) {
  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_LIENS_RAIL }} />

      <nav className="ai5d-liens-rail" aria-label={etiquette}>
        {rubriques.map((rubrique) => (
          <Lien
            key={rubrique.id}
            href={rubrique.href}
            className="ai5d-liens-rail__lien"
            aria-current={rubrique.id === actif ? 'page' : undefined}
          >
            {/*
              L'icône reste décorative : le mot est juste à côté, et le faire lire deux fois
              n'apporte rien. C'est la règle générale du système.
            */}
            <Icone nom={rubrique.icone} taille={20} />
            <span>{rubrique.libelle}</span>
          </Lien>
        ))}
      </nav>
    </>
  );
}
