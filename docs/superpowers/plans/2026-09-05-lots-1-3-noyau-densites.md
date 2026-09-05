# AI5D Digital Design System — Lots 1 à 3 · Plan d'implémentation

> **Pour les exécutants agentiques :** ce plan se déroule tâche par tâche. Les étapes sont
> en cases à cocher (`- [ ]`).
>
> **Cycle adapté.** Ce plan ne suit **pas** le cycle TDD strict rouge/vert. Sur décision du
> commanditaire (`~/.claude/CLAUDE.md`), chaque tâche écrit **le code et ses tests
> ensemble**, se marque « écrite, non testée », et se commite. **La tâche 17 lance la
> vérification d'un seul bloc.** Ne lancez aucune suite de tests avant elle, hormis les
> commandes explicitement notées « sonde » dans une tâche.

**Objectif :** livrer le noyau et les densités du système de design applicatif AI5D — les
polices, les jetons vérifiés par le contraste, le préréglage Tailwind, les huit composants
de base, les quatre profils de densité et les gardes distribuables — de sorte qu'un projet
puisse l'adopter en trois lignes.

**Architecture :** un dépôt sans monorepo, trois couches en dossiers (`noyau/`, `densites/`,
`ecosysteme/` — cette dernière hors périmètre). Les jetons de marque sont **copiés depuis
`AI5D_Brand_2026` par un script, avec vérification d'intégrité au build** : la marque n'est
ni un dépôt Git ni un paquet, et la décision D1 interdit de la faire bouger. Le contraste de
chaque jeton sémantique est recalculé à chaque exécution des tests ; sous 4,5 le build
échoue.

**Pile technique :** pnpm · TypeScript strict · React 19 · Vitest + Testing Library + jsdom ·
Tailwind v4 (CSS-first, `@theme`) · Node 24 · fontTools (Python) pour le sous-ensemblage.

**Spec :** [`../specs/2026-09-05-ai5d-digital-design-system-design.md`](../specs/2026-09-05-ai5d-digital-design-system-design.md)

> **Plan exécuté le 5 septembre 2026.** Ce document raconte ce qui était prévu ; il n'est
> pas la référence de ce qui existe. Cinq choses ont changé en cours d'exécution, toutes
> consignées dans [`CHANGELOG.md`](../../../CHANGELOG.md) et dans le §0 de la spec. Les
> valeurs ci-dessous ont été rectifiées pour qu'aucun lecteur pressé n'y recopie un jeton
> périmé ; le reste du plan est laissé tel qu'il a été écrit.

---

## Contraintes globales

Ces contraintes valent pour **toutes** les tâches. Elles sont reprises mot pour mot de la
spec.

| # | Contrainte | Source |
| - | ---------- | ------ |
| C1 | **Aucune valeur de marque écrite en dur.** `--encre #051C2C`, `--navy #042A76`, `--action #2251FF`, `--action-survol #1B44DB`, `--action-clair #5B7BFF`, `--blanc #FFFFFF` viennent de `marque.css`, généré par script | Spec §4.1 |
| C2 | **Aucun littéral `#RRGGBB`** hors de `noyau/marque.css`, `noyau/jetons.css` et `noyau/ai5d.preset.css` | Spec §9 |
| C3 | **Le contraste de chaque jeton sémantique ≥ 4,5** contre ses surfaces déclarées, recalculé à chaque build | Spec §9 |
| C4 | **Plancher tactile 44 px** sur `pointer: coarse`, quel que soit le profil de densité | Spec §6.2 |
| C5 | **La densité change l'espace, jamais la taille du texte.** `profils.css` ne contient ni couleur, ni police, ni taille de texte | Spec §6.2 |
| C6 | **Polices en local, en woff2, sous-ensemble latin.** Aucun appel à un CDN de polices, nulle part | Spec §5.2 |
| C7 | **TypeScript strict**, zéro `any` non justifié par un commentaire | Standard IA5D |
| C8 | **Ton de la voix** dans toute chaîne visible : vouvoiement, aucun tiret cadratin, ni emoji ni exclamation | Spec §5.5 |
| C9 | **Le mode sombre neutralise les élévations à `none`** — sur fond sombre une ombre portée ne se voit pas | Spec §5.6 |
| C10 | **Ne jamais lancer `pnpm build`** sans demande explicite du commanditaire | `tasks/lessons.md` |

**Valeurs de référence, à recopier exactement** (spec §5.1) :

```
surfaces clair : --surface-1 #FAF7F2 · --surface-2 #FFFFFF · --surface-3 #FFFFFF
                 --surface-chaude #F4EFE7 · --bordure #E7E0D6 · --bordure-forte #D5CCBE
surfaces sombre: --surface-1 #0B1620 · --surface-2 #11212D · --surface-3 #172C3B
                 --surface-chaude #171F26 · --bordure #22323F · --bordure-forte #2E4252
texte clair    : --texte-fort #051C2C · --texte #2B3A45 · --texte-faible #616F78
texte sombre   : --texte-fort #F2F5F7 · --texte #C9D4DC · --texte-faible #8D9AA5
sémantiques    : --reussite #0E7C5A / #2FA37B · --reussite-fond #E6F4EE / #103029
action sombre  : --action-sur-sombre #6B88FF (le #5B7BFF de la marque echoue sur carte et menu)
                 --attention #B45309 / #E0A050 · --attention-fond #FDF2E3 / #2E2413
                 --erreur #B42318 / #F27063 · --erreur-fond #FDECEA / #331A18
```

> `--texte-faible` vaut **`#616F78`**. Deux valeurs ont été écartées avant elle : `#6B7A85`,
> héritée de l'Académie, qui donnait 4,14 sur le papier ; et `#66747E`, retenue par la
> première rédaction de ce plan, qui corrigeait le papier et le blanc mais restait à 4,20
> sur la surface chaude. Seule `#616F78` tient les trois. Toute tâche qui écrit l'une des
> deux premières est en faute.

---

## Structure des fichiers

| Fichier | Responsabilité |
| ------- | -------------- |
| `package.json` · `tsconfig.json` · `vitest.config.ts` · `eslint.config.mjs` · `.prettierrc` | Outillage |
| `outils/contraste.ts` | Calcul WCAG. Une seule responsabilité : luminance et ratio |
| `outils/jetons.ts` | Lecture d'un fichier CSS de jetons vers un objet. Aucune connaissance des couleurs AI5D |
| `_build/recuperer-polices.mjs` | Télécharge et range les 8 woff2. Écrit `polices.css` |
| `_build/synchroniser-marque.mjs` | Copie les 6 jetons de marque, écrit l'empreinte de provenance |
| `noyau/marque.css` | **Généré.** Les 6 jetons de marque et rien d'autre |
| `noyau/jetons.css` | Surfaces, texte, sémantiques, géométrie, typo, animation, 3 états de thème |
| `noyau/ai5d.preset.css` | Bloc `@theme` Tailwind v4. Ne fait que pointer vers les jetons |
| `noyau/polices/polices.css` | Les 8 `@font-face`, chemins relatifs, `font-display: swap` |
| `noyau/composants/*.tsx` | Un composant, un fichier, une responsabilité |
| `densites/profils.css` | 4 sélecteurs, 6 variables, le plancher tactile. Aucune prose |
| `gardes/*.test.ts` | Les 3 gardes distribuées aux projets consommateurs |
| `tests/*.test.ts(x)` | Les tests propres au système |

---

## Ordre des tâches

```
T1  socle du dépôt
T2  outils/contraste.ts          ─┐
T3  polices                       │ Lot 1
T4  synchronisation de la marque  │
T5  jetons.css + outils/jetons.ts │
T6  préréglage Tailwind          ─┘
T7  densités                      ← Lot 3, avant les composants qui en dépendent
T8  Logotype                     ─┐
T9  Bouton                        │
T10 Champ                         │ Lot 2
T11 Carte, Bandeau, Pastille      │
T12 Icone                         │
T13 CarteAuth                     │
T14 index + spécimens            ─┘
T15 les 3 gardes distribuables
T16 documents : NOYAU, DENSITES, formulations, README
T17 VÉRIFICATION D'UN SEUL BLOC + preuves
```

---

## Tâche 1 : Socle du dépôt

**Fichiers :**
- Créer : `package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.mjs`, `.prettierrc`, `tests/fumee.test.ts`

**Interfaces :**
- Produit : les scripts `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm polices`, `pnpm marque`, `pnpm specimens` — utilisés par toutes les tâches suivantes et par T17.

- [ ] **Étape 1 : écrire `package.json`**

```json
{
  "name": "@ai5d/design-system",
  "version": "0.1.0",
  "private": true,
  "description": "Systeme de design applicatif de l'ecosysteme AI5D",
  "type": "module",
  "exports": {
    "./noyau/jetons.css": "./noyau/jetons.css",
    "./noyau/marque.css": "./noyau/marque.css",
    "./noyau/polices/polices.css": "./noyau/polices/polices.css",
    "./preset": "./noyau/ai5d.preset.css",
    "./densites/profils.css": "./densites/profils.css",
    "./composants": "./noyau/composants/index.ts",
    "./gardes": "./gardes/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "polices": "node _build/recuperer-polices.mjs",
    "marque": "node _build/synchroniser-marque.mjs",
    "specimens": "node _build/generer-specimens.mjs"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.17.0",
    "jsdom": "^25.0.1",
    "prettier": "^3.4.2",
    "typescript": "^5.7.2",
    "typescript-eslint": "^8.18.1",
    "vitest": "^2.1.8"
  },
  "peerDependencies": {
    "react": ">=19",
    "react-dom": ">=19"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.469.0"
  }
}
```

- [ ] **Étape 2 : `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["noyau", "densites", "outils", "gardes", "tests", "_build"],
  "exclude": ["node_modules"]
}
```

- [ ] **Étape 3 : `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}', 'gardes/**/*.test.ts'],
  },
});
```

Et `tests/setup.ts` :

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Étape 4 : `eslint.config.mjs` et `.prettierrc`**

```js
// eslint.config.mjs
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/**', 'noyau/polices/**', 'specimens/**'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
```

```json
{ "singleQuote": true, "printWidth": 100, "semi": true, "trailingComma": "all" }
```

- [ ] **Étape 5 : test de fumée `tests/fumee.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';

describe('socle du depot', () => {
  it('expose les fichiers de configuration attendus', () => {
    for (const f of ['package.json', 'tsconfig.json', 'vitest.config.ts']) {
      expect(existsSync(f), `${f} manquant`).toBe(true);
    }
  });
});
```

- [ ] **Étape 6 : lancer l'installation EN ARRIÈRE-PLAN**

`pnpm install` prend 9 à 12 minutes sur ce poste (`tasks/lessons.md`). La lancer en tâche de
fond et **continuer à écrire les fichiers des tâches suivantes pendant ce temps**. Ne pas
attendre.

- [ ] **Étape 7 : commit** — « socle : outillage du dépôt, écrit, non testé »

---

## Tâche 2 : `outils/contraste.ts`

C'est la brique qui rend la contrainte C3 exécutable. Elle ne connaît aucune couleur AI5D :
elle sait seulement calculer un ratio.

**Fichiers :**
- Créer : `outils/contraste.ts`, `tests/contraste.test.ts`

**Interfaces :**
- Produit : `luminance(hex: string): number`, `ratioContraste(a: string, b: string): number`,
  `verdictWcag(ratio: number): 'AAA' | 'AA' | 'AA-gros' | 'echec'`. Consommé par T5, T15, T17.

- [ ] **Étape 1 : écrire `outils/contraste.ts`**

```ts
/** Calcul de contraste WCAG 2.1. Aucune connaissance des couleurs AI5D. */

export type VerdictWcag = 'AAA' | 'AA' | 'AA-gros' | 'echec';

const HEXA = /^#([0-9a-fA-F]{6})$/;

/** Convertit un hexadécimal `#RRGGBB` en triplet 0-255. Lève si la forme est invalide. */
export function versRgb(hex: string): [number, number, number] {
  const m = HEXA.exec(hex.trim());
  if (!m) throw new Error(`Couleur invalide : ${hex}. Forme attendue #RRGGBB.`);
  const v = m[1] as string;
  return [
    Number.parseInt(v.slice(0, 2), 16),
    Number.parseInt(v.slice(2, 4), 16),
    Number.parseInt(v.slice(4, 6), 16),
  ];
}

function canal(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminance relative, entre 0 (noir) et 1 (blanc). */
export function luminance(hex: string): number {
  const [r, g, b] = versRgb(hex);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Ratio de contraste entre deux couleurs, entre 1 et 21. L'ordre est indifférent. */
export function ratioContraste(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const haut = Math.max(la, lb);
  const bas = Math.min(la, lb);
  return (haut + 0.05) / (bas + 0.05);
}

/** Verdict WCAG pour du texte. `AA-gros` ne vaut que pour 18,66 px gras ou 24 px. */
export function verdictWcag(ratio: number): VerdictWcag {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-gros';
  return 'echec';
}
```

- [ ] **Étape 2 : écrire `tests/contraste.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { luminance, ratioContraste, verdictWcag, versRgb } from '../outils/contraste';

describe('versRgb', () => {
  it('lit un hexadecimal a six chiffres', () => {
    expect(versRgb('#2251FF')).toEqual([34, 81, 255]);
  });
  it('accepte les minuscules et les espaces', () => {
    expect(versRgb('  #2251ff ')).toEqual([34, 81, 255]);
  });
  it('refuse une forme courte', () => {
    expect(() => versRgb('#FFF')).toThrow(/Couleur invalide/);
  });
  it('refuse une chaine sans diese', () => {
    expect(() => versRgb('2251FF')).toThrow(/Couleur invalide/);
  });
});

describe('luminance', () => {
  it('vaut 1 pour le blanc et 0 pour le noir', () => {
    expect(luminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(luminance('#000000')).toBeCloseTo(0, 5);
  });
});

describe('ratioContraste', () => {
  it('donne 21 entre noir et blanc', () => {
    expect(ratioContraste('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
  });
  it('donne 1 pour deux couleurs identiques', () => {
    expect(ratioContraste('#2251FF', '#2251FF')).toBeCloseTo(1, 5);
  });
  it("est insensible a l'ordre des arguments", () => {
    expect(ratioContraste('#B42318', '#FAF7F2')).toBeCloseTo(
      ratioContraste('#FAF7F2', '#B42318'),
      10,
    );
  });
  // Valeurs mesurees et consignees dans la spec section 2.4.
  it('reproduit les mesures de la spec', () => {
    expect(ratioContraste('#0E7C5A', '#FAF7F2')).toBeCloseTo(4.85, 1);
    expect(ratioContraste('#B45309', '#FAF7F2')).toBeCloseTo(4.7, 1);
    expect(ratioContraste('#B42318', '#FAF7F2')).toBeCloseTo(6.15, 1);
    expect(ratioContraste('#66747E', '#FAF7F2')).toBeCloseTo(4.5, 1);
    expect(ratioContraste('#66747E', '#FFFFFF')).toBeCloseTo(4.81, 1);
  });
  // La valeur ecartee, gardee en test pour que la regression se voie.
  it('confirme que l ancienne valeur du texte faible echouait', () => {
    expect(ratioContraste('#6B7A85', '#FAF7F2')).toBeLessThan(4.5);
  });
});

describe('verdictWcag', () => {
  it('classe les seuils', () => {
    expect(verdictWcag(7.1)).toBe('AAA');
    expect(verdictWcag(4.5)).toBe('AA');
    expect(verdictWcag(3.2)).toBe('AA-gros');
    expect(verdictWcag(2.9)).toBe('echec');
  });
});
```

- [ ] **Étape 3 : commit** — « contraste : calcul WCAG, écrit, non testé »

---

## Tâche 3 : Les polices

**Fichiers :**
- Créer : `_build/recuperer-polices.mjs`, `noyau/polices/polices.css`, `noyau/polices/*.woff2`, `tests/polices.test.ts`

**Interfaces :**
- Produit : 8 fichiers woff2 et `polices.css`. Consommé par T8 (Logotype), T14 (spécimens), T16.

**Contexte vérifié le 5 septembre 2026.** Google Fonts ne sert du woff2 que si l'agent
utilisateur ressemble à un navigateur récent ; avec un UA générique il renvoie du TTF. Avec
un UA Chrome, l'appel aux trois familles retourne 43 faces woff2. Il faut ensuite **filtrer
sur le sous-ensemble latin** — la plage `U+0000-00FF`.

- [ ] **Étape 1 : écrire `_build/recuperer-polices.mjs`**

```js
/**
 * Recupere les polices du systeme en woff2, sous-ensemble latin, et ecrit polices.css.
 *
 * Deux pieges appris a l'usage :
 *  - sans un agent utilisateur de navigateur recent, Google Fonts renvoie du TTF ;
 *  - la reponse contient une face par plage Unicode. On ne garde que la plage latine,
 *    sinon on telecharge du cyrillique et du vietnamien dont personne n'a besoin.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const REQUETE =
  'https://fonts.googleapis.com/css2' +
  '?family=Inter:wght@400;500;600;700' +
  '&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500' +
  '&family=JetBrains+Mono:wght@500' +
  '&display=swap';

/** La plage latine de base. Toute face qui ne la couvre pas est ecartee. */
const PLAGE_LATINE = 'U+0000-00FF';

const DOSSIER = 'noyau/polices';

/** Nom de fichier deterministe : famille-graisse.woff2 */
function nomFichier(famille, graisse) {
  const f = famille.toLowerCase().replace(/\s+/g, '-');
  return `${f}-${graisse}.woff2`;
}

function decouperBlocs(css) {
  return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
}

function lire(bloc, propriete) {
  const m = new RegExp(`${propriete}:\\s*([^;]+);`).exec(bloc);
  return m ? m[1].trim().replace(/^'|'$/g, '') : null;
}

async function main() {
  const reponse = await fetch(REQUETE, { headers: { 'User-Agent': UA } });
  if (!reponse.ok) throw new Error(`Google Fonts a repondu ${reponse.status}`);
  const css = await reponse.text();

  if (!css.includes("format('woff2')")) {
    throw new Error("La reponse ne contient pas de woff2. L'agent utilisateur est en cause.");
  }

  await mkdir(DOSSIER, { recursive: true });

  const faces = [];
  for (const bloc of decouperBlocs(css)) {
    const plage = lire(bloc, 'unicode-range');
    if (!plage || !plage.includes(PLAGE_LATINE)) continue;

    const famille = lire(bloc, 'font-family');
    const graisse = lire(bloc, 'font-weight');
    const src = lire(bloc, 'src');
    const url = /url\((https:[^)]+)\)/.exec(src ?? '')?.[1];
    if (!famille || !graisse || !url) continue;

    const fichier = nomFichier(famille, graisse);
    const bin = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!bin.ok) throw new Error(`Telechargement de ${fichier} : ${bin.status}`);
    const octets = Buffer.from(await bin.arrayBuffer());

    // Signature woff2 : les quatre premiers octets valent 'wOF2'.
    if (octets.subarray(0, 4).toString('latin1') !== 'wOF2') {
      throw new Error(`${fichier} n'est pas un woff2.`);
    }
    await writeFile(join(DOSSIER, fichier), octets);
    faces.push({ famille, graisse, fichier, octets: octets.length });
    console.log(`  ${fichier.padEnd(30)} ${(octets.length / 1024).toFixed(1)} Ko`);
  }

  const entete = [
    '/* =========================================================================',
    '   AI5D Digital Design System - polices',
    '   GENERE par _build/recuperer-polices.mjs. Ne pas modifier a la main.',
    '   Sous-ensemble latin, woff2, servi en local. Aucun appel a un CDN.',
    `   Genere le ${new Date().toISOString().slice(0, 10)}.`,
    '   ========================================================================= */',
    '',
  ].join('\n');

  const regles = faces
    .map(
      (f) =>
        `@font-face {\n` +
        `  font-family: '${f.famille}';\n` +
        `  font-style: normal;\n` +
        `  font-weight: ${f.graisse};\n` +
        `  font-display: swap;\n` +
        `  src: url('./${f.fichier}') format('woff2');\n` +
        `}\n`,
    )
    .join('\n');

  await writeFile(join(DOSSIER, 'polices.css'), `${entete}\n${regles}`, 'utf8');
  console.log(`\n${faces.length} faces ecrites dans ${DOSSIER}/polices.css`);
}

main().catch((e) => {
  console.error('ECHEC :', e.message);
  process.exitCode = 1;
});
```

- [ ] **Étape 2 : sonde — exécuter le script**

`pnpm polices`. C'est une **sonde autorisée** : le reste de la tâche dépend du résultat
réel, et une tâche qui écrirait un test sur des fichiers inexistants serait sans valeur.
Attendu : 8 faces, chacune entre 10 et 60 Ko.

- [ ] **Étape 3 : écrire `tests/polices.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DOSSIER = 'noyau/polices';

const ATTENDUES = [
  'inter-400.woff2',
  'inter-500.woff2',
  'inter-600.woff2',
  'inter-700.woff2',
  'fraunces-300.woff2',
  'fraunces-400.woff2',
  'fraunces-500.woff2',
  'jetbrains-mono-500.woff2',
];

describe('polices', () => {
  it('livre les huit faces attendues', () => {
    const presents = readdirSync(DOSSIER).filter((f) => f.endsWith('.woff2'));
    for (const attendue of ATTENDUES) {
      expect(presents, `${attendue} manquante`).toContain(attendue);
    }
  });

  it('ne livre que du woff2 authentique', () => {
    for (const f of readdirSync(DOSSIER).filter((n) => n.endsWith('.woff2'))) {
      const octets = readFileSync(join(DOSSIER, f));
      expect(octets.subarray(0, 4).toString('latin1'), `${f} n'est pas un woff2`).toBe('wOF2');
    }
  });

  it('garde des fichiers de taille plausible pour un sous-ensemble latin', () => {
    for (const f of readdirSync(DOSSIER).filter((n) => n.endsWith('.woff2'))) {
      const taille = statSync(join(DOSSIER, f)).size;
      expect(taille, `${f} est vide`).toBeGreaterThan(5_000);
      expect(taille, `${f} depasse 200 Ko, le sous-ensemble a echoue`).toBeLessThan(200_000);
    }
  });

  it('declare chaque face avec un chemin relatif, jamais une URL', () => {
    const css = readFileSync(join(DOSSIER, 'polices.css'), 'utf8');
    expect(css).not.toMatch(/https?:/);
    expect((css.match(/@font-face/g) ?? []).length).toBe(ATTENDUES.length);
    expect(css).toContain("format('woff2')");
  });
});
```

- [ ] **Étape 4 : commit** — « polices : 8 faces woff2 latines servies en local, écrit, non testé »

---

## Tâche 4 : Synchronisation des jetons de marque

**Fichiers :**
- Créer : `_build/synchroniser-marque.mjs`, `noyau/marque.css`, `tests/marque.test.ts`

**Interfaces :**
- Produit : `noyau/marque.css`, qui déclare exactement 6 variables. Consommé par T5, T6, T15.

C'est le mécanisme retenu en spec §4.1. La marque n'étant ni un dépôt Git ni un paquet, on
copie, et le test échoue si la copie diverge de la source.

- [ ] **Étape 1 : écrire `_build/synchroniser-marque.mjs`**

```js
/**
 * Copie les jetons de marque depuis AI5D_Brand_2026 vers noyau/marque.css.
 *
 * La marque n'est ni un depot Git ni un paquet npm : l'importation ne peut pas passer
 * par une dependance. On copie, et tests/marque.test.ts echoue si la copie diverge.
 * Publier la marque comme paquet reviendrait a la faire bouger, ce que la decision D1
 * interdit.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const SOURCE = 'C:/Users/ksthe/Documents/AI5D_Brand_2026/tokens.css';
const CIBLE = 'noyau/marque.css';

/** Les six seuls jetons que le registre applicatif herite de la marque. */
const JETONS = [
  ['--encre', '--ai5d-ink'],
  ['--navy', '--ai5d-navy'],
  ['--action', '--ai5d-blue'],
  ['--action-survol', '--ai5d-blue-hover'],
  ['--action-clair', '--ai5d-blue-light'],
  ['--blanc', '--ai5d-white'],
];

function extraire(css, nom) {
  const m = new RegExp(`${nom}\\s*:\\s*(#[0-9A-Fa-f]{6})\\s*;`).exec(css);
  if (!m) throw new Error(`Jeton ${nom} introuvable dans la source de marque.`);
  return m[1].toUpperCase();
}

const source = await readFile(SOURCE, 'utf8');
const empreinte = createHash('sha256').update(source).digest('hex').slice(0, 16);

const lignes = JETONS.map(([local, amont]) => {
  const valeur = extraire(source, amont);
  return `  ${local}: ${valeur};`.padEnd(34) + ` /* ${amont} */`;
});

const contenu = [
  '/* =========================================================================',
  '   AI5D Digital Design System - jetons de marque',
  '',
  '   GENERE par _build/synchroniser-marque.mjs. Ne pas modifier a la main.',
  `   Source  : ${SOURCE}`,
  `   Empreinte source (sha256, 16) : ${empreinte}`,
  `   Synchronise le ${new Date().toISOString().slice(0, 10)}`,
  '',
  '   Ces six valeurs appartiennent a la marque. Le systeme les cite, ne les',
  '   redefinit jamais, et aucun projet consommateur n a le droit de les surcharger.',
  '   ========================================================================= */',
  '',
  ':root {',
  ...lignes,
  '}',
  '',
].join('\n');

await writeFile(CIBLE, contenu, 'utf8');
console.log(`${CIBLE} ecrit. Empreinte source ${empreinte}.`);
```

- [ ] **Étape 2 : sonde — exécuter `pnpm marque`**

Attendu : `noyau/marque.css` écrit, empreinte affichée.

- [ ] **Étape 3 : écrire `tests/marque.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const SOURCE = 'C:/Users/ksthe/Documents/AI5D_Brand_2026/tokens.css';
const marque = readFileSync('noyau/marque.css', 'utf8');

/** Correspondance entre le nom local et le nom amont, identique au script. */
const CORRESPONDANCE: Array<[string, string]> = [
  ['--encre', '--ai5d-ink'],
  ['--navy', '--ai5d-navy'],
  ['--action', '--ai5d-blue'],
  ['--action-survol', '--ai5d-blue-hover'],
  ['--action-clair', '--ai5d-blue-light'],
  ['--blanc', '--ai5d-white'],
];

function valeur(css: string, nom: string): string | null {
  const m = new RegExp(`${nom}\\s*:\\s*(#[0-9A-Fa-f]{6})\\s*;`).exec(css);
  return m ? (m[1] as string).toUpperCase() : null;
}

describe('jetons de marque', () => {
  it('declare exactement six jetons', () => {
    const declares = marque.match(/^\s*--[a-z-]+:/gm) ?? [];
    expect(declares.length).toBe(6);
  });

  it("n a pas derive de la source - c'est la garde d integrite", () => {
    const source = readFileSync(SOURCE, 'utf8');
    for (const [local, amont] of CORRESPONDANCE) {
      expect(valeur(marque, local), `${local} absent de marque.css`).not.toBeNull();
      expect(
        valeur(marque, local),
        `${local} a derive de ${amont}. Relancer : pnpm marque`,
      ).toBe(valeur(source, amont));
    }
  });

  it('porte son en-tete de provenance', () => {
    expect(marque).toContain('GENERE par _build/synchroniser-marque.mjs');
    expect(marque).toMatch(/Empreinte source \(sha256, 16\) : [0-9a-f]{16}/);
  });

  it('reproduit les valeurs de marque connues', () => {
    expect(valeur(marque, '--encre')).toBe('#051C2C');
    expect(valeur(marque, '--action')).toBe('#2251FF');
    expect(valeur(marque, '--navy')).toBe('#042A76');
  });
});
```

- [ ] **Étape 4 : commit** — « marque : synchronisation vérifiée des six jetons hérités, écrit, non testé »

---

## Tâche 5 : `noyau/jetons.css` et `outils/jetons.ts`

Le cœur du système.

**Fichiers :**
- Créer : `noyau/jetons.css`, `outils/jetons.ts`, `tests/jetons.test.ts`

**Interfaces :**
- Produit : `lireJetons(chemin: string, selecteur?: string): Map<string, string>` et
  `resoudre(jetons: Map<string, string>, nom: string): string` — consommés par T15 et T17.

- [ ] **Étape 1 : écrire `noyau/jetons.css`**

Reprendre **exactement** les valeurs de la section « Contraintes globales ». Structure :
`@import './marque.css';` puis `:root` (clair), puis
`@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { … } }`, puis
`:root[data-theme='dark']`, puis `:root[data-theme='light']`. Les trois états du §5.6.

Le fichier déclare, dans cet ordre : surfaces · texte · sémantiques · typographie (familles,
tailles, graisses, interlignes, interlettrages) · rayons · élévations · animation. Il ne
déclare **aucune** variable de densité — celles-là appartiennent à `densites/profils.css`.

Rappel C9 : dans les trois blocs sombres, `--elevation-1/2/3` valent `none`.

- [ ] **Étape 2 : écrire `outils/jetons.ts`**

```ts
/** Lecture d'un fichier CSS de jetons. Aucune connaissance des couleurs AI5D. */
import { readFileSync } from 'node:fs';

/**
 * Lit les declarations `--nom: valeur;` d'un bloc donne.
 * `selecteur` accepte une sous-chaine du selecteur voulu, par exemple
 * `:root[data-theme='dark']`. Par defaut, le premier bloc `:root` simple.
 */
export function lireJetons(chemin: string, selecteur = ':root'): Map<string, string> {
  const css = readFileSync(chemin, 'utf8');
  const jetons = new Map<string, string>();

  // On decoupe sur les accolades plutot que d'employer un vrai parseur : le format
  // de ces fichiers est ecrit par nous et reste simple. Un parseur serait du poids
  // pour aucune robustesse supplementaire ici.
  const blocs = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  for (const [, brut, corps] of blocs) {
    if (!brut || !corps) continue;
    if (!brut.trim().includes(selecteur)) continue;
    for (const [, nom, valeur] of corps.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      if (nom && valeur) jetons.set(nom, valeur.trim());
    }
  }
  return jetons;
}

/** Resout `var(--autre)` en remontant les alias. Leve au-dela de dix sauts. */
export function resoudre(jetons: Map<string, string>, nom: string): string {
  let valeur = jetons.get(nom);
  if (valeur === undefined) throw new Error(`Jeton inconnu : ${nom}`);
  for (let saut = 0; saut < 10; saut += 1) {
    const alias = /^var\((--[a-z0-9-]+)\)$/.exec(valeur.trim());
    if (!alias) return valeur.trim();
    const suivant = jetons.get(alias[1] as string);
    if (suivant === undefined) throw new Error(`Alias non resolu : ${valeur}`);
    valeur = suivant;
  }
  throw new Error(`Boucle d alias sur ${nom}`);
}
```

- [ ] **Étape 3 : écrire `tests/jetons.test.ts` — c'est ici que vit la garde C3**

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { lireJetons, resoudre } from '../outils/jetons';
import { ratioContraste } from '../outils/contraste';

const CHEMIN = 'noyau/jetons.css';
const clair = lireJetons(CHEMIN, ':root');
const sombre = lireJetons(CHEMIN, ":root[data-theme='dark']");
const brut = readFileSync(CHEMIN, 'utf8');

/** Chaque jeton de premier plan, avec les fonds sur lesquels il a le droit d'apparaitre. */
const EXIGENCES: Array<{ jeton: string; fonds: string[] }> = [
  { jeton: '--texte-fort', fonds: ['--surface-1', '--surface-2', '--surface-chaude'] },
  { jeton: '--texte', fonds: ['--surface-1', '--surface-2', '--surface-chaude'] },
  { jeton: '--texte-faible', fonds: ['--surface-1', '--surface-2', '--surface-chaude'] },
  { jeton: '--reussite', fonds: ['--surface-1', '--surface-2', '--reussite-fond'] },
  { jeton: '--attention', fonds: ['--surface-1', '--surface-2', '--attention-fond'] },
  { jeton: '--erreur', fonds: ['--surface-1', '--surface-2', '--erreur-fond'] },
  { jeton: '--action', fonds: ['--surface-1', '--surface-2'] },
];

describe('jetons - structure', () => {
  it('importe la marque plutot que de la recopier', () => {
    expect(brut).toContain("@import './marque.css'");
  });

  it('ne redefinit aucun jeton de marque', () => {
    for (const marque of ['--encre', '--navy', '--action', '--blanc']) {
      const declarations = brut.match(new RegExp(`^\\s*${marque}\\s*:`, 'gm')) ?? [];
      expect(declarations.length, `${marque} est redefini dans jetons.css`).toBe(0);
    }
  });

  it('traite les trois etats de theme', () => {
    expect(brut).toContain('prefers-color-scheme: dark');
    expect(brut).toContain("[data-theme='dark']");
    expect(brut).toContain("[data-theme='light']");
  });

  it('ne declare aucune variable de densite', () => {
    for (const densite of ['--rythme-section', '--padding-carte', '--ligne-liste']) {
      expect(brut, `${densite} appartient a densites/profils.css`).not.toContain(densite);
    }
  });

  it('applique la correction du texte faible', () => {
    expect(clair.get('--texte-faible')).toBe('#66747E');
    expect(brut, "l ancienne valeur du texte faible subsiste").not.toContain('#6B7A85');
  });
});

describe('jetons - mode sombre', () => {
  it('neutralise les trois elevations', () => {
    for (const n of [1, 2, 3]) {
      expect(sombre.get(`--elevation-${n}`), `elevation ${n} non neutralisee`).toBe('none');
    }
  });

  it('eclaircit l action, seul jeton herite qui change de valeur', () => {
    expect(resoudre(sombre, '--action')).toBe('var(--action-clair)');
  });
});

describe('jetons - contraste (garde C3)', () => {
  const valeurs = new Map<string, string>([
    ...clair,
    ['--encre', '#051C2C'],
    ['--action', '#2251FF'],
    ['--navy', '#042A76'],
    ['--blanc', '#FFFFFF'],
  ]);

  for (const { jeton, fonds } of EXIGENCES) {
    for (const fond of fonds) {
      it(`${jeton} sur ${fond} atteint 4,5`, () => {
        const avant = valeurs.get(jeton);
        const arriere = valeurs.get(fond);
        expect(avant, `${jeton} introuvable`).toBeDefined();
        expect(arriere, `${fond} introuvable`).toBeDefined();
        const r = ratioContraste(avant as string, arriere as string);
        expect(r, `${jeton} sur ${fond} : ${r.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe('jetons - contraste en mode sombre', () => {
  const valeurs = new Map<string, string>([...clair, ...sombre]);
  const paires: Array<[string, string]> = [
    ['--texte-fort', '--surface-1'],
    ['--texte', '--surface-1'],
    ['--texte-faible', '--surface-1'],
    ['--texte-faible', '--surface-2'],
    ['--reussite', '--surface-1'],
    ['--erreur', '--surface-1'],
  ];
  for (const [avant, fond] of paires) {
    it(`${avant} sur ${fond} atteint 4,5 en sombre`, () => {
      const r = ratioContraste(valeurs.get(avant) as string, valeurs.get(fond) as string);
      expect(r, `${avant} sur ${fond} en sombre : ${r.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    });
  }
});
```

- [ ] **Étape 4 : commit** — « jetons : noyau complet, trois états de thème, garde de contraste, écrit, non testé »

---

## Tâche 6 : Le préréglage Tailwind

**Fichiers :**
- Créer : `noyau/ai5d.preset.css`, `tests/preset.test.ts`

**Écart assumé par rapport à la spec.** La spec §8 nomme le fichier `ai5d.preset.ts`.
Tailwind v4 abandonne la configuration JavaScript au profit d'un bloc `@theme` en CSS. Un
préréglage TypeScript serait une couche de traduction sans usage. On livre donc
`ai5d.preset.css`. L'export `"./preset"` du `package.json` pointe dessus, si bien qu'un
projet consommateur n'est pas affecté par l'écart. **À consigner dans `docs/decisions/`.**

- [ ] **Étape 1 : écrire `noyau/ai5d.preset.css`**

Le fichier importe `jetons.css`, `polices/polices.css` et `../densites/profils.css`, puis
déclare un bloc `@theme` qui **ne fait que pointer vers les jetons** — jamais une valeur en
dur, contrainte C2. Exemple de la forme attendue :

```css
@import './jetons.css';
@import './polices/polices.css';
@import '../densites/profils.css';

@theme {
  --color-encre: var(--encre);
  --color-action: var(--action);
  --color-surface-1: var(--surface-1);
  --color-texte-faible: var(--texte-faible);
  --color-reussite: var(--reussite);
  --font-titre: var(--police-titre);
  --font-corps: var(--police-corps);
  --radius-md: var(--rayon-md);
  --shadow-2: var(--elevation-2);
  /* … une entree par jeton expose a Tailwind */
}
```

- [ ] **Étape 2 : écrire `tests/preset.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const preset = readFileSync('noyau/ai5d.preset.css', 'utf8');
const bloc = /@theme\s*\{([\s\S]*?)\n\}/.exec(preset)?.[1] ?? '';

describe('prereglage Tailwind', () => {
  it('importe les jetons, les polices et les densites', () => {
    expect(preset).toContain("@import './jetons.css'");
    expect(preset).toContain("@import './polices/polices.css'");
    expect(preset).toContain("@import '../densites/profils.css'");
  });

  it('declare un bloc @theme non vide', () => {
    expect(bloc.trim().length).toBeGreaterThan(0);
  });

  it('ne contient aucune couleur en dur - contrainte C2', () => {
    expect(bloc).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });

  it('ne fait que pointer vers des jetons', () => {
    const declarations = [...bloc.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)];
    expect(declarations.length).toBeGreaterThan(10);
    for (const [, nom, valeur] of declarations) {
      expect(valeur?.trim(), `${nom} ne pointe pas vers un jeton`).toMatch(
        /^var\(--[a-z0-9-]+\)$/,
      );
    }
  });

  it('expose au moins les familles de couleur, de police et de rayon', () => {
    expect(bloc).toContain('--color-');
    expect(bloc).toContain('--font-');
    expect(bloc).toContain('--radius-');
  });
});
```

- [ ] **Étape 3 : commit** — « préréglage : bloc @theme Tailwind v4 pointant vers les jetons, écrit, non testé »

---

## Tâche 7 : Les densités

**Fichiers :**
- Créer : `densites/profils.css`, `tests/densites.test.ts`

**Interfaces :**
- Produit : les variables `--rythme-section`, `--padding-carte`, `--hauteur-controle`,
  `--ligne-liste`, `--interligne-corps`, `--contenu-max`. Consommées par T9 à T13.

- [ ] **Étape 1 : écrire `densites/profils.css`**

```css
/* =========================================================================
   AI5D Digital Design System - profils de densite

   Meme ADN partout. Seule varie la densite fonctionnelle.

   Deux regles, et elles ne se negocient pas :
     1. La densite change l'espace entre les choses, jamais la taille du texte.
        Ce fichier ne contient donc ni couleur, ni police, ni taille de texte.
     2. Le plancher tactile de 44 px prime sur les quatre profils.
   ========================================================================= */

:root,
[data-densite='aere'] {
  --rythme-section: 64px;
  --padding-carte: 32px;
  --hauteur-controle: 48px;
  --ligne-liste: 64px;
  --interligne-corps: 1.6;
  --contenu-max: 1120px;
}

[data-densite='equilibre'] {
  --rythme-section: 48px;
  --padding-carte: 24px;
  --hauteur-controle: 48px;
  --ligne-liste: 56px;
  --interligne-corps: 1.55;
  --contenu-max: 1120px;
}

[data-densite='modere'] {
  --rythme-section: 40px;
  --padding-carte: 20px;
  --hauteur-controle: 44px;
  --ligne-liste: 48px;
  --interligne-corps: 1.5;
  --contenu-max: 1280px;
}

[data-densite='compact'] {
  --rythme-section: 32px;
  --padding-carte: 16px;
  --hauteur-controle: 40px;
  --ligne-liste: 40px;
  --interligne-corps: 1.45;
  --contenu-max: 100%;
}

/* Le plancher tactile. Le profil compact descend a 40 px sur un ecran de bureau
   avec une souris, jamais sur un telephone. La regle s'exprime ici une fois pour
   toutes : elle n'est donc pas negociable a la main, ecran par ecran. */
@media (pointer: coarse) {
  :root,
  [data-densite] {
    --hauteur-controle: max(var(--hauteur-controle), 44px);
    --ligne-liste: max(var(--ligne-liste), 44px);
  }
}
```

- [ ] **Étape 2 : écrire `tests/densites.test.ts`**

```ts
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

/** Le tableau de la spec section 6.1, recopie. */
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
      for (const v of VARIABLES) {
        expect(jetons.get(v), `${profil} : ${v} manquant`).toBe(ATTENDU[profil]?.[v]);
      }
    });
  }

  it('le profil aere est aussi le defaut sur :root', () => {
    const racine = lireJetons(CHEMIN, ':root');
    expect(racine.get('--hauteur-controle')).toBe('48px');
  });
});

describe('regle 1 - la densite ne touche jamais au texte ni aux couleurs', () => {
  it('ne contient aucune couleur', () => {
    expect(brut).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
    expect(brut).not.toMatch(/\brgba?\(/);
  });

  it('ne contient aucune famille ni taille de police', () => {
    expect(brut).not.toMatch(/font-family/);
    expect(brut).not.toMatch(/font-size/);
    expect(brut).not.toMatch(/--taille-/);
  });

  it('ne declare que les six variables autorisees', () => {
    const declarees = new Set(
      [...brut.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1] as string),
    );
    for (const d of declarees) {
      expect(VARIABLES as readonly string[], `${d} n'a rien a faire ici`).toContain(d);
    }
  });
});

describe('regle 2 - le plancher tactile (contrainte C4)', () => {
  it('existe sous forme de requete media, et non ecran par ecran', () => {
    expect(brut).toContain('@media (pointer: coarse)');
  });

  it('releve la hauteur de controle et la ligne de liste a 44 px au minimum', () => {
    const bloc = /@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/.exec(brut)?.[1] ?? '';
    expect(bloc).toContain('max(var(--hauteur-controle), 44px)');
    expect(bloc).toContain('max(var(--ligne-liste), 44px)');
  });

  it('couvre le profil compact, le seul qui descend sous 44 px', () => {
    expect(ATTENDU['compact']?.['--hauteur-controle']).toBe('40px');
    const bloc = /@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/.exec(brut)?.[1] ?? '';
    expect(bloc).toContain('[data-densite]');
  });
});
```

- [ ] **Étape 3 : commit** — « densités : quatre profils et le plancher tactile, écrit, non testé »

---

## Tâches 8 à 13 : Les composants de base

**Convention commune à ces six tâches.**

- Un fichier par composant, dans `noyau/composants/`.
- Chaque composant est une fonction React typée, sans état interne inutile, qui accepte
  `className` et transmet le reste de ses props à son élément racine.
- **Aucune couleur en dur** : les styles passent par les variables CSS (contrainte C2). On
  utilise l'attribut `style` avec des `var(--…)` plutôt que des classes utilitaires, de
  sorte que le composant fonctionne dans un projet qui n'aurait pas Tailwind.
- Chaque composant expose ses états par des props explicites, jamais par des classes que le
  consommateur devrait deviner.
- Chaque tâche écrit son composant **et** son test de rendu dans le même commit.

### Tâche 8 : `Logotype`

**Fichiers :** Créer `noyau/composants/Logotype.tsx`, `tests/composants/Logotype.test.tsx`

**Interfaces :**
- Produit : `<Logotype variante="encre" | "blanc" produit?: string taille?: number />`.
  Consommé par T13 (`CarteAuth`) et par la couche écosystème plus tard.

- [ ] **Étape 1 : écrire le composant**

Rend « AI », puis « 5 » **en `var(--action)` et incliné de -5°**, puis « D », en
`var(--police-corps)` graisse 700, interlettrage `var(--lettrage-marque)`. Si `produit` est
fourni, il suit en `var(--police-titre)` graisse 300, précédé d'une marge de 10 px. La
variante `blanc` remplace `var(--encre)` par `var(--blanc)` sur « AI » et « D » — **jamais
sur le « 5 »**, qui reste bleu en toutes circonstances (interdit de la charte mère §08).

- [ ] **Étape 2 : écrire le test**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logotype } from '../../noyau/composants/Logotype';

describe('Logotype', () => {
  it('rend les trois parties du mot', () => {
    render(<Logotype />);
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('incline le 5 de -5 degres et le laisse bleu', () => {
    render(<Logotype />);
    const cinq = screen.getByText('5');
    expect(cinq.style.transform).toContain('-5deg');
    expect(cinq.style.color).toContain('--action');
  });

  it('garde le 5 bleu meme en variante blanche', () => {
    render(<Logotype variante="blanc" />);
    expect(screen.getByText('5').style.color).toContain('--action');
    expect(screen.getByText('AI').style.color).toContain('--blanc');
  });

  it('affiche le label de produit quand il est fourni', () => {
    render(<Logotype produit="Compte" />);
    expect(screen.getByText('Compte')).toBeInTheDocument();
  });

  it("n'affiche aucun label quand il n'y en a pas", () => {
    const { container } = render(<Logotype />);
    expect(container.textContent).toBe('AI5D');
  });

  it('porte un role d image accessible', () => {
    render(<Logotype produit="Compte" />);
    expect(screen.getByRole('img', { name: /AI5D Compte/i })).toBeInTheDocument();
  });
});
```

- [ ] **Étape 3 : commit** — « Logotype : le 5 incliné, invariant de marque, écrit, non testé »

### Tâche 9 : `Bouton`

**Fichiers :** Créer `noyau/composants/Bouton.tsx`, `tests/composants/Bouton.test.tsx`

**Interfaces :**
- Produit : `<Bouton variante="primaire" | "secondaire" | "discret" taille="sm" | "md" | "lg"
  chargement?: boolean disabled?: boolean />`. Consommé par T13.

- [ ] **Étape 1 : écrire le composant.** Hauteur `var(--hauteur-controle)` en taille `md` —
  **c'est ici que la densité entre dans les composants**. Fond `var(--action)` en primaire,
  bordure `var(--action)` sur fond transparent en secondaire, sans bordure en discret. Rayon
  `var(--rayon-md)`. En chargement : `aria-busy="true"`, bouton désactivé, libellé conservé
  pour ne pas faire sauter la mise en page.

- [ ] **Étape 2 : écrire le test.** Couvre : les trois variantes rendent un `<button>` ; la
  taille `md` utilise `var(--hauteur-controle)` ; `chargement` pose `aria-busy` et `disabled` ;
  un clic sur un bouton désactivé n'appelle pas `onClick` ; `className` fourni est conservé ;
  aucune couleur en dur dans le style calculé.

- [ ] **Étape 3 : commit** — « Bouton : trois variantes, hauteur pilotée par la densité, écrit, non testé »

### Tâche 10 : `Champ`

**Fichiers :** Créer `noyau/composants/Champ.tsx`, `tests/composants/Champ.test.tsx`

**Interfaces :**
- Produit : `<Champ libelle aide? erreur? id? />`, transmet le reste à `<input>`.

- [ ] **Étape 1 : écrire le composant.** Le libellé est **toujours** lié à l'entrée par
  `htmlFor`/`id` — un identifiant est engendré si aucun n'est fourni. L'aide et l'erreur sont
  reliées par `aria-describedby`. En erreur : `aria-invalid="true"`, bordure `var(--erreur)`,
  **et un message textuel** — jamais la couleur seule (spec §5.1).

- [ ] **Étape 2 : écrire le test.** Couvre : le libellé trouve son entrée par `getByLabelText` ;
  l'aide est reliée par `aria-describedby` ; l'erreur pose `aria-invalid` **et** affiche son
  texte ; un identifiant engendré reste unique entre deux rendus ; la hauteur suit
  `var(--hauteur-controle)`.

- [ ] **Étape 3 : commit** — « Champ : libellé lié, erreur jamais portée par la seule couleur, écrit, non testé »

### Tâche 11 : `Carte`, `Bandeau`, `Pastille`

**Fichiers :** Créer `noyau/composants/Carte.tsx`, `Bandeau.tsx`, `Pastille.tsx` et leurs
trois fichiers de test.

Ces trois composants partagent un test commun — le registre sémantique — d'où leur
regroupement dans une seule tâche.

- [ ] **Étape 1 : `Carte`.** Fond `var(--surface-2)`, filet `var(--bordure)`, rayon
  `var(--rayon-lg)`, ombre `var(--elevation-2)`, padding **`var(--padding-carte)`** — second
  point d'entrée de la densité. Prop `cliquable` qui ajoute un état de survol et rend un
  `<button>` plutôt qu'une `<div>`.

- [ ] **Étape 2 : `Bandeau`.** Quatre tons : `information`, `reussite`, `attention`, `erreur`.
  Chacun porte **une icône Lucide et un mot**, jamais la couleur seule. `role="status"` pour
  information et réussite, `role="alert"` pour attention et erreur.

- [ ] **Étape 3 : `Pastille`.** Mêmes quatre tons, en version compacte. Toujours du texte à
  l'intérieur.

- [ ] **Étape 4 : les trois tests.** Chacun vérifie que le ton rend son icône **et** son texte,
  que le rôle ARIA correspond au ton, et qu'aucune couleur n'est en dur. `Carte` vérifie en
  plus qu'elle rend un `<button>` quand elle est cliquable, et que son padding vient de
  `var(--padding-carte)`.

- [ ] **Étape 5 : commit** — « Carte, Bandeau, Pastille : registre sémantique jamais porté par la seule couleur, écrit, non testé »

### Tâche 12 : `Icone`

**Fichiers :** Créer `noyau/composants/Icone.tsx`, `tests/composants/Icone.test.tsx`

**Interfaces :**
- Produit : `<Icone nom={LucideIcon} taille?: 16|20|24|32|72 titre?: string />`.

- [ ] **Étape 1 : écrire le composant.** Épaisseur de trait **1,75** (spec §5.4), jamais
  remplie. Sans `titre`, l'icône est décorative : `aria-hidden="true"`. Avec `titre`, elle
  porte `role="img"` et son libellé.

- [ ] **Étape 2 : écrire le test.** Couvre : l'épaisseur vaut 1,75 ; les cinq tailles
  autorisées passent, une autre est refusée par le type ; sans titre, `aria-hidden` ; avec
  titre, `role="img"` et nom accessible.

- [ ] **Étape 3 : commit** — « Icone : contour 1,75, décorative par défaut, écrit, non testé »

### Tâche 13 : `CarteAuth`

**Fichiers :** Créer `noyau/composants/CarteAuth.tsx`, `tests/composants/CarteAuth.test.tsx`

**Interfaces :**
- Consomme : `Logotype` (T8), `Carte` (T11).
- Produit : `<CarteAuth titre produit? children />`.

- [ ] **Étape 1 : écrire le gabarit.** Fond de page `var(--surface-1)`, contenu centré,
  carte de **largeur `min(420px, 100% - 32px)`** — bloquée à 420 px à **toutes** les tailles,
  y compris au-delà de 1280 px (spec §10.2 de la charte Platform, chapitre 07 de la charte).
  Logotype en tête avec le label de produit, titre en `var(--police-titre)`
  `var(--taille-xl)`, puis les enfants.

- [ ] **Étape 2 : écrire le test.** Couvre : la largeur maximale vaut bien `min(420px, 100% - 32px)` ;
  le logotype est présent et porte le label de produit ; le titre est rendu en `<h1>` ; les
  enfants sont rendus ; le fond est `var(--surface-1)`.

- [ ] **Étape 3 : commit** — « CarteAuth : gabarit d'authentification, largeur bloquée à 420 px, écrit, non testé »

---

## Tâche 14 : Index des composants et spécimens

**Fichiers :**
- Créer : `noyau/composants/index.ts`, `_build/generer-specimens.mjs`, `tests/index.test.ts`

- [ ] **Étape 1 : `noyau/composants/index.ts`** — réexporte les huit composants et leurs types.

- [ ] **Étape 2 : `_build/generer-specimens.mjs`** — engendre `specimens/composants.html` :
  une page qui affiche chaque composant dans **tous ses états**, en clair et en sombre, et
  dans les **quatre densités**. La page importe `ai5d.preset.css` et n'appelle aucun réseau.
  C'est la preuve visuelle du lot 2, à ouvrir dans un navigateur.

- [ ] **Étape 3 : `tests/index.test.ts`** — vérifie que l'index exporte les huit noms
  attendus, et qu'aucun fichier de `noyau/composants/` n'est absent de l'index.

- [ ] **Étape 4 : commit** — « index et spécimens : les huit composants, tous états, quatre densités, écrit, non testé »

---

## Tâche 15 : Les trois gardes distribuables

Ce sont les tests que **les projets consommateurs** exécutent chez eux. Ils diffèrent des
tests précédents : ils prennent une racine de projet en paramètre.

**Fichiers :**
- Créer : `gardes/index.ts`, `gardes/aucune-couleur-en-dur.test.ts`,
  `gardes/aucun-jeton-de-marque-redefini.test.ts`, `gardes/cible-tactile-minimale.test.ts`

**Interfaces :**
- Produit : `verifierAucuneCouleurEnDur(racine, exceptions): Infraction[]`,
  `verifierAucunJetonDeMarqueRedefini(racine): Infraction[]`,
  `verifierCibleTactile(cssDensites): Infraction[]`, et
  `type Infraction = { fichier: string; ligne: number; extrait: string; regle: string }`.

- [ ] **Étape 1 : écrire `gardes/index.ts`** — les trois fonctions, pures, qui parcourent une
  arborescence et rendent une liste d'infractions. Elles ne lèvent pas et n'affichent rien :
  c'est l'appelant qui décide quoi en faire.

- [ ] **Étape 2 : écrire les trois fichiers de test**, chacun appliquant sa garde au dépôt
  lui-même. Exceptions de la garde C2 : `noyau/marque.css`, `noyau/jetons.css`,
  `noyau/ai5d.preset.css`, `noyau/polices/**`, `tests/**`, `specimens/**`.

> Les tests sont exclus de la garde parce qu'ils citent délibérément des hexadécimaux — le
> test des jetons vérifie des valeurs, il ne peut pas le faire sans les nommer.

- [ ] **Étape 3 : commit** — « gardes : les trois vérifications distribuées aux projets, écrit, non testé »

---

## Tâche 16 : Les documents

**Fichiers :**
- Créer : `noyau/NOYAU.md`, `noyau/formulations.md`, `densites/DENSITES.md`,
  `docs/decisions/001-copie-verifiee-des-jetons-de-marque.md`,
  `docs/decisions/002-prereglage-en-css-plutot-qu-en-typescript.md`
- Modifier : `README.md` (état du chantier)

- [ ] **Étape 1 : `noyau/NOYAU.md`** — le document du noyau : les trois familles de jetons avec
  leurs valeurs et leurs contrastes mesurés, la typographie et ses trois règles, les huit
  composants avec leurs états, l'iconographie, la voix, le mode sombre. Il **cite** la charte
  mère pour tout ce qui est hérité, et ne le redit pas.

- [ ] **Étape 2 : `noyau/formulations.md`** — le répertoire des formulations de référence
  transverses : échec de connexion, anti-énumération, verrouillage, accès refusé, état vide,
  hors ligne. Chacune avec sa règle. Reprises de la charte Platform, chapitre 09.

- [ ] **Étape 3 : `densites/DENSITES.md`** — le tableau, les deux règles, et la façon dont un
  produit choisit son profil. Court par construction.

- [ ] **Étape 4 : les deux décisions d'architecture** — la copie vérifiée plutôt que le paquet
  de marque (spec §4.1), et le préréglage en CSS plutôt qu'en TypeScript (tâche 6). Chacune
  dit l'option écartée et pourquoi.

- [ ] **Étape 5 : commit** — « documents : noyau, formulations, densités, deux décisions, écrit »

---

## Tâche 17 : VÉRIFICATION D'UN SEUL BLOC

C'est ici, et **seulement ici**, que la vérification a lieu. Toutes les tâches précédentes
sont marquées « écrite, non testée ».

- [ ] **Étape 1 : s'assurer que `pnpm install` est terminé** (lancé en tâche 1).

- [ ] **Étape 2 : lancer la vérification complète, dans cet ordre**

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
```

- [ ] **Étape 3 : corriger ce qui échoue, puis relancer le bloc entier.**

Ne pas corriger un test en affaiblissant son assertion. Si la garde de contraste échoue,
c'est la couleur qui est fausse, pas le seuil.

- [ ] **Étape 4 : engendrer et regarder les spécimens**

```bash
pnpm specimens
```

Ouvrir `specimens/composants.html` dans un navigateur. Vérifier de l'œil, et consigner :
les quatre densités se distinguent ; le mode sombre n'a aucune ombre ; le « 5 » est bleu et
incliné dans les deux variantes ; aucune requête réseau dans l'onglet Réseau.

- [ ] **Étape 5 : consigner les preuves dans `docs/preuves/lots-1-3/`**

La sortie de chaque commande, le décompte des tests, les captures des spécimens en clair et
en sombre, et la capture de l'onglet Réseau qui montre zéro appel externe.

- [ ] **Étape 6 : mettre à jour `tasks/todo.md`** — cocher ce qui est fait, **et écrire
  honnêtement ce qui ne l'est pas.**

- [ ] **Étape 7 : commit final** — « vérification des lots 1 à 3 : types, lint, format, tests, spécimens »

---

## Ce que ce plan ne fait pas

| Élément | Lot | Déclencheur |
| ------- | --- | ----------- |
| Traçage des 36 SVG, lockups `compte` et `cercle` | L4 | Quand un produit aura besoin de son jeu complet |
| Les 5 composants inter-produits, les 5 écrans système | L5 | Sprint 03 de la Platform |
| Le gabarit de courriel | L6 | Sprint 01 de la Platform |
| Gardes distribuées aux projets, migration de l'Académie, correction de la spec Platform | L7 | Après validation des lots 1 à 3 |
| Le paquet npm publié | — | Sprint 00 de la Platform, deuxième consommateur |
| Les PDF imprimables du noyau et des densités | L2/L3, différé | Après validation visuelle des spécimens |
