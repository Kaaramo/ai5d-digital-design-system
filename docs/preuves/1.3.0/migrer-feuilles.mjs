/**
 * La migration mecanique des feuilles vers `feuille(id, css)` (SPEC 1.3.0, §5.1.2 et §5.1.7).
 *
 * Rejouable, et sans effet la seconde fois : chaque remplacement vise la forme de la 1.2.0, qui
 * n existe plus apres. Elle ecrit, fichier par fichier, ce qu elle a change ; le plan (tache 2) dit
 * les nombres attendus. Ecrite dans un fichier et non passee au shell (lecon du depot).
 *
 *   node docs/preuves/1.3.0/migrer-feuilles.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const COMPOSANTS = 'noyau/composants';

/** Insere une ligne d import apres le dernier import de tete du fichier. */
function importer(source, ligne) {
  if (source.includes(ligne)) return source;
  const lignes = source.split('\n');
  let derniere = -1;
  for (let i = 0; i < Math.min(lignes.length, 60); i += 1) {
    if (/^import .*;$/.test(lignes[i]) || /^\} from '.*';$/.test(lignes[i])) derniere = i;
  }
  lignes.splice(derniere + 1, 0, ligne);
  return lignes.join('\n');
}

// 1. Les composants : chaque balise posee a chaque rendu devient une feuille hissee.
const BALISE = /<style\s+id=\{([A-Z_]+)\}\s+dangerouslySetInnerHTML=\{\{\s*__html:\s*([A-Z_]+)\s*\}\}\s*\/>/g;
const CONDITIONNELLE =
  /\{(\w+) \? \(\n\s*<style id=\{ID_STYLE_HORS_ECRAN\} dangerouslySetInnerHTML=\{\{ __html: STYLE_HORS_ECRAN \}\} \/>\n\s*\) : null\}/g;

for (const nom of readdirSync(COMPOSANTS).filter((f) => f.endsWith('.tsx'))) {
  const chemin = `${COMPOSANTS}/${nom}`;
  const avant = readFileSync(chemin, 'utf8');
  let apres = avant
    .replace(CONDITIONNELLE, (_, condition) => `{${condition} ? feuille(ID_STYLE_HORS_ECRAN, STYLE_HORS_ECRAN) : null}`)
    // Bouton.tsx nommait « feuille » sa balise locale : le nom revient a la fonction.
    .replace(
      'const feuille = <style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_BOUTON }} />;',
      'const feuilleBouton = feuille(ID_STYLE, STYLE_BOUTON);',
    )
    .replaceAll('        {feuille}\n', '        {feuilleBouton}\n')
    .replace('      {feuille}\n      {nouvelOnglet', '      {feuilleBouton}\n      {nouvelOnglet')
    .replace(BALISE, (_, id, css) => `{feuille(${id}, ${css})}`);

  // GabaritApp : la balise anonyme de palier rejoint STYLE_APP, une fois.
  if (nom === 'GabaritApp.tsx' && /<style\s*\n\s*dangerouslySetInnerHTML/.test(avant)) {
    apres = apres
      .replace(
        /\s*\{avecBarre \? \(\n\s*<style\n\s*dangerouslySetInnerHTML=\{\{\n\s*__html: `@media \(min-width: \$\{TABLETTE\}px\) \{ \.ai5d-app \{ --reserve-barre: 0px; \} \}`,\n\s*\}\}\n\s*\/>\n\s*\) : null\}/,
        '',
      )
      .replace(
        '@media (min-width: ${BUREAU}px) {\n  .ai5d-app__contenu {',
        '/* La barre basse disparait au palier tablette : sa reserve retombe a zero. */\n@media (min-width: ${TABLETTE}px) {\n  .ai5d-app { --reserve-barre: 0px; }\n}\n\n@media (min-width: ${BUREAU}px) {\n  .ai5d-app__contenu {',
      );
  }

  if (apres !== avant) {
    apres = importer(apres, "import { feuille } from './feuille';");
    writeFileSync(chemin, apres);
    console.log(`${chemin} : ${(apres.match(/feuille\(/g) ?? []).length} appel(s) de feuille()`);
  }
}

// 2. Les tests : chaque lecture d une feuille dans son conteneur ou par son id passe par texteFeuille.
const TESTS = [
  'tests/composants/composants.test.tsx',
  'tests/composants/mobile.test.tsx',
  'tests/composants/onglets-rubrique.test.tsx',
  'tests/composants/grille-cartes.test.tsx',
  'tests/composants/valeur-copiable.test.tsx',
  'tests/composants/bouton-lien.test.tsx',
  'tests/composants/liste-definitions.test.tsx',
];

for (const chemin of TESTS) {
  const avant = readFileSync(chemin, 'utf8');
  let apres = avant
    .replace(
      /const feuille = container\.querySelector\('#ai5d-bouton'\);\n\s*expect\(feuille\)\.not\.toBeNull\(\);\n\s*const css = feuille\?\.innerHTML \?\? '';/,
      "const css = texteFeuille('ai5d-bouton');",
    )
    .replace(
      /\(?(?:container|document)\.(?:querySelector\('#(ai5d-[a-z-]+)'\)|getElementById\('(ai5d-[a-z-]+)'\))\?\.innerHTML \?\? ''\)?/g,
      (_, parDiese, parId) => `texteFeuille('${parDiese ?? parId}')`,
    )
    .replace(/container\.querySelector\('style'\)\?\.textContent \?\? ''/g, "texteFeuille('ai5d-gabarit-auth')")
    .replace(
      /\[\.\.\.container\.querySelectorAll\('style'\)\]\.map\(\(s\) => s\.innerHTML\)\.join\('\\n'\)/,
      "texteFeuille('ai5d-gabarit-app')",
    )
    .replace(
      "expect(document.getElementById('ai5d-hors-ecran')).not.toBeNull();",
      "expect(texteFeuille('ai5d-hors-ecran')).toContain('.ai5d-hors-ecran');",
    )
    .replace(/\nfunction styleInjecte\(id: string\): string \{\n[\s\S]*?\n\}\n/, '\n')
    .replaceAll('styleInjecte(', 'texteFeuille(');

  if (apres === avant) continue;
  apres = importer(apres, "import { texteFeuille } from '../aides/feuille';");

  // Un `container` qui ne sert plus qu a lire la feuille disparait : ESLint le refuserait.
  const lignes = apres.split('\n');
  for (let i = 0; i < lignes.length; i += 1) {
    if (!lignes[i].includes('const { container } = render(')) continue;
    let fin = i + 1;
    while (fin < lignes.length && lignes[fin] !== '  });') fin += 1;
    if (!/\bcontainer\b/.test(lignes.slice(i + 1, fin).join('\n'))) {
      lignes[i] = lignes[i].replace('const { container } = render(', 'render(');
    }
  }
  apres = lignes.join('\n');
  writeFileSync(chemin, apres);
  console.log(`${chemin} : ${(apres.match(/texteFeuille\(/g) ?? []).length} lecture(s) par texteFeuille`);
}
