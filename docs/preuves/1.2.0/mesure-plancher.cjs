/**
 * La mesure du plancher tactile dans un vrai moteur (SPEC 1.2.0, §5.1.4, troisieme preuve).
 *
 * jsdom ne calcule aucune propriete personnalisee : c est ce qui a laisse vivre le defaut de la 0.1.0
 * a la 1.1.0. Ce script ouvre le specimen du depot, qui importe les vraies feuilles par le prereglage,
 * dans deux contextes (souris a 1280 px, doigt a 390 px), verifie d abord que `pointer: coarse` vaut
 * ce qu il doit, puis releve pour chaque profil les deux proprietes calculees et la hauteur de six
 * elements construits sur les formules exactes des composants :
 *
 *   bouton-sm, -md, -lg   Bouton.tsx, HAUTEURS, et min-height: var(--cible-tactile)
 *   champ                 Champ.tsx, styleEntree
 *   squelette-controle    Squelette.tsx, SqueletteFormulaire, hauteur var(--hauteur-controle)
 *   ligne-de-liste        min-height: var(--ligne-liste), la hauteur de LigneLien
 *
 * La zone de mesure est injectee par le script, et non lue dans le specimen : celui de la 1.1.0 n a
 * ni tailles de bouton ni blocs de mesure, et la mesure « avant » doit etre la meme que la mesure
 * « apres ».
 *
 * Il n ajoute aucune dependance au depot : il emploie le Playwright installe sur le poste.
 *   NODE_PATH="$(npm root -g)" node docs/preuves/1.2.0/mesure-plancher.cjs avant
 */
const { chromium } = require('playwright');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const MOMENT = process.argv[2] ?? 'sans-nom';
const PAGE = pathToFileURL(resolve('specimens/composants.html')).href;
const PROFILS = ['aere', 'equilibre', 'modere', 'compact'];

const CONTEXTES = [
  { nom: 'souris', grossier: false, options: { viewport: { width: 1280, height: 800 } } },
  {
    nom: 'doigt',
    grossier: true,
    options: {
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 3,
    },
  },
];

const ZONE = [
  ['bouton-sm', 'height: calc(var(--hauteur-controle) - 8px); min-height: var(--cible-tactile)'],
  ['bouton-md', 'height: var(--hauteur-controle); min-height: var(--cible-tactile)'],
  ['bouton-lg', 'height: calc(var(--hauteur-controle) + 8px); min-height: var(--cible-tactile)'],
  ['champ', 'height: var(--hauteur-controle); min-height: var(--cible-tactile)'],
  ['squelette-controle', 'height: var(--hauteur-controle)'],
  ['ligne-de-liste', 'min-height: var(--ligne-liste)'],
];

async function mesurer(page) {
  return page.evaluate(
    ({ profils, zone }) => {
      const conteneur = document.createElement('div');
      conteneur.id = 'zone-de-mesure';
      conteneur.innerHTML = zone
        .map(
          ([cle, style]) =>
            `<div data-mesure="${cle}" style="display: flex; align-items: center; box-sizing: border-box; ${style}">${cle}</div>`,
        )
        .join('');
      document.body.prepend(conteneur);

      const racine = document.documentElement;
      const lignes = [];
      for (const profil of profils) {
        racine.setAttribute('data-densite', profil);
        const calcule = getComputedStyle(racine);
        const ligne = {
          profil,
          '--hauteur-controle': JSON.stringify(calcule.getPropertyValue('--hauteur-controle').trim()),
          '--ligne-liste': JSON.stringify(calcule.getPropertyValue('--ligne-liste').trim()),
        };
        for (const [cle] of zone) {
          const element = document.querySelector(`[data-mesure="${cle}"]`);
          ligne[cle] = Math.round(element.getBoundingClientRect().height * 100) / 100;
        }
        lignes.push(ligne);
      }

      conteneur.remove();
      racine.removeAttribute('data-densite');
      return lignes;
    },
    { profils: PROFILS, zone: ZONE },
  );
}

(async () => {
  const navigateur = await chromium.launch();
  console.log(`Mesure du plancher tactile · ${MOMENT} · Chromium ${navigateur.version()}`);
  console.log(`Page : ${PAGE}`);

  for (const contexte of CONTEXTES) {
    const ctx = await navigateur.newContext(contexte.options);
    const page = await ctx.newPage();
    await page.goto(PAGE, { waitUntil: 'load' });
    const grossier = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
    console.log(
      `\n== ${contexte.nom} · ${contexte.options.viewport.width} px · matchMedia('(pointer: coarse)').matches = ${grossier}`,
    );
    if (grossier !== contexte.grossier) {
      console.error(`ECHEC : pointer: coarse vaut ${grossier}, attendu ${contexte.grossier}.`);
      process.exitCode = 1;
      await ctx.close();
      continue;
    }
    for (const ligne of await mesurer(page)) console.log(JSON.stringify(ligne));
    await ctx.close();
  }

  await navigateur.close();
})().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
