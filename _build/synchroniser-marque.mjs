/**
 * Copie les jetons de marque depuis AI5D_Brand_2026 vers noyau/marque.css.
 *
 * Pourquoi une copie et non une dépendance : la marque n'est ni un dépôt Git ni un
 * paquet npm. Publier `AI5D_Brand_2026/tokens.css` comme paquet reviendrait à versionner
 * la marque, c'est-à-dire à la faire bouger — ce que la décision D1 de la spec interdit.
 *
 * La copie est donc assumée, et rendue sûre par `tests/marque.test.ts`, qui relit la
 * source et échoue si les deux ont divergé. La copie ne peut pas dériver en silence.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const SOURCE = 'C:/Users/ksthe/Documents/AI5D_Brand_2026/tokens.css';
const CIBLE = 'noyau/marque.css';

/**
 * Les six seuls jetons que le registre applicatif hérite de la marque.
 * À gauche le nom local, à droite le nom dans la source. La liste est fermée :
 * ajouter une entrée est une décision d'architecture, pas une commodité.
 */
const JETONS = [
  ['--marque-encre', '--ai5d-ink'],
  ['--marque-navy', '--ai5d-navy'],
  ['--marque-action', '--ai5d-blue'],
  ['--marque-action-survol', '--ai5d-blue-hover'],
  ['--marque-action-clair', '--ai5d-blue-light'],
  ['--marque-blanc', '--ai5d-white'],
];

function extraire(css, nom) {
  const correspondance = new RegExp(`${nom}\\s*:\\s*(#[0-9A-Fa-f]{6})\\s*;`).exec(css);
  if (!correspondance) {
    throw new Error(
      `Jeton ${nom} introuvable dans la source de marque. ` +
        'La marque a change de forme : verifier avant de regenerer.',
    );
  }
  return correspondance[1].toUpperCase();
}

async function main() {
  const source = await readFile(SOURCE, 'utf8');
  const empreinte = createHash('sha256').update(source).digest('hex').slice(0, 16);

  const lignes = JETONS.map(([local, amont]) => {
    const valeur = extraire(source, amont);
    return `  ${local}: ${valeur};`.padEnd(42) + ` /* ${amont} */`;
  });

  const contenu = [
    '/* =========================================================================',
    '   AI5D Digital Design System - jetons de marque',
    '',
    '   GENERE par _build/synchroniser-marque.mjs. Ne pas modifier a la main.',
    `   Source    : ${SOURCE}`,
    `   Empreinte : sha256(16) ${empreinte}`,
    `   Synchronise le ${new Date().toISOString().slice(0, 10)}`,
    '',
    '   Ces six valeurs appartiennent a la marque institutionnelle. Le prefixe',
    '   --marque- les rend intouchables : le noyau les aliase vers ses propres noms,',
    '   et aucune valeur de marque n apparait ailleurs que dans ce fichier.',
    '   La garde aucun-jeton-de-marque-redefini le verifie.',
    '   ========================================================================= */',
    '',
    ':root {',
    ...lignes,
    '}',
    '',
  ].join('\n');

  await writeFile(CIBLE, contenu, 'utf8');
  console.log(`${CIBLE} ecrit. ${JETONS.length} jetons, empreinte source ${empreinte}.`);
}

main().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
