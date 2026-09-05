import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';

describe('socle du depot', () => {
  it('expose les fichiers de configuration attendus', () => {
    for (const f of ['package.json', 'tsconfig.json', 'vitest.config.ts', 'eslint.config.mjs']) {
      expect(existsSync(f), `${f} manquant`).toBe(true);
    }
  });

  it('declare les trois couches du systeme', () => {
    for (const d of ['noyau', 'densites', 'gardes', 'outils']) {
      expect(existsSync(d), `${d} manquant`).toBe(true);
    }
  });
});
