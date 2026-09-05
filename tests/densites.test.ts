import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { lireJetons } from '../outils/jetons';

const CHEMIN = 'densites/profils.css';
const brut = readFileSync(CHEMIN, 'utf8');

const PROFILS = ['aere', 'equilibre', 'modere', 'compact'] as const;

const VARIABLES = [
  '--rythme-section',
  '--padding-carte',
  '--hauteur-controle',
  '--ligne-liste',
  '--interligne-corps',
  '--contenu-max',
] as const;

/** Le tableau de la spec, section 6.1, recopie sans interpretation. */
const ATTENDU: Record<string, Record<string, string>> = {
  aere: {
    '--rythme-section': '64px',
    '--padding-carte': '32px',
    '--hauteur-controle': '48px',
    '--ligne-liste': '64px',
    '--interligne-corps': '1.6',
    '--contenu-max': '1120px',
  },
  equilibre: {
    '--rythme-section': '48px',
    '--padding-carte': '24px',
    '--hauteur-controle': '48px',
    '--ligne-liste': '56px',
    '--interligne-corps': '1.55',
    '--contenu-max': '1120px',
  },
  modere: {
    '--rythme-section': '40px',
    '--padding-carte': '20px',
    '--hauteur-controle': '44px',
    '--ligne-liste': '48px',
    '--interligne-corps': '1.5',
    '--contenu-max': '1280px',
  },
  compact: {
    '--rythme-section': '32px',
    '--padding-carte': '16px',
    '--hauteur-controle': '40px',
    '--ligne-liste': '40px',
    '--interligne-corps': '1.45',
    '--contenu-max': '100%',
  },
};

describe('profils de densite', () => {
  for (const profil of PROFILS) {
    it(`le profil ${profil} declare les six variables aux valeurs de la spec`, () => {
      const jetons = lireJetons(CHEMIN, `[data-densite='${profil}']`);
      for (const variable of VARIABLES) {
        expect(jetons.get(variable), `${profil} : ${variable} manquant ou faux`).toBe(
          ATTENDU[profil]?.[variable],
        );
      }
    });
  }

  it('le profil aere sert aussi de defaut sur :root', () => {
    const racine = lireJetons(CHEMIN, ':root');
    for (const variable of VARIABLES) {
      expect(racine.get(variable), `${variable} absent du defaut`).toBe(
        ATTENDU['aere']?.[variable],
      );
    }
  });

  it('ordonne les quatre profils du plus aere au plus compact', () => {
    const enPixels = (profil: string, variable: string) =>
      Number.parseInt(ATTENDU[profil]?.[variable] ?? '0', 10);
    for (const variable of ['--rythme-section', '--padding-carte', '--ligne-liste']) {
      const valeurs = PROFILS.map((profil) => enPixels(profil, variable));
      const trie = [...valeurs].sort((a, b) => b - a);
      expect(valeurs, `${variable} ne decroit pas d'un profil au suivant`).toEqual(trie);
    }
  });
});

describe('regle 1 - la densite ne touche ni au texte ni aux couleurs', () => {
  it('ne contient aucune couleur', () => {
    expect(brut).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
    expect(brut).not.toMatch(/\brgba?\(/);
    expect(brut).not.toMatch(/\bhsla?\(/);
  });

  it('ne contient ni famille ni taille de police', () => {
    expect(brut).not.toMatch(/font-family/);
    expect(brut).not.toMatch(/font-size/);
    expect(brut).not.toMatch(/--taille-/);
    expect(brut).not.toMatch(/--police-/);
  });

  it('ne declare que les six variables autorisees', () => {
    const declarees = new Set(
      [...brut.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(
        (correspondance) => correspondance[1] as string,
      ),
    );
    for (const declaree of declarees) {
      expect(
        VARIABLES as readonly string[],
        `${declaree} n'a rien a faire dans ce fichier`,
      ).toContain(declaree);
    }
  });

  it('declare bien les six, et pas moins', () => {
    const declarees = new Set(
      [...brut.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(
        (correspondance) => correspondance[1] as string,
      ),
    );
    for (const variable of VARIABLES) {
      expect(declarees, `${variable} absent du fichier`).toContain(variable);
    }
  });
});

describe('regle 2 - le plancher tactile (contrainte C4)', () => {
  const blocTactile = /@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/.exec(brut)?.[1] ?? '';

  it("s'exprime en requete media, une seule fois, et non ecran par ecran", () => {
    expect(brut).toContain('@media (pointer: coarse)');
    expect((brut.match(/@media \(pointer: coarse\)/g) ?? []).length).toBe(1);
  });

  it('releve la hauteur de controle et la ligne de liste a 44 px au minimum', () => {
    expect(blocTactile).toContain('max(var(--hauteur-controle), 44px)');
    expect(blocTactile).toContain('max(var(--ligne-liste), 44px)');
  });

  it('couvre tous les profils, y compris ceux a ajouter plus tard', () => {
    expect(blocTactile, 'le selecteur generique [data-densite] est absent').toContain(
      '[data-densite]',
    );
    expect(blocTactile).toContain(':root');
  });

  it('protege le seul profil qui descend sous le plancher', () => {
    const compact = Number.parseInt(ATTENDU['compact']?.['--hauteur-controle'] ?? '0', 10);
    expect(
      compact,
      'le profil compact ne descend plus sous 44 px : la garde est-elle utile ?',
    ).toBeLessThan(44);
  });

  it("n'est pas contredit par un profil declare apres lui", () => {
    const positionMedia = brut.indexOf('@media (pointer: coarse)');
    const dernierProfil = brut.lastIndexOf("[data-densite='");
    expect(
      dernierProfil,
      'un profil est declare apres le plancher et le remplacerait',
    ).toBeLessThan(positionMedia);
  });
});
