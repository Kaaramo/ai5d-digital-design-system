import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { lireJetons, resoudre } from '../outils/jetons';
import { luminance, ratioContraste, SEUIL_TEXTE_COURANT } from '../outils/contraste';

const CHEMIN = 'noyau/jetons.css';
const brut = readFileSync(CHEMIN, 'utf8');

/** SPEC 1.2.0, §5.14.3, decision 006 : la regle, mot pour mot, dans jetons.css et NOYAU.md. */
const REGLE_DUREE_LONGUE =
  'La durée longue sert deux choses, et deux seulement : une confirmation qui engage la sécurité du compte, et le moment signature unique d’un produit, déclaré par son nom dans le DESIGN.md de ce produit. Jamais un ornement, jamais deux moments dans un même produit.';

const MOUVEMENTS: Array<[string, string]> = [
  ['--mouvement-retour', 'var(--duree-courte) var(--courbe-sortie)'],
  ['--mouvement-entree', 'var(--duree-moyenne) var(--courbe-entree)'],
  ['--mouvement-sortie', 'var(--duree-courte) var(--courbe-sortie)'],
];

const marque = lireJetons('noyau/marque.css', ':root');
const clair = new Map([...marque, ...lireJetons(CHEMIN, ':root')]);
const sombre = new Map([...clair, ...lireJetons(CHEMIN, ":root[data-theme='dark']")]);
const themeClairExplicite = new Map([...clair, ...lireJetons(CHEMIN, ":root[data-theme='light']")]);

/** Les valeurs sont ecrites en minuscules dans le CSS ; les mesures en majuscules. */
function couleur(jetons: Map<string, string>, nom: string): string {
  return resoudre(jetons, nom).toUpperCase();
}

describe('jetons - structure', () => {
  it('importe la marque plutot que de la recopier', () => {
    expect(brut).toContain("@import './marque.css'");
  });

  it('ne contient aucune valeur de marque en dur - contrainte C1', () => {
    const declarations = brut.match(/^\s*--[a-z0-9-]+:\s*#[0-9a-fA-F]{6};/gm) ?? [];
    const valeursDeMarque = ['#051c2c', '#2251ff', '#042a76', '#1b44db', '#5b7bff', '#ffffff'];
    for (const declaration of declarations) {
      for (const valeur of valeursDeMarque) {
        expect(
          declaration.toLowerCase(),
          `${declaration.trim()} recopie une valeur de marque au lieu de l'aliaser`,
        ).not.toContain(valeur);
      }
    }
  });

  it('aliase les six jetons de marque', () => {
    for (const nom of ['--encre', '--navy', '--blanc', '--action', '--action-survol']) {
      expect(lireJetons(CHEMIN, ':root').get(nom), `${nom} n'est pas aliase`).toMatch(
        /^var\(--marque-/,
      );
    }
  });

  it('traite les trois etats de theme', () => {
    expect(brut).toContain('prefers-color-scheme: dark');
    expect(brut).toContain("[data-theme='dark']");
    expect(brut).toContain("[data-theme='light']");
  });

  it('respecte prefers-reduced-motion', () => {
    expect(brut).toContain('prefers-reduced-motion: reduce');
  });

  it('ne declare aucune variable de densite - elles appartiennent a densites/', () => {
    for (const densite of [
      '--rythme-section',
      '--padding-carte',
      '--hauteur-controle',
      '--ligne-liste',
      '--contenu-max',
    ]) {
      expect(brut, `${densite} appartient a densites/profils.css`).not.toContain(densite);
    }
  });

  it('a purge les valeurs de texte faible ecartees des DECLARATIONS', () => {
    // Les commentaires citent les valeurs ecartees, et c'est voulu : ils expliquent
    // pourquoi elles l'ont ete. Seules les declarations sont controlees.
    const declarations = (brut.match(/^\s*--[a-z0-9-]+:[^;]+;/gm) ?? []).join(' ').toLowerCase();
    expect(declarations, 'la valeur heritee subsiste dans une declaration').not.toContain(
      '#6b7a85',
    );
    expect(declarations, 'la premiere correction subsiste').not.toContain('#66747e');
    expect(declarations).toContain('#616f78');
  });
});

describe('jetons - mode sombre', () => {
  it('neutralise les trois elevations', () => {
    for (const niveau of [1, 2, 3]) {
      expect(sombre.get(`--elevation-${niveau}`), `elevation ${niveau} non neutralisee`).toBe(
        'none',
      );
    }
  });

  it("bascule l'action vers le jeton applicatif prevu pour les fonds sombres", () => {
    expect(couleur(sombre, '--action')).toBe('#6B88FF');
    expect(couleur(clair, '--action')).toBe('#2251FF');
  });

  it('laisse le jeton de marque --action-clair intact dans les deux themes', () => {
    expect(couleur(clair, '--action-clair')).toBe('#5B7BFF');
    expect(couleur(sombre, '--action-clair')).toBe('#5B7BFF');
  });

  it('restaure les elevations quand le theme clair est choisi explicitement', () => {
    expect(themeClairExplicite.get('--elevation-2')).not.toBe('none');
    expect(couleur(themeClairExplicite, '--action')).toBe('#2251FF');
  });
});

/**
 * La garde C3. Chaque jeton de premier plan est mesure contre TOUS les fonds sur
 * lesquels il a le droit d'apparaitre. C'est ce test qui aurait attrape, des le
 * premier jour, les quatre defauts trouves le 5 septembre 2026.
 */
const EXIGENCES: Array<{ jeton: string; fonds: string[] }> = [
  {
    jeton: '--texte-fort',
    // `--surface-selection` : le titre d'une ligne ou d'un onglet a l'appui (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--surface-chaude', '--surface-selection'],
  },
  { jeton: '--texte', fonds: ['--surface-1', '--surface-2', '--surface-chaude'] },
  {
    jeton: '--texte-faible',
    // `--surface-selection` : la description d'une ligne a l'appui, 4,51 en clair, de peu (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--surface-chaude', '--surface-selection'],
  },
  { jeton: '--reussite', fonds: ['--surface-1', '--surface-2', '--reussite-fond'] },
  { jeton: '--attention', fonds: ['--surface-1', '--surface-2', '--attention-fond'] },
  { jeton: '--erreur', fonds: ['--surface-1', '--surface-2', '--erreur-fond'] },
  {
    jeton: '--action',
    // `--surface-selection` : l'onglet actif et le segment coche (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--info-fond', '--surface-selection'],
  },
];

/** Les exigences du theme sombre, sorties du bloc qui les mesure pour que le total se compte. */
const EXIGENCES_SOMBRES: Array<{ jeton: string; fonds: string[] }> = [
  {
    jeton: '--texte-fort',
    fonds: ['--surface-1', '--surface-2', '--surface-3', '--surface-selection'],
  },
  {
    jeton: '--texte',
    // `--surface-chaude` : le corps d'un bandeau neutre (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--surface-3', '--surface-chaude'],
  },
  {
    jeton: '--texte-faible',
    // `--surface-chaude` : le ton neutre ; `--surface-selection` : l'appui en sombre (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--surface-3', '--surface-chaude', '--surface-selection'],
  },
  { jeton: '--reussite', fonds: ['--surface-1', '--surface-2', '--reussite-fond'] },
  { jeton: '--attention', fonds: ['--surface-1', '--surface-2', '--attention-fond'] },
  { jeton: '--erreur', fonds: ['--surface-1', '--surface-2', '--erreur-fond'] },
  {
    jeton: '--action',
    // `--surface-selection` : l'onglet actif en sombre, 4,51, de peu (1.2.0).
    fonds: ['--surface-1', '--surface-2', '--surface-3', '--info-fond', '--surface-selection'],
  },
];

/**
 * Les couples des boutons, mesures a part : texte sur action, au repos et au survol, et texte sur
 * erreur, dans chaque theme.
 */
const COUPLES_DE_BOUTONS = 6;

describe('jetons - contraste en clair (garde C3)', () => {
  for (const { jeton, fonds } of EXIGENCES) {
    for (const fond of fonds) {
      it(`${jeton} sur ${fond}`, () => {
        const ratio = ratioContraste(couleur(clair, jeton), couleur(clair, fond));
        expect(
          ratio,
          `${ratio.toFixed(2)} contre ${SEUIL_TEXTE_COURANT} attendu`,
        ).toBeGreaterThanOrEqual(SEUIL_TEXTE_COURANT);
      });
    }
  }

  it('--texte-sur-action se lit sur le bouton primaire', () => {
    const ratio = ratioContraste(couleur(clair, '--texte-sur-action'), couleur(clair, '--action'));
    expect(ratio).toBeGreaterThanOrEqual(SEUIL_TEXTE_COURANT);
  });

  it('--texte-sur-action se lit AUSSI sur le bouton primaire survole', () => {
    // Le survol etait le trou : on mesurait le repos et jamais l etat vers lequel la
    // souris emmene. En clair il tient largement ; c est en sombre qu il ne tenait pas.
    const ratio = ratioContraste(
      couleur(clair, '--texte-sur-action'),
      couleur(clair, '--action-survol'),
    );
    expect(ratio, `${ratio.toFixed(2)} en clair, au survol`).toBeGreaterThanOrEqual(
      SEUIL_TEXTE_COURANT,
    );
  });

  it('--texte-sur-erreur se lit sur le bouton danger', () => {
    const ratio = ratioContraste(couleur(clair, '--texte-sur-erreur'), couleur(clair, '--erreur'));
    expect(ratio, `${ratio.toFixed(2)} en clair`).toBeGreaterThanOrEqual(SEUIL_TEXTE_COURANT);
  });

  it('--erreur-survol reste plus sombre que --erreur en clair', () => {
    // Le survol assombrit en mode clair, comme --action-survol. S'il eclaircissait,
    // le bouton paraitrait se desactiver au passage de la souris.
    expect(luminance(couleur(clair, '--erreur-survol'))).toBeLessThan(
      luminance(couleur(clair, '--erreur')),
    );
  });
});

describe('jetons - contraste en sombre (garde C3)', () => {
  /**
   * Le couple du bouton danger, mesure separement.
   *
   * C'est LE test qui justifie l'existence de --texte-sur-erreur : en sombre, --erreur
   * vaut #F27063 et du blanc dessus tombe a 2,89. Remplacer --texte-sur-erreur par
   * --texte-sur-action fait echouer ce test, et c'est exactement ce qu'on veut.
   */
  it('--texte-sur-erreur se lit sur le bouton danger, en sombre aussi', () => {
    const ratio = ratioContraste(
      couleur(sombre, '--texte-sur-erreur'),
      couleur(sombre, '--erreur'),
    );
    expect(ratio, `${ratio.toFixed(2)} en sombre`).toBeGreaterThanOrEqual(SEUIL_TEXTE_COURANT);
  });

  /**
   * Le couple du bouton PRIMAIRE, qui manquait ici alors que celui du danger y etait.
   *
   * C'est le defaut trouve le 8 septembre 2026, a la relecture de l'ecran de connexion.
   * En sombre, --action vaut #6B88FF et du blanc dessus donne 3,19 : sous le seuil AA.
   * Au survol, sur #8BA1FF, 2,43 - le seul geste qui devrait confirmer l'action rendait
   * son libelle MOINS lisible qu'au repos.
   *
   * Rien ne le signalait. La garde du bloc clair mesurait ce couple depuis le premier
   * jour ; celle du bloc sombre ne le mesurait pas, et c'est le seul theme ou il echouait.
   *
   * --texte-sur-action vaut desormais l'encre en sombre, comme --texte-sur-erreur, et
   * pour la meme raison : 5,45 au repos, 7,15 au survol. Le remettre a --blanc fait
   * echouer ces deux tests, et c'est exactement ce qu'on veut.
   */
  it('--texte-sur-action se lit sur le bouton primaire, en sombre aussi', () => {
    const ratio = ratioContraste(
      couleur(sombre, '--texte-sur-action'),
      couleur(sombre, '--action'),
    );
    expect(ratio, `${ratio.toFixed(2)} en sombre, au repos`).toBeGreaterThanOrEqual(
      SEUIL_TEXTE_COURANT,
    );
  });

  it('--texte-sur-action se lit sur le bouton primaire SURVOLE, en sombre', () => {
    const ratio = ratioContraste(
      couleur(sombre, '--texte-sur-action'),
      couleur(sombre, '--action-survol'),
    );
    expect(ratio, `${ratio.toFixed(2)} en sombre, au survol`).toBeGreaterThanOrEqual(
      SEUIL_TEXTE_COURANT,
    );
  });

  it('--action lui-meme n a PAS ete assombri pour corriger le libelle', () => {
    // L'autre correction possible etait d'assombrir le bleu pour y garder du blanc. Elle
    // aurait casse les liens, les bordures et les icones qui s'appuient sur --action et
    // qui tiennent deja leurs mesures sur les trois surfaces sombres. C'est le texte pose
    // dessus qui etait faux, pas le bleu.
    expect(couleur(sombre, '--action')).toBe('#6B88FF');
  });

  it('--erreur-survol s eclaircit en sombre, comme --action-survol', () => {
    expect(luminance(couleur(sombre, '--erreur-survol'))).toBeGreaterThan(
      luminance(couleur(sombre, '--erreur')),
    );
  });

  for (const { jeton, fonds } of EXIGENCES_SOMBRES) {
    for (const fond of fonds) {
      it(`${jeton} sur ${fond}`, () => {
        const ratio = ratioContraste(couleur(sombre, jeton), couleur(sombre, fond));
        expect(
          ratio,
          `${ratio.toFixed(2)} contre ${SEUIL_TEXTE_COURANT} attendu`,
        ).toBeGreaterThanOrEqual(SEUIL_TEXTE_COURANT);
      });
    }
  }
});

describe('jetons - le nombre de couples mesures', () => {
  it('mesure cinquante-sept couples : les quarante-neuf de la 1.1.0, et huit de la 1.2.0', () => {
    /*
      Le nombre n est plus ecrit dans NOYAU.md : il y avait vieilli (« 44 paires » pour 49). Il se lit
      ici, et nulle part ailleurs. SPEC 1.2.0, §6.3.
    */
    const clairs = EXIGENCES.flatMap(({ fonds }) => fonds).length;
    const sombres = EXIGENCES_SOMBRES.flatMap(({ fonds }) => fonds).length;
    expect(clairs + sombres + COUPLES_DE_BOUTONS).toBe(57);
  });
});

describe('jetons - typographie', () => {
  it('declare les trois familles, avec un repli systeme', () => {
    expect(clair.get('--police-titre')).toContain("'Fraunces'");
    expect(clair.get('--police-titre')).toContain('serif');
    expect(clair.get('--police-corps')).toContain("'Inter'");
    expect(clair.get('--police-mono')).toContain("'JetBrains Mono'");
  });

  it("declare l'echelle de tailles et les graisses", () => {
    for (const taille of ['--taille-xs', '--taille-md', '--taille-xl', '--taille-4xl']) {
      expect(clair.get(taille), `${taille} manquant`).toBeDefined();
    }
    expect(clair.get('--graisse-legere')).toBe('300');
    expect(clair.get('--graisse-forte')).toBe('700');
  });
});

describe('jetons - geometrie et mouvement', () => {
  it('accorde les rayons, que le registre institutionnel interdit', () => {
    expect(clair.get('--rayon-sm')).toBe('4px');
    expect(clair.get('--rayon-md')).toBe('10px');
    expect(clair.get('--rayon-lg')).toBe('16px');
  });

  it('declare les trois durees et les deux courbes', () => {
    expect(clair.get('--duree-courte')).toBe('150ms');
    expect(clair.get('--duree-longue')).toBe('800ms');
    expect(clair.get('--courbe-entree')).toContain('cubic-bezier');
  });

  it('fixe la cible tactile minimale a 44 px', () => {
    expect(clair.get('--cible-tactile')).toBe('44px');
  });
});

/**
 * L echelle d espacement.
 *
 * Elle etait promise par la charte, chapitre 07, et par le contrat de jetons du portail
 * depuis le premier jour. Elle n'avait jamais ete implementee, et le defaut etait
 * parfaitement silencieux : `var(--espace-4)` resolvait au vide, le navigateur appliquait
 * zero, la page s'affichait collee. Rien dans la console, rien dans les tests.
 *
 * Ce bloc-la existe pour que cela ne puisse plus arriver.
 */
describe('jetons - echelle d espacement (charte ch. 07)', () => {
  const ATTENDUS: [string, string][] = [
    ['--espace-1', '4px'],
    ['--espace-2', '8px'],
    ['--espace-3', '12px'],
    ['--espace-4', '16px'],
    ['--espace-6', '24px'],
    ['--espace-8', '32px'],
    ['--espace-12', '48px'],
    ['--espace-16', '64px'],
  ];

  for (const [jeton, valeur] of ATTENDUS) {
    it(`${jeton} vaut ${valeur}`, () => {
      expect(clair.get(jeton), `${jeton} manquant`).toBe(valeur);
    });
  }

  it('ne change ni avec le theme ni avec la densite', () => {
    // La densite decrit l espace entre les SECTIONS, l echelle entre les elements.
    for (const [jeton, valeur] of ATTENDUS) {
      expect(sombre.get(jeton), `${jeton} differe en sombre`).toBe(valeur);
    }
  });

  it('suit un pas de quatre pixels, sans exception', () => {
    for (const [jeton, valeur] of ATTENDUS) {
      expect(Number.parseInt(valeur, 10) % 4, `${jeton} sort du pas`).toBe(0);
    }
  });
});

describe('le schema de couleur du navigateur', () => {
  it('suit le theme force et la preference du systeme', () => {
    expect(brut).toMatch(/:root\s*\{[^}]*color-scheme:\s*light dark;/);
    expect(brut).toMatch(/:root\[data-theme='dark'\]\s*\{[^}]*color-scheme:\s*dark;/);
    expect(brut).toMatch(/:root\[data-theme='light'\]\s*\{[^}]*color-scheme:\s*light;/);
  });

  it('donne aux cases a cocher la couleur d action', () => {
    expect(brut).toMatch(/accent-color:\s*var\(--action\);/);
  });
});

describe('jetons - la mesure d un texte (1.2.0)', () => {
  it('--mesure-texte vaut 65ch', () => {
    expect(clair.get('--mesure-texte')).toBe('65ch');
  });

  it('ne varie pas avec le theme', () => {
    expect(lireJetons(CHEMIN, ":root[data-theme='dark']").has('--mesure-texte')).toBe(false);
    expect(lireJetons(CHEMIN, ":root[data-theme='light']").has('--mesure-texte')).toBe(false);
  });
});

describe('jetons - le mouvement par role (1.2.0)', () => {
  for (const [nom, valeur] of MOUVEMENTS) {
    it(`${nom} vaut ${valeur}`, () => {
      expect(clair.get(nom)).toBe(valeur);
    });
  }

  it('ne pointent que vers des durees et des courbes existantes', () => {
    for (const [nom] of MOUVEMENTS) {
      const cibles = [...(clair.get(nom) ?? '').matchAll(/var\((--[a-z0-9-]+)\)/g)].map(
        (m) => m[1] ?? '',
      );
      expect(cibles, nom).toHaveLength(2);
      for (const cible of cibles) {
        expect(cible, `${nom} pointe vers ${cible}`).toMatch(/^--(duree|courbe)-/);
        expect(clair.has(cible), `${cible} n'est declare nulle part`).toBe(true);
      }
    }
  });

  it('sous mouvement reduit, leurs durees tombent a 100 ms par le bloc existant', () => {
    const reduit = lireJetons(CHEMIN, ':root', { inclureRegleArobase: true });
    expect(reduit.get('--duree-courte')).toBe('100ms');
    expect(reduit.get('--duree-moyenne')).toBe('100ms');
    expect(reduit.get('--duree-longue')).toBe('0ms');
  });

  it('aucun jeton --duree-signature : il doublerait --duree-longue (decision 006)', () => {
    expect(brut).not.toMatch(/--duree-signature\s*:/);
  });

  it('la regle de la duree longue est ecrite, mot pour mot, dans jetons.css et NOYAU.md', () => {
    const normaliser = (texte: string) => texte.replace(/\s+/g, ' ');
    expect(normaliser(brut)).toContain(REGLE_DUREE_LONGUE);
    expect(normaliser(readFileSync('noyau/NOYAU.md', 'utf8'))).toContain(REGLE_DUREE_LONGUE);
  });
});

describe('le navigateur suit le theme, jusque dans la selection (1.2.0)', () => {
  it('pose le curseur de saisie sur la couleur d action', () => {
    expect(brut).toMatch(/:root\s*\{[^}]*caret-color:\s*var\(--action\);/);
  });

  it('peint la selection aux couleurs du bouton primaire', () => {
    expect(brut).toMatch(
      /::selection\s*\{\s*background:\s*var\(--action\);\s*color:\s*var\(--texte-sur-action\);\s*\}/,
    );
  });

  it('ne pose aucune couleur de barre de defilement', () => {
    expect(brut).not.toMatch(/^\s*scrollbar-color\s*:/m);
  });
});
