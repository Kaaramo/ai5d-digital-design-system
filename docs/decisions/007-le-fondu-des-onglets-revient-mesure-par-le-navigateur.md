# 007 · Le fondu des onglets revient, mesuré par le navigateur

**Date :** 26 septembre 2026 · **Statut :** appliquée · **Version :** 1.2.0

## Contexte

`OngletsRubrique` défile quand ses onglets ne tiennent pas. La 0.6.0 signalait le débordement par un
dégradé fixe de 24 px au bord droit ; vu à l'écran, il se dessinait aussi sur un écran de 1 440 px où
rien ne débordait, et coupait le filet et le trait de l'onglet actif. La 0.6.3 l'a retiré : le rendre
conditionnel demandait de mesurer la largeur au montage, donc un état, donc un module client, et
`OngletsRubrique` est rendu par des composants serveur qui lui passent des icônes (leçon de `Avatar`,
0.6.2).

Le contrat de P09 redemande le fondu (« sur le bord qui cache un onglet »), et l'onglet actif amené
dans la vue au montage par `scrollIntoView` : sur un téléphone de 390 px, l'onglet Attestation, le
cinquième, est caché à droite.

## Options

**A. Mesurer au montage**, et amener l'onglet par un effet. Le composant devient client : tout appelant
serveur qui passe des icônes tombe.

**B. Un voile fixe**, comme en 0.6.0. Déjà vu faux.

**C. Laisser le navigateur mesurer.** Le fondu est un masque animé par la frise de défilement du
conteneur (`animation-timeline: scroll(self inline)`), sous `@supports` : au début, fondu à droite ;
au milieu, aux deux bords ; à la fin, à gauche ; et quand rien ne défile, la frise est inactive et
aucun masque ne s'applique. L'onglet actif est amené dans la vue par `scroll-initial-target: nearest`,
sous `@supports`.

## Décision

**C.** Aucun script, aucune directive, aucun élément de voile dans le DOM.

## Constat, le 26 septembre 2026

Sonde Playwright 1.57 sur une rangée de six onglets, `CSS.supports` et masque calculé :

| Moteur | `animation-timeline` | `scroll-initial-target` | Rien ne déborde | Début, milieu, fin |
| ------ | -------------------- | ----------------------- | --------------- | ------------------ |
| Chromium 143 | oui | oui, rangée amenée sur l'onglet actif | aucun masque | les trois masques attendus |
| WebKit 26.0 | oui | non | aucun masque | les trois masques attendus |
| Firefox 144 | non | non | aucun masque | aucun masque |

Le constat est refait sur le spécimen du dépôt à la vérification de la 1.2.0
(`docs/preuves/1.2.0/navigateurs.md`). WebKit de Playwright n'est pas Safari : Safari reste à constater
sur un appareil.

## Conséquences

- Sans prise en charge, le rendu est celui de la 1.1.0 : le dernier onglet coupé net par le bord est le
  signal, et l'onglet actif n'est pas amené dans la vue. Le Portail le sait (SPEC 1.2.0, §17, écarts 4
  et 5).
- Le rembourrage de défilement (`scroll-padding-inline: var(--espace-6)`) garde l'onglet actif hors du
  fondu.
- Une navigation cliente ne remonte pas le composant : l'onglet touché est déjà dans la vue.
