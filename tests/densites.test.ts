import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { decouperBlocs, lireJetons } from '../outils/jetons';
import { INVALIDE, PROFILS, valeursEffectives, type Pointeur, type Profil } from './aides/densite';

const CHEMIN = 'densites/profils.css';
const brut = readFileSync(CHEMIN, 'utf8');
const blocs = decouperBlocs(brut);

/** Les six variables que lisent les composants. Nom et valeur déclarée inchangés depuis la 0.1.0. */
const VARIABLES = [
  '--rythme-section',
  '--padding-carte',
  '--hauteur-controle',
  '--ligne-liste',
  '--interligne-corps',
  '--contenu-max',
] as const;

/** Ce que chaque profil déclare lui-même depuis la 1.2.0 : quatre variables et deux sources. */
const DECLAREES_PAR_PROFIL = [
  '--rythme-section',
  '--padding-carte',
  '--hauteur-controle-profil',
  '--ligne-liste-profil',
  '--interligne-corps',
  '--contenu-max',
] as const;

/** Les huit propriétés du fichier : les six que lisent les composants, et les deux sources. */
const AUTORISEES: readonly string[] = [
  ...VARIABLES,
  '--hauteur-controle-profil',
  '--ligne-liste-profil',
];

/** Le tableau de la spec fondatrice, section 6.1, recopié sans interprétation : la valeur à la souris. */
const ATTENDU: Record<Profil, Record<(typeof VARIABLES)[number], string>> = {
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

/** SPEC 1.2.0, §5.1.2 : la valeur effective au doigt, relevée au plancher de 44 px. */
const AU_DOIGT: Record<Profil, { '--hauteur-controle': string; '--ligne-liste': string }> = {
  aere: { '--hauteur-controle': '48px', '--ligne-liste': '64px' },
  equilibre: { '--hauteur-controle': '48px', '--ligne-liste': '56px' },
  modere: { '--hauteur-controle': '44px', '--ligne-liste': '48px' },
  compact: { '--hauteur-controle': '44px', '--ligne-liste': '44px' },
};

const INCHANGEES_AU_DOIGT = [
  '--rythme-section',
  '--padding-carte',
  '--interligne-corps',
  '--contenu-max',
] as const;

/** La source de chaque hauteur porte la valeur de la spec : seule la forme a changé. */
function sourceAttendue(profil: Profil, nom: (typeof DECLAREES_PAR_PROFIL)[number]): string {
  if (nom === '--hauteur-controle-profil') return ATTENDU[profil]['--hauteur-controle'];
  if (nom === '--ligne-liste-profil') return ATTENDU[profil]['--ligne-liste'];
  return ATTENDU[profil][nom];
}

describe('profils de densite', () => {
  for (const profil of PROFILS) {
    it(`le profil ${profil} declare ses quatre variables et ses deux sources aux valeurs de la spec`, () => {
      const jetons = lireJetons(CHEMIN, `[data-densite='${profil}']`);
      for (const nom of DECLAREES_PAR_PROFIL) {
        expect(jetons.get(nom), `${profil} : ${nom} manquant ou faux`).toBe(
          sourceAttendue(profil, nom),
        );
      }
    });
  }

  it('le profil aere sert aussi de defaut sur :root', () => {
    const racine = lireJetons(CHEMIN, ':root');
    for (const nom of DECLAREES_PAR_PROFIL) {
      expect(racine.get(nom), `${nom} absent du defaut`).toBe(sourceAttendue('aere', nom));
    }
  });

  it('ordonne les quatre profils du plus aere au plus compact', () => {
    for (const variable of ['--rythme-section', '--padding-carte', '--ligne-liste'] as const) {
      const valeurs = PROFILS.map((profil) => Number.parseInt(ATTENDU[profil][variable], 10));
      const trie = [...valeurs].sort((a, b) => b - a);
      expect(valeurs, `${variable} ne decroit pas d'un profil au suivant`).toEqual(trie);
    }
  });
});

describe('les valeurs effectives, calculees comme le navigateur (SPEC 1.2.0, §5.1.2)', () => {
  for (const profil of PROFILS) {
    it(`${profil}, a la souris : les six valeurs de la spec`, () => {
      const valeurs = valeursEffectives(blocs, profil, 'souris');
      for (const variable of VARIABLES) {
        expect(valeurs.get(variable), variable).toBe(ATTENDU[profil][variable]);
      }
    });

    it(`${profil}, au doigt : les hauteurs relevees au plancher, le reste inchange`, () => {
      const valeurs = valeursEffectives(blocs, profil, 'doigt');
      expect(valeurs.get('--hauteur-controle')).toBe(AU_DOIGT[profil]['--hauteur-controle']);
      expect(valeurs.get('--ligne-liste')).toBe(AU_DOIGT[profil]['--ligne-liste']);
      for (const variable of INCHANGEES_AU_DOIGT) {
        expect(valeurs.get(variable), variable).toBe(ATTENDU[profil][variable]);
      }
    });
  }

  it('sans profil, la racine prend le profil aere, a la souris comme au doigt', () => {
    const souris = valeursEffectives(blocs, null, 'souris');
    const doigt = valeursEffectives(blocs, null, 'doigt');
    for (const variable of VARIABLES) {
      expect(souris.get(variable), variable).toBe(ATTENDU.aere[variable]);
    }
    expect(doigt.get('--hauteur-controle')).toBe('48px');
    expect(doigt.get('--ligne-liste')).toBe('64px');
  });

  it('aucune valeur ne se resout en invalide, nulle part', () => {
    const pointeurs: Pointeur[] = ['souris', 'doigt'];
    for (const profil of [null, ...PROFILS]) {
      for (const pointeur of pointeurs) {
        const valeurs = valeursEffectives(blocs, profil, pointeur);
        for (const variable of VARIABLES) {
          expect(
            valeurs.get(variable),
            `${profil ?? 'sans profil'} · ${pointeur} · ${variable}`,
          ).not.toBe(INVALIDE);
        }
      }
    }
  });

  it('le temoin : le resolveur voit le defaut de la 1.1.0', () => {
    /*
      Sans ce temoin, un resolveur qui ne detecterait aucun cycle passerait tous les tests ci-dessus
      sans rien prouver. La feuille de la 1.1.0 vaut 48 px a la souris, et rien au doigt.
    */
    const anciens = decouperBlocs(readFileSync('tests/instantanes/profils-1.1.0.css', 'utf8'));
    expect(valeursEffectives(anciens, 'equilibre', 'souris').get('--hauteur-controle')).toBe(
      '48px',
    );
    expect(valeursEffectives(anciens, 'equilibre', 'doigt').get('--hauteur-controle')).toBe(
      INVALIDE,
    );
    expect(valeursEffectives(anciens, 'equilibre', 'doigt').get('--ligne-liste')).toBe(INVALIDE);
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

  it('ne declare que les huit proprietes autorisees', () => {
    /*
      Six jusqu a la 1.1.0. Les deux sources, `--hauteur-controle-profil` et `--ligne-liste-profil`,
      sont nees du correctif du plancher tactile (decision 005) : ce sont elles que le plancher releve,
      pour ne plus lire la propriete qu il ecrit.
    */
    const declarees = new Set([...brut.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1] ?? ''));
    for (const declaree of declarees) {
      expect(AUTORISEES, `${declaree} n'a rien a faire dans ce fichier`).toContain(declaree);
    }
  });

  it('declare bien les huit, et pas moins', () => {
    const declarees = new Set([...brut.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1] ?? ''));
    for (const nom of AUTORISEES) {
      expect(declarees, `${nom} absent du fichier`).toContain(nom);
    }
  });
});

describe('regle 2 - le plancher tactile (contrainte C4, decision 005)', () => {
  const blocTactile = /@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/.exec(brut)?.[1] ?? '';

  it("s'exprime en requete media, une seule fois, et non ecran par ecran", () => {
    expect(brut).toContain('@media (pointer: coarse)');
    expect((brut.match(/@media \(pointer: coarse\)/g) ?? []).length).toBe(1);
  });

  it('releve la SOURCE de chaque hauteur a 44 px au minimum', () => {
    expect(blocTactile).toContain('--hauteur-controle: max(var(--hauteur-controle-profil), 44px);');
    expect(blocTactile).toContain('--ligne-liste: max(var(--ligne-liste-profil), 44px);');
  });

  it("ne lit jamais la propriete qu'il ecrit", () => {
    // La forme de la 1.1.0, que ce test EXIGEAIT : invalide au calcul, donc aucune hauteur au doigt.
    expect(blocTactile).not.toMatch(/var\(--hauteur-controle\)/);
    expect(blocTactile).not.toMatch(/var\(--ligne-liste\)/);
  });

  it('calcule la valeur lue une fois, dans un bloc generique', () => {
    expect(brut).toMatch(
      /^:root,\n\[data-densite\] \{\n {2}--hauteur-controle: var\(--hauteur-controle-profil\);\n {2}--ligne-liste: var\(--ligne-liste-profil\);\n\}/m,
    );
  });

  it('couvre tous les profils, y compris ceux a ajouter plus tard', () => {
    expect(blocTactile, 'le selecteur generique [data-densite] est absent').toContain(
      '[data-densite]',
    );
    expect(blocTactile).toContain(':root');
  });

  it('protege le seul profil qui descend sous le plancher', () => {
    const compact = Number.parseInt(ATTENDU.compact['--hauteur-controle'], 10);
    expect(
      compact,
      'le profil compact ne descend plus sous 44 px : la garde est-elle utile ?',
    ).toBeLessThan(44);
  });

  it('declare les profils, puis le bloc generique, puis le plancher, dans cet ordre', () => {
    const dernierProfil = brut.lastIndexOf("[data-densite='");
    const generique = brut.search(/^:root,\n\[data-densite\] \{/m);
    const plancher = brut.indexOf('@media (pointer: coarse)');
    expect(generique, 'le bloc generique est introuvable').toBeGreaterThan(-1);
    expect(dernierProfil, 'un profil est declare apres le bloc generique').toBeLessThan(generique);
    expect(generique, 'le plancher precede le bloc generique').toBeLessThan(plancher);
  });
});
