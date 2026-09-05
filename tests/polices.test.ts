import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const DOSSIER = 'noyau/polices';
const css = readFileSync(join(DOSSIER, 'polices.css'), 'utf8');
const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith('.woff2'));

/**
 * Trois fichiers, et non huit : Inter et Fraunces sont variables, un seul fichier
 * porte toute leur plage de graisses. Voir _build/recuperer-polices.mjs, piege 3.
 */
const ATTENDUS = ['fraunces-variable.woff2', 'inter-variable.woff2', 'jetbrains-mono-500.woff2'];

describe('polices - fichiers', () => {
  it('livre les trois fichiers attendus, et rien de plus', () => {
    expect(fichiers.sort()).toEqual(ATTENDUS);
  });

  it('ne livre que du woff2 authentique', () => {
    for (const f of fichiers) {
      const octets = readFileSync(join(DOSSIER, f));
      expect(octets.subarray(0, 4).toString('latin1'), `${f} n'est pas un woff2`).toBe('wOF2');
    }
  });

  it('garde des tailles plausibles pour un sous-ensemble latin', () => {
    for (const f of fichiers) {
      const taille = statSync(join(DOSSIER, f)).size;
      expect(taille, `${f} est vide ou tronque`).toBeGreaterThan(5_000);
      expect(taille, `${f} depasse 200 Ko : le sous-ensemblage a echoue`).toBeLessThan(200_000);
    }
  });

  it("ne contient aucun doublon - c'est la regression que le script a corrigee", () => {
    const empreintes = fichiers.map((f) =>
      createHash('sha256').update(readFileSync(join(DOSSIER, f))).digest('hex'),
    );
    expect(new Set(empreintes).size, 'deux fichiers de police sont identiques').toBe(
      fichiers.length,
    );
  });

  it('tient sous 200 Ko au total', () => {
    const total = fichiers.reduce((somme, f) => somme + statSync(join(DOSSIER, f)).size, 0);
    expect(total, `${(total / 1024).toFixed(1)} Ko`).toBeLessThan(200_000);
  });
});

describe('polices - declaration CSS', () => {
  it('declare une face par fichier', () => {
    expect((css.match(/@font-face/g) ?? []).length).toBe(ATTENDUS.length);
  });

  it("n'appelle aucun reseau - contrainte C6", () => {
    expect(css).not.toMatch(/https?:/);
    expect(css).not.toContain('fonts.googleapis');
    expect(css).not.toContain('fonts.gstatic');
  });

  it('ne reference que des chemins relatifs, en woff2', () => {
    const sources = [...css.matchAll(/src:\s*url\('([^']+)'\)\s*format\('([^']+)'\)/g)];
    expect(sources.length).toBe(ATTENDUS.length);
    for (const [, chemin, format] of sources) {
      expect(chemin, 'chemin non relatif').toMatch(/^\.\//);
      expect(format).toBe('woff2');
      expect(fichiers, `${chemin} ne correspond a aucun fichier`).toContain(
        (chemin as string).slice(2),
      );
    }
  });

  it('declare les trois familles du systeme', () => {
    for (const famille of ['Fraunces', 'Inter', 'JetBrains Mono']) {
      expect(css, `famille ${famille} absente`).toContain(`font-family: '${famille}'`);
    }
  });

  it('declare des plages de graisses pour les polices variables', () => {
    expect(css).toMatch(/font-family: 'Fraunces';[\s\S]*?font-weight: 300 500;/);
    expect(css).toMatch(/font-family: 'Inter';[\s\S]*?font-weight: 400 700;/);
  });

  it('couvre les graisses dont le systeme a besoin', () => {
    // Fraunces 300/400/500 pour l'affichage, Inter 400/500/600/700 pour l'interface.
    const fraunces = /font-family: 'Fraunces';[\s\S]*?font-weight: (\d+) (\d+);/.exec(css);
    expect(Number(fraunces?.[1])).toBeLessThanOrEqual(300);
    expect(Number(fraunces?.[2])).toBeGreaterThanOrEqual(500);

    const inter = /font-family: 'Inter';[\s\S]*?font-weight: (\d+) (\d+);/.exec(css);
    expect(Number(inter?.[1])).toBeLessThanOrEqual(400);
    expect(Number(inter?.[2])).toBeGreaterThanOrEqual(700);
  });

  it('demande un affichage immediat avec repli', () => {
    expect((css.match(/font-display: swap;/g) ?? []).length).toBe(ATTENDUS.length);
  });

  it('porte son en-tete de provenance', () => {
    expect(css).toContain('GENERE par _build/recuperer-polices.mjs');
  });
});
