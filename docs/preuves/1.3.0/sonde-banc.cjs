/**
 * Les mesures du banc d'essai dans Chromium (SPEC 1.3.0, §11.2) : les feuilles, la réserve basse, et
 * le survol du rail capturé en clair et en sombre. Lancé une fois sur la 1.2.0 (tâche 1, « avant »),
 * une fois sur le lot (tâche 18, « apres ») : le même script, les mêmes pages.
 *
 *   node docs/preuves/1.3.0/banc.mjs
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/sonde-banc.cjs avant
 *
 * Il n'ajoute aucune dépendance au dépôt : il emploie le Playwright installé sur le poste.
 */
const { chromium } = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const MOMENT = process.argv[2] ?? 'sans-nom';
const DOSSIER = 'docs/preuves/1.3.0';
const adresse = (section) =>
  pathToFileURL(resolve(`${DOSSIER}/banc/genere/${section}.html`)).href;

async function ouvrir(navigateur, section, largeur, theme) {
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: 900 } });
  const page = await contexte.newPage();
  const erreurs = [];
  page.on('console', (message) => {
    if (message.type() === 'error') erreurs.push(message.text());
  });
  page.on('pageerror', (erreur) => erreurs.push(erreur.message));
  await page.goto(adresse(section), { waitUntil: 'load' });
  if (theme !== undefined) {
    await page.evaluate((valeur) => document.documentElement.setAttribute('data-theme', valeur), theme);
  }
  await page.waitForTimeout(400);
  return { contexte, page, erreurs };
}

/** Toutes les balises de feuille du document, où elles sont, et sous quelle clé. */
function compterFeuilles() {
  const toutes = [...document.querySelectorAll('style')];
  const ids = toutes.map((balise) => balise.id).filter((id) => id !== '');
  return {
    total: toutes.length,
    dansHead: document.head.querySelectorAll('style').length,
    dansBody: document.body.querySelectorAll('style').length,
    identifiants: [...new Set(ids)],
    identifiantsDupliques: ids.length - new Set(ids).size,
    dataHref: toutes.map((balise) => balise.getAttribute('data-href')).filter((cle) => cle !== null),
    boutons: document.querySelectorAll('.ai5d-bouton').length,
  };
}

function mesurerReserve([racine, contenu]) {
  const elementRacine = document.querySelector(racine);
  const elementContenu = document.querySelector(contenu);
  return {
    reserveBarre: getComputedStyle(elementRacine).getPropertyValue('--reserve-barre').trim(),
    styleEnLigne: elementRacine.getAttribute('style'),
    paddingBottomContenu: getComputedStyle(elementContenu).paddingBottom,
  };
}

(async () => {
  const navigateur = await chromium.launch();
  console.log(`Banc 1.3.0 · ${MOMENT} · Chromium ${navigateur.version()}`);

  console.log('\n## Feuilles, 500 boutons et un champ');
  for (const section of ['feuilles', 'feuilles-client']) {
    const { contexte, page, erreurs } = await ouvrir(navigateur, section, 1280);
    console.log(`\n${section} (${section === 'feuilles' ? 'rendu serveur puis hydratation' : 'rendu client seul'})`);
    console.log(JSON.stringify(await page.evaluate(compterFeuilles)));
    console.log(`erreurs de console : ${erreurs.length === 0 ? 'aucune' : erreurs.join(' | ')}`);
    await contexte.close();
  }

  console.log('\n## Réserve basse');
  for (const [section, selecteurs] of [
    ['reserve-coquille', ['.ai5d-coquille-rail', '.ai5d-coquille-rail__contenu']],
    ['reserve-app', ['.ai5d-app', '.ai5d-app__contenu']],
  ]) {
    for (const largeur of [390, 1280]) {
      const { contexte, page, erreurs } = await ouvrir(navigateur, section, largeur);
      console.log(`\n${section} · ${largeur} px`);
      console.log(JSON.stringify(await page.evaluate(mesurerReserve, selecteurs)));
      console.log(`erreurs de console : ${erreurs.length === 0 ? 'aucune' : erreurs.join(' | ')}`);
      await contexte.close();
    }
  }

  console.log('\n## Le rail survolé');
  for (const theme of ['light', 'dark']) {
    const { contexte, page, erreurs } = await ouvrir(navigateur, 'rail', 1280, theme);
    const lien = page.getByRole('link', { name: 'Sécurité' });
    await lien.hover();
    await page.waitForTimeout(300);
    const fonds = await page.evaluate(() =>
      [...document.querySelectorAll('.ai5d-liens-rail__lien')].map(
        (element) => `${element.textContent} : ${getComputedStyle(element).backgroundColor}`,
      ),
    );
    const fichier = `survol-rail-${MOMENT}-${theme === 'light' ? 'clair' : 'sombre'}.png`;
    await page.locator('[data-banc="rail"]').screenshot({ path: `${DOSSIER}/${fichier}` });
    console.log(`\n${fichier} · « Sécurité » survolé, « Formations » actif`);
    console.log(fonds.join('\n'));
    console.log(`erreurs de console : ${erreurs.length === 0 ? 'aucune' : erreurs.join(' | ')}`);
    await contexte.close();
  }

  await navigateur.close();
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
