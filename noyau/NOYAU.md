# Le noyau

Ce que le registre applicatif AI5D tient pour acquis. Le noyau bouge presque jamais :
le toucher est un événement, pas une correction.

**Fichiers exécutables :** [`jetons.css`](jetons.css) · [`marque.css`](marque.css) (généré) ·
[`paliers.css`](paliers.css) · [`paliers.ts`](paliers.ts) · [`ai5d.preset.css`](ai5d.preset.css) ·
[`polices/`](polices/) · [`composants/`](composants/)

---

## 1. Les trois familles de jetons

### 1.1 Les jetons de marque — importés, jamais définis

`marque.css` est **généré** par `pnpm marque` depuis
`AI5D_Brand_2026/tokens.css`. Il porte six valeurs, préfixées `--marque-`, et c'est le
seul fichier du dépôt où une couleur de marque apparaît en clair. Le noyau les aliase
vers ses propres noms.

| Jeton                    | Valeur    | Source amont        |
| ------------------------ | --------- | ------------------- |
| `--marque-encre`         | `#051C2C` | `--ai5d-ink`        |
| `--marque-navy`          | `#042A76` | `--ai5d-navy`       |
| `--marque-action`        | `#2251FF` | `--ai5d-blue`       |
| `--marque-action-survol` | `#1B44DB` | `--ai5d-blue-hover` |
| `--marque-action-clair`  | `#5B7BFF` | `--ai5d-blue-light` |
| `--marque-blanc`         | `#FFFFFF` | `--ai5d-white`      |

`tests/marque.test.ts` relit la source à chaque exécution et échoue si la copie a
divergé. Voir [`docs/decisions/001`](../docs/decisions/001-copie-verifiee-des-jetons-de-marque.md).

### 1.2 Les surfaces — propres au registre applicatif

La marque institutionnelle n'a ni papier tiède ni mode sombre : ces jetons n'ont pas
d'équivalent amont.

| Jeton              | Clair          | Sombre    | Rôle                        |
| ------------------ | -------------- | --------- | --------------------------- |
| `--surface-1`      | `#FAF7F2`      | `#0B1620` | Fond de page                |
| `--surface-2`      | `var(--blanc)` | `#11212D` | Cartes, panneaux, champs    |
| `--surface-3`      | `var(--blanc)` | `#172C3B` | Menus, dialogues, flottants |
| `--surface-chaude` | `#F4EFE7`      | `#171F26` | Lectures longues            |
| `--bordure`        | `#E7E0D6`      | `#22323F` | Filets courants             |
| `--bordure-forte`  | `#D5CCBE`      | `#2E4252` | Filets appuyés              |

Le blanc pur durcit. Sur les pages qui se lisent vraiment — journal de sécurité, mentions
légales, liste des sessions — le papier tiède fait baisser la garde.

### 1.3 Le texte et les sémantiques — divergents, et c'est mesuré

| Jeton            | Clair                  | Sombre    | Contraste clair, le plus faible des trois surfaces |
| ---------------- | ---------------------- | --------- | -------------------------------------------------- |
| `--texte-fort`   | `var(--encre)`         | `#F2F5F7` | 15,18                                              |
| `--texte`        | `#2B3A45`              | `#C9D4DC` | 10,23                                              |
| `--texte-faible` | `#616F78`              | `#8D9AA5` | **4,53**                                           |
| `--reussite`     | `#0E7C5A`              | `#2FA37B` | 4,58                                               |
| `--attention`    | `#B45309`              | `#E0A050` | 4,54                                               |
| `--erreur`       | `#B42318`              | `#F27063` | 5,75                                               |
| `--action`       | `var(--marque-action)` | `#6B88FF` | 4,96                                               |

**Pourquoi ces valeurs divergent de la marque.** Sur le papier tiède, le vert
institutionnel `#1E874B` tombe à 4,25 et l'avertissement `#B7791F` est déjà à 3,64 sur
blanc. Les deux échouent au seuil AA du texte courant. Les valeurs ci-dessus tiennent.

**`--action-sur-sombre` mérite une note.** La marque déclare `--ai5d-blue-light #5B7BFF`
pour les liens sur fond encre ou navy. Sur l'encre, il tient : 4,73. Mais le registre
applicatif introduit des surfaces que la marque n'a jamais eues — `#11212D` pour les
cartes, `#172C3B` pour les menus — et `#5B7BFF` y tombe à 4,47 et 3,92. Le jeton de marque
reste importé et intact ; le noyau déclare `--action-sur-sombre: #6B88FF`, qui tient sur
les trois surfaces sombres et sur l'encre.

**Une règle qui ne se discute pas.** Aucune information n'est portée par la seule couleur.
Réussite et erreur portent toujours aussi un mot ou une icône : près d'un homme sur douze
ne distingue pas correctement le rouge du vert.

**Le ton `neutre`, depuis la 1.2.0.** Il dit « rien à signaler » : un état au repos, qui ne demande
aucun geste et n'annonce aucune réussite (« Inscription confirmée », « Formation terminée », « Sans
accès », « Remplacée »). Il ne dit **jamais** un état qui attend un geste (c'est `attention`) ni un
échec (c'est `erreur`). Texte `--texte-faible` sur `--surface-chaude` : 4,53 en clair, 5,79 en sombre.
Comme les quatre autres, il porte toujours un mot : le composant n'existe pas sans texte.

### 1.4 La garde de contraste

`tests/jetons.test.ts` recalcule à chaque exécution chaque paire de contraste que le système déclare,
en clair et en sombre, et échoue sous 4,5. Le nombre de paires se lit dans ce test et nulle part
ailleurs : écrit ici, il avait déjà vieilli une fois. C'est ce test qui aurait attrapé, dès le premier
jour, les quatre défauts trouvés le 5 septembre 2026.

---

## 2. La typographie

| Police                 | Rôle                                                                        | Fichier                    |
| ---------------------- | --------------------------------------------------------------------------- | -------------------------- |
| **Fraunces** 300–500   | Affichage et signature : titres d'écran, noms propres, en-têtes de courriel | `fraunces-variable.woff2`  |
| **Inter** 400–700      | Interface et lecture : formulaires, journaux, mentions légales              | `inter-variable.woff2`     |
| **JetBrains Mono** 500 | Codes 2FA, empreintes de session, identifiants                              | `jetbrains-mono-500.woff2` |

Trois fichiers pour huit graisses : Inter et Fraunces sont **variables**, un seul fichier
porte toute leur plage. 134 Ko au total, sous-ensemble latin, servis en local.

**Aucun appel à un CDN de polices, nulle part.** Une page d'authentification ne doit
émettre aucune requête vers un tiers — c'est une exigence de confidentialité autant que de
robustesse. `tests/polices.test.ts` le vérifie.

**Trois règles.** Une seule graisse par bloc : la hiérarchie se fait par la taille, jamais
par le gras. **Fraunces ne compose jamais un paragraphe.** Les capitales sont réservées aux
overlines.

Échelle : 12 · 14 · 16 · 18 · 22 · 30 · 48 · 56 px.

**La mesure d'un texte.** `--mesure-texte` vaut `65ch` : la longueur de ligne d'un texte courant long
(programme, annonce, politique). Au-delà de soixante-cinq signes, l'œil perd le début de la ligne
suivante. Elle s'emploie en `max-width` sur un bloc de texte, jamais sur une colonne entière : une
phrase courte d'en-tête garde sa propre borne.

---

## 2 bis. Le mouvement

Trois durées, deux courbes, et depuis la 1.2.0 trois jetons qui nomment un mouvement par son **rôle**.
La durée et la courbe qu'ils portent peuvent changer sans qu'un seul appel change.

| Jeton                | Valeur                                      | Rôle                                   |
| -------------------- | ------------------------------------------- | -------------------------------------- |
| `--mouvement-retour` | `var(--duree-courte) var(--courbe-sortie)`  | Un état répond : survol, appui relâché |
| `--mouvement-entree` | `var(--duree-moyenne) var(--courbe-entree)` | Quelque chose arrive                   |
| `--mouvement-sortie` | `var(--duree-courte) var(--courbe-sortie)`  | Quelque chose part                     |

Sous `prefers-reduced-motion`, leurs durées tombent à 100 ms d'elles-mêmes ; ce qui se déplace reste à
supprimer par chaque feuille. Les composants antérieurs à la 1.2.0 ne sont pas migrés.

**La durée longue** (800 ms, 0 ms sous mouvement réduit) suit une règle réécrite en 1.2.0,
décision 006 :

> La durée longue sert deux choses, et deux seulement : une confirmation qui engage la sécurité du compte, et le moment signature unique d’un produit, déclaré par son nom dans le DESIGN.md de ce produit. Jamais un ornement, jamais deux moments dans un même produit.

---

## 3. Les 39 composants

Neuf familles. Le nombre et les noms sont vérifiés par `tests/documentation.test.ts` : chaque fichier
de `composants/` doit figurer ici, et le nombre de ce titre doit être celui des fichiers.

### Marque

| Composant  | Ce qu'il garantit                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Logotype` | Le « 5 » incliné à -5° et bleu, **dans toutes les variantes**. Interdit de la charte mère : ne jamais le redresser, ne jamais le recolorer |
| `Embleme`  | L'emblème de compte, en cartouche ou nu. Le cartouche est celui du favicon, peint depuis des jetons                                        |
| `Icone`    | Lucide, contour, épaisseur **1,75**. Décorative par défaut, accessible seulement si on lui donne un titre                                  |

### Saisie et action

| Composant        | Ce qu'il garantit                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Bouton`         | Variantes, trois tailles, hauteur pilotée par la densité, plancher tactile respecté, `aria-busy` en chargement. Avec `href`, un vrai lien aux mêmes classes et états |
| `Champ`          | Libellé **toujours** lié par `htmlFor`, aide et erreur reliées par `aria-describedby`, erreur jamais portée par la seule couleur                                     |
| `ValeurCopiable` | Une valeur en clair, copiée d'un geste. Si la copie échoue, la valeur est sélectionnée et le geste manuel nommé : jamais une copie annoncée qui n'a pas eu lieu      |

### États et signaux

| Composant      | Ce qu'il garantit                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `Pastille`     | Un état compact, qui contient toujours du texte. Cinq tons, dont `neutre`, « rien à signaler »    |
| `PastilleEtat` | Une `Pastille` précédée d'un point en `currentColor` : un état courant, et non une étiquette      |
| `Bandeau`      | Une icône **et** un texte. `role="alert"` pour attention et erreur, `role="status"` pour le reste |
| `TempsRelatif` | Un temps relatif calculé au client, la date absolue dans le HTML pour qui n'a pas de JavaScript   |
| `Chiffre`      | Un chiffre, son libellé, et sa cible quand le produit en fixe une                                 |
| `Avatar`       | La photo d'une personne, ou ses initiales. Une photo qui ne charge pas retombe sur les initiales  |

### Contenu

| Composant          | Ce qu'il garantit                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `Carte`            | Padding piloté par la densité. Rend un `<button>` quand elle est cliquable, jamais une `<div>`                                |
| `CarteAction`      | Le motif « une carte, une action » : bouton qui **nomme sa destination**                                                      |
| `GrilleCartes`     | Une grille qui se règle sur la largeur disponible, par requête de conteneur                                                   |
| `EnteteRubrique`   | Icône encadrée, titre `h1`, intention alignée sur le titre, filet                                                             |
| `EnteteCarte`      | Icône encadrée, titre `h2`, description, ton `danger` rare, emplacement à droite dans le flux                                 |
| `EtatVide`         | Ce qui est vide, si c'est normal, et quoi faire : la commande dans son propre bloc                                            |
| `TitreSection`     | Le niveau (plan du document) et la taille (écran) séparés et obligatoires ; Fraunces 400, jamais de faux gras, jamais tronqué |
| `ListeDefinitions` | Un `<dl>` de libellés et de valeurs ; deux colonnes dès 480 px de conteneur, une sinon                                        |

### Coquilles

| Composant      | Ce qu'il garantit                                                                                                                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CoquilleRail` | La coquille des écrans à rubriques. Rail de 240 px en tablette, 280 px sur bureau, barre basse sous 768 px ; mode `bureau-seulement` pour une console. La navigation arrive en emplacements. Aucun import de Next. Un pied de contenu après `<main>`, et un pied compact sous 768 px |
| `GabaritAuth`  | Le gabarit d'authentification. Colonne unique sous 1024 px, deux colonnes au-delà, panneau détaché du fond en sombre                                                                                                                                                                 |
| `GabaritApp`   | La coquille d'application : en-tête collant, contenu défilant, barre d'onglets. Il réserve la hauteur de la barre sous le contenu                                                                                                                                                    |
| `GabaritSeuil` | L'écran qui occupe le chargement d'après connexion, avec la marque du produit en emplacement                                                                                                                                                                                         |

### Navigation

| Composant         | Ce qu'il garantit                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `LiensRail`       | Les liens du rail. Reçoit la rubrique active et le lien du produit ; actif sur `--surface-selection`, `aria-current`              |
| `BarreOnglets`    | La navigation basse. Trois à cinq onglets, icône **et** mot, zone sûre réservée, lien du produit, disparaît dès 768 px            |
| `OngletsRubrique` | Les sous-pages d'une rubrique, deux à six. Des **liens**, jamais un `tablist` ; un fondu au bord qui cache un onglet, sans script |
| `SelecteurTheme`  | Clair, sombre, système, en groupe radio. 44 px au doigt, libellés visibles sur demande, cookie partagé sur le domaine             |
| `LigneLien`       | Une ligne entière, un seul lien. Hauteur `--ligne-liste`, appui immédiat, attente visible ; ni chevron ni routeur pour un fichier |
| `ListeLignes`     | Une `<ul role="list">`, un filet entre les lignes, et aux bords sur demande                                                       |

### Document

| Composant          | Ce qu'il garantit                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `GabaritDocument`  | Bandeau, sommaire collé, sections numérotées. Sections fermées dans le HTML, visibles sur ordinateur par `::details-content` |
| `SommaireDocument` | Les ancres du document, repliées sur téléphone, visibles sur ordinateur                                                      |
| `BlocDocument`     | Cinq formes de bloc, pas une de plus. Un tableau défile dans son propre cadre, jamais la page                                |
| `DeplierDocument`  | Pose l'état vrai des sections après l'hydratation : ouvertes sur ordinateur, la section visée sur téléphone                  |

### Dialogues

| Composant           | Ce qu'il garantit                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| `BoiteConfirmation` | Un `<dialog>` natif. Document inerte, Échap annule, focus sur « Annuler » et rendu à l'ouverture  |
| `BoiteMotif`        | Un motif obligatoire avant un geste d'exploitation. L'action est absente tant que le motif manque |

### Attente et session

| Composant          | Ce qu'il garantit                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| `Squelette`        | La forme de ce qui arrive, jamais celle de ce qui est déjà là                                             |
| `SigneAnime`       | La marque entourée de deux anneaux contrarotatifs ; l'emplacement porte la taille de la marque            |
| `RechargeAuRetour` | Redemande la page quand le navigateur la ressort de son cache : aucune identité visible après déconnexion |

`GabaritAuth` est dans le noyau et non dans l'écosystème parce que tout produit peut avoir à
afficher un écran de session expirée, même si le portail Compte porte l'essentiel des flux.

**Sa disposition n'est pas une proposition.** Elle vient de l'Académie, où elle est en
production, et ses valeurs sont mesurées. La bascule est à **1024 px et non 768** : à
768 px le panneau prend 345 px et laisse 423 px pour un formulaire annoncé à 440 px —
l'écran de réinitialisation débordait de 14 px. Le panneau ne porte que le logotype et une
phrase : ni photo, ni illustration, ni filet, ni forme animée. Il a porté trois preuves,
retirées depuis — elles promettaient un contenu qu'un écran de connexion n'a pas à vendre.
On y arrive déjà décidé.

Les composants ne dépendent d'aucun framework de style : leurs styles passent par les
variables CSS, de sorte qu'un projet sans Tailwind les rend correctement.

---

## 3 bis. Les paliers

**Tout ce qui est servi à un utilisateur se conçoit d'abord pour un téléphone.** Les espaces
d'administration sont hors de cette règle, et c'est la seule exception.

Les paliers appartiennent au noyau et non à une couche à part : contrairement aux densités,
ils ne varient pas d'un produit à l'autre. Un téléphone de 390 px est un téléphone de 390 px
dans les quatre produits.

| Constante          | Valeur  | Nature     | Ce qui s'y passe                                    |
| ------------------ | ------- | ---------- | --------------------------------------------------- |
| `PLANCHER`         | 320 px  | contrainte | Rien. Aucune mise en page n'a le droit d'y casser   |
| `REFERENCE_MOBILE` | 390 px  | contrainte | Rien. C'est la largeur sur laquelle on dessine      |
| `COMPACT`          | 640 px  | palier     | La marge de page passe de 16 à 24 px                |
| `TABLETTE`         | 768 px  | palier     | La barre d'onglets disparaît, la navigation remonte |
| `BUREAU`           | 1024 px | palier     | Deux colonnes deviennent possibles                  |
| `LARGE`            | 1280 px | palier     | Le contenu est plafonné et centré                   |

**Deux des six ne sont pas des paliers.** Rien ne s'y déclenche. Les distinguer évite qu'on
écrive un jour `@media (min-width: 320px)`, qui ne voudrait rien dire.

Les sept règles, la justification chiffrée de chaque valeur et le détail de la coquille
d'application sont dans [`PALIERS.md`](PALIERS.md).

---

## 4. L'iconographie

Lucide, style contour, **épaisseur 1,75 px** — contre 1,5 dans le registre institutionnel.
Les 0,25 px se justifient sur un écran de téléphone, où un trait de 1,5 disparaît. Jamais
d'icône remplie. Tailles 16, 20, 24, 32, 72.

**Une icône ne remplace jamais un mot dans une information d'état.** Un cadenas seul ne dit
pas quelle licence manque, ni à qui la demander.

---

## 5. La voix

Héritée de la marque : mentor et non vendeur, clair, structuré, quantifié, lucide.

Plus les règles propres à l'applicatif : vouvoiement partout, y compris dans les erreurs et
les courriels ; aucun tiret cadratin ; ni emoji ni exclamation nulle part ; nommer la
conséquence — un verrou dit ce qui le lève, un avertissement dit ce qu'on perd ; pas
d'anglicisme ; assumer l'absence plutôt qu'inventer une réponse.

Les formulations de référence sont dans [`formulations.md`](formulations.md).

---

## 6. Le mode sombre

Traité dès le premier écran, jamais ajouté après. Trois états : préférence système, choix
explicite clair, choix explicite sombre — **le choix du compte l'emporte sur la préférence
du système**.

**Le navigateur suit.** `color-scheme` et `accent-color` depuis la 1.1.0 ; `caret-color` et la
sélection de texte, aux couleurs du bouton primaire, depuis la 1.2.0. La barre d'adresse d'un
téléphone se colore par `<meta name="theme-color">`, qui n'accepte pas de variable : ses deux valeurs,
celles de `--surface-1`, s'importent par `COULEURS_NAVIGATEUR` depuis `@ai5d/design-system/theme`.

Trois règles. Les ombres disparaissent et `--elevation-*` vaut `none` : sur fond sombre une
ombre portée ne se voit pas, et la simuler produit du gris sale. La hiérarchie y naît d'une
surface plus claire. Le bleu s'éclaircit — seul jeton dont la valeur change entre les deux
thèmes. Et **aucun scintillement** : le thème est appliqué avant le premier rendu.

---

## 7. Adoption

```ts
import '@ai5d/design-system/preset';
```

```html
<html lang="fr" data-densite="equilibre"></html>
```

Le préréglage tire derrière lui les polices, les jetons de marque, les jetons du noyau et
les profils de densité. Le profil se choisit dans [`../densites/DENSITES.md`](../densites/DENSITES.md).

Hors d'une page, dans un PDF, une image de partage ou un courriel, le logotype se compose selon
`LOGOTYPE`, exporté par `@ai5d/design-system/logotype` : la recette, sans les couleurs, que chaque
format porte lui-même.
