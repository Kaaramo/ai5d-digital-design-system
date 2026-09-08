import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { lireJetons, resoudre } from '../outils/jetons';
import { luminance, ratioContraste, SEUIL_TEXTE_COURANT } from '../outils/contraste';

const CHEMIN = 'noyau/jetons.css';
const brut = readFileSync(CHEMIN, 'utf8');

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
  { jeton: '--texte-fort', fonds: ['--surface-1', '--surface-2', '--surface-chaude'] },
  { jeton: '--texte', fonds: ['--surface-1', '--surface-2', '--surface-chaude'] },
  { jeton: '--texte-faible', fonds: ['--surface-1', '--surface-2', '--surface-chaude'] },
  { jeton: '--reussite', fonds: ['--surface-1', '--surface-2', '--reussite-fond'] },
  { jeton: '--attention', fonds: ['--surface-1', '--surface-2', '--attention-fond'] },
  { jeton: '--erreur', fonds: ['--surface-1', '--surface-2', '--erreur-fond'] },
  { jeton: '--action', fonds: ['--surface-1', '--surface-2', '--info-fond'] },
];

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
  const exigencesSombres: Array<{ jeton: string; fonds: string[] }> = [
    { jeton: '--texte-fort', fonds: ['--surface-1', '--surface-2', '--surface-3'] },
    { jeton: '--texte', fonds: ['--surface-1', '--surface-2', '--surface-3'] },
    { jeton: '--texte-faible', fonds: ['--surface-1', '--surface-2', '--surface-3'] },
    { jeton: '--reussite', fonds: ['--surface-1', '--surface-2', '--reussite-fond'] },
    { jeton: '--attention', fonds: ['--surface-1', '--surface-2', '--attention-fond'] },
    { jeton: '--erreur', fonds: ['--surface-1', '--surface-2', '--erreur-fond'] },
    { jeton: '--action', fonds: ['--surface-1', '--surface-2', '--surface-3', '--info-fond'] },
  ];

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

  for (const { jeton, fonds } of exigencesSombres) {
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
