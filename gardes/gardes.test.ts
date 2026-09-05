import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  decrire,
  JETONS_DE_MARQUE,
  PLANCHER_LARGEUR,
  PLANCHER_TACTILE,
  verifierAucuneCouleurEnDur,
  verifierAucuneLargeurFixe,
  verifierAucunJetonDeMarqueRedefini,
  verifierHauteurDeVueDynamique,
  verifierPlancherTactile,
} from './index';

/**
 * Les gardes s'appliquent d'abord au depot lui-meme : un systeme qui ne respecte pas
 * ses propres regles ne peut pas les imposer a ses consommateurs.
 *
 * Les fichiers qui DEFINISSENT les jetons sont les seules exceptions legitimes, et
 * elles sont enumerees ici plutot que devinees.
 */
const EXCEPTIONS_DU_DEPOT = [
  'noyau/marque.css',
  'noyau/jetons.css',
  'noyau/ai5d.preset.css',
  'noyau/polices',
  'tests',
  'gardes',
  '_build',
  'specimens',
  'docs',
];

function depotTemporaire(): string {
  return mkdtempSync(join(tmpdir(), 'ai5d-gardes-'));
}

describe('garde 1 - aucune couleur en dur', () => {
  it('ne releve aucune infraction dans le depot lui-meme', () => {
    const infractions = verifierAucuneCouleurEnDur('.', { exceptions: EXCEPTIONS_DU_DEPOT });
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('releve un hexadecimal ecrit dans un composant', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'Ecran.tsx'), "const c = '#2251FF';\n");
    const infractions = verifierAucuneCouleurEnDur(racine);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.regle).toBe('aucune-couleur-en-dur');
    expect(infractions[0]?.ligne).toBe(1);
  });

  it('releve rgba autant qu un hexadecimal', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'styles.css'), '.a { color: rgba(5, 28, 44, 0.6); }\n');
    expect(verifierAucuneCouleurEnDur(racine)).toHaveLength(1);
  });

  it('laisse passer les commentaires, qui ont le droit de citer une valeur ecartee', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'note.ts'),
      "// L'ancienne valeur #6B7A85 echouait a 4,14.\nconst a = 'var(--texte-faible)';\n",
    );
    expect(verifierAucuneCouleurEnDur(racine)).toHaveLength(0);
  });

  it('honore les exceptions, dossier compris', () => {
    const racine = depotTemporaire();
    mkdirSync(join(racine, 'jetons'));
    writeFileSync(join(racine, 'jetons', 'base.css'), ':root { --a: #FAF7F2; }\n');
    expect(verifierAucuneCouleurEnDur(racine)).toHaveLength(1);
    expect(verifierAucuneCouleurEnDur(racine, { exceptions: ['jetons'] })).toHaveLength(0);
  });

  it('ignore node_modules sans qu on ait a le demander', () => {
    const racine = depotTemporaire();
    mkdirSync(join(racine, 'node_modules'));
    writeFileSync(join(racine, 'node_modules', 'x.css'), '.a { color: #FFF; }\n');
    expect(verifierAucuneCouleurEnDur(racine)).toHaveLength(0);
  });
});

describe('garde 2 - aucun jeton de marque redefini', () => {
  it('ne releve aucune infraction dans le depot, hors marque.css', () => {
    const infractions = verifierAucunJetonDeMarqueRedefini('.', {
      exceptions: ['noyau/marque.css', 'gardes', 'tests', 'docs', 'node_modules'],
    });
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('releve la redefinition de chacun des six jetons', () => {
    for (const jeton of JETONS_DE_MARQUE) {
      const racine = depotTemporaire();
      writeFileSync(join(racine, 'produit.css'), `:root {\n  ${jeton}: #123456;\n}\n`);
      const infractions = verifierAucunJetonDeMarqueRedefini(racine);
      expect(infractions.length, `${jeton} non detecte`).toBe(1);
      expect(infractions[0]?.regle).toBe('aucun-jeton-de-marque-redefini');
    }
  });

  it('laisse passer une simple lecture du jeton', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'produit.css'), ':root { --action: var(--marque-action); }\n');
    expect(verifierAucunJetonDeMarqueRedefini(racine)).toHaveLength(0);
  });
});

describe('garde 3 - plancher tactile', () => {
  it('valide le fichier de profils du depot', () => {
    const infractions = verifierPlancherTactile('densites/profils.css');
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('releve une requete media absente', () => {
    const racine = depotTemporaire();
    const chemin = join(racine, 'profils.css');
    writeFileSync(chemin, "[data-densite='compact'] { --hauteur-controle: 40px; }\n");
    const infractions = verifierPlancherTactile(chemin);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.extrait).toContain('absente');
  });

  it('releve une variable oubliee dans la requete', () => {
    const racine = depotTemporaire();
    const chemin = join(racine, 'profils.css');
    writeFileSync(
      chemin,
      '@media (pointer: coarse) {\n  :root { --hauteur-controle: max(var(--hauteur-controle), 44px); }\n}\n',
    );
    const infractions = verifierPlancherTactile(chemin);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.extrait).toContain('--ligne-liste');
  });

  it('fixe le plancher a 44 px, valeur non negociable', () => {
    expect(PLANCHER_TACTILE).toBe(44);
  });
});

describe('garde 4 - aucune largeur fixe', () => {
  it('ne releve aucune infraction dans le depot lui-meme', () => {
    const infractions = verifierAucuneLargeurFixe('.', { exceptions: EXCEPTIONS_DU_DEPOT });
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('accepte max-width et min-width, qui sont la solution et non le probleme', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'ecran.css'),
      '.a { max-width: 440px; }\n.b { min-width: 600px; }\n.c { maxWidth: 900px; }\n',
    );
    expect(verifierAucuneLargeurFixe(racine)).toHaveLength(0);
  });

  it('refuse une largeur figee au-dela du plancher', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '.panneau { width: 440px; }\n');
    const infractions = verifierAucuneLargeurFixe(racine);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.regle).toBe('aucune-largeur-fixe');
  });

  it('tolere une largeur figee sous le plancher : une pastille, une icone, un avatar', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '.pastille { width: 48px; }\n');
    expect(verifierAucuneLargeurFixe(racine)).toHaveLength(0);
  });

  it('voit la meme faute ecrite en style en ligne', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'Ecran.tsx'), "const s = { width: '600px' };\n");
    expect(verifierAucuneLargeurFixe(racine)).toHaveLength(1);
  });

  it('laisse passer les pourcentages et les unites souples', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'ecran.css'),
      '.a { width: 100%; }\n.b { width: 45vw; }\n.c { width: auto; }\n',
    );
    expect(verifierAucuneLargeurFixe(racine)).toHaveLength(0);
  });

  it('laisse passer les commentaires, qui ont le droit de citer la faute', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '/* jamais width: 900px ici */\n.a { color: red; }\n');
    expect(verifierAucuneLargeurFixe(racine)).toHaveLength(0);
  });

  it('fixe le plancher a 320 px', () => {
    expect(PLANCHER_LARGEUR).toBe(320);
  });
});

describe('garde 5 - hauteur de vue dynamique', () => {
  it('ne releve aucune infraction dans le depot lui-meme', () => {
    const infractions = verifierHauteurDeVueDynamique('.', { exceptions: EXCEPTIONS_DU_DEPOT });
    expect(infractions.length, `\n${decrire(infractions)}`).toBe(0);
  });

  it('refuse 100vh', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '.page { min-height: 100vh; }\n');
    const infractions = verifierHauteurDeVueDynamique(racine);
    expect(infractions).toHaveLength(1);
    expect(infractions[0]?.regle).toBe('hauteur-de-vue-dynamique');
  });

  it('accepte dvh, svh et lvh', () => {
    const racine = depotTemporaire();
    writeFileSync(
      join(racine, 'ecran.css'),
      '.a { height: 100dvh; }\n.b { height: 50svh; }\n.c { height: 80lvh; }\n',
    );
    expect(verifierHauteurDeVueDynamique(racine)).toHaveLength(0);
  });

  it('voit vh a l interieur d un calc', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '.a { height: calc(100vh - 56px); }\n');
    expect(verifierHauteurDeVueDynamique(racine)).toHaveLength(1);
  });

  it('ne confond pas vh avec vw ou vmin', () => {
    const racine = depotTemporaire();
    writeFileSync(join(racine, 'ecran.css'), '.a { width: 50vw; }\n.b { font-size: 4vmin; }\n');
    expect(verifierHauteurDeVueDynamique(racine)).toHaveLength(0);
  });
});

describe('mise en forme', () => {
  it('dit clairement quand il n y a rien', () => {
    expect(decrire([])).toBe('Aucune infraction.');
  });

  it('nomme la regle, le fichier et la ligne', () => {
    const texte = decrire([
      { fichier: 'a.css', ligne: 12, extrait: 'color: #FFF', regle: 'aucune-couleur-en-dur' },
    ]);
    expect(texte).toContain('aucune-couleur-en-dur');
    expect(texte).toContain('a.css:12');
  });
});
