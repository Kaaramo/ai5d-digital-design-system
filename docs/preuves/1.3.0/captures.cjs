/**
 * Les captures de la 1.3.0 (SPEC 1.3.0, §11.2) : les spécimens en clair et en sombre, et le survol
 * rendu par React sur le banc d'essai, une ligne survolée à côté de deux lignes sélectionnées, un
 * menu ouvert dont un élément est survolé, le rail.
 *
 *   node _build/generer-specimens.mjs && node docs/preuves/1.3.0/banc.mjs
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.3.0/captures.cjs
 *
 * Chaque contexte « doigt » vérifie d'abord que `pointer: coarse` est vrai, et chaque contexte
 * « souris » qu'il est faux ; chaque page, qu'elle ne déborde pas (leçon de la 1.2.0).
 */
const { chromium } = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const DOSSIER = 'docs/preuves/1.3.0';
const SPECIMENS = pathToFileURL(resolve('specimens/composants.html')).href;
const SURVOL = pathToFileURL(resolve(`${DOSSIER}/banc/genere/survol.html`)).href;

const souris = (largeur) => ({ viewport: { width: largeur, height: 900 } });
const doigt = (largeur) => ({
  viewport: { width: largeur, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});

async function ouvrir(navigateur, adresse, options, theme, grossierAttendu) {
  const contexte = await navigateur.newContext(options);
  const page = await contexte.newPage();
  await page.goto(adresse, { waitUntil: 'load' });
  await page.evaluate((valeur) => document.documentElement.setAttribute('data-theme', valeur), theme);
  await page.waitForTimeout(400);
  const constat = await page.evaluate(() => ({
    grossier: matchMedia('(pointer: coarse)').matches,
    deborde: document.documentElement.scrollWidth > innerWidth,
  }));
  if (constat.grossier !== grossierAttendu) {
    throw new Error(`pointer: coarse vaut ${constat.grossier}, attendu ${grossierAttendu}`);
  }
  if (constat.deborde) throw new Error(`la page déborde à ${options.viewport.width} px`);
  return { contexte, page };
}

/** Le rapport de luminance de deux couleurs calculées : dit si un survol se voit à côté d'un autre fond. */
function rapport(a, b) {
  const lum = (rgb) => {
    const [r, g, v] = rgb.match(/\d+/g).slice(0, 3).map(Number).map((c) => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * v;
  };
  const [claire, sombre] = [lum(a), lum(b)].sort((x, y) => y - x);
  return ((claire + 0.05) / (sombre + 0.05)).toFixed(2);
}

(async () => {
  const navigateur = await chromium.launch();
  console.log(`Captures de la 1.3.0 · Chromium ${navigateur.version()}`);

  console.log('\n== Spécimens, pleines pages');
  for (const [fichier, options, theme, grossier] of [
    ['specimens-clair-1280.png', souris(1280), 'light', false],
    ['specimens-sombre-1280.png', souris(1280), 'dark', false],
    ['specimens-clair-1024.png', souris(1024), 'light', false],
    ['specimens-doigt-clair-390.png', doigt(390), 'light', true],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, SPECIMENS, options, theme, grossier);
    await page.screenshot({ path: `${DOSSIER}/${fichier}`, fullPage: true });
    console.log(`  ${fichier} · pointer: coarse = ${grossier}, aucun débordement`);
    await contexte.close();
  }

  console.log('\n== Survol et sélection, rendus par React');
  for (const [fichier, theme] of [
    ['survol-clair.png', 'light'],
    ['survol-sombre.png', 'dark'],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, SURVOL, souris(1280), theme, false);
    await page.hover('[data-ligne="Mamadou Diallo"] > span');
    await page.waitForTimeout(250);
    const fonds = await page.evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll('.banc-ligne')].map((ligne) => [
          ligne.dataset.ligne,
          getComputedStyle(ligne).backgroundColor,
        ]),
      ),
    );
    const survol = fonds['Mamadou Diallo'];
    const selection = fonds['Fatoumata Bah'];
    await page.screenshot({ path: `${DOSSIER}/${fichier.replace('.png', '-table.png')}` });
    await page.click('[data-ligne="Aïssatou Camara"] .ai5d-bouton');
    await page.waitForTimeout(250);
    await page.getByRole('menuitem', { name: 'Voir la fiche' }).hover();
    await page.waitForTimeout(250);
    const menu = await page.evaluate(() => {
      const liste = document.querySelector('.ai5d-menu__liste:popover-open');
      const survole = [...liste.querySelectorAll('[role="menuitem"]')].find(
        (element) => element.textContent === 'Voir la fiche',
      );
      return {
        fondDuMenu: getComputedStyle(liste).backgroundColor,
        elementSurvole: getComputedStyle(survole).backgroundColor,
      };
    });
    await page.screenshot({ path: `${DOSSIER}/${fichier}` });
    console.log(`  ${fichier}, et sa table seule`);
    console.log(`    ligne survolée ${survol}, lignes sélectionnées ${selection} : écart ${rapport(survol, selection)}`);
    console.log(
      `    menu ${menu.fondDuMenu}, élément survolé ${menu.elementSurvole} : écart ${rapport(menu.fondDuMenu, menu.elementSurvole)}`,
    );
    await contexte.close();
  }

  await navigateur.close();
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
