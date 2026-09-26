import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { BlocDocument } from './BlocDocument';
import { DeplierDocument } from './DeplierDocument';
import type { Document, EnteteDocument } from './document';
import { Icone } from './Icone';
import type { ComposantLien } from './LiensRail';
import { Logotype } from './Logotype';
import { SommaireDocument } from './SommaireDocument';
import { BUREAU } from '../paliers';

/**
 * La page d'un document : un bandeau, un sommaire collé, des sections numérotées.
 *
 * ── D'OÙ IL VIENT ───────────────────────────────────────────────────────────
 * De Compte, où `CoquilleDocument` et `BandeauDocument` servaient les conditions et la politique de
 * confidentialité. Ils fusionnent ici : le bandeau n avait aucun usage hors de la coquille, et deux
 * fichiers pour une seule pièce ne font que deux endroits où changer une marge. La disposition est
 * celle du site vitrine, demandée par le commanditaire au sprint 15 de Compte.
 *
 * ── LE LIEN VERS L'ACCUEIL VIENT DU PRODUIT ─────────────────────────────────
 * Dans Compte, le bandeau importait `next/link` et codait `href="/"`. Le système ne connaît pas Next,
 * et ne sait pas où est l'accueil d'un produit : `Lien` et `accueil` sont des propriétés.
 *
 * ── UNE SECTION EST UN `<details>`, ET SON TITRE EST DANS LE `summary` ──────
 * Un `summary` admet un titre : le `<h2>` reste un titre pour qui navigue de titre en titre, et
 * devient le bouton qui déplie la section sur téléphone. L'ancre est sur le `<details>` lui-même,
 * pour que `DeplierDocument` retrouve la section visée sans chercher.
 *
 * ── `entete` ────────────────────────────────────────────────────────────────
 * Remplace le surtitre, le titre et l'intention du document dans le bandeau. Un écran qui affiche
 * son propre titre au-dessus d'un document s'en sert, pour n'avoir qu'un seul titre de premier
 * niveau sur la page.
 */

export interface ProprietesGabaritDocument {
  document: Document;
  /** Ce qui suit la dernière section : liens vers les autres documents, contact. */
  pied: ReactNode;
  /** Remplace l'en-tête tiré du document. */
  entete?: EnteteDocument | undefined;
  /** L'adresse de l'accueil du produit, vers laquelle ramène le logotype du bandeau. */
  accueil: string;
  /** Le composant de lien du produit ; `a` par défaut. */
  Lien?: ComposantLien | undefined;
}

const ID_STYLE = 'ai5d-gabarit-document';

/**
 * La feuille des pages de document.
 *
 * Les règles qui dépendent d'une requête média, d'un `:hover`, d'un état `[open]` ou de l'impression
 * ne s'écrivent pas en style en ligne. Les classes portent le préfixe `ai5d-` : dans Compte elles
 * s'appelaient `.page-document` ou `.section-document`, noms qu'un système injecté dans tous les
 * produits ne peut pas se permettre, faute de quoi il colorerait les pages du produit qui les emploie
 * déjà.
 *
 * ── `::details-content`, OU COMMENT UN `<details>` FERMÉ SE LIT SUR ORDINATEUR ─
 * Les sections sont servies FERMÉES : c'est l'état juste sur téléphone, sans rien exécuter, donc sans
 * clignotement. Au-dessus de 1024 px, `::details-content` rend leur contenu visible sans les ouvrir.
 * `DeplierDocument` pose ensuite l'état vrai.
 *
 * ── `minmax(0, 720px)` ET NON `720px` ───────────────────────────────────────
 * Une piste sans `minmax(0, …)` refuse de descendre sous la largeur intrinsèque de son contenu : un
 * tableau large pousserait la page entière de côté au lieu de défiler dans son cadre.
 *
 * ── L'IMPRESSION ────────────────────────────────────────────────────────────
 * Toutes les sections ouvertes : on imprime ce qu'on accepte en entier. Le bandeau repasse en encre
 * sur blanc, parce que le navigateur retire les fonds et que son texte est blanc.
 */
export const STYLE_DOCUMENT = `
.ai5d-colonne-document { max-width: 1120px; margin: 0 auto; padding-inline: var(--espace-4); }
.ai5d-bandeau-document { background: var(--encre); color: var(--blanc); border-bottom: 1px solid var(--bordure); }
.ai5d-bandeau-document__interieur { padding-block: var(--espace-8) var(--espace-12); }
.ai5d-bandeau-document__logo { display: inline-block; margin-bottom: var(--espace-12); color: inherit; }
.ai5d-titre-bandeau { font-size: var(--taille-2xl); }
.ai5d-corps-document { padding-block: var(--espace-8) var(--espace-16); }
.ai5d-page-document { display: grid; gap: var(--espace-6); }
.ai5d-document__masque {
  position: absolute; width: 1px; height: 1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}

.ai5d-sommaire-document { border: 1px solid var(--bordure); padding: var(--espace-4); }
.ai5d-titre-sommaire { display: flex; align-items: center; justify-content: space-between; cursor: pointer; list-style: none; }
.ai5d-titre-sommaire::-webkit-details-marker { display: none; }
.ai5d-sommaire-document nav { padding-top: var(--espace-4); }
.ai5d-entree-sommaire:hover { color: var(--action); }

.ai5d-section-document { border-top: 1px solid var(--bordure); scroll-margin-top: var(--espace-12); }
.ai5d-section-document:first-child { border-top: 0; }
.ai5d-titre-section { display: flex; align-items: flex-start; gap: var(--espace-3); padding: var(--espace-6) 0; cursor: pointer; list-style: none; }
.ai5d-titre-section::-webkit-details-marker { display: none; }
.ai5d-numero-section { flex-shrink: 0; padding-top: var(--espace-2); font-size: var(--taille-xs); font-weight: var(--graisse-semi); letter-spacing: var(--lettrage-overline); color: var(--action); font-variant-numeric: tabular-nums; }
.ai5d-titre-section h2 { margin: 0; font-family: var(--police-titre); font-size: var(--taille-xl); font-weight: var(--graisse-legere); line-height: var(--interligne-titre); color: var(--texte-fort); }
.ai5d-chevron-section { margin-left: auto; flex-shrink: 0; color: var(--texte-faible); transition: transform var(--duree-courte) var(--courbe-sortie); }
.ai5d-section-document[open] > .ai5d-titre-section .ai5d-chevron-section,
.ai5d-sommaire-document[open] > .ai5d-titre-sommaire .ai5d-chevron-section { transform: rotate(180deg); }
.ai5d-corps-section { display: grid; gap: var(--espace-4); padding-bottom: var(--espace-8); }

@media (min-width: ${BUREAU}px) {
  .ai5d-colonne-document { padding-inline: var(--espace-8); }
  .ai5d-bandeau-document__interieur { padding-block: var(--espace-8) var(--espace-16); }
  .ai5d-titre-bandeau { font-size: var(--taille-4xl); }
  .ai5d-corps-document { padding-top: var(--espace-12); }
  .ai5d-page-document { grid-template-columns: 280px minmax(0, 720px); gap: var(--espace-12); }
  .ai5d-colonne-sommaire { position: sticky; top: var(--espace-8); align-self: start; }
  .ai5d-sommaire-document { border: 0; padding: 0; }
  .ai5d-titre-sommaire { cursor: default; padding-bottom: var(--espace-4); border-bottom: 1px solid var(--bordure); }
  details[data-depliable]::details-content { content-visibility: visible; display: block; }
  .ai5d-chevron-section { display: none; }
  .ai5d-titre-section { cursor: default; }
  .ai5d-titre-section h2 { font-size: var(--taille-2xl); }
}

@media print {
  details[data-depliable]::details-content { content-visibility: visible; display: block; }
  .ai5d-chevron-section, .ai5d-bandeau-document__logo, .ai5d-colonne-sommaire { display: none; }
  .ai5d-bandeau-document { background: none; color: var(--encre); border-bottom-color: var(--encre); }
}

@media (prefers-reduced-motion: reduce) {
  .ai5d-chevron-section { transition: none; }
}
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
`;

/** Le repli quand le produit ne fournit pas de composant de lien. */
function LienDocument({
  href,
  className,
  children,
}: {
  href: string;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function GabaritDocument({
  document,
  pied,
  entete,
  accueil,
  Lien = LienDocument,
}: ProprietesGabaritDocument) {
  const bandeau = entete ?? {
    surtitre: document.surtitre,
    titre: document.titre,
    intention: document.sousTitre,
  };

  const capitales = {
    margin: 0,
    fontSize: 'var(--taille-xs)',
    fontWeight: 'var(--graisse-semi)',
    letterSpacing: 'var(--lettrage-overline)',
    textTransform: 'uppercase',
  } as const;

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_DOCUMENT }} />
      <DeplierDocument />

      {/*
        LE BANDEAU. Ni date de mise a jour ni version : les deux ont quitte l affichage a la demande
        du commanditaire de Compte. La version reste dans les donnees, parce que c est ce qu un
        compte enregistre quand il accepte ; elle quitte l ecran, pas le modele.

        Les couleurs sont sur des classes : a l impression, un texte blanc pose en style en ligne
        resterait blanc sur le papier.
      */}
      <header className="ai5d-bandeau-document">
        <div className="ai5d-colonne-document ai5d-bandeau-document__interieur">
          {/*
            Le lien du produit reçoit l'adresse et la classe. Depuis la 1.2.0, `ComposantLien` accepte
            aussi `aria-label` ; le nom accessible passe pourtant toujours par un texte masqué et le
            logotype reste décoratif, pour que le rendu de la 1.1.0 ne change pas et que le lien
            s'annonce « Retour à l'accueil » et rien d'autre.
          */}
          <Lien href={accueil} className="ai5d-bandeau-document__logo">
            <span className="ai5d-document__masque">Retour à l’accueil</span>
            <span aria-hidden="true">
              <Logotype variante="blanc" />
            </span>
          </Lien>

          <p style={capitales}>{bandeau.surtitre}</p>

          <h1
            className="ai5d-titre-bandeau"
            style={{
              margin: 'var(--espace-4) 0 0',
              fontFamily: 'var(--police-titre)',
              fontWeight: 'var(--graisse-legere)',
              lineHeight: 'var(--interligne-titre)',
            }}
          >
            {bandeau.titre}
          </h1>

          {/* Une OPACITE, et non une couleur : le texte reste `--blanc`, il s efface d un quart. */}
          <p
            style={{
              margin: 'var(--espace-6) 0 0',
              maxWidth: '560px',
              fontSize: 'var(--taille-md)',
              lineHeight: 'var(--interligne-corps)',
              opacity: 0.72,
            }}
          >
            {bandeau.intention}
          </p>
        </div>
      </header>

      <div className="ai5d-colonne-document ai5d-corps-document">
        <div className="ai5d-page-document">
          <div className="ai5d-colonne-sommaire">
            <SommaireDocument sections={document.sections} />
          </div>

          <main>
            {document.sections.map((section) => (
              <details
                key={section.id}
                id={section.id}
                className="ai5d-section-document"
                data-depliable
              >
                <summary className="ai5d-titre-section">
                  <span className="ai5d-numero-section" aria-hidden="true">
                    {section.numero}
                  </span>
                  <h2>{section.titre}</h2>
                  <span className="ai5d-chevron-section" aria-hidden="true">
                    <Icone nom={ChevronDown} taille={20} />
                  </span>
                </summary>

                <div className="ai5d-corps-section">
                  {section.blocs.map((bloc, index) => (
                    <BlocDocument key={`${section.id}-${index}`} bloc={bloc} />
                  ))}
                </div>
              </details>
            ))}

            {pied}
          </main>
        </div>
      </div>
    </>
  );
}
