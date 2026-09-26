/**
 * Les captures de la 1.2.0 (SPEC 1.2.0, §11.2), et les mesures qui les accompagnent.
 *
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/captures.cjs
 *
 * Chaque contexte « doigt » verifie d abord que `pointer: coarse` est vrai, et chaque contexte
 * « souris » qu il est faux : sinon la capture ne vaut rien, et le script s arrete.
 */
const { chromium } = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const PAGE = pathToFileURL(resolve('specimens/composants.html')).href;
const DOSSIER = 'docs/preuves/1.2.0';
const BOUTON_PRIMAIRE = '.ai5d-bouton[data-variante="primaire"][href]';

const souris = (largeur) => ({ viewport: { width: largeur, height: 900 } });
const doigt = (largeur) => ({
  viewport: { width: largeur, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});

async function ouvrir(navigateur, options, theme, grossierAttendu) {
  const contexte = await navigateur.newContext(options);
  const page = await contexte.newPage();
  await page.goto(PAGE, { waitUntil: 'load' });
  await page.evaluate((valeur) => document.documentElement.setAttribute('data-theme', valeur), theme);
  await page.waitForTimeout(400);
  const grossier = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  if (grossier !== grossierAttendu) {
    throw new Error(`pointer: coarse vaut ${grossier}, attendu ${grossierAttendu}`);
  }
  return { contexte, page };
}

async function capturer(page, selecteur, fichier) {
  const element = page.locator(selecteur).first();
  await element.scrollIntoViewIfNeeded();
  await element.screenshot({ path: `${DOSSIER}/${fichier}` });
  console.log(`  ${fichier}`);
}

const masque = (selecteur) =>
  `getComputedStyle(document.querySelector('${selecteur} .ai5d-onglets-r')).maskImage`;

(async () => {
  const navigateur = await chromium.launch();
  console.log(`Captures de la 1.2.0 · Chromium ${navigateur.version()} · ${PAGE}`);

  console.log('\n== Pleines pages');
  for (const [fichier, options, theme, grossier] of [
    ['specimens-souris-clair-1280.png', souris(1280), 'light', false],
    ['specimens-souris-sombre-1280.png', souris(1280), 'dark', false],
    ['specimens-doigt-clair-390.png', doigt(390), 'light', true],
    ['specimens-doigt-sombre-390.png', doigt(390), 'dark', true],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, options, theme, grossier);
    await page.screenshot({ path: `${DOSSIER}/${fichier}`, fullPage: true });
    console.log(`  ${fichier} · pointer: coarse = ${grossier}`);
    await contexte.close();
  }

  console.log('\n== Selecteur de theme');
  for (const [nom, options, grossier] of [
    ['doigt 390', doigt(390), true],
    ['souris 1280', souris(1280), false],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, options, 'light', grossier);
    const mesure = await page.evaluate(() => {
      const groupe = document.querySelector('[data-specimen="theme-icones"] .ai5d-theme');
      const segments = [...groupe.querySelectorAll('.ai5d-theme__segment')].map((segment) => {
        const boite = segment.getBoundingClientRect();
        return `${Math.round(boite.width)}x${Math.round(boite.height)}`;
      });
      return { groupe: Math.round(groupe.getBoundingClientRect().height), segments };
    });
    console.log(`  ${nom} : groupe ${mesure.groupe} px de haut, segments ${mesure.segments.join(', ')}`);
    await contexte.close();
  }
  for (const [fichier, options, grossier, selecteur] of [
    ['specimens-doigt-clair-320.png', doigt(320), true, '[data-specimen="theme-288"]'],
    ['specimens-souris-clair-768.png', souris(768), false, '[data-specimen="theme-216"]'],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, options, 'light', grossier);
    await capturer(page, selecteur, fichier);
    const icones = await page.evaluate(
      (s) => [...document.querySelectorAll(`${s} .ai5d-theme__icone`)].map((i) => getComputedStyle(i).display),
      selecteur,
    );
    const largeur = await page.evaluate(
      (s) => Math.round(document.querySelector(`${s} .ai5d-theme`).getBoundingClientRect().width),
      selecteur,
    );
    console.log(`    groupe de ${largeur} px, icones : ${icones.join(', ')}`);
    await contexte.close();
  }

  console.log('\n== Onglets de rubrique');
  {
    const { contexte, page } = await ouvrir(navigateur, doigt(390), 'light', true);
    for (const position of ['debut', 'milieu', 'fin']) {
      await capturer(page, `[data-specimen="onglets-${position}"]`, `onglets-${position}-390.png`);
      console.log(`    masque : ${await page.evaluate(masque(`[data-specimen="onglets-${position}"]`))}`);
    }
    const initial = await page.evaluate(
      () => document.querySelector('[data-specimen="onglets-initial"] .ai5d-onglets-r').scrollLeft,
    );
    console.log(`  rangee sans defilement impose, scrollLeft au chargement : ${initial}`);
    await contexte.close();
  }
  {
    const { contexte, page } = await ouvrir(navigateur, souris(1280), 'light', false);
    await capturer(page, '[data-specimen="onglets-large"]', 'onglets-1280.png');
    console.log(`    masque, rien ne deborde : ${await page.evaluate(masque('[data-specimen="onglets-large"]'))}`);
    await contexte.close();
  }

  console.log('\n== Selection et curseur');
  for (const [fichier, theme] of [
    ['selection-clair.png', 'light'],
    ['selection-sombre.png', 'dark'],
  ]) {
    const { contexte, page } = await ouvrir(navigateur, souris(1280), theme, false);
    await page.bringToFront();
    const couleurs = await page.evaluate(() => {
      const section = document.querySelector('[data-specimen="selection"]');
      const paragraphes = section.querySelectorAll('p');
      const plage = document.createRange();
      plage.setStartBefore(paragraphes[0]);
      plage.setEndAfter(paragraphes[paragraphes.length - 1]);
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(plage);
      return { curseur: getComputedStyle(section.querySelector('input')).caretColor };
    });
    await capturer(page, '[data-specimen="selection"]', fichier);
    console.log(`    ${theme} : curseur de saisie ${couleurs.curseur}`);
    await contexte.close();
  }

  console.log('\n== Le survol du bouton primaire en lien');
  {
    const { contexte, page } = await ouvrir(navigateur, doigt(390), 'light', true);
    const survol = await page.evaluate(() => matchMedia('(hover: hover)').matches);
    const avant = await page.$eval(BOUTON_PRIMAIRE, (e) => getComputedStyle(e).backgroundColor);
    await page.tap(BOUTON_PRIMAIRE);
    await page.waitForTimeout(400);
    const apres = await page.$eval(BOUTON_PRIMAIRE, (e) => getComputedStyle(e).backgroundColor);
    console.log(`  doigt : hover:hover = ${survol}, fond avant ${avant}, apres le toucher ${apres}`);
    await contexte.close();
  }
  {
    const { contexte, page } = await ouvrir(navigateur, souris(1280), 'light', false);
    const avant = await page.$eval(BOUTON_PRIMAIRE, (e) => getComputedStyle(e).backgroundColor);
    await page.hover(BOUTON_PRIMAIRE);
    await page.waitForTimeout(400);
    const apres = await page.$eval(BOUTON_PRIMAIRE, (e) => getComputedStyle(e).backgroundColor);
    console.log(`  souris : fond au repos ${avant}, au survol ${apres}`);
    await contexte.close();
  }

  await navigateur.close();
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
