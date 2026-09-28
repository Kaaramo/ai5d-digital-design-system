/**
 * Construit le banc d'essai de la 1.3.0 et en écrit les pages, sans dépendance ajoutée.
 *
 * esbuild est celui que Vite apporte à Vitest, résolu depuis eux : le dépôt n'en déclare aucun. Deux
 * paquets : le rendu serveur (Node), exécuté aussitôt pour écrire les pages, et le client
 * (navigateur), qui les hydrate. Les pages s'ouvrent ensuite dans Chromium par `sonde-banc.cjs`.
 *
 *   node docs/preuves/1.3.0/banc.mjs
 */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const BANC = 'docs/preuves/1.3.0/banc';
const DOSSIER = `${BANC}/genere`;

const depuisDepot = createRequire(`${process.cwd()}/`);
const vite = createRequire(depuisDepot.resolve('vitest')).resolve('vite');
const { build, version } = await import(pathToFileURL(createRequire(vite).resolve('esbuild')).href);
console.log(`esbuild ${version}, celui de Vite, lui-même celui de Vitest`);

const communs = {
  bundle: true,
  jsx: 'automatic',
  logLevel: 'warning',
  define: { 'process.env.NODE_ENV': '"production"' },
};

await build({
  ...communs,
  entryPoints: [`${BANC}/serveur.tsx`],
  outfile: `${DOSSIER}/serveur.mjs`,
  platform: 'node',
  format: 'esm',
  packages: 'external',
});
await build({
  ...communs,
  entryPoints: [`${BANC}/client.tsx`],
  outfile: `${DOSSIER}/client.js`,
  platform: 'browser',
  format: 'iife',
});

await import(pathToFileURL(`${process.cwd()}/${DOSSIER}/serveur.mjs`).href);
