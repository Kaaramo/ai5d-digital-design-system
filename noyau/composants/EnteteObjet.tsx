import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { feuille } from './feuille';
import { Icone } from './Icone';
import type { ComposantLien } from './LiensRail';
import { TitreSection } from './TitreSection';

/**
 * L'en-tête d'un objet : une session, un compte, une organisation. Identique sur tous ses onglets.
 *
 * ── POURQUOI IL MONTE, EN v1.3.0 ────────────────────────────────────────────
 * Compte écrit le sien dans sa console (`EnteteConsole.tsx:25-34`, relu le 28 septembre 2026) : un
 * titre, un fil d'Ariane nommé, une action unique à droite, rendu sur sept écrans. La console du
 * Portail en demande un pour ses sessions. Deux produits, un besoin : décision 012.
 *
 * ── CE QU'IL DIT, DANS L'ORDRE ──────────────────────────────────────────────
 * D'où l'on vient (le fil), ce qu'est l'objet (le titre, un seul `h1`), où il en est (l'état), ce qui
 * le fait avancer (une action, et un menu), ses faits (dates, lieu), puis son pouls (une rangée de
 * `Chiffre` compacts). Un filet le ferme, comme `EnteteRubrique`.
 *
 * ── LE FIL S'ARRÊTE AU PARENT ───────────────────────────────────────────────
 * Il ne répète jamais le titre : le dernier segment est un lien vers le parent, et aucun ne porte
 * `aria-current`. Compte terminait son fil par la page courante, sans lien ; ici, c'est le titre qui
 * la nomme, juste dessous.
 *
 * ── IL RESTE UN COMPOSANT SERVEUR ───────────────────────────────────────────
 * Aucun crochet. Les icônes des métadonnées et le lien du routeur arrivent en propriétés, comme pour
 * `EnteteRubrique` et `OngletsRubrique`.
 */

export interface ElementFil {
  libelle: string;
  href: string;
}

export interface MetadonneeObjet {
  icone: LucideIcon;
  texte: ReactNode;
}

export interface ProprietesEnteteObjet {
  /** Le chemin de retour, du plus large au plus proche. Il ne répète jamais le titre. */
  fil?: readonly ElementFil[] | undefined;
  /** Le nom de l'objet, en `h1`. */
  titre: string;
  /** Son état : une `PastilleEtat`, à côté du titre. */
  etat?: ReactNode | undefined;
  metadonnees?: readonly MetadonneeObjet[] | undefined;
  /** Le pouls : une rangée de `Chiffre` compacts. */
  indicateurs?: ReactNode | undefined;
  /** L'action qui fait avancer l'état. Une seule. */
  action?: ReactNode | undefined;
  /** Un `MenuActions`. */
  menu?: ReactNode | undefined;
  /** Le lien du routeur du produit, pour le fil ; `a` par défaut. */
  Lien?: ComposantLien | undefined;
  /** Le nom du fil pour les lecteurs d'écran. « Fil d’Ariane » par défaut. */
  etiquetteFil?: string | undefined;
}

const ID_STYLE = 'ai5d-entete-objet';

export const STYLE_ENTETE_OBJET = `
.ai5d-entete-objet {
  display: flex;
  flex-direction: column;
  gap: var(--espace-3);
  padding-bottom: var(--espace-6);
  border-bottom: 1px solid var(--bordure);
}
.ai5d-entete-objet__fil {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--espace-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.ai5d-entete-objet__fil li { display: inline-flex; align-items: center; gap: var(--espace-2); }
.ai5d-entete-objet__fil li > svg { color: var(--texte-faible); }
.ai5d-entete-objet__lien {
  border-radius: var(--rayon-sm);
  color: var(--action);
  font-family: var(--police-corps);
  font-size: var(--taille-sm);
  text-decoration: none;
}
@media (hover: hover) {
  .ai5d-entete-objet__lien:hover { text-decoration: underline; text-underline-offset: 0.2em; }
}
.ai5d-entete-objet__lien:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }
.ai5d-entete-objet__lien:active { background: var(--surface-selection); transition: none; }

.ai5d-entete-objet__tete {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--espace-3);
}
.ai5d-entete-objet__gestes {
  display: flex;
  align-items: center;
  gap: var(--espace-2);
  margin-inline-start: auto;
}
.ai5d-entete-objet__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espace-4);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--texte-faible);
  font-family: var(--police-corps);
  font-size: var(--taille-sm);
}
.ai5d-entete-objet__meta li { display: inline-flex; align-items: center; gap: var(--espace-2); }
`;

export function EnteteObjet({
  fil,
  titre,
  etat,
  metadonnees,
  indicateurs,
  action,
  menu,
  Lien,
  etiquetteFil = 'Fil d’Ariane',
}: ProprietesEnteteObjet) {
  const avecFil = fil !== undefined && fil.length > 0;
  const avecGestes = action !== undefined || menu !== undefined;

  return (
    <header className="ai5d-entete-objet">
      {feuille(ID_STYLE, STYLE_ENTETE_OBJET)}

      {avecFil ? (
        <nav aria-label={etiquetteFil}>
          {/* `list-style: none` retire la liste sous Safari et VoiceOver : `role` la rend. */}
          <ol role="list" className="ai5d-entete-objet__fil">
            {fil.map((element) => (
              <li key={element.href}>
                {Lien === undefined ? (
                  <a className="ai5d-entete-objet__lien" href={element.href}>
                    {element.libelle}
                  </a>
                ) : (
                  <Lien className="ai5d-entete-objet__lien" href={element.href}>
                    {element.libelle}
                  </Lien>
                )}
                <Icone nom={ChevronRight} taille={16} />
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="ai5d-entete-objet__tete">
        <TitreSection niveau={1} taille="ecran">
          {titre}
        </TitreSection>
        {etat}
        {avecGestes ? (
          <div className="ai5d-entete-objet__gestes">
            {action}
            {menu}
          </div>
        ) : null}
      </div>

      {metadonnees === undefined || metadonnees.length === 0 ? null : (
        <ul role="list" className="ai5d-entete-objet__meta">
          {metadonnees.map((metadonnee, index) => (
            <li key={index}>
              <Icone nom={metadonnee.icone} taille={16} />
              <span>{metadonnee.texte}</span>
            </li>
          ))}
        </ul>
      )}

      {indicateurs === undefined ? null : (
        <div className="ai5d-entete-objet__indicateurs">{indicateurs}</div>
      )}
    </header>
  );
}
