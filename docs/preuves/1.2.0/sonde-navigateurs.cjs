/**
 * Ce que chaque moteur fait du fondu des onglets et de l onglet initial (SPEC 1.2.0, §0.8.3,
 * decision 007), sur le specimen du depot.
 *
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/sonde-navigateurs.cjs
 *
 * WebKit de Playwright n est pas Safari : Safari se constate sur un appareil, ou reste non couvert.
 */
const pw = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const PAGE = pathToFileURL(resolve('specimens/composants.html')).href;
const PROPRIETES = [
  'animation-timeline: scroll()',
  'scroll-initial-target: nearest',
  'selector(:has(a))',
  'container-type: inline-size',
  'mask-image: linear-gradient(black, transparent)',
];

function lireMasque(nom) {
  const rangee = document.querySelector(`[data-specimen="${nom}"] .ai5d-onglets-r`);
  if (rangee === null) return 'absent';
  const style = getComputedStyle(rangee);
  return style.maskImage || style.webkitMaskImage || 'none';
}

(async () => {
  for (const nom of ['chromium', 'firefox', 'webkit']) {
    const navigateur = await pw[nom].launch();
    const tactile = nom === 'firefox' ? { hasTouch: true } : { hasTouch: true, isMobile: true };

    const etroit = await navigateur.newContext({ viewport: { width: 390, height: 844 }, ...tactile });
    const page = await etroit.newPage();
    await page.goto(PAGE, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    await page.addScriptTag({ content: lireMasque.toString() });
    const constat = await page.evaluate((proprietes) => {
      const initiale = document.querySelector('[data-specimen="onglets-initial"] .ai5d-onglets-r');
      return {
        prisEnCharge: Object.fromEntries(proprietes.map((p) => [p, CSS.supports(p)])),
        pointerCoarse: matchMedia('(pointer: coarse)').matches,
        masqueDebut: lireMasque('onglets-debut'),
        masqueMilieu: lireMasque('onglets-milieu'),
        masqueFin: lireMasque('onglets-fin'),
        scrollInitial: initiale === null ? 'absent' : initiale.scrollLeft,
      };
    }, PROPRIETES);
    await etroit.close();

    const large = await navigateur.newContext({ viewport: { width: 1280, height: 900 } });
    const pageLarge = await large.newPage();
    await pageLarge.goto(PAGE, { waitUntil: 'load' });
    await pageLarge.waitForTimeout(600);
    await pageLarge.addScriptTag({ content: lireMasque.toString() });
    const masqueSansDebordement = await pageLarge.evaluate(() => lireMasque('onglets-large'));
    await large.close();

    console.log(`\n== ${nom} ${navigateur.version()}`);
    console.log(JSON.stringify({ ...constat, masqueSansDebordement }, null, 2));
    await navigateur.close();
  }
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
