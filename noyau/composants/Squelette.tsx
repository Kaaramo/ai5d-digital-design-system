import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

/**
 * UN BLOC D ATTENTE A LA FORME DE CE QUI ARRIVE.
 *
 * Jamais un rond qui tourne au centre d une page vide : sur une liaison qui hesite, un squelette
 * dit « ca arrive, et voila ce qui arrive », la ou un rond dit seulement « attendez ». La personne
 * commence a lire la page avant qu elle n arrive, et son clic a visiblement ete pris.
 *
 * ── LA TEINTE EST CELLE DE LA BORDURE, ET C EST UNE MESURE ──────────────────
 * En theme clair, `--surface-2` et `--surface-3` valent tous deux le blanc : un squelette pose sur
 * une carte y serait ENTIEREMENT invisible, et la page paraitrait vide au lieu de paraitre en train
 * d arriver. `--bordure` est la seule valeur qui contraste avec les trois surfaces, dans les deux
 * themes : c est exactement ce a quoi elle sert, marquer une separation sur n importe quel fond.
 * Defaut paye une fois par l Academie ; on ne le repaie pas ici.
 *
 * ── IL NE DIT RIEN, C EST LA ZONE QUI PARLE ─────────────────────────────────
 * Chaque bloc est `aria-hidden`. Un lecteur d ecran qui annoncerait trente rectangles serait pire
 * que le silence. `ZoneEnChargement` annonce une fois, pour tout l ecran.
 *
 * ── LES FORMES SONT ICI, LES PAGES SONT AILLEURS ────────────────────────────
 * Le systeme donne six formes ; le produit les compose page par page, parce que lui seul connait
 * la structure de ses ecrans. Un squelette qui promet une forme que le contenu ne prendra pas est
 * un defaut, pas une approximation.
 */

const ID_STYLE = 'ai5d-squelette';

const STYLE_SQUELETTE = `
.ai5d-squelette {
  display: block;
  background: var(--bordure);
  animation: ai5d-squelette-pulsation 1600ms var(--courbe-sortie) infinite;
}
@keyframes ai5d-squelette-pulsation {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.ai5d-squelette-tableau--compact { display: flex; }
.ai5d-squelette-tableau--large { display: none; }
@media (min-width: 1024px) {
  .ai5d-squelette-tableau--compact { display: none; }
  .ai5d-squelette-tableau--large { display: flex; }
}
@media (prefers-reduced-motion: reduce) {
  .ai5d-squelette { animation: none; }
}
`;

const RAYONS = {
  sm: 'var(--rayon-sm)',
  md: 'var(--rayon-md)',
  lg: 'var(--rayon-lg)',
  plein: 'var(--rayon-plein)',
} as const;

export interface ProprietesSquelette extends HTMLAttributes<HTMLSpanElement> {
  /** Hauteur CSS du bloc. */
  hauteur?: string;
  /** Largeur CSS du bloc. */
  largeur?: string;
  /** Le rayon, comme partout ailleurs dans le systeme. `plein` donne un rond. */
  rayon?: keyof typeof RAYONS;
}

export function Squelette({
  hauteur = '1rem',
  largeur = '100%',
  rayon = 'sm',
  className,
  style,
  ...reste
}: ProprietesSquelette) {
  const styleBloc: CSSProperties = {
    height: hauteur,
    width: largeur,
    flexShrink: 0,
    borderRadius: RAYONS[rayon],
    ...style,
  };

  return (
    <>
      <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_SQUELETTE }} />
      <span
        aria-hidden="true"
        className={className === undefined ? 'ai5d-squelette' : `ai5d-squelette ${className}`}
        style={styleBloc}
        {...reste}
      />
    </>
  );
}

/**
 * L enveloppe accessible : un chargement s annonce aussi a qui ne le voit pas.
 *
 * UNE SEULE PAR ECRAN. Trois zones sur la meme page feraient annoncer trois fois le meme
 * chargement, ce qui est plus penible que de n en annoncer aucun.
 */
export function ZoneEnChargement({
  libelle = 'Chargement en cours',
  children,
}: {
  libelle?: string;
  children: ReactNode;
}) {
  const styleLecteur: CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  };

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span style={styleLecteur}>{libelle}</span>
      {children}
    </div>
  );
}

/** La colonne verticale que toutes les formes emploient. */
function colonne(ecart: string): CSSProperties {
  return { display: 'flex', flexDirection: 'column', gap: ecart };
}

/**
 * L en-tete d une rubrique : une intention courte, puis un titre long.
 *
 * L ordre compte : l inverse donnerait l impression d un titre suivi d un sous-titre, alors que
 * les rubriques du systeme annoncent d abord a quoi sert la page.
 */
export function SqueletteEnTete() {
  return (
    <div style={colonne('var(--espace-3)')} data-forme="en-tete">
      <Squelette hauteur="0.75rem" largeur="6rem" />
      <Squelette hauteur="2rem" largeur="14rem" />
    </div>
  );
}

/** Une grille de cartes : vignette, surtitre, titre, description. */
export function SqueletteCartes({ nombre = 6 }: { nombre?: number }) {
  const grille: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
    gap: 'var(--espace-6)',
  };

  return (
    <div style={grille} data-forme="cartes">
      {Array.from({ length: nombre }, (_, i) => (
        <div key={i} style={colonne('var(--espace-3)')}>
          <Squelette hauteur="0" rayon="md" style={{ aspectRatio: '16 / 10', height: 'auto' }} />
          <Squelette hauteur="0.75rem" largeur="5rem" />
          <Squelette hauteur="1.25rem" largeur="80%" />
          <Squelette hauteur="0.75rem" />
        </div>
      ))}
    </div>
  );
}

/**
 * Un tableau, et sa forme de telephone.
 *
 * `avecCartesMobile` existe parce que plusieurs registres de la console ne sont PAS des tableaux
 * sous 1024 px : ils rendent une liste de cartes. Un squelette qui resterait un tableau a ce
 * palier promettrait une forme que le contenu ne prend jamais. Faux par defaut : les tableaux qui
 * ne changent pas de forme n en ont rien a faire.
 *
 * La premiere colonne est deux fois plus large : c est presque toujours un nom, et un tableau dont
 * toutes les colonnes font la meme largeur ne ressemble a aucun tableau reel.
 */
export function SqueletteTableau({
  lignes = 5,
  colonnes = 4,
  avecCartesMobile = false,
}: {
  lignes?: number;
  colonnes?: number;
  avecCartesMobile?: boolean;
}) {
  const cadre: CSSProperties = {
    flexDirection: 'column',
    border: '1px solid var(--bordure)',
    borderRadius: 'var(--rayon-md)',
  };
  const ligne: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--espace-4)',
    padding: 'var(--espace-4)',
    borderBottom: '1px solid var(--bordure)',
  };

  const tableau = (
    <div
      className={avecCartesMobile ? 'ai5d-squelette-tableau--large' : undefined}
      style={avecCartesMobile ? cadre : { display: 'flex', ...cadre }}
      data-forme="tableau"
    >
      {Array.from({ length: lignes }, (_, l) => (
        <div key={l} style={l === lignes - 1 ? { ...ligne, borderBottom: 'none' } : ligne}>
          {Array.from({ length: colonnes }, (_, c) => (
            <Squelette
              key={c}
              hauteur="1rem"
              largeur="auto"
              style={{ flexGrow: c === 0 ? 2 : 1, flexBasis: 0, flexShrink: 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  if (!avecCartesMobile) return tableau;

  return (
    <>
      <div className="ai5d-squelette-tableau--compact" style={cadre} data-forme="tableau-compact">
        {Array.from({ length: lignes }, (_, l) => (
          <div
            key={l}
            style={{
              ...colonne('var(--espace-2)'),
              padding: 'var(--espace-4)',
              borderBottom: l === lignes - 1 ? 'none' : '1px solid var(--bordure)',
            }}
          >
            <Squelette hauteur="1rem" largeur="66%" />
            <Squelette hauteur="0.75rem" largeur="33%" />
            <Squelette hauteur="0.75rem" largeur="50%" />
          </div>
        ))}
      </div>
      {tableau}
    </>
  );
}

/**
 * Une liste encadree.
 *
 * `avecAvatar` est vrai par defaut parce que la forme la plus frequente est un registre de
 * personnes. Sur une liste de libelles ou de modules, le rond de tete promettrait un visage que le
 * contenu ne montre pas.
 */
export function SqueletteListe({
  lignes = 5,
  avecAvatar = true,
}: {
  lignes?: number;
  avecAvatar?: boolean;
}) {
  return (
    <div style={colonne('var(--espace-3)')} data-forme="liste">
      {Array.from({ length: lignes }, (_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--espace-4)',
            padding: 'var(--espace-4)',
            border: '1px solid var(--bordure)',
            borderRadius: 'var(--rayon-md)',
          }}
        >
          {avecAvatar ? <Squelette hauteur="2.5rem" largeur="2.5rem" rayon="plein" /> : null}
          <div style={{ ...colonne('var(--espace-2)'), flex: 1, minWidth: 0 }}>
            <Squelette hauteur="1rem" largeur="33%" />
            <Squelette hauteur="0.75rem" largeur="66%" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Les tuiles d indicateurs d un tableau de bord.
 *
 * La disposition arrive en propriete : deux colonnes sur telephone puis quatre chez un dirigeant,
 * trois d emblee en console. Une valeur par defaut qui ne correspondrait a aucun des deux ferait
 * toujours sauter l un des ecrans.
 */
export function SqueletteIndicateurs({
  nombre = 4,
  colonnes = 'repeat(2, 1fr)',
  colonnesLarges = 'repeat(4, 1fr)',
}: {
  nombre?: number;
  colonnes?: string;
  colonnesLarges?: string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: colonnes,
        gap: 'var(--espace-4)',
      }}
      data-forme="indicateurs"
      data-colonnes-larges={colonnesLarges}
    >
      {Array.from({ length: nombre }, (_, i) => (
        <Squelette key={i} hauteur="5rem" rayon="md" />
      ))}
    </div>
  );
}

/** Une etiquette courte, un champ pleine largeur, et un bouton a la fin. */
export function SqueletteFormulaire({ champs = 3 }: { champs?: number }) {
  return (
    <div style={colonne('var(--espace-6)')} data-forme="formulaire">
      {Array.from({ length: champs }, (_, i) => (
        <div key={i} style={colonne('var(--espace-2)')}>
          <Squelette hauteur="0.75rem" largeur="8rem" />
          <Squelette hauteur="var(--hauteur-controle)" rayon="md" />
        </div>
      ))}
      <Squelette hauteur="var(--hauteur-controle)" largeur="10rem" rayon="md" />
    </div>
  );
}
