import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

interface Manifeste {
  version: string;
  exports: Record<string, string>;
  files: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

const MANIFESTE = JSON.parse(readFileSync('package.json', 'utf8')) as Manifeste;

describe('le champ exports du manifeste (1.2.0)', () => {
  it('chaque chemin exporte existe', () => {
    for (const [cle, chemin] of Object.entries(MANIFESTE.exports)) {
      expect(existsSync(chemin), `${cle} pointe vers ${chemin}, qui n existe pas`).toBe(true);
    }
  });

  it('exporte la recette du logotype et le theme', () => {
    expect(MANIFESTE.exports['./logotype']).toBe('./noyau/logotype.ts');
    expect(MANIFESTE.exports['./theme']).toBe('./noyau/theme.ts');
  });

  it('chaque fichier exporte part avec le paquet', () => {
    for (const chemin of Object.values(MANIFESTE.exports)) {
      const dossier = chemin.replace(/^\.\//, '').split('/')[0] ?? '';
      expect(MANIFESTE.files, `${chemin} ne part pas avec le paquet`).toContain(dossier);
    }
  });
});

describe('aucune dependance ajoutee (SPEC 1.2.0, §0.7)', () => {
  it('garde exactement les dependances de la 1.1.0', () => {
    expect(Object.keys(MANIFESTE.dependencies).sort()).toEqual(['clsx', 'react', 'react-dom']);
    expect(Object.keys(MANIFESTE.peerDependencies).sort()).toEqual([
      'lucide-react',
      'react',
      'react-dom',
    ]);
    expect(Object.keys(MANIFESTE.devDependencies).sort()).toEqual([
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@testing-library/user-event',
      '@types/node',
      '@types/react',
      '@types/react-dom',
      '@vitejs/plugin-react',
      'eslint',
      'jsdom',
      'lucide-react',
      'prettier',
      'typescript',
      'typescript-eslint',
      'vitest',
    ]);
  });
});
