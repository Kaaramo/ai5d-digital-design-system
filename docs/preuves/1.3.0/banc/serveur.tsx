/**
 * Le rendu serveur du banc : chaque section écrite en HTML, comme Next l'enverrait. La page
 * `feuilles-client` n'a pas de rendu serveur : son client monte les cinq cents boutons seul.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { Page, SECTIONS } from './pages';

const DOSSIER = 'docs/preuves/1.3.0/banc/genere';
mkdirSync(DOSSIER, { recursive: true });

for (const section of SECTIONS) {
  const html = `<!doctype html>${renderToString(<Page section={section} />)}`;
  writeFileSync(`${DOSSIER}/${section}.html`, html);
  console.log(`${section}.html · balises <style au serveur : ${(html.match(/<style/g) ?? []).length}`);
}
