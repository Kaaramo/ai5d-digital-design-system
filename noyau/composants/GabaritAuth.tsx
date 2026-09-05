import type { CSSProperties, ReactNode } from 'react';
import { Logotype } from './Logotype';

/**
 * Le gabarit des écrans de compte : connexion, inscription, oubli,
 * réinitialisation, vérification.
 *
 * Cette disposition n'est pas une proposition. Elle vient de l'Académie, où elle est en
 * production, et chacune de ses valeurs a été mesurée. Les raisons sont recopiées ici
 * parce qu'elles valent plus que le code : un jour, quelqu'un voudra les changer.
 *
 * ── SOUS 1024 PX — le palier de référence ────────────────────────────────────
 * Colonne unique, logotype centré au-dessus, marge de 16 px, aucune image lourde.
 * L'écran doit s'afficher en moins de 2,5 secondes sur une 4G irrégulière, ce qui
 * interdit tout décor. Le contenu court — oubli, réinitialisation, confirmation — se
 * centre dans la hauteur restante au lieu de rester collé en haut d'un écran à moitié
 * vide. Un formulaire long pousse simplement le conteneur, et rien ne change pour lui.
 *
 * ── À PARTIR DE 1024 PX ──────────────────────────────────────────────────────
 * Deux colonnes. Le formulaire à gauche, dans 440 px. Un panneau d'encre à droite qui
 * porte le logotype et une phrase, et rien d'autre. Ni photo, ni illustration, ni filet,
 * ni forme animée : cette sobriété est le signal de sérieux qui distingue un produit AI5D
 * des plateformes grand public.
 *
 * ── POURQUOI 1024 ET NON 768 ─────────────────────────────────────────────────
 * La première spécification plaçait la bascule à 768 px. Mesure faite : à cette largeur
 * le panneau prend 45 %, soit 345 px, et il reste 423 px pour un formulaire annoncé à
 * 440 px plus ses marges — l'écran de réinitialisation débordait de 14 px. À 1024 px,
 * 55 % font 563 px et tout respire. Entre 768 et 1023 px, la colonne unique centrée est
 * de toute façon la meilleure disposition sur une tablette tenue à la verticale.
 *
 * ── CE QUE LE PANNEAU NE PORTE PLUS ──────────────────────────────────────────
 * Il a porté trois preuves — chiffres, garanties, arguments. Elles ont été retirées :
 * elles promettaient un contenu qu'un écran de connexion n'a pas à vendre. On y arrive
 * déjà décidé.
 */

export interface ProprietesGabaritAuth {
  /** Le nom du produit, à côté du logotype. « Compte », « Académie », « Lab ». */
  produit?: string;
  /**
   * La phrase du panneau d'encre. Une seule, courte, en Fraunces léger.
   * Absente, le panneau ne porte que le logotype — c'est acceptable.
   */
  phrase?: string;
  /** Le formulaire, ou tout autre contenu de la colonne de gauche. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** La largeur maximale de la colonne de formulaire. Mesurée, pas choisie. */
export const LARGEUR_FORMULAIRE = 440;

/** La bascule vers deux colonnes. Voir l'en-tête : 768 px débordait de 14 px. */
export const BASCULE_DEUX_COLONNES = 1024;

/** La part du panneau d'encre, et son plafond. */
export const PART_PANNEAU = '45%';
export const LARGEUR_MAX_PANNEAU = 560;

const ID_STYLE = 'ai5d-gabarit-auth';

/**
 * Les règles qui dépendent d'une requête média ne peuvent pas s'écrire en style en
 * ligne. On les injecte une fois, sous un identifiant stable, plutôt que d'imposer
 * Tailwind au consommateur.
 */
const STYLE_GABARIT = `
.ai5d-auth { display: flex; min-height: 100dvh; background: var(--surface-1); }
.ai5d-auth__principal {
  display: flex; flex: 1 1 0; min-width: 0; flex-direction: column;
  padding: 40px 16px;
}
.ai5d-auth__colonne {
  display: flex; flex: 1 1 auto; flex-direction: column;
  width: 100%; max-width: ${LARGEUR_FORMULAIRE}px; margin: 0 auto;
}
.ai5d-auth__marque-mobile { display: flex; justify-content: center; margin-bottom: 40px; }
.ai5d-auth__contenu { display: flex; flex: 1 1 auto; flex-direction: column; justify-content: center; }
.ai5d-auth__panneau { display: none; }

@media (min-width: 640px) { .ai5d-auth__principal { padding-left: 32px; padding-right: 32px; } }

@media (min-width: 768px) {
  .ai5d-auth__principal { justify-content: center; padding-top: 64px; padding-bottom: 64px; }
  .ai5d-auth__contenu { display: block; flex: none; }
}

@media (min-width: ${BASCULE_DEUX_COLONNES}px) {
  .ai5d-auth__principal { padding-left: 48px; padding-right: 48px; }
  .ai5d-auth__colonne { flex: none; }
  .ai5d-auth__marque-mobile { display: none; }
  .ai5d-auth__panneau {
    display: flex; flex-direction: column; justify-content: space-between;
    flex-shrink: 0; width: ${PART_PANNEAU}; max-width: ${LARGEUR_MAX_PANNEAU}px;
    padding: 64px; background: var(--encre); color: var(--blanc);
  }
}
`;

export function GabaritAuth({
  produit,
  phrase,
  children,
  className,
  style,
}: ProprietesGabaritAuth) {
  const classes = className ? `ai5d-auth ${className}` : 'ai5d-auth';

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_GABARIT }} />

      <div className={classes} style={style} data-gabarit="auth">
        {/*
          `min-width: 0` sur la colonne principale n'est pas décoratif : sans lui, une
          colonne flexible refuse de descendre sous la largeur intrinsèque de son contenu
          et pousse le panneau hors de l'écran au lieu de se réduire. C'est la cause exacte
          du débordement mesuré à 768 px.
        */}
        <main className="ai5d-auth__principal">
          <div className="ai5d-auth__colonne">
            {/*
              Le logotype mobile est en 20 px, et non 18 : à 18 px le verrouillage complet
              mesurait 19 px de haut, sous le plancher de 28 px de la charte — il se voyait
              mal, et c'était la cause. On ne monte pas plus haut non plus : à 30 px, la
              signature réclame 250 px de large et se casserait en deux lignes à 320 px.
            */}
            <div className="ai5d-auth__marque-mobile">
              <Logotype produit={produit} taille={20} />
            </div>

            <div className="ai5d-auth__contenu">{children}</div>
          </div>
        </main>

        {/*
          Le panneau est décoratif : il ne porte aucune information que la colonne de
          gauche n'ait déjà. `aria-hidden` évite de le faire lire deux fois.
        */}
        <aside className="ai5d-auth__panneau" aria-hidden="true">
          <Logotype produit={produit} variante="blanc" taille={26} />

          {phrase ? (
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--police-titre)',
                fontSize: 'var(--taille-2xl)',
                fontWeight: 'var(--graisse-legere)',
                lineHeight: 'var(--interligne-titre)',
                letterSpacing: 'var(--lettrage-titre)',
                textWrap: 'balance',
                color: 'var(--blanc)',
              }}
            >
              {phrase}
            </p>
          ) : null}
        </aside>
      </div>
    </>
  );
}
