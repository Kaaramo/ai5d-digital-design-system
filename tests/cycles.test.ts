import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { declarationsAutoReferentes } from '../gardes';

/**
 * AUCUNE PROPRIETE NE SE LIT ELLE-MEME.
 *
 * Premiere des trois preuves du correctif du plancher tactile (SPEC 1.2.0, §5.1.4, decision 005). De la
 * 0.1.0 a la 1.1.0, `densites/profils.css` ecrivait `--hauteur-controle: max(var(--hauteur-controle),
 * 44px)` : une propriete personnalisee qui depend d elle-meme est invalide au calcul, et sur tout ecran
 * tactile la hauteur tombait a celle du contenu. jsdom ne calcule rien : seule la forme peut se lire
 * ici, et elle se lit dans TOUTES les feuilles du systeme, les feuilles injectees comprises.
 */

const FEUILLES = [
  'noyau/jetons.css',
  'noyau/paliers.css',
  'densites/profils.css',
  'noyau/ai5d.preset.css',
];

/** Le texte des constantes `STYLE_…` des composants et des modules du noyau. */
function feuillesInjectees(): Array<{ nom: string; fichier: string; css: string }> {
  const dossier = 'noyau/composants';
  return readdirSync(dossier)
    .filter((fichier) => /\.tsx?$/.test(fichier))
    .flatMap((fichier) => {
      const source = readFileSync(`${dossier}/${fichier}`, 'utf8');
      return [...source.matchAll(/const (STYLE_[A-Z_]+) = `([\s\S]*?)`;/g)].map((m) => ({
        nom: `${fichier} · ${m[1] ?? ''}`,
        fichier,
        css: m[2] ?? '',
      }));
    });
}

const INJECTEES = feuillesInjectees();

describe('aucune declaration ne lit sa propre propriete', () => {
  for (const chemin of FEUILLES) {
    it(chemin, () => {
      const trouvees = declarationsAutoReferentes(readFileSync(chemin, 'utf8'));
      expect(
        trouvees,
        trouvees.map((t) => `${chemin}:${t.ligne}  ${t.extrait}`).join('\n'),
      ).toEqual([]);
    });
  }

  it('lit bien les feuilles injectees des composants', () => {
    // Seize en 1.1.0, cinq de plus en 1.2.0. Si le motif cessait d en trouver, les tests suivants
    // passeraient a vide.
    expect(INJECTEES.length).toBeGreaterThanOrEqual(21);
  });

  for (const { nom, css } of INJECTEES) {
    it(nom, () => {
      expect(declarationsAutoReferentes(css)).toEqual([]);
    });
  }
});

describe('le temoin : la forme de la 1.1.0 est relevee', () => {
  it('releve les deux declarations fautives, a leur vraie ligne', () => {
    const trouvees = declarationsAutoReferentes(
      readFileSync('tests/instantanes/profils-1.1.0.css', 'utf8'),
    );
    expect(trouvees.map(({ propriete, ligne }) => [propriete, ligne])).toEqual([
      ['--hauteur-controle', 79],
      ['--ligne-liste', 80],
    ]);
  });

  it('releve aussi la forme avec valeur de repli', () => {
    expect(declarationsAutoReferentes(':root {\n  --x: var(--x, 4px);\n}\n')).toEqual([
      { propriete: '--x', ligne: 2, extrait: '--x: var(--x, 4px);' },
    ]);
  });

  it('ne prend pas une source voisine pour la propriete elle-meme', () => {
    expect(
      declarationsAutoReferentes(
        ':root {\n  --hauteur-controle: var(--hauteur-controle-profil);\n}\n',
      ),
    ).toEqual([]);
  });

  it('ne lit pas les commentaires, et garde les numeros de ligne', () => {
    const css =
      '/* ancienne forme :\n   --x: max(var(--x), 44px);\n*/\n:root {\n  --y: var(--y);\n}\n';
    expect(declarationsAutoReferentes(css)).toEqual([
      { propriete: '--y', ligne: 5, extrait: '--y: var(--y);' },
    ]);
  });
});

describe('toute feuille qui anime respecte le mouvement reduit (SPEC 1.2.0, §5.0.2, regle 4)', () => {
  const parFichier = new Map<string, string>();
  for (const { fichier, css } of INJECTEES) {
    parFichier.set(fichier, `${parFichier.get(fichier) ?? ''}\n${css}`);
  }

  for (const [fichier, css] of parFichier) {
    if (!css.includes('@keyframes')) continue;
    it(fichier, () => {
      expect(css, `${fichier} anime sans respecter prefers-reduced-motion`).toContain(
        '@media (prefers-reduced-motion: reduce)',
      );
    });
  }
});
