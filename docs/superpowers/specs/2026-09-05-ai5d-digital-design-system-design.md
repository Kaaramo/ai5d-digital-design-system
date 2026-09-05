# SPEC — AI5D Digital Design System

**Projet :** `ai5d-digital-design-system`
**Dépôt :** `github.com/Kaaramo/ai5d-digital-design-system` (privé)
**Dossier local :** `F:i5d-design-system`
**Version :** 1.0 — cadrage validé
**Date :** 5 septembre 2026
**Auteur :** Karamo Sylla, avec Claude
**Statut :** Validé en brainstorming, prêt pour le plan d'implémentation

---

## 1. Objet

Ce document spécifie le **système de design applicatif** de l'écosystème AI5D : la couche
qui manque aujourd'hui entre la marque institutionnelle et chaque produit.

La marque AI5D existe, elle est bonne, et **elle ne bouge pas**. Ce qui n'existe pas, c'est
le document qui dit une fois pour toutes ce que cette marque accorde à une **interface
applicative** — par opposition à une page de communication. Faute de ce document, chaque
produit re-dérive la charte du produit précédent, en réargumentant les mêmes décisions pour
un usage différent. L'Académie l'a fait la première. La Platform l'a fait le 5 septembre
2026. Le Cercle et le Lab le referaient une troisième et une quatrième fois.

À la fin de ce chantier, un nouveau produit AI5D reçoit un dossier et une seule ligne à
écrire : le profil de densité qu'il adopte.

---

## 2. Ce qui existe déjà — audit

Cette section est le résultat d'une inspection réelle des trois sources, le 5 septembre
2026. Elle existe parce que la première question à se poser sur un chantier d'ampleur est
de savoir si la chose n'existe pas déjà.

### 2.1 La marque mère — `C:\Users\ksthe\Documents\AI5D_Brand_2026`

| Élément | État |
| ------- | ---- |
| `charte/AI5D_Brand_Guidelines.{md,pdf,docx}` | 238 lignes, 11 chapitres. Positionnement, framework des 5 dimensions, architecture des branches, palette, typographie, style, voix, système de logo, motif, slogans, variables |
| `DESIGN-SYSTEM.md` | 115 lignes. Direction « Autorité institutionnelle » |
| `tokens.css` | Jetons CSS complets, préfixés `--ai5d-*` |
| `logos/svg/` | 36 fichiers |
| `logos/png/` | @1x, @2x, @4x pour chaque logo |
| `logos/favicon/` | `.ico` + PNG de 16 à 512 |
| `_build/` | Générateurs Node : SVG, PNG, ICO, documents, PDF |
| Dépôt Git | **Non.** C'est un dossier de livrables, pas du code |

**La doctrine institutionnelle**, telle qu'elle est écrite : angles à **0 px partout**,
**aucune ombre portée, jamais**, Inter seule, **aucune police serif**, filets 1 px plutôt
qu'ombres, répartition 70 % blanc/gris · 25 % encre/navy · 5 % bleu signal. La liste des
interdits est explicite : dégradés, ombres portées, angles arrondis, textures, effets 3D,
icônes remplies.

**L'architecture des branches** est également écrite : « Toutes les branches partagent la
même identité visuelle. La différenciation se fait par le nom de branche, jamais par la
couleur. » Six branches nommées : AI5D, Consulting, Academy, Labs, Leaders Circle,
Framework.

### 2.2 L'Académie — `F:\ai5d-academie`

Charte dérivée, direction « Encre & Papier », 15 pages. Son chapitre 01 s'appelle
**« Héritage et libertés »** et contient deux tableaux : ce qui est hérité et non
négociable, ce qui est accordé. C'est-à-dire que l'Académie a **déjà inventé les règles de
dérivation** — mais pour elle seule, et en les justifiant par son propre usage.

Les cinq libertés qu'elle prend, toutes en contradiction frontale avec la doctrine
institutionnelle :

| Liberté | Doctrine institutionnelle | Justification écrite par l'Académie |
| ------- | ------------------------- | ----------------------------------- |
| Coins arrondis 4 / 10 / 16 px | Rayon 0 partout | La maison mère impose le rayon zéro, l'Académie ne la suit pas |
| Trois niveaux d'élévation | Aucune ombre, jamais | Indispensable sur un écran qui porte plusieurs choses à la fois |
| Fraunces en serif d'affichage | Aucune police serif | Rend le produit reconnaissable en une demi-seconde |
| Surfaces tièdes `#FAF7F2` / `#F4EFE7` | Blanc `#FFFFFF` | Le blanc pur fatigue au-delà de vingt minutes de lecture |
| Mode sombre complet | Absent de la charte mère | Une partie des sessions se fait la nuit |

Elle ajoute par ailleurs un vert de réussite comme couleur sémantique de premier plan, ce
que le registre institutionnel n'a pas besoin de faire.

### 2.3 La Platform — `F:\AI5D Platform`

Charte dérivée de celle de l'Académie le 5 septembre 2026, le matin même. Valeurs
identiques, arguments réécrits pour un portail d'identité. C'est la deuxième dérivation,
et c'est elle qui a rendu le problème visible.

### 2.4 Les écarts constatés — et leur nature réelle

Quatre jetons sémantiques ont divergé entre la marque mère et les chartes dérivées :

| Jeton | Marque mère | Chartes dérivées |
| ----- | ----------- | ---------------- |
| Succès | `#1E874B` | `#0E7C5A` |
| Erreur | `#D02B2B` | `#B42318` |
| Avertissement | `#B7791F` | `#B45309` |
| Texte secondaire | `#757575` | `#6B7A85` |

Ces écarts avaient toutes les apparences d'une dérive. La mesure des contrastes montre
autre chose.

| Jeton | Fond | Ratio | Verdict |
| ----- | ---- | ----- | ------- |
| Succès mère `#1E874B` | blanc | 4,54 | AA |
| Succès mère `#1E874B` | papier `#FAF7F2` | **4,25** | **Échoue en texte courant** |
| Succès Académie `#0E7C5A` | papier | 4,85 | AA |
| Avertissement mère `#B7791F` | blanc | **3,64** | **Échoue en texte courant** |
| Avertissement Académie `#B45309` | papier | 4,70 | AA |
| Erreur mère `#D02B2B` | blanc | 5,17 | AA |
| Erreur Académie `#B42318` | papier | 6,15 | AA |

**Conclusion :** trois des quatre écarts sont de **bonnes décisions prises sans avoir été
écrites**. Sur la surface tiède du registre applicatif, les valeurs institutionnelles
lâchent. Le système doit donc les entériner, avec leur justification chiffrée, plutôt que
les corriger.

Le quatrième écart, en revanche, est un **défaut présent des deux côtés** :

| Jeton | Fond | Ratio |
| ----- | ---- | ----- |
| Texte secondaire mère `#757575` | papier | 4,31 — échoue |
| Texte secondaire Académie `#6B7A85` | papier | 4,14 — échoue |
| Texte secondaire Académie `#6B7A85` | blanc | 4,42 — échoue |

Aucun des deux n'atteint 4,5, et c'est la couleur des descriptions, des horodatages et des
métadonnées — celle qui se lit le plus souvent en petit corps. **Correction retenue :
`#66747E`**, obtenue en conservant la teinte (205,4°) et la saturation (0,108) de
`#6B7A85` et en abaissant la seule luminosité. Résultat : 4,50 sur papier, 4,81 sur blanc.
L'écart est imperceptible à l'œil ; il fait passer le seuil.

Le mode sombre était déjà conforme : `#8D9AA5` donne 6,35 sur `#0B1620` et 5,70 sur
`#11212D`.

### 2.5 L'état des fichiers de logo

Inspection des 36 SVG de `logos/svg/` :

| Constat | Nombre |
| ------- | ------ |
| Fichiers contenant du `<text>`, donc dépendants d'une police installée | **28 / 36** |
| Fichiers important Google Fonts par le réseau | **36 / 36** |
| Fichiers utilisant `text-anchor="middle"` avec plusieurs `<tspan>` | **20 / 36** |
| Fichiers en tracés purs, sans dépendance | 8 / 36 (les icônes seules) |

Le troisième point mérite d'être souligné : `logos/AZIMUT.md` documente explicitement ce
piège — « Ne jamais centrer un `<text>` à plusieurs `<tspan>`. Avec `text-anchor="middle"`,
certains moteurs replacent chaque groupe de lettres. » Les huit fichiers Azimut l'évitent,
parce qu'ils ont été fabriqués **après** la leçon. Les vingt fichiers AI5D antérieurs le
reproduisent.

**Conséquence pratique :** pour un site web, cela fonctionne — le navigateur charge la
police. Pour un système de design dont les logos partent dans des courriels transactionnels,
des exports PDF, des favicons et des en-têtes d'application, cela ne fonctionne pas. Un
client de messagerie ne charge pas Google Fonts. Un export PDF hors ligne rend le wordmark
en Arial. Le traçage des 28 fichiers est donc un livrable, pas un raffinement.

### 2.6 La question de la légitimité

| Question | Réponse |
| -------- | ------- |
| Est-ce que ça existe déjà ? | À moitié. Un `DESIGN-SYSTEM.md` institutionnel et deux chartes applicatives dérivées existent. Ce qui manque est la couche qui les relie. |
| Quel cadre s'impose ? | La charte mère `AI5D_Brand_Guidelines`, ses invariants de logo et sa doctrine de branches. Le système la cite, ne la contredit jamais. |
| Qui l'a résolu ailleurs ? | Le patron « brand core + product design system » est courant (Atlassian, Shopify Polaris, IBM Carbon avec ses thèmes). Nous n'inventons rien : nous appliquons un patron connu à une marque existante. |
| Qu'est-ce qui rend le chantier légitime ? | Le système n'a de valeur que s'il est **le nôtre**, parce que sa substance est la liste des libertés que notre marque accorde — une liste qu'aucun système générique ne peut contenir. |

---

## 3. Décisions validées

| # | Décision | Conséquence |
| - | -------- | ----------- |
| D1 | **Deux registres, une famille.** Le registre institutionnel — site, documents, slides, communication — garde angles vifs, aucune ombre, Inter seule. Le registre applicatif — tous les produits — obtient les arrondis, l'élévation, la serif d'affichage et le mode sombre. | Le système de design définit le second registre une fois. La charte mère reste seule autorité sur le premier. |
| D2 | **Même ADN, quatre densités.** Palette, typographies, composants, iconographie, bordures, langage graphique identiques partout. Seule varie la densité fonctionnelle, en quatre profils nommés. | Académie AÉRÉ · Compte ÉQUILIBRÉ · Cercle MODÉRÉ · Lab COMPACT |
| D3 | **Dossier de référence d'abord, paquet ensuite.** Le système vit dans un dépôt Git dès le premier jour. Le paquet npm `@ai5d/design-system` naît au sprint 00 de la Platform, deuxième consommateur. | On ne monte pas la tuyauterie pour un seul consommateur ; on ne s'en prive pas quand elle sert. |
| D4 | **Trois couches à rythmes distincts.** Noyau, densités, écosystème. | Corollaire de l'analyse : les écarts constatés viennent de ce que le noyau et les libertés sont mélangés dans un même document. Quand tout se discute, tout dérive. |
| D5 | **L'Académie est la base du registre applicatif.** | C'est la seule des trois chartes pensée pour une interface qu'on habite, et ses valeurs sont mesurément meilleures sur ses propres surfaces. |

---

## 4. Architecture

### 4.1 La relation à la marque — à sens unique

```
   AI5D_Brand_2026                    ← la marque. Ne bouge pas.
   ├── charte/                          Registre INSTITUTIONNEL
   ├── logos/                           site, documents, slides, goodies
   ├── DESIGN-SYSTEM.md                 angles vifs · aucune ombre · Inter seule
   └── tokens.css
            │
            │  invariants cités, jamais redéfinis :
            │  logotype · le 5 à -5° · encre · navy · bleu signal · blanc · voix
            ▼
   ai5d-digital-design-system        ← ce chantier. Registre APPLICATIF
   ├── noyau/                           ce qui ne se discute pas
   ├── densites/                        les quatre profils, mécaniques
   └── ecosysteme/                      ce qui n'existe que parce qu'il y a plusieurs produits
            │
      ┌─────┴──────┬────────────┬───────────┐
      ▼            ▼            ▼           ▼
  Académie      Compte       Cercle       Lab
   AÉRÉ        ÉQUILIBRÉ    MODÉRÉ      COMPACT
```

**Règle d'importation.** Le fichier de jetons du noyau **importe** les couleurs de marque
depuis `AI5D_Brand_2026/tokens.css` plutôt que d'en recopier les valeurs. Une valeur de
marque écrite en dur dans le système est une faute, détectable par une garde automatisée
(§9). Le jour où le bleu signal changerait — ce qui n'arrivera pas, mais c'est le principe —
il changerait partout sans intervention.

**Mécanisme retenu : copie synchronisée par script, avec vérification d'intégrité au
build.** La marque n'étant ni un dépôt Git ni un paquet npm, l'importation ne peut pas
passer par une dépendance. Deux voies existaient : cette copie vérifiée, ou la publication
de `AI5D_Brand_2026/tokens.css` comme paquet minimal `@ai5d/brand-tokens`. La seconde est
techniquement plus propre, mais elle impose de versionner la marque — c'est-à-dire de la
faire bouger, ce que la décision D1 interdit. On retient donc la première : un script
recopie les six jetons de marque dans `noyau/jetons.css` sous un en-tête de provenance, et
le build échoue si la copie a divergé de la source. La bascule vers un paquet reste possible
plus tard sans rien changer aux projets consommateurs, puisqu'ils n'importent que
`noyau/jetons.css`.

### 4.2 Les trois couches et leurs rythmes

| Couche | Contenu | Rythme de changement | Qui la lit |
| ------ | ------- | -------------------- | ---------- |
| **Noyau** | Jetons, typographie, composants de base, iconographie, voix, mode sombre | Presque jamais. Le toucher est un événement | Tout le monde, une fois |
| **Densités** | Quatre profils, un tableau, aucune prose | Seulement si un produit s'ajoute | Le développeur, au démarrage |
| **Écosystème** | Lockups produit, composants inter-produits, courriels, écrans système, motif | Au rythme des produits | Le produit qui en a besoin |

C'est ce découpage qui répond au problème de la §2.4 : en séparant un noyau qu'on ne
discute pas d'une liste fermée de libertés, on obtient un dossier qu'on donne à un nouveau
projet sans avoir à expliquer quoi que ce soit.

---

## 5. Le noyau

### 5.1 Les jetons

Trois familles, par ordre de préséance.

**Famille 1 — jetons de marque.** Importés, jamais définis ici.

| Jeton | Valeur | Source |
| ----- | ------ | ------ |
| `--encre` | `#051C2C` | Marque |
| `--navy` | `#042A76` | Marque |
| `--action` | `#2251FF` | Marque — le Signal Blue |
| `--action-survol` | `#1B44DB` | Marque |
| `--action-clair` | `#5B7BFF` | Marque |
| `--blanc` | `#FFFFFF` | Marque |

**Famille 2 — surfaces.** Propres au registre applicatif : le registre institutionnel n'a
ni papier tiède ni mode sombre.

| Jeton | Clair | Sombre | Rôle |
| ----- | ----- | ------ | ---- |
| `--surface-1` | `#FAF7F2` | `#0B1620` | Fond de page |
| `--surface-2` | `#FFFFFF` | `#11212D` | Cartes, panneaux, champs |
| `--surface-3` | `#FFFFFF` | `#172C3B` | Menus, dialogues, flottants |
| `--surface-chaude` | `#F4EFE7` | `#171F26` | Lectures longues |
| `--bordure` | `#E7E0D6` | `#22323F` | Filets courants |
| `--bordure-forte` | `#D5CCBE` | `#2E4252` | Filets appuyés |

**Famille 3 — texte et sémantiques.** Valeurs de l'Académie, entérinées avec leur
justification chiffrée, plus la correction du texte secondaire.

| Jeton | Clair | Sombre | Contraste clair | Note |
| ----- | ----- | ------ | --------------- | ---- |
| `--texte-fort` | `#051C2C` | `#F2F5F7` | — | Titres |
| `--texte` | `#2B3A45` | `#C9D4DC` | — | Corps |
| `--texte-faible` | **`#66747E`** | `#8D9AA5` | 4,50 papier · 4,81 blanc | **Corrigé** — voir §2.4 |
| `--texte-sur-action` | `#FFFFFF` | `#FFFFFF` | — | |
| `--reussite` | `#0E7C5A` | `#2FA37B` | 4,85 papier | Diverge de la marque, mesuré |
| `--reussite-fond` | `#E6F4EE` | `#10312A` | — | |
| `--attention` | `#B45309` | `#E0A050` | 4,70 papier | Diverge de la marque, mesuré |
| `--attention-fond` | `#FDF2E3` | `#2E2413` | — | |
| `--erreur` | `#B42318` | `#F27063` | 6,15 papier | Diverge de la marque, mesuré |
| `--erreur-fond` | `#FDECEA` | `#331A18` | — | |
| `--info` | `var(--action)` | `var(--action-clair)` | 5,33 papier | |

**Règle de sens.** Aucune information n'est portée par la seule couleur. Réussite et erreur
portent toujours aussi un mot ou une icône. La justification n'est pas décorative : près
d'un homme sur douze ne distingue pas correctement le rouge du vert.

**Géométrie, élévation, mouvement.** Rayons 4 / 10 / 16 / plein. Trois niveaux
d'élévation en clair, **neutralisés à `none` en sombre** — sur fond sombre, une ombre
portée ne se voit pas et la simuler produit du gris sale ; la hiérarchie y naît d'une
surface plus claire. Durées 150 / 250 / 800 ms, courbes d'entrée et de sortie nommées.

### 5.2 La typographie

| Police | Rôle | Graisses nécessaires |
| ------ | ---- | -------------------- |
| **Fraunces** | Affichage et signature : titres d'écran, noms propres, en-têtes de courriel | 300, 400, 500 |
| **Inter** | Interface et lecture : formulaires, navigation, textes longs | 400, 500, 600, 700 |
| **JetBrains Mono** | Codes, identifiants, empreintes, horodatages techniques | 500 |

Échelle : 12 / 14 / 16 / 18 / 22 / 30 / 48 / 56 px. Interlignes 1,12 / 1,2 / 1,6 / 1,75.

**Trois règles.** Une seule graisse par bloc — la hiérarchie se fait par la taille, jamais
par le gras. **Fraunces ne compose jamais un paragraphe.** Les capitales sont réservées aux
overlines.

Toutes les polices sont servies **en local, en woff2**, jamais depuis un CDN. C'est une
exigence de confidentialité autant que de robustesse : une page d'authentification ne doit
émettre aucune requête vers un tiers.

*Réserve d'exécution :* seule `Inter700-latin.woff2` est présente sur le poste
(`F:\ai5d-academie\kit-design\commun\`). Les graisses 400, 500, 600 d'Inter et les trois
graisses de Fraunces sont à récupérer et à sous-ensembler en latin. À faire avant tout le
reste, car le traçage des logos (§7.1) en dépend.

### 5.3 Les composants de base

Huit composants, extraits de `ai5d-academie/docs/design-system/composants/`, documentés
état par état et livrés avec leur spécimen.

| Composant | États à spécifier |
| --------- | ----------------- |
| `Bouton` | Défaut, survol, focus, actif, chargement, désactivé — en trois variantes (primaire, secondaire, discret) et trois tailles |
| `Champ` | Défaut, focus, rempli, erreur, désactivé, lecture seule — avec libellé, aide et message d'erreur |
| `Carte` | Défaut, survol si cliquable, sélectionnée |
| `Bandeau` | Information, réussite, attention, erreur — avec action optionnelle |
| `Pastille` | Neutre, réussite, attention, erreur |
| `Icone` | Tailles 16 / 20 / 24 / 32 / 72, épaisseur 1,75 |
| `Logotype` | Encre, blanc, avec ou sans label de produit |
| `CarteAuth` | Le gabarit d'authentification — carte 420 px, largeur bloquée à toutes les tailles |

`CarteAuth` mérite un mot : il est dans le noyau et non dans l'écosystème parce que tout
produit peut avoir à afficher un écran d'authentification ou de session expirée, même si le
portail Compte porte l'essentiel des flux.

### 5.4 L'iconographie

Lucide, style contour, **épaisseur 1,75 px** dans le registre applicatif contre 1,5 px dans
l'institutionnel — la différence se justifie sur un écran de téléphone. Jamais d'icône
pleine. Tailles 16, 20, 24, 32, 72.

**Une icône ne remplace jamais un mot dans une information d'état.** Un cadenas seul ne dit
pas quelle licence manque, ni à qui la demander.

### 5.5 La voix

Héritée de la marque : mentor et non vendeur, clair, structuré, quantifié, lucide.
Vocabulaire officiel inchangé.

Plus les règles propres à l'applicatif, reprises de l'Académie : vouvoiement partout, y
compris dans les erreurs et les courriels ; aucun tiret cadratin ; ni emoji ni exclamation
nulle part ; nommer la conséquence — un verrou dit ce qui le lève, un avertissement dit ce
qu'on perd ; pas d'anglicisme ; assumer l'absence plutôt qu'inventer une réponse.

Le noyau porte également un **répertoire de formulations de référence** transverses : échec
de connexion, anti-énumération, verrouillage, accès refusé, état vide, hors ligne. Chaque
produit y puise plutôt que de réinventer sa formulation.

### 5.6 Le mode sombre

Traité dès le premier écran, jamais ajouté après. Trois règles : les ombres disparaissent
et la hiérarchie passe par la clarté des surfaces ; le bleu s'éclaircit à `#5B7BFF`, seul
jeton hérité qui change de valeur ; **aucun scintillement** — le thème est appliqué avant le
premier rendu.

Trois états à supporter : préférence système, choix explicite clair, choix explicite sombre.
Le choix du compte l'emporte sur la préférence du système.

---

## 6. Les densités

### 6.1 Le tableau

| | AÉRÉ · Académie | ÉQUILIBRÉ · Compte | MODÉRÉ · Cercle | COMPACT · Lab |
| --- | --- | --- | --- | --- |
| Rythme de section | 64 px | 48 px | 40 px | 32 px |
| Padding de carte | 32 px | 24 px | 20 px | 16 px |
| Hauteur de contrôle | 48 px | 48 px | 44 px | 40 px |
| Ligne de liste | 64 px | 56 px | 48 px | 40 px |
| Interligne du corps | 1,6 | 1,55 | 1,5 | 1,45 |
| Largeur de contenu | 1120 px | 1120 px | 1280 px | pleine |

### 6.2 Les deux règles qui rendent la densité inoffensive

**La densité change l'espace entre les choses, jamais la taille du texte.** Sans cette
règle, le Lab devient illisible en six mois — c'est la pente naturelle de tout profil
compact. Ne varient jamais : les couleurs, les polices, les tailles de texte, les rayons,
l'élévation, l'épaisseur des icônes, les significations sémantiques. Un produit qui a besoin
de changer l'un de ces éléments a un problème que la densité ne résout pas.

**Plancher tactile absolu : 44 px sur tout appareil tactile**, quel que soit le profil. Le
Lab descend à 40 px sur un écran de bureau avec une souris, jamais sur un téléphone. La
règle s'exprime en une requête média, elle n'est donc pas négociable à la main :

```css
@media (pointer: coarse) {
  :root { --hauteur-controle: max(var(--hauteur-controle), 44px); }
}
```

### 6.3 La forme technique

Un fichier `profils.css`, quatre sélecteurs d'attribut, aucune prose :

```css
:root,
[data-densite="aere"]      { --rythme-section: 64px; --padding-carte: 32px;
                             --hauteur-controle: 48px; --ligne-liste: 64px;
                             --interligne-corps: 1.6;  --contenu-max: 1120px; }
[data-densite="equilibre"] { --rythme-section: 48px; --padding-carte: 24px;
                             --hauteur-controle: 48px; --ligne-liste: 56px;
                             --interligne-corps: 1.55; --contenu-max: 1120px; }
[data-densite="modere"]    { --rythme-section: 40px; --padding-carte: 20px;
                             --hauteur-controle: 44px; --ligne-liste: 48px;
                             --interligne-corps: 1.5;  --contenu-max: 1280px; }
[data-densite="compact"]   { --rythme-section: 32px; --padding-carte: 16px;
                             --hauteur-controle: 40px; --ligne-liste: 40px;
                             --interligne-corps: 1.45; --contenu-max: 100%; }
```

Un produit pose `data-densite` sur son élément racine, une fois. C'est toute son adoption.

---

## 7. L'écosystème

C'est la couche qui n'existe nulle part aujourd'hui, et celle qui justifie le plus l'effort.

### 7.1 Les lockups produit et la remédiation des SVG

**Le problème est établi en §2.5.** 28 fichiers sur 36 dépendent d'une police, les 36
appellent le réseau, 20 reproduisent un piège que la documentation de la marque proscrit
elle-même.

**Le travail :**

1. **Récupérer et sous-ensembler les polices** — Inter 400/500/600/700 et Fraunces
   300/400/500, en latin, en woff2. Préalable à tout le reste.
2. **Tracer le texte en chemins.** Faisabilité vérifiée le 5 septembre 2026 : `fontTools`
   est disponible sur le poste, ouvre le woff2, et rend de vrais contours — le glyphe `5`
   d'Inter 700 produit 487 caractères de tracé, unités par em 2048, avances disponibles.
3. **Retirer l'import Google Fonts** des 36 fichiers, y compris des 8 icônes où il ne sert
   à rien.
4. **Supprimer le motif `text-anchor="middle"` à plusieurs `tspan`** — sans objet une fois
   le texte tracé, mais la vérification reste à faire sur le rendu.
5. **Produire les lockups manquants** : `compte` et `cercle`. Le gabarit existe
   (`ai5d-consulting-*` est explicitement décrit comme tel dans le README de la marque) :
   wordmark AI5D, filet bleu de 60 × 1,5 px, label en Inter 500, taille 22, interlettrage 6.
6. **Vérifier le rendu** des 36 fichiers tracés contre les originaux, hors ligne, dans un
   navigateur et dans un export PDF.

**Le jeu complet livré par produit :** lockup encre, lockup blanc, icône, favicons 16 à
512, `favicon.ico`, icône d'application 512, en-tête de courriel.

**Les deux doctrines de sous-marque, écrites.** Un produit de l'écosystème porte le lockup
AI5D suivi de son label. Un produit vendu comme outil autonome suit la doctrine Azimut :
mot propre, icône dérivée **exactement** du bouclier AI5D, signature `BY AI5D` en lockup
vertical ou horizontal. Le système dit lequel s'applique quand — et pourquoi redessiner une
forme voisine du bouclier se lit comme une erreur et non comme une famille.

### 7.2 Les composants inter-produits

Cinq composants qui ne peuvent pas vivre dans un produit, parce qu'ils sont l'interface de
l'écosystème lui-même.

| Composant | Rôle | Consommateur connu |
| --------- | ---- | ------------------ |
| `MenuCompte` | Avatar, nom, lien vers `compte.ai5d.technology`, déconnexion | Tous. Platform sprint 06 |
| `SelecteurOrganisation` | Bascule d'organisation active | Tous les produits B2B. Platform sprint 03 |
| `SelecteurProduit` | Passer d'un produit à l'autre ; montre ceux auxquels on a accès et ceux qui sont fermés | Tous. S'appuie sur les entitlements |
| `AccesRefuse` | L'écran affiché quand le droit produit manque, avec le nom de qui peut le lever | Tous. Platform sprint 06 |
| `BandeauEnvironnement` | La bande qui distingue staging de production | Tous, hors production |

Ces composants lisent la session et les droits. **Le système de design ne les fournit pas
câblés** : il fournit leur forme et leurs états, et le SDK `@ai5d/auth` fournit les données.
La frontière est nette — le design system ne connaît pas l'authentification.

### 7.3 Les courriels transactionnels

Un gabarit unique pour tout l'écosystème : en-tête au logotype tracé, corps, bouton
d'action, pied avec mentions légales. Chaque produit ne fournit que son contenu.

Ce n'est pas une commodité. Un courriel de la Communauté qui ne ressemblerait pas à un
courriel de l'Académie sèmerait le doute au moment précis où le destinataire se demande si
le message est authentique — c'est-à-dire au moment où il vient de recevoir un lien qui lui
demande de saisir un mot de passe.

Contraintes propres au courriel : tables plutôt que grille, styles en ligne, aucune police
distante, logo en PNG tracé plutôt qu'en SVG, largeur 600 px, mode sombre traité par
`prefers-color-scheme` avec repli acceptable.

### 7.4 Les écrans système

Cinq écrans que chaque produit refait aujourd'hui à sa façon : 404, 500, hors ligne,
maintenance, session expirée. Registre encre, ton de la charte, **action de sortie toujours
proposée**.

### 7.5 Le motif signature

La diagonale à -5° et le système des cinq dimensions, hérités de la marque, avec leur règle
d'usage applicative. Cette règle est essentiellement la parcimonie : l'Académie va jusqu'à
interdire tout motif décoratif dans ses écrans, en réservant le geste incliné au seul
logotype. Le système reprend cette position pour le registre applicatif, et laisse le motif
au registre institutionnel où il a sa place.

---

## 8. Le livrable

```
ai5d-digital-design-system/
├── README.md                  ce qu'on prend, ce qu'on ne prend pas, comment on adopte
├── CHANGELOG.md               une entrée par changement de jeton ou de règle
├── noyau/
│   ├── NOYAU.md               le document — jetons, typo, composants, icônes, voix, sombre
│   ├── jetons.css             importe la marque, définit surfaces et sémantiques
│   ├── ai5d.preset.ts         préréglage Tailwind v4, jetons aplatis
│   ├── polices/               Fraunces 300/400/500, Inter 400/500/600/700, JetBrains 500
│   ├── composants/            8 composants — .tsx + .d.ts + spécimen HTML
│   └── formulations.md        le répertoire des formulations de référence
├── densites/
│   ├── DENSITES.md            le tableau, les deux règles
│   └── profils.css            4 sélecteurs, aucune prose
├── ecosysteme/
│   ├── ECOSYSTEME.md
│   ├── logos/
│   │   ├── trace/             les 36 SVG tracés, sans dépendance réseau
│   │   ├── produits/          un jeu complet par produit
│   │   └── DOCTRINES.md       lockup AI5D contre doctrine Azimut
│   ├── composants/            les 5 composants inter-produits
│   ├── courriels/             gabarit unique + spécimens rendus
│   └── ecrans-systeme/        les 5 écrans
├── gardes/
│   ├── aucune-couleur-en-dur.test.ts
│   ├── aucun-jeton-de-marque-redefini.test.ts
│   └── cible-tactile-minimale.test.ts
├── docs/
│   ├── superpowers/specs/     ce document
│   └── decisions/             une décision d'architecture par arbitrage
└── _build/
    ├── tracer-logos.js        fontTools ou équivalent — texte vers chemins
    ├── generer-favicons.js
    ├── generer-specimens.js
    └── exporter-pdf.js        le document imprimable, sur le modèle de la charte Académie
```

**Le document imprimable.** Le noyau, les densités et l'écosystème produisent chacun leur
PDF, composés en HTML puis imprimés — c'est la méthode déjà éprouvée sur la charte de
l'Académie et sur la charte mère, et elle est la seule qui permette les fonds perdus, les
nuanciers et les planches de spécimens.

---

## 9. Les gardes automatisées

Trois tests, livrés par le système, exécutés par **chaque projet consommateur** dans son
intégration continue. Ce sont eux qui remplacent la discipline humaine — celle qui a produit
les écarts de la §2.4.

| Garde | Ce qu'elle vérifie | Ce qu'elle empêche |
| ----- | ------------------ | ------------------ |
| `aucune-couleur-en-dur` | Aucun littéral `#RRGGBB` hors du fichier de jetons et du préréglage | Qu'un écran décide une couleur dans son coin |
| `aucun-jeton-de-marque-redefini` | Aucun projet ne redéfinit `--encre`, `--action`, `--navy`, `--blanc` | Qu'un produit dérive la marque |
| `cible-tactile-minimale` | Tout élément interactif ≥ 44 px sur `pointer: coarse` | Qu'un profil compact casse l'accessibilité |

Une quatrième garde, propre au système lui-même : **le contraste de chaque jeton sémantique
est recalculé à chaque build** contre ses surfaces déclarées, et le build échoue sous 4,5.
C'est ce test qui aurait attrapé le défaut du texte secondaire des années plus tôt.

---

## 10. Adoption par un projet

Trois lignes, et rien d'autre :

```ts
// 1. les jetons et les profils
import '@ai5d/design-system/noyau/jetons.css';
import '@ai5d/design-system/densites/profils.css';

// 2. le préréglage Tailwind
import { ai5dPreset } from '@ai5d/design-system/preset';

// 3. le profil, sur la racine
<html lang="fr" data-densite="equilibre">
```

Tant que le paquet n'existe pas, les deux premières lignes sont une copie de fichier, faite
par un script du système et non à la main — de sorte que la bascule vers le paquet ne change
que le chemin d'import.

---

## 11. Gouvernance et versionnement

| Règle | Détail |
| ----- | ------ |
| Versionnement | Sémantique. Un changement de valeur de jeton est **majeur** : il modifie le rendu de tous les produits |
| Journal | Une entrée de `CHANGELOG.md` par changement de jeton ou de règle, avec la raison |
| Décisions | Un document dans `docs/decisions/` par arbitrage qui a écarté une option |
| Ajout d'un composant à l'écosystème | Autorisé quand **un deuxième produit** en a besoin, jamais avant |
| Ajout d'un profil de densité | Autorisé quand un produit ne rentre dans aucun des quatre, avec démonstration |
| Modification du noyau | Nécessite une décision écrite. C'est un événement, pas une correction |

---

## 12. Effet rétroactif sur les projets existants

Ce chantier change le statut de choses qui existent. Autant le nommer.

| Projet | Ce qui change | Quand |
| ------ | ------------- | ----- |
| `ai5d-academie` | Devient consommateur. Son `docs/charte` perd son statut de source et devient un document historique. Ses jetons sont remplacés par ceux du système — les valeurs sont identiques **sauf `--texte-faible`**, qui passe à `#66747E` | Après livraison du noyau |
| `AI5D Platform` | Son `packages/ui` change de nature : il **consomme** au lieu de recopier. La spec du sprint 00 est à corriger sur ce point | Avant le sprint 00 |
| `AI5D Platform` | La charte adaptée le 5 septembre 2026 devient largement redondante avec le noyau. Elle garde sa valeur documentaire — ses arguments sont écrits pour un portail d'identité — mais cesse d'être la source des valeurs | Après livraison du noyau |
| `AI5D_Brand_2026` | Ne change pas. Éventuellement : correction de l'avertissement `#B7791F`, qui échoue au contraste à 3,64 même sur blanc. **Hors périmètre de ce chantier**, signalé pour décision séparée | — |

---

## 13. Hors périmètre

| Élément | Raison |
| ------- | ------ |
| Toute modification de la marque institutionnelle | Décision D1 : la marque ne bouge pas |
| Le registre institutionnel — site, slides, documents commerciaux | Reste sous l'autorité de `AI5D_Brand_2026` |
| Les documents contractuels — devis, facture, convention, attestation | Registre document, adjacent. `ai5d-academie/kit-design/documents/` en porte déjà des gabarits ; leur mutualisation est un chantier distinct |
| Le câblage des composants inter-produits à la session | Frontière §7.2 : la forme ici, les données dans `@ai5d/auth` |
| Une bibliothèque de composants exhaustive | YAGNI. Huit composants de base et cinq inter-produits ; le reste s'ajoute quand un deuxième produit le demande |
| L'illustration et la photographie | Aucun produit n'en a besoin aujourd'hui. À rouvrir quand le Cercle aura des profils |
| Le paquet npm publié | Décision D3 : il naît au sprint 00 de la Platform |

---

## 14. Décomposition en lots

Ce chantier est trop large pour un seul plan d'implémentation. Il se découpe en sept lots,
dont les trois premiers forment un tout cohérent et débloquent tous les autres.

| Lot | Contenu | Débloque | Estimation |
| --- | ------- | -------- | ---------- |
| **L1 — Polices et jetons** | Les sept woff2 manquants, `jetons.css`, le script de synchronisation depuis la marque, `ai5d.preset.ts`, la garde de contraste | Tout le reste | ~8 h |
| **L2 — Composants de base** | Les 8 composants, tous leurs états, leurs spécimens, `NOYAU.md` et son PDF | L5, L6 | ~16 h |
| **L3 — Densités** | `profils.css`, `DENSITES.md`, le plancher tactile, la garde de cible tactile | Adoption par un produit | ~4 h |
| **L4 — Remédiation des logos** | Traçage des 36 SVG, retrait des imports réseau, lockups `compte` et `cercle`, jeux complets par produit, `DOCTRINES.md` | L6, favicons des produits | ~12 h |
| **L5 — Composants inter-produits** | Les 5 composants, les 5 écrans système | Platform sprints 03 et 06 | ~12 h |
| **L6 — Courriels** | Le gabarit unique et ses spécimens rendus | Platform sprint 01 | ~6 h |
| **L7 — Adoption et reprise** | Gardes distribuées, script de copie, `README.md`, migration de l'Académie et correction de la spec Platform | — | ~8 h |

**Le premier plan couvre L1, L2 et L3** — le noyau et les densités, c'est-à-dire ce qu'un
projet doit recevoir pour adopter le système. Les lots L4 à L7 recevront chacun leur plan,
au moment où leur consommateur en aura besoin : L6 avant le sprint 01 de la Platform, L5
avant son sprint 03, L4 quand un produit aura besoin de son jeu de logos complet.

Ce découpage suit la règle de gouvernance du §11 : on ne construit une brique d'écosystème
que quand un deuxième produit la demande.

---

## 15. Risques et points à vérifier

| # | Risque | Traitement |
| - | ------ | ---------- |
| R1 | **Les polices manquent.** Seule Inter 700 est présente localement. Sept fichiers woff2 sont nécessaires | À faire en premier. Bloque le traçage des logos et les spécimens |
| R2 | **Le traçage altère le rendu.** Un contour tracé peut différer imperceptiblement du texte rendu | Comparaison visuelle des 36 fichiers, avant/après, consignée en preuve |
| R3 | **L'importation depuis la marque n'a pas de mécanisme propre** — la marque n'est ni un dépôt Git ni un paquet | Arbitrage à porter dans le plan : copie synchronisée vérifiée au build, ou publication de `@ai5d/brand-tokens` |
| R4 | **La correction de `--texte-faible` touche l'Académie en production** | Changement de 4 unités de luminosité, imperceptible. À livrer avec les autres jetons, pas isolément |
| R5 | **Les quatre profils de densité ne sont validés sur aucun écran réel** | Les valeurs sont dérivées de l'Académie par raisonnement. À éprouver sur un écran par produit avant de figer |
| R6 | **Le système précède trois de ses quatre consommateurs.** Cercle et Lab n'existent pas | Assumé, et c'est l'objet du chantier. Contre-mesure : ne rien mettre dans l'écosystème avant qu'un deuxième produit le demande (§11) |
| R7 | **Le PDF ne se vérifie pas sur ce poste** — `pdftoppm` absent | Vérification visuelle manuelle, ou installation de poppler |

---

## 16. Références

| Source | Chemin |
| ------ | ------ |
| Marque mère — charte | `C:\Users\ksthe\Documents\AI5D_Brand_2026\charte\AI5D_Brand_Guidelines.md` |
| Marque mère — design system | `C:\Users\ksthe\Documents\AI5D_Brand_2026\DESIGN-SYSTEM.md` |
| Marque mère — jetons | `C:\Users\ksthe\Documents\AI5D_Brand_2026\tokens.css` |
| Marque mère — doctrine Azimut | `C:\Users\ksthe\Documents\AI5D_Brand_2026\logos\AZIMUT.md` |
| Académie — charte | `F:\ai5d-academie\docs\charte\CHARTE_GRAPHIQUE_AI5D_ACADEMIE.pdf` |
| Académie — jetons | `F:\ai5d-academie\docs\tokens-academie.css` |
| Académie — contrat de jetons | `F:\ai5d-academie\docs\tokens-contrat.md` |
| Académie — composants | `F:\ai5d-academie\docs\design-system\composants\` |
| Platform — charte dérivée | `F:\AI5D Platform\docs\charte\` |
| Platform — spec sprint 00 | `F:\AI5D Platform\docs\sprints\sprint-00-socle\SPEC-Sprint00-Socle.md` |

---

**Fin de la spécification — AI5D Digital Design System v1.0**
