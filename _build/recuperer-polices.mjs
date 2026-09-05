/**
 * Récupère les polices du système en woff2, sous-ensemble latin, et écrit polices.css.
 *
 * Trois pièges, appris à l'usage le 5 septembre 2026 :
 *
 *  1. Sans un agent utilisateur de navigateur récent, Google Fonts renvoie du TTF.
 *     Le fichier est alors trois fois plus lourd et le sous-ensemblage est perdu.
 *
 *  2. La réponse contient une face par plage Unicode : latin, latin-ext, cyrillique,
 *     grec, vietnamien. On ne garde que la plage latine de base, sinon on télécharge
 *     quarante fichiers dont personne n'a besoin.
 *
 *  3. Inter et Fraunces sont des polices VARIABLES : Google sert le même fichier pour
 *     toutes les graisses demandées. Écrire une face par graisse livrait quatre copies
 *     identiques d'Inter et trois de Fraunces — 420 Ko au lieu de 160. On dédoublonne
 *     par empreinte, et on déclare une plage de graisses que le navigateur interpole.
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const REQUETE =
  'https://fonts.googleapis.com/css2' +
  '?family=Inter:wght@400;500;600;700' +
  '&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500' +
  '&family=JetBrains+Mono:wght@500' +
  '&display=swap';

/** La plage latine de base. Toute face qui ne la couvre pas est écartée. */
const PLAGE_LATINE = 'U+0000-00FF';

const DOSSIER = 'noyau/polices';

function decouperBlocs(css) {
  return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
}

function lire(bloc, propriete) {
  const m = new RegExp(`${propriete}:\\s*([^;]+);`).exec(bloc);
  return m ? m[1].trim().replace(/^'|'$/g, '') : null;
}

function extraireUrl(src) {
  return /url\((https:[^)]+)\)/.exec(src ?? '')?.[1] ?? null;
}

async function telecharger(url, etiquette) {
  const reponse = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!reponse.ok) throw new Error(`Telechargement de ${etiquette} : ${reponse.status}`);
  const octets = Buffer.from(await reponse.arrayBuffer());
  // Signature woff2 : les quatre premiers octets valent 'wOF2'.
  if (octets.subarray(0, 4).toString('latin1') !== 'wOF2') {
    throw new Error(`${etiquette} n'est pas un woff2.`);
  }
  return octets;
}

async function main() {
  const reponse = await fetch(REQUETE, { headers: { 'User-Agent': UA } });
  if (!reponse.ok) throw new Error(`Google Fonts a repondu ${reponse.status}`);
  const css = await reponse.text();

  if (!css.includes("format('woff2')")) {
    throw new Error(
      "La reponse ne contient pas de woff2. L'agent utilisateur est en cause : sans un UA " +
        'de navigateur recent, Google Fonts sert du TTF.',
    );
  }

  await mkdir(DOSSIER, { recursive: true });

  // On collecte d'abord, on ecrit ensuite : le dedoublonnage a besoin de tout voir.
  const collectees = [];
  const urlsVues = new Map();

  for (const bloc of decouperBlocs(css)) {
    const plage = lire(bloc, 'unicode-range');
    if (!plage || !plage.includes(PLAGE_LATINE)) continue;

    const famille = lire(bloc, 'font-family');
    const graisse = lire(bloc, 'font-weight');
    const url = extraireUrl(lire(bloc, 'src'));
    if (!famille || !graisse || !url) continue;

    // Meme URL pour deux graisses : inutile de retelecharger.
    let octets = urlsVues.get(url);
    if (!octets) {
      octets = await telecharger(url, `${famille} ${graisse}`);
      urlsVues.set(url, octets);
    }

    collectees.push({
      famille,
      graisse: Number(graisse),
      octets,
      empreinte: createHash('sha256').update(octets).digest('hex'),
    });
  }

  // Regroupement par famille et par empreinte : une entree = un fichier reellement distinct.
  const groupes = new Map();
  for (const face of collectees) {
    const cle = `${face.famille}|${face.empreinte}`;
    const groupe = groupes.get(cle);
    if (groupe) {
      groupe.graisses.push(face.graisse);
    } else {
      groupes.set(cle, {
        famille: face.famille,
        octets: face.octets,
        graisses: [face.graisse],
      });
    }
  }

  const faces = [];
  for (const groupe of groupes.values()) {
    groupe.graisses.sort((a, b) => a - b);
    const variable = groupe.graisses.length > 1;
    const base = groupe.famille.toLowerCase().replace(/\s+/g, '-');
    const fichier = variable ? `${base}-variable.woff2` : `${base}-${groupe.graisses[0]}.woff2`;

    await writeFile(join(DOSSIER, fichier), groupe.octets);
    faces.push({
      famille: groupe.famille,
      fichier,
      graisses: groupe.graisses,
      variable,
      octets: groupe.octets.length,
    });

    const derniere = groupe.graisses[groupe.graisses.length - 1];
    const etiquette = variable
      ? `${groupe.graisses[0]} a ${derniere} (variable)`
      : String(groupe.graisses[0]);
    console.log(
      `  ${fichier.padEnd(30)} ${(groupe.octets.length / 1024).toFixed(1).padStart(6)} Ko   ${etiquette}`,
    );
  }

  // Nettoyage des fichiers d'une execution precedente qui ne sont plus produits.
  const attendus = new Set(faces.map((f) => f.fichier));
  for (const present of await readdir(DOSSIER)) {
    if (present.endsWith('.woff2') && !attendus.has(present)) {
      await rm(join(DOSSIER, present));
      console.log(`  ${present.padEnd(30)} supprime (doublon d'une execution precedente)`);
    }
  }

  faces.sort((a, b) => a.fichier.localeCompare(b.fichier));

  const entete = [
    '/* =========================================================================',
    '   AI5D Digital Design System - polices',
    '',
    '   GENERE par _build/recuperer-polices.mjs. Ne pas modifier a la main.',
    '   Sous-ensemble latin, woff2, servi en local. Aucun appel a un CDN.',
    '',
    "   Une page d'authentification ne doit emettre aucune requete vers un tiers :",
    "   c'est une exigence de confidentialite autant que de robustesse.",
    '',
    '   Inter et Fraunces sont variables : un seul fichier porte toute la plage de',
    '   graisses, que le navigateur interpole.',
    `   Genere le ${new Date().toISOString().slice(0, 10)}.`,
    '   ========================================================================= */',
    '',
  ].join('\n');

  const regles = faces
    .map((f) => {
      const graisse = f.variable
        ? `${f.graisses[0]} ${f.graisses[f.graisses.length - 1]}`
        : String(f.graisses[0]);
      return (
        '@font-face {\n' +
        `  font-family: '${f.famille}';\n` +
        '  font-style: normal;\n' +
        `  font-weight: ${graisse};\n` +
        '  font-display: swap;\n' +
        `  src: url('./${f.fichier}') format('woff2');\n` +
        '}\n'
      );
    })
    .join('\n');

  await writeFile(join(DOSSIER, 'polices.css'), `${entete}\n${regles}`, 'utf8');

  const total = faces.reduce((somme, f) => somme + f.octets, 0);
  console.log(
    `\n${faces.length} fichiers, ${(total / 1024).toFixed(1)} Ko au total, ` +
      `ecrits dans ${DOSSIER}/polices.css`,
  );
}

main().catch((erreur) => {
  console.error('ECHEC :', erreur.message);
  process.exitCode = 1;
});
