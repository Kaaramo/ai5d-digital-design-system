import { ChevronDown } from 'lucide-react';
import type { Section } from './document';
import { Icone } from './Icone';

/**
 * La liste des ancres d un document.
 *
 * ── IL A ETE VIDE SUR ORDINATEUR, DANS COMPTE ───────────────────────────────
 * Le sommaire etait un `<details>` ferme, et la feuille masquait son `summary` au-dessus de
 * 1024 px en croyant l ouvrir. Masquer le `summary` n ouvre pas un `<details>` : son contenu
 * reste replie. La colonne de gauche etait donc vide, sur l ecran ou elle devait servir le plus.
 *
 * Il suit desormais la meme regle que les sections : ferme dans le HTML, rendu visible
 * au-dessus de 1024 px par `::details-content`, ouvert pour de bon par `DeplierDocument`.
 *
 * ── AUCUNE DETECTION DE LA SECTION COURANTE ─────────────────────────────────
 * Elle demanderait un observateur d intersection, pour un confort mineur sur une page qu on
 * parcourt une fois.
 *
 * ── REPLIE SUR TELEPHONE ────────────────────────────────────────────────────
 * Quinze entrees posees au-dessus du texte reculeraient la premiere section hors de l ecran.
 * Replie, il tient dans un cadre d une ligne.
 */
export function SommaireDocument({ sections }: { sections: readonly Section[] }) {
  return (
    <details className="ai5d-sommaire-document" data-depliable>
      <summary className="ai5d-titre-sommaire">
        <span
          style={{
            fontSize: 'var(--taille-xs)',
            fontWeight: 'var(--graisse-semi)',
            letterSpacing: 'var(--lettrage-overline)',
            textTransform: 'uppercase',
            color: 'var(--action)',
          }}
        >
          Sommaire
        </span>
        <span className="ai5d-chevron-section" aria-hidden="true">
          <Icone nom={ChevronDown} taille={20} />
        </span>
      </summary>

      <nav aria-label="Sommaire du document">
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {sections.map((section) => (
            <li key={section.id} style={{ marginBottom: 'var(--espace-3)' }}>
              <a
                href={`#${section.id}`}
                className="ai5d-entree-sommaire"
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'var(--espace-3)',
                  fontSize: 'var(--taille-sm)',
                  lineHeight: 'var(--interligne-corps)',
                  color: 'var(--texte)',
                  textDecoration: 'none',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    minWidth: '1.5em',
                    fontSize: 'var(--taille-xs)',
                    color: 'var(--texte-faible)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {section.numero}
                </span>
                <span>{section.titre}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
