# SPEC · Version 1.3.0 : ce qui manque au système pour la console

| | |
| - | - |
| **Projet** | AI5D Digital Design System, paquet `@ai5d/design-system` |
| **Dépôt** | `Kaaramo/ai5d-digital-design-system`, **public** |
| **Version publiée par ce lot** | `1.3.0`, étiquette `v1.3.0` |
| **Nom de ce lot dans les documents du Portail** | « Système 1.3 » (SPEC P10 §0.2, §0.3 et §7, après le renommage tranché le 26 septembre 2026) |
| **Priorité** | Haute. P10 ne commence pas son code sans cette version ; l’injection unique des feuilles touche tous les produits |
| **Dépend de** | `v1.2.0`, publiée le 26 septembre 2026 (commit `c952e0e`) |
| **Suivi de** | La montée du Portail à `v1.3.0` (P10), puis celle de Compte et du SDK `@ai5d/auth`, à leur rythme |
| **Responsable** | Karamo Sylla |
| **Document compagnon** | [`USER-STORIES-Version-1.3.0-Console.md`](USER-STORIES-Version-1.3.0-Console.md) |
| **Date** | 28 septembre 2026 |

---

## 0. Constats et décisions, avant toute spécification

Ce lot ajoute au système ce que la console d’administration du Portail lui demande (SPEC P10 §7.2,
treize pièces), constate ce que la `1.2.0` a déjà livré de la liste du §7.1 de P10, et corrige au
passage un défaut que tous les produits portent : chaque instance d’un composant pose sa propre
feuille de style. Les constats ci-dessous ont été faits le 28 septembre 2026, en machine : sur ce
dépôt au commit `c952e0e` (`v1.2.0`), sur le Portail au commit `ad843ea`, et sur le SDK
`@ai5d/auth` 1.1.0 tel qu’il est installé dans le Portail (`node_modules/@ai5d/auth`). Ce qui est
constaté est écrit comme un fait ; ce qui reste à trancher est au §0.9.

**Compte (`ai5d-platform`) a été relu le 28 septembre 2026, au commit `1ef7ef2`.** Chaque constat de
la SPEC P10 §0.6 y a été revérifié, fichier et ligne (§0.6) : `EnteteConsole.tsx`, `Selecteur.tsx`,
`Annonce.tsx`, `ActionsCompte.tsx`, `app/admin/Recherche.tsx`.

Ce dépôt est **public**. Rien de ce lot n’y dépose de donnée personnelle, de clé ni d’adresse réelle :
les exemples emploient les personnes fictives du PRD du Portail.

### 0.1 Le numéro et le nom du lot

Le lot publie la **1.3.0** : des ajouts rétrocompatibles et deux changements de rendu annoncés
(§0.9, point 1). Correspondance des noms, telle qu’elle est après le renommage du 26 septembre 2026
(SPEC P10 §0.3, encadré « Tranché ») :

| Nom dans le Portail | Version publiée ici | Contenu |
| ------------------- | ------------------- | ------- |
| (aucun) | `1.1.0`, publiée | L’erreur dans les boîtes de dialogue, le schéma de couleur du navigateur |
| « Système 1.2 » | `1.2.0`, publiée | Le contrat de P09 §7 |
| « Système 1.3 » | **`1.3.0`, ce lot** | Le contrat de P10 §7.2, tel que ce document le retient (§0.6) |

**Constat d’écart dans nos propres documents.** La SPEC de la 1.2.0 (§0.1, tableau de
correspondance, et §16) nomme encore ce lot « Système 1.2 » : elle a été écrite avant le renommage.
Elle n’est pas réécrite (un document daté garde son état) ; ce paragraphe fait foi.

### 0.2 Où en sont les consommateurs

| Consommateur | Version installée | Où, et état du constat |
| ------------ | ----------------- | ---------------------- |
| AI5D Portail | `v1.2.0` | `package.json:27` du Portail, constaté. P09 est livré (`03017ba`, « Les preuves, les leçons et le suivi de P09 ») |
| SDK `@ai5d/auth` 1.1.0 | dépendance de pair `*` | Installé dans le Portail, constaté ; il importe `Avatar` (`src/react/UserButton.tsx:4`) et `Pastille` (`src/react/OrganizationSwitcher.tsx:4`) du système |
| AI5D Compte | **`v1.1.0`** sur sa branche principale (`apps/compte/package.json:11`, commit `1ef7ef2`, relu le 28 septembre 2026) ; la montée à `v1.2.0` n’a été qu’un essai (`docs/preuves/1.2.0/montee-compte.md`) | Constaté. La 1.3.0 doit rester montable depuis la 1.1.0 : c’est une raison de plus de n’y casser aucune API |

### 0.3 Ce que P10 §7.1 attendait de la 1.2.0, pièce par pièce

La SPEC P10 §7.1 liste neuf pièces demandées par P09 à la 1.2.0 et employées par la console ; pour
chacune, elle écrit « Passe au contrat 1.3, bloquante » si la 1.2.0 ne l’a pas livrée. Constat dans
le code de la 1.2.0 :

| N° P09 | Pièce | État constaté | Où |
| ------ | ----- | ------------- | -- |
| 1 | `Bouton` rendu en lien (`href`, `Lien`, `target`, `rel`, `download`) | **Livré** | `noyau/composants/Bouton.tsx:132-142` (types), `:422-529` (rendu) |
| 2 | Ton `neutre` de `Pastille`, `PastilleEtat`, `Bandeau` | **Livré** | `Pastille.tsx:17`, `:29` ; `Bandeau.tsx:34`, `:42`, `:51` |
| 3 | `OngletsRubrique` relié au routeur, six onglets, débordement signalé, onglet actif amené dans la vue | **Livré** ; fondu et onglet initial selon le moteur (Chromium les deux, WebKit le fondu seul, Firefox aucun ; décision 007) | `OngletsRubrique.tsx:89` (`Lien`), `:102` (`ONGLETS_RUBRIQUE_MAX = 6`), `:185-204` |
| 7 | `--largeur-lecture` (36rem) et `--mesure-texte` (65ch) | `--mesure-texte` **livré** (`noyau/jetons.css:144`) ; `--largeur-lecture` **retiré** en 1.2.0, faute de deuxième consommateur (SPEC 1.2.0 §17, écart 8 ; décision 009) | Le Portail le porte en constante : `lib/mesures.ts:10`, `LARGEUR_LECTURE = '36rem'`, déjà employée par P09 (`components/Chargements.tsx:112`, `components/participant/TeteMoment.tsx:149`) |
| 8 | Jetons de mouvement par rôle | **Livré** | `noyau/jetons.css:207-209` |
| 9 | `TitreSection` | **Livré** | `TitreSection.tsx:44` |
| 10 | `ListeLignes` | **Livré** | `ListeLignes.tsx:37` |
| 11 | `ListeDefinitions` | **Livré** | `ListeDefinitions.tsx:71` |
| 12 | `ValeurCopiable` | **Livré**, avec un écart de forme pour la console (§0.7) | `ValeurCopiable.tsx:81`, bouton `neutre` à `:154` |

**Conséquence.** Aucune pièce du §7.1 ne passe au contrat de la 1.3.0. La seule non livrée,
`--largeur-lecture`, n’est pas bloquante : la constante `LARGEUR_LECTURE` du Portail sert la console
comme elle sert l’espace participant (même produit), et IP63 de P09 vise `app/` et `components/`, pas
`lib/`. Le « point laissé ouvert » de P10 §7.1 (un formulaire de session à 36rem qui ne tiendrait plus
date et heure sur une ligne) se tranche donc dans le Portail, sur capture, sans le système. P10 relit
§5.1 (règle 1), §5.2, §5.6, §5.8, §5.12, §5.14, §5.19 et §11, qui citent le jeton `--largeur-lecture`
(§17 de ce document).

### 0.4 Chaque instance pose sa feuille : le mécanisme actuel, mesuré, et sa correction

**Le mécanisme actuel.** Un composant qui a des états porte sa feuille dans une constante
`STYLE_…` et la rend, **à chaque rendu**, dans une balise placée juste avant son élément :

```tsx
<style id={ID_STYLE} dangerouslySetInnerHTML={{ __html: STYLE_BOUTON }} />
```

Constat par `grep -n "<style" noyau/composants/*.tsx` : **26 balises dans 21 fichiers**. La SPEC
P10 §0.11 en comptait dix-sept, lues dans la `v1.0.1` installée ; la `1.2.0` en a ajouté.

| Fichier | Balises | Identifiant |
| ------- | ------- | ----------- |
| `Bouton.tsx` | 3 (`:393`, `:442`, `:495`) | `ai5d-bouton` deux fois (bouton d’action, lien), `ai5d-hors-ecran` |
| `LigneLien.tsx` | 2 (`:195`, `:197`) | `ai5d-ligne-lien`, `ai5d-hors-ecran` |
| `ValeurCopiable.tsx` | 2 (`:138`, `:139`) | `ai5d-valeur-copiable`, `ai5d-hors-ecran` |
| `GabaritApp.tsx` | 2 (`:113`, `:115-119`) | `ai5d-gabarit-app`, et **une balise sans identifiant**, dont le contenu est une règle de palier |
| `BoiteConfirmation.tsx:59`, `BoiteMotif.tsx:68` | 1 chacun | `ai5d-boite`, partagé (`dialogue.ts:30`) |
| `BarreOnglets`, `CarteAction`, `Champ`, `CoquilleRail`, `GabaritAuth`, `GabaritDocument`, `GabaritSeuil`, `GrilleCartes`, `LiensRail`, `ListeDefinitions`, `ListeLignes`, `OngletsRubrique`, `SelecteurTheme`, `SigneAnime`, `Squelette` | 1 chacun | un identifiant par composant |

Trois défauts en découlent : autant de balises identiques que d’instances ; autant d’identifiants
dupliqués, ce qui rend le document invalide ; et, sur un rendu serveur, autant de copies du texte de
la feuille dans le HTML transmis.

**Mesuré le 28 septembre 2026** (sonde écrite pour ce document, non versionnée ; `react-dom` 19.2.8
et `jsdom` 25.0.1 de ce dépôt) :

| Rendu | Balises `<style>` |
| ----- | ----------------- |
| `renderToString` de 500 boutons, mécanisme actuel | **500** |
| `renderToString` de 500 boutons et d’un champ, feuilles portant `href` et `precedence` | **1**, dans laquelle `data-href="ai5d-bouton ai5d-champ"` et les deux feuilles à la suite, sélecteur `>` intact |
| Rendu client (`createRoot`) de 500 boutons, feuilles portant `href` et `precedence` | **1**, dans `document.head`, **0** dans le conteneur ; toujours présente après le démontage |

**La correction retenue : les feuilles se hissent** (décision 010). Chaque feuille est rendue par
une seule fonction, `feuille(id, css)`, qui pose `<style href={id} precedence="ai5d">{css}</style>`.
React 19 la hisse dans `<head>` et la déduplique par `href`, au serveur comme au client. Le détail est
au §5.1. L’autre voie, une feuille statique importée par le préréglage, est écartée au §5.1.6.

Ce que la correction change hors du rendu, et que le §13 dit aux produits : la feuille n’est plus
dans le conteneur du composant mais dans `<head>` ; elle ne porte plus d’`id` au serveur (React
n’émet que `data-href` et `data-precedence`) ; au serveur, toutes les feuilles du système tiennent
dans **une** balise dont `data-href` liste les composants employés.

### 0.5 Le survol n’a pas de jeton, et en sombre il se confond avec l’appui

Deux composants écrivent leur survol à la main, avec un bloc de sélecteurs par thème, faute de jeton
réglé par thème :

| Composant | Clair | Sombre | Où |
| --------- | ----- | ------ | -- |
| `LiensRail` | `--surface-1` | `--surface-3` | `LiensRail.tsx:103`, `:111`, `:113` ; le commentaire `:84-86` le dit : « Il n’existe pas de jeton de survol réglé par thème » |
| `LigneLien` | `--surface-chaude` | `--surface-3` | `LigneLien.tsx:108-111` ; le commentaire `:37-38` attend « le jeton de survol de la 1.3.0 » |

**En sombre, le survol vaut l’état qu’il ne doit pas imiter.** `--surface-selection` vaut
`--surface-3` en sombre (`noyau/jetons.css:292`, `:331`). Une `LigneLien` survolée a donc exactement
le fond d’une `LigneLien` appuyée (`LigneLien.tsx:114`) ; un lien du rail survolé a exactement le fond
de la rubrique active (`LiensRail.tsx:104-108`). La SPEC P10 §5.23 le relève pour ses tables.

**Mesures** (ratio WCAG des luminances ; ce n’est pas un contraste de texte mais l’écart entre deux
fonds, ce qui dit si un survol se voit) :

| Candidat au survol | Sur `--surface-1` | Sur `--surface-2` | Sur `--surface-3` | Contre `--surface-selection` |
| ------------------ | ----------------- | ----------------- | ----------------- | ---------------------------- |
| Clair, `--surface-chaude` (#F4EFE7) | 1,07 | 1,14 | 1,14 | 1,00 : même clarté, teinte différente (chaude contre bleutée) |
| Clair, `--surface-1` (#FAF7F2) | 1,00, invisible | 1,07 | 1,07 | 1,07 |
| Sombre, `--surface-3` (#172C3B) | 1,27 | 1,14 | 1,00, invisible | 1,00, invisible |
| Sombre, `--surface-1` (#0B1620) | 1,00, invisible | 1,11 | 1,27 | 1,27 |
| Sombre, `--surface-chaude` (#171F26) | 1,10 | 1,01, invisible | 1,26 | 1,26 |

Aucune valeur sombre ne se détache à la fois des trois surfaces : en essayant des teintes nouvelles
entre et au-delà de celles du système (sonde du 28 septembre 2026), une valeur plus claire que
`--surface-3` fait tomber `--action` à 4,16 et `--reussite` à 4,20 ; une valeur entre les surfaces
se confond avec l’une d’elles. **Décision proposée (décision 011)** : `--surface-survol` est le survol
d’un élément posé sur **`--surface-2` ou `--surface-3`** (table, menu, carte, rail), et il vaut
`--surface-chaude` en clair, `--surface-1` en sombre. En sombre, le survol creuse d’un cran là où la
sélection et l’appui éclairent : les deux ne se confondent plus (1,27). Il ne vaut pas pour un
élément posé à même la page (`--surface-1`), ce que `LigneLien` fait dans l’espace participant : elle
garde ses règles (§5.2.4).

**Une paire échoue, et la règle le dit.** `--attention` (#B45309) en texte nu sur `--surface-chaude`
mesure **4,39** en clair. Un texte en `--attention` ne se pose pas sur une surface survolée sans son
fond `--attention-fond` (4,54) : c’est le cas du compte « Envoi échoué » en `attention` d’une puce de
filtre de P10 §5.16 (§17).

### 0.6 La règle du deuxième consommateur, appliquée au contrat de P10

La règle, telle que la décision 009 la lit : un **composant nouveau** monte quand un deuxième produit
en a le besoin, constaté dans son code (fichier et ligne) ; une **extension** d’un composant déjà
partagé se justifie par le besoin d’un seul produit ; un **jeton ou une règle globale** se justifie
par un correctif ou une nature transversale. **La console du Portail n’est pas un deuxième
consommateur** du Portail. Le SDK `@ai5d/auth`, qui consomme le système (décision 004), en est un.

| # | Pièce (P10 §7.2) | Nature | Deuxième consommateur, constaté ou non | Verdict |
| - | ---------------- | ------ | -------------------------------------- | ------- |
| 1 | `TableauDonnees` | Composant nouveau | Non constaté. P10 §0.6 : Compte n’a que des registres en lignes de relevé (`LigneCompte`, `LigneCle`, `LigneReception`, `LigneAutorisation`), « à confirmer ». Le SDK n’a aucune table | **Reste dans le Portail**, API de P10 §7.2 |
| 2 | `BarreActionsGroupees` | Composant nouveau | Non constaté. P10 §0.6 : « aucune sélection multiple dans la console de Compte » | **Reste dans le Portail** |
| 3 | `PucesFiltre` et `RechercheTable` | Composants nouveaux | Non constaté. Revérifié le 28 septembre 2026 : `apps/compte/app/admin/Recherche.tsx:31` est un formulaire envoyé au serveur (`chercherCompte`), un `Champ` et un bouton, sans puces ni filtre dans une table affichée : ce n’est pas un deuxième consommateur | **Restent dans le Portail** |
| 4 | `MenuActions` | Composant nouveau | **Constaté dans le SDK.** `node_modules/@ai5d/auth/src/react/UserButton.tsx:100-139` (dans le Portail) écrit un menu à la main : `role="menu"` (`:102`), `role="menuitem"` (`:120`), `aria-haspopup="menu"` (`:78`), aucune gestion des flèches ni d’Échap (aucune occurrence de `ArrowDown` ni de `Escape` dans le fichier), aucune fermeture au clic extérieur, largeur `minWidth: 200` en pixels (`:107`), ombre `--elevation-2`. Compte (`ActionsCompte.tsx:32`, revérifié le 28 septembre 2026) : des `Bouton` directs (`:139`, `:143`), aucun menu ; il ne compte pas | **Monte** (§5.3) |
| 5 | `EnteteObjet` | Composant nouveau | **Constaté le 28 septembre 2026** dans Compte (`ai5d-platform`, commit `1ef7ef2`) : `apps/compte/components/EnteteConsole.tsx:25-34`, `titre`, `filDAriane` (`:31`, `nav aria-label="Fil d’Ariane"` `:38`, dernier segment sans lien en `aria-current="page"`), `action` unique à droite du titre (`:33`) ; rendu dans 7 fichiers de `apps/compte` | **Monte** (§5.8) |
| 6 | `EnteteRubrique`, emplacement `action` | Extension | Suffit (décision 009) ; `EnteteConsole.tsx:33` porte aussi une `action` unique à droite du titre (revérifié le 28 septembre 2026) | **Monte** (§5.5) |
| 7 | `OngletsRubrique`, compteur | Extension | Suffit | **Monte** (§5.6) |
| 8 | Jeton `--surface-survol` | Jeton transversal, et correctif (§0.5) | Les deux composants du système qui l’écrivent à la main, `LiensRail` et `LigneLien` | **Monte** (§5.2) |
| 9 | Injection unique des feuilles | Correctif du système | Tous les produits, et le SDK par ses composants | **Monte**, premier du lot (§5.1) |
| 10 | `Annonce` (région de retour) | Composant nouveau **ou** extension de `Bandeau` | Comme composant : revérifié le 28 septembre 2026, `apps/compte/components/Annonce.tsx:18-20` rend un `Bandeau ton="reussite"` sans fermeture, ce qui confirme la lecture en extension de `Bandeau`. Comme extension : `Bandeau` a déjà le ton, l’icône, le rôle selon le ton et l’emplacement `action` (`Bandeau.tsx:20-27`, `:46-52`) ; il lui manque la fermeture et le focus | **Monte comme extension de `Bandeau`** (`onFermer`, `libelleFermer`, `ref`) ; la région elle-même (collée, remplacement, codes d’adresse, focus rendu) reste dans le Portail, `RegionRetour` composé sur `Bandeau` (§5.4) |
| 11 | `Chiffre` compact | Extension | Suffit | **Monte** (§5.7), avec la forme compacte de `SqueletteIndicateurs` que P10 §5.4 demande sans la nommer |
| 12 | `BarreEnregistrement` | Composant nouveau | Non constaté | **Reste dans le Portail** |
| 13 | `CaseACocher`, `ChoixSegmente`, `Selecteur`, `ZoneTexte` | Composants nouveaux | `Selecteur` : **constaté le 28 septembre 2026** dans Compte (`apps/compte/components/Selecteur.tsx:19-35`, `<select>` natif `:65`, `libelleMasque` `:21`, `invite` `:26`), rendu 7 fois dans 6 fichiers de `apps/compte`. Les trois autres : non constatés | **`Selecteur` monte** (§5.9) ; **les trois autres restent dans le Portail** |

Bilan : **six pièces montent** (n° 4, 6, 7, 8, 9, 10 sous forme d’extension, 11), **deux constatées dans Compte le 28 septembre** (n° 5 et `Selecteur` du n° 13), **cinq restent dans le Portail** (n° 1, 2, 3, 12, et trois
des quatre champs du n° 13). Aucune pièce restée dans le Portail n’est bloquante pour P10 : aucune ne
touche un composant du système ni ne déclare de jeton (critère de P10 §7).

**Pourquoi `TableauDonnees` ne monte pas, alors que c’est la plus grosse pièce.** La règle ne se lit
pas à la taille. `GabaritPortail` est monté sans consommateur et a été retiré en `1.0.0` ; une table
écrite pour la seule console porterait les choix de la console (sélection de participations, adresse
tronquée, colonne Personne collée) et devrait être réécrite au premier usage de Compte. Elle s’écrit
dans le Portail sur les jetons, avec `--surface-survol` et le mécanisme de feuille du §5.1, et monte
le jour où Compte montre une table. Karamo peut décider autrement ; ce serait un écart à la décision
009, à consigner comme tel (§0.9, point 4).

### 0.7 Ce que la lecture du code a montré en plus

| Constat | Où | Conséquence |
| ------- | -- | ----------- |
| **La réserve basse ne retombe jamais à zéro au-delà de 768 px.** `CoquilleRail` pose `--reserve-barre` en **style en ligne** sur `.ai5d-coquille-rail` en mode `complet` (`CoquilleRail.tsx:313-316`, `:333`), puis tente de la remettre à `0px` au palier tablette par une règle de feuille (`:217`). Une déclaration en ligne l’emporte sur toute règle de feuille : la remise à zéro ne s’applique pas. `GabaritApp` a la même forme (`:102-108` en ligne, `:115-119` en feuille) | Lecture de la cascade CSS ; **non mesuré** | Au bureau, en mode `complet`, le contenu et le pied garderaient en bas la hauteur de la barre basse, qui n’y est plus. À mesurer au plan dans Chromium ; si c’est confirmé, correctif du lot (§5.10) |
| `ValeurCopiable` rend un `Bouton` `neutre` de taille `md` (`ValeurCopiable.tsx:154`) ; P10 §5.21 décrit un bouton `discret` `sm` « Copier l’identifiant » | Code et SPEC P10 | Pas au contrat ; P10 relit §5.21 (§17) |
| `SqueletteIndicateurs` ne connaît que des tuiles de 5rem de haut en grille (`Squelette.tsx:292-316`) ; P10 §5.4 le veut « ramené à la forme de la rangée » compacte | Code et SPEC P10 | Forme `compact` ajoutée avec `Chiffre` (§5.7) : un squelette qui ne promet pas la forme du contenu est le défaut P1-19 de l’audit |
| Aucun composant du système ne pose de chiffres tabulaires hors du document (`SommaireDocument.tsx:68`, `GabaritDocument.tsx:95`) | `grep -rn "tabular" noyau` | Le compteur d’onglet et `Chiffre` compact les posent (P2-11 de l’audit) |
| `EnteteRubrique` écrit son `h1` à la main (`EnteteRubrique.tsx:83-93`) et reçoit ses propriétés en type anonyme (`:45-53`) | Code | Le titre reste tel quel (la 1.2.0 a décidé de ne pas migrer, SPEC 1.2.0 §5.8.3) ; le type devient nommé et exporté, `ProprietesEnteteRubrique` |
| jsdom 25 n’implémente ni `showPopover()` ni l’évènement `toggle` (aucune occurrence dans `node_modules/jsdom/lib`) | Recherche dans le paquet | Le comportement du menu au clavier et au clic extérieur se prouve au navigateur ; les tests jsdom doublent l’API (leçon « jsdom ne connaît pas `showModal()` ») |
| P10 §10 donne à l’ouverture d’un menu `--mouvement-sortie`, « celui de l’apparition des dialogues ». Les dialogues s’ouvrent en `var(--duree-courte) var(--courbe-sortie)` (`dialogue.ts:53`), qui en a la valeur mais pas le rôle : une ouverture n’est pas un départ | Code et SPEC P10 | Le menu emploie la durée et la courbe par leurs jetons de base, comme les dialogues ; aucun jeton de rôle détourné (§7) |
| Trois constats différés par la relecture de la 1.2.0 touchent des pièces de ce lot ou que la console emploie : n° 5 (`ListeLignes` rend un filet pour un enfant qui rend `null`), n° 9 (une apostrophe droite dans la page des spécimens), n° 3 (commentaire de `ComposantLien`) | `docs/preuves/1.2.0/relecture.md` | N° 9 corrigé au passage, puisque les spécimens sont régénérés ; n° 3 et n° 5 restent différés, la console ne rend aucune ligne nulle (§16) |

### 0.8 Ce que le lot ne change pas

- **Aucune valeur de jeton existante.** Une garde le prouve contre un instantané de `1.2.0` (§6).
- **Aucune propriété retirée, aucune variante renommée.** `ProprietesChiffre` devient une union
  (§5.7) ; les appels constatés dans le Portail (`app/admin/page.tsx:40-56`) compilent tels quels.
- **Aucune dépendance ajoutée**, ni de production ni de développement. `Ellipsis` et `X` viennent de
  `lucide-react`, déjà en pair.
- **Aucun cadriciel.** Aucun composant n’importe Next ; le lien du routeur arrive toujours en
  propriété.
- **`noyau/marque.css`** et les six jetons de marque ne bougent pas.
- **Aucun composant existant ne passe côté client.** `MenuActions` déclare `'use client'` ; `Selecteur`
  aussi ; tous les autres restent rendables par un composant serveur.
- **Les constantes `STYLE_…` gardent leur nom, leur forme (`const STYLE_X = \`…\`;`) et leurs
  exports** (`STYLE_LIENS_RAIL`, `STYLE_DOCUMENT`, `STYLE_SELECTEUR_THEME`, `STYLE_COPIABLE`…) :
  `_build/generer-specimens.mjs:122` et `tests/cycles.test.ts` les lisent par leur texte.

### 0.9 Ce qui reste ouvert, et qui le tranche

**Tranché par Karamo le 28 septembre 2026**, avant le plan : points 1 (mineure, `1.3.0`), 2 (le survol
sombre creuse, `--surface-1`), 3 (`LiensRail` passe au jeton), 4 (`TableauDonnees` reste au Portail,
décision 009) ; le point 5 est clos par la relecture de Compte. Les points 2 et 3 se revoient encore
sur les captures avant l’étiquette ; les points 6, 7 et 8 restent ouverts.

1. **Le classement de la version.** Deux changements de rendu sans code dans le produit : la place
   des feuilles (dans `<head>`, une balise au serveur), et, si Karamo les accepte, le survol de
   `LiensRail` (§5.2.3) et la réserve basse (§5.10). Aucune valeur de jeton ne change, aucune
   propriété n’est retirée. **Proposition : mineure, `1.3.0`**, avec « Ce qui change à l’écran » en
   tête du journal, comme en `1.2.0`. **Karamo tranche** au moment de l’étiquette.
2. **Le survol en sombre** (`--surface-1`, un survol qui creuse) : Karamo le valide sur les captures en
   sombre d’une table, d’un menu et du rail, ou demande une autre valeur, qui devra passer les mesures
   du §0.5.
3. **La migration de `LiensRail` vers `--surface-survol`** (§5.2.3) : proposée, parce qu’elle corrige
   le survol confondu avec la rubrique active en sombre ; elle change le survol du rail dans tous les
   produits. Karamo l’accepte sur captures, ou elle sort avant l’étiquette.
4. **`TableauDonnees` sans deuxième consommateur** (§0.6) : la SPEC suit la décision 009 et le laisse
   au Portail. Un autre choix est un écart à consigner.
5. **Les deux revérifications dans Compte** : **faites le 28 septembre 2026** sur `1ef7ef2` (lignes
   au §0.6) ; `EnteteObjet` et `Selecteur` montent. Point clos.
6. **La réserve basse** (§5.10) : correctif seulement si la mesure la confirme.
7. **Les moteurs** : `popover`, le positionnement par ancre CSS (`anchor-name`, `position-anchor`) et
   le hissage des feuilles se constatent dans Chromium, Firefox et WebKit au plan ; Safari sur appareil
   seulement si Karamo en dispose, sinon ligne « non couvert ».
8. **La publication de l’étiquette `v1.3.0`** demande l’accord explicite de Karamo (§14).

---

## 1. Objectif

Donner au système ce qu’une console d’opérateur lui demande et qu’un deuxième produit partage déjà :
une page qui pose une seule feuille par composant, quelle que soit la longueur d’une table ; un menu
d’actions qui se parcourt au clavier, se referme au clic extérieur et range à part les gestes qui
défont ; un survol réglé par thème qui ne se confond plus avec l’appui ; un en-tête de rubrique qui
porte son action sans couper son filet ; des onglets qui comptent le travail en attente ; des
indicateurs qui se lisent comme une phrase et mènent où ils le disent ; un bandeau de retour qui se
ferme et reçoit le focus. Et, pour ce qui n’a pas de deuxième consommateur, une réponse nette : cela
reste dans le Portail, avec l’API que P10 a proposée, et monte le jour où Compte en a besoin.

Le lot ne se déclare pas terminé sur une suite verte : il se prouve par un compte de balises dans un
vrai rendu, par le menu au clavier dans un vrai navigateur, par des captures en clair et en sombre, et
par la montée d’essai du Portail, de Compte et du SDK avant l’étiquette (§11).

---

## 2. User Stories (résumé)

Le détail narratif est dans le document compagnon
[`USER-STORIES-Version-1.3.0-Console.md`](USER-STORIES-Version-1.3.0-Console.md) : quinze stories,
huit epics. Deux sortes de personas : les **produits** qui consomment le système (Karamo qui intègre
la console du Portail, le SDK `@ai5d/auth`, Compte), et les **personnes** qui les utilisent (Karamo
opérateur, au bureau, trois sessions en parallèle ; Aïssatou Camara, participante, sur son téléphone).

| # | En tant que | Je veux | Afin de |
| - | ----------- | ------- | ------- |
| US-C01 | Karamo, qui intègre la console | qu’une table de cinq cents lignes ne pose qu’une feuille par composant | un HTML valide et une page qui reste légère sur un réseau lent |
| US-C02 | Compte, puis le Portail | monter de version sans réécrire un test ni un composant | savoir où la feuille est passée avant de le découvrir |
| US-C03 | Karamo, opérateur au clavier | ouvrir le menu d’une ligne, le parcourir aux flèches, le refermer par Échap | corriger une adresse sans reprendre la souris |
| US-C04 | Karamo, opérateur | voir les gestes qui défont rangés à part, en rouge | ne pas révoquer une attestation en visant « Bloquer » |
| US-C05 | Aïssatou, puis le SDK | que le menu de compte se referme quand je touche à côté | ne pas rester devant un menu ouvert sur mon téléphone |
| US-C06 | Karamo, opérateur | lire une ligne survolée et une ligne sélectionnée sans les confondre, en sombre | savoir ce que la barre groupée va toucher |
| US-C07 | Karamo, qui intègre la console | poser l’action d’une rubrique à droite de son titre | qu’elle ne coupe plus le filet de l’en-tête |
| US-C08 | Karamo, opérateur | voir sur un onglet le nombre de choses qui m’y attendent | aller droit à l’onglet où il reste un geste |
| US-C09 | Karamo, opérateur | lire le pouls d’une session en trois phrases qui mènent à la liste filtrée | savoir où en est la session sans ouvrir ses onglets |
| US-C10 | Karamo, opérateur | fermer un retour quand je l’ai lu, et y être ramené quand le bouton que je tenais disparaît | ne jamais perdre le fil de mon geste |
| US-C11 | Karamo, opérateur | un en-tête qui dit l’objet, son état, sa suite et son pouls, identique sur tous ses onglets | ne pas recomposer l’état d’une session onglet par onglet |
| US-C12 | Compte | un sélecteur natif aux jetons du système | cesser d’en écrire un par produit |
| US-C13 | Aïssatou, sur une tablette | que la page s’arrête où le contenu s’arrête | ne pas faire défiler un vide |
| US-C14 | Karamo, qui intègre la console | savoir ce qui reste au Portail et avec quelle API | écrire les replis une fois, montables plus tard |
| US-C15 | Karamo | une version prouvée au navigateur et montée à l’essai avant d’en poser l’étiquette | ne publier à tous les produits que ce qui a été vu |

---

## 3. Livrables

| # | Livrable | Fichiers | Nature |
| - | -------- | -------- | ------ |
| 3.1 | Feuilles hissées | `noyau/composants/feuille.ts` (nouveau, module sans JSX) ; les 21 fichiers du §0.4 ; `GabaritApp.tsx` sans balise anonyme | Correctif |
| 3.2 | Garde distribuée | `gardes/index.ts` : `verifierFeuilleUnique` (septième garde) | Garde |
| 3.3 | Jeton de survol | `noyau/jetons.css` (`--surface-survol` dans les quatre blocs de thème) ; `LiensRail.tsx` si le point 3 du §0.9 est accepté ; commentaire de `LigneLien.tsx` | Jeton |
| 3.4 | `MenuActions` | `noyau/composants/MenuActions.tsx` (nouveau, `'use client'`) | Composant |
| 3.5 | `Bandeau` qui se ferme | `noyau/composants/Bandeau.tsx` | Extension |
| 3.6 | `EnteteRubrique` et son action | `noyau/composants/EnteteRubrique.tsx` | Extension |
| 3.7 | Compteur d’onglet | `noyau/composants/OngletsRubrique.tsx` | Extension |
| 3.8 | `Chiffre` compact | `noyau/composants/Chiffre.tsx`, `Squelette.tsx` (`SqueletteIndicateurs compact`) | Extension |
| 3.9 | `EnteteObjet` | `noyau/composants/EnteteObjet.tsx` (nouveau) | Composant |
| 3.10 | `Selecteur` | `noyau/composants/Selecteur.tsx` (nouveau, `'use client'`) | Composant |
| 3.11 | Réserve basse, sous condition | `CoquilleRail.tsx`, `GabaritApp.tsx` | Correctif |
| 3.12 | Index | `noyau/composants/index.ts` : composants nouveaux et leurs types, `ProprietesEnteteRubrique`, `ProprietesChiffre`, `PRECEDENCE_FEUILLES` | Code |
| 3.13 | Tests et gardes | §10 | Tests |
| 3.14 | Spécimens | `_build/generer-specimens.mjs`, `specimens/composants.html` régénéré | Preuve visuelle |
| 3.15 | Documents | `noyau/NOYAU.md` (nombre de composants, survol, feuilles, menu), `README.md` (version, badge, nombre de composants, sept gardes, tableau des familles), `noyau/formulations.md` (menu, fermeture, compteur), `CHANGELOG.md` (§12) | Documents |
| 3.16 | Décisions | `docs/decisions/010-les-feuilles-se-hissent.md`, `011-le-survol-a-un-jeton-et-une-portee.md`, `012-ce-que-la-console-demandait-et-ce-qui-reste-au-portail.md` ; `013-la-reserve-basse-vit-dans-la-feuille.md` si le §5.10 s’applique | Documents |
| 3.17 | Version | `package.json` (`"version": "1.3.0"`) | Manifeste |
| 3.18 | Preuves | `docs/preuves/1.3.0/` (§11.2) | Preuves |
| 3.19 | Suivi | `docs/superpowers/plans/2026-09-28-version-1-3-0-console.md` (le plan), `tasks/todo.md` (une section 1.3.0), `tasks/lessons.md` | Suivi |

---

## 4. Ordre des travaux

L’ordre n’est pas indifférent : les feuilles passent d’abord, parce que chaque composant touché
ensuite les rend, et que chaque test de feuille change de lieu de lecture. Les tests s’écrivent
**avec** le code de chaque tâche, marqués « écrite, non testée » ; la vérification se lance d’un seul
bloc à la fin.

```
0. Plan              superpowers:writing-plans, couple SPEC et user stories déclaré dans **Spec:**
                     · tasks/todo.md · revérification dans Compte (EnteteConsole.tsx, Selecteur.tsx),
                     fichier et ligne, verdicts des pièces 5 et 13 consignés · mesures « avant » :
                     balises sur 500 boutons (rendu serveur et client), réserve basse à 1 280 px
1. Feuilles          feuille.ts · les 21 composants · balise anonyme de GabaritApp · aide de test
                     « feuille(id) » lue dans document.head · garde verifierFeuilleUnique · décision 010
2. Survol            --surface-survol · paires de contraste · instantané 1.2.0 · décision 011
                     · LiensRail (si accepté) · commentaire de LigneLien
3. Extensions        Bandeau (onFermer, ref) · EnteteRubrique (action) · OngletsRubrique (compteur)
                     · Chiffre compact et SqueletteIndicateurs compact
4. Composants        MenuActions · EnteteObjet · Selecteur
5. Réserve basse     seulement si la mesure de l’étape 0 la confirme · décision 013
6. Documents         index · NOYAU · README · formulations · décision 012 · CHANGELOG · version
7. Spécimens         pnpm specimens
8. Vérification      pnpm typecheck && pnpm lint && pnpm format:check && pnpm test, d’un seul bloc
9. Preuves           balises « après » · menu au clavier dans trois moteurs · captures clair et sombre
                     · montée d’essai du Portail, de Compte et du SDK · ce qui n’est pas couvert
10. Revue            relecture du lot contre ce document par un relecteur neuf, écarts consignés
11. Étiquette        accord explicite de Karamo, puis v1.3.0 et poussée (§14)
```

Chaque tâche du plan donne un commit, en français, dont le message passe la recherche des mentions
interdites que la règle des commits de Karamo impose (aucun co-auteur, aucune mention d’outillage),
avec un résultat nul. Aucune poussée sans accord.

---

## 5. Comportements attendus, composant par composant

### 5.0 Règles communes à tout le lot

#### 5.0.1 Les jetons employés, et leur valeur pour la lecture

Aucune couleur ni aucun espacement littéral dans un composant. Les valeurs entre parenthèses sont
celles du thème clair puis du thème sombre.

| Jeton | Valeur (clair, sombre) | Emploi dans ce lot |
| ----- | ---------------------- | ------------------ |
| `var(--surface-1)` | #FAF7F2, #0B1620 | Survol en sombre (par `--surface-survol`) |
| `var(--surface-2)` | #FFFFFF, #11212D | Fond d’une table (P10), rail |
| `var(--surface-3)` | #FFFFFF, #172C3B | Fond du menu d’actions |
| `var(--surface-chaude)` | #F4EFE7, #171F26 | Survol en clair (par `--surface-survol`) ; ton `neutre` |
| `var(--surface-survol)` | #F4EFE7, #0B1620 | **Nouveau.** Survol d’un élément de menu, d’un lien du rail (si accepté), d’une ligne de table du produit |
| `var(--surface-selection)` | #EAEFFF, #172C3B | Appui ; rubrique active |
| `var(--bordure)` | #E7E0D6, #22323F | Filet du menu, filet sous l’en-tête, filet entre gestes et gestes graves |
| `var(--texte-fort)` | #051C2C, #F2F5F7 | Titres, valeur d’un `Chiffre` |
| `var(--texte)` | #2B3A45, #C9D4DC | Élément de menu au repos, libellé d’un `Chiffre` |
| `var(--texte-faible)` | #616F78, #8D9AA5 | Métadonnées, séparateurs du fil |
| `var(--action)` | #2251FF, #6B88FF | Anneau de focus, fil de retour, libellé d’un `Chiffre` en lien |
| `var(--erreur)` | #B42318, #F27063 | Geste grave du menu |
| `var(--elevation-3)` | ombre en clair, aucune en sombre | Menu d’actions, comme les dialogues |

Espacements : `--espace-1` 4 px, `-2` 8 px, `-3` 12 px, `-4` 16 px, `-6` 24 px, `-8` 32 px, `-12`
48 px, `-16` 64 px. **Il n’existe pas de `--espace-5`.** Rayons : `--rayon-sm` 4 px, `--rayon-md`
10 px, `--rayon-lg` 16 px, `--rayon-plein`. Cible : `--cible-tactile` 44 px.

#### 5.0.2 Les feuilles

Toute feuille du système passe par `feuille(id, css)` (§5.1) ; toute classe porte le préfixe
`ai5d-` ; les couleurs et les états vivent dans la feuille, jamais en style en ligne (leçon de la
0.4.0). Les quatre règles de la 1.2.0 tiennent pour toute feuille nouvelle ou modifiée : survol gardé
par `@media (hover: hover)` et par `:not(:disabled)` ou `:not([aria-disabled='true'])` ; focus en
`:focus-visible`, anneau de 2 px en `var(--action)` ; appui immédiat, sans transition ; toute feuille
qui déclare `@keyframes` contient `@media (prefers-reduced-motion: reduce)`, qui supprime le
mouvement.

#### 5.0.3 La voix

Tout texte cité entre guillemets s’affiche mot pour mot. Vouvoiement, apostrophe typographique `’`,
aucun tiret cadratin ni demi-cadratin, aucun emoji, aucun point d’exclamation ; un refus nomme qui peut
lever le blocage. Le système écrit peu de texte : « Fermer ce message », le nom du fil « Fil
d’Ariane », et la forme du nom accessible d’un compteur. Tout autre libellé vient du produit. Les
formulations nouvelles entrent dans `noyau/formulations.md` (§5.3.6, §5.4, §5.6).

#### 5.0.4 La frontière serveur et client

| Composant | Directive | Pourquoi |
| --------- | --------- | -------- |
| `Bandeau`, `EnteteRubrique`, `OngletsRubrique`, `Chiffre`, `Squelette`, `EnteteObjet` | aucune | Aucun crochet. Rendables par un composant serveur, avec des icônes et un lien du routeur en propriétés. `onFermer` de `Bandeau` n’est passé que par un appelant client, comme `onClick` de `Bouton` |
| `MenuActions` | `'use client'` | État ouvert, focus itinérant, écoute de `toggle` |
| `Selecteur` | `'use client'` | `useId`, comme `Champ` |
| `feuille.ts` | aucune, module pur | Lu par des composants serveur et client |

La garde `tests/index.test.ts:172-210` le tient dans les deux sens.

---

### 5.1 L’injection unique des feuilles

`noyau/composants/feuille.ts`, et les 21 fichiers du §0.4. **Correctif**, premier du lot. Décision
010. Pièce 9 de P10.

#### 5.1.1 API

```ts
// noyau/composants/feuille.ts : module pur, sans JSX, sans directive
import { createElement, type ReactElement } from 'react';

/**
 * Le groupe de toutes les feuilles du système. React 19 hisse dans `<head>`, et déduplique par
 * `href`, toute balise `<style>` qui porte `href` et `precedence` ; au serveur, il réunit les
 * feuilles d’une même précédence dans une seule balise.
 */
export const PRECEDENCE_FEUILLES = 'ai5d';

/**
 * La feuille d’un composant, posée une fois par document quel que soit le nombre d’instances.
 * `id` est la clé de déduplication : `ai5d-bouton`, `ai5d-champ`… Jamais d’espace (React le refuse,
 * l’hydratation échouerait).
 */
export function feuille(id: string, css: string): ReactElement {
  return createElement('style', { href: id, precedence: PRECEDENCE_FEUILLES }, css);
}
```

Le module est en `.ts` et sans JSX, comme `lien.ts` : un fichier `.tsx` compterait comme un composant
dans `tests/index.test.ts:56-67`. `PRECEDENCE_FEUILLES` est exporté par l’index pour qu’un produit
puisse compter les feuilles du système dans sa recette ; `feuille` ne l’est pas : un produit pose ses
propres feuilles sous **sa** précédence (le Portail : `portail`), jamais sous celle du système.

#### 5.1.2 Rendu

Dans chaque composant, la balise actuelle devient :

```tsx
{feuille(ID_STYLE, STYLE_BOUTON)}
```

Le texte de la feuille passe en **enfant chaîne**, et non par `dangerouslySetInnerHTML` : c’est la
forme que React documente pour une feuille hissée, et le rendu serveur n’échappe que `<style` et
`</style` (`escapeStyleTextContent`, constaté dans `react-dom` 19.2.8) : un sélecteur `>` passe
intact (sonde du §0.4).

| Situation | Ce que le document contient |
| --------- | --------------------------- |
| Rendu serveur (Next, `renderToString`) | **Une** balise `<style data-precedence="ai5d" data-href="ai5d-bouton ai5d-champ …">`, en tête du document, qui contient chaque feuille employée une fois, dans l’ordre du premier rendu |
| Hydratation | React retrouve chaque feuille par `style[data-href~="…"]` et ne la recrée pas |
| Rendu client d’un composant qui n’était pas dans le rendu serveur | Une balise `<style data-href="ai5d-…" data-precedence="ai5d">` ajoutée dans `<head>`, une seule fois |
| Démontage de toutes les instances | La feuille reste (constaté) : elle ne coûte rien, et la retirer ferait clignoter la prochaine instance |

**Ce qui disparaît** : l’attribut `id` des balises de feuille (au serveur, React ne le transmet pas) ;
la feuille dans le conteneur du composant ; la balise anonyme de `GabaritApp.tsx:115-119`, dont la
règle rejoint `STYLE_APP` (et que le §5.10 réécrit si la réserve basse est confirmée).

**Les feuilles partagées restent partagées** : `ai5d-boite` (`BoiteConfirmation`, `BoiteMotif`),
`ai5d-hors-ecran` (`Bouton`, `LigneLien`, `ValeurCopiable`, et désormais `OngletsRubrique` et
`MenuActions`), `ai5d-champ` (`Champ` et `Selecteur`) : même clé, une seule feuille.

#### 5.1.3 L’ordre dans la cascade

Avant, chaque feuille suivait le `<link>` des feuilles du produit, puisqu’elle était dans le corps.
Désormais elle est dans `<head>`, à une place que React choisit par précédence. Ce qui peut changer :

| Règle concurrente | Effet | Pourquoi |
| ----------------- | ----- | -------- |
| Utilitaire Tailwind 4 du produit | Aucun | Tailwind 4 range ses utilitaires dans `@layer utilities` ; une règle hors couche, celles du système, l’emporte quel que soit l’ordre |
| Sélecteur d’élément du préréglage (`html`, `iframe` dans `paliers.css:80`, `:94`) | Aucun | Une classe l’emporte sur un élément quel que soit l’ordre |
| Règle de classe du produit, hors couche, de même spécificité qu’une règle du système | **L’ordre peut s’inverser** | À constater par la montée d’essai (§11.2) ; aucun cas constaté dans le Portail, dont `app/globals.css` n’importe que Tailwind et le préréglage |

#### 5.1.4 Ce que la politique de sécurité du contenu en pense

Une balise `<style>` hissée reste une feuille en ligne. Le Portail autorise `style-src 'self'
'unsafe-inline'` (`lib/securite/csp.ts:32`) : rien ne change. Un produit qui passerait à des feuilles
à nonce devrait fournir le nonce au rendu de React ; React refuse sinon d’inclure la feuille (message
constaté dans `react-dom-server.node.development.js`). Aucun produit n’est dans ce cas (Compte : non
revérifié).

#### 5.1.5 La garde distribuée `verifierFeuilleUnique`

Septième garde, dans `gardes/index.ts`, sur le modèle des six autres (`racine`, `OptionsGarde`,
`Infraction[]`) :

```ts
/**
 * Garde 7 - une feuille de composant se pose une fois par document.
 *
 * Une balise `<style>` sans `href` ni `precedence` est rendue à chaque instance : cinq cents lignes,
 * cinq cents copies et autant d’identifiants dupliqués. Seule une feuille hissée se déduplique.
 */
export function verifierFeuilleUnique(racine: string, options?: OptionsGarde): Infraction[];
```

| Relevé dans un `.tsx` | Infraction (`extrait`) |
| --------------------- | ---------------------- |
| Un élément JSX `<style` dont la balise ouvrante ne porte pas `precedence` | `<style> sans precedence : la feuille est posee a chaque instance` |
| `createElement('style'` sans `precedence` dans ses propriétés | idem |

La balise ouvrante se lit jusqu’au `>` qui la ferme, sur plusieurs lignes au besoin (constat n° 2 de
la relecture de la 1.2.0 : une lecture ligne à ligne rate une déclaration sur deux lignes). Le système
se l’applique à lui-même (`gardes/gardes.test.ts`) ; le Portail peut la brancher dans IP19 (SPEC P10
§13), pour `components/champs/commun.tsx:90-92` qu’il corrige de son côté.

#### 5.1.6 La voie écartée : une feuille statique importée par le préréglage

| Critère | Feuilles hissées | Feuille statique dans le préréglage |
| ------- | ---------------- | ----------------------------------- |
| Geste demandé au produit | Aucun | Aucun si le produit importe déjà `@ai5d/design-system/preset` ; sinon, les composants perdent leurs états |
| Ce qui est chargé | Les feuilles des composants employés | Toutes les feuilles, à chaque page |
| Proximité de la feuille et du composant | Inchangée : la constante vit dans le fichier du composant | La feuille quitte le fichier ; deux lieux à tenir ensemble |
| Tests de feuille (`tests/cycles.test.ts`, tests de composant) | Lus dans `document.head` | Lus dans un fichier CSS, par une autre voie |
| Dépendance | React 19, déjà exigé en pair (`package.json`, `"react": ">=19"`) | Aucune |

Écartée : elle chargerait tout pour tous, et séparerait chaque composant de sa feuille, ce que le
dépôt a choisi de ne jamais faire depuis la 0.4.0.

#### 5.1.7 Les tests qui changent de lieu de lecture

Huit fichiers de tests lisent aujourd’hui une feuille dans le conteneur du rendu ou par son `id`
(`querySelector('style')`, `getElementById('ai5d-…')` ou l’aide `styleInjecte`), trente-neuf
occurrences au total, comptées par `grep` le 28 septembre 2026 : `mobile.test.tsx` (15),
`composants.test.tsx` (6), `onglets-rubrique.test.tsx` (6), `grille-cartes.test.tsx` (5),
`valeur-copiable.test.tsx` (3), `bouton-lien.test.tsx` (2), `coquille-rail.test.tsx` (1),
`liste-definitions.test.tsx` (1). Le plan recompte avant d’écrire la tâche. Une aide unique,
`tests/aides/feuille.ts`, les remplace :

```ts
/** Le texte de la feuille hissée dont la clé est `id`, lu dans `document.head`. */
export function texteFeuille(id: string): string;
```

`sansFeuilles` de `coquille-rail.test.tsx:210-214` reste utile et ne trouve plus rien à retirer : la
comparaison au HTML de la 1.1.0 (`CoquilleRail-1.1.0`) passe de ce fait sans changer. La comparaison
de `bouton-lien.test.tsx:52-74` porte sur `outerHTML` du `<button>` seul : inchangée.

---

### 5.2 Le jeton `--surface-survol`

`noyau/jetons.css`. **Jeton de rôle**, comme `--surface-selection`. Décision 011. Pièce 8 de P10.

#### 5.2.1 Déclaration

```css
:root {
  /* Le survol d’un élément posé sur --surface-2 ou --surface-3 : une ligne de table, un élément de
     menu, un lien du rail. Il ne vaut pas sur --surface-1 en sombre, où il se confondrait avec la
     page : un élément posé à même la page garde ses propres règles (LigneLien).
     En sombre, il creuse d’un cran là où la sélection éclaire : les deux ne se confondent plus
     (1,27), ce que --surface-3 ne permettait pas (1,00). */
  --surface-survol: var(--surface-chaude);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) { --surface-survol: var(--surface-1); }
}
:root[data-theme='dark'] { --surface-survol: var(--surface-1); }
:root[data-theme='light'] { --surface-survol: var(--surface-chaude); }
```

Le jeton ne porte aucune valeur nouvelle : il nomme un rôle et choisit, par thème, une surface déjà
mesurée.

#### 5.2.2 Ce que la garde de contraste mesure en plus

Les couples que tout élément survolé doit tenir, sur `--surface-survol`, dans les deux thèmes. Ceux
qui sont déjà mesurés sous un autre nom de fond (le fond est une surface existante) ne sont pas
dupliqués ; le plan compte ce qui s’ajoute.

| Thème | Premier plan | Ratio | Rôle |
| ----- | ------------ | ----- | ---- |
| clair | `--texte-fort` | 15,18 | Titre ou nom d’une ligne survolée |
| clair | `--texte` | 10,23 | Élément de menu survolé |
| clair | `--texte-faible` | **4,53** | Sous-ligne d’une ligne survolée |
| clair | `--action` | 4,97 | Lien dans une ligne survolée |
| clair | `--erreur` | 5,74 | Geste grave survolé |
| clair | `--reussite` | **4,53** | Texte de réussite dans une ligne survolée |
| sombre | `--texte-fort` | 16,68 | |
| sombre | `--texte` | 12,12 | |
| sombre | `--texte-faible` | 6,35 | |
| sombre | `--action` | 5,73 | |
| sombre | `--erreur` | 6,33 | |

**`--attention` sur `--surface-survol` en clair : 4,39. Paire interdite.** Elle entre dans la garde
comme témoin qui **doit** échouer (un test vérifie qu’elle reste sous 4,5), et `NOYAU.md` §1.4 écrit la
règle : un texte en `--attention` se pose sur `--attention-fond` (4,54), jamais sur une surface
survolée.

#### 5.2.3 Qui l’emploie dans ce lot

| Composant | Emploi | Changement à l’écran |
| --------- | ------ | -------------------- |
| `MenuActions` | Survol et focus d’un élément | Composant nouveau |
| `LiensRail` | **Proposé** : `:hover` sur `var(--surface-survol)`, les deux blocs de thème (`LiensRail.tsx:111`, `:113`) retirés, survol gardé par `@media (hover: hover)` | Oui, dans tous les produits : en clair, `--surface-1` devient `--surface-chaude` (1,07 puis 1,14 contre le rail) ; en sombre, `--surface-3` devient `--surface-1`, et un lien survolé ne se confond plus avec la rubrique active. Point 3 du §0.9 |
| `LigneLien` | **Aucun** : elle se pose aussi à même la page, où le jeton ne vaut pas en sombre | Aucun ; son commentaire `:37-38` est réécrit pour le dire |

#### 5.2.4 Ce que le jeton ne règle pas

`LigneLien` garde, en sombre, un survol égal à son appui (`--surface-3`). La corriger demande une
valeur qui se détache à la fois de `--surface-1` et de `--surface-3`, que le §0.5 n’a pas trouvée.
Différé, écrit au §16.

---

### 5.3 `MenuActions`

`noyau/composants/MenuActions.tsx`, `'use client'`. **Composant nouveau** ; deuxième consommateur
constaté dans le SDK (§0.6, n° 4). Pièce 4 de P10.

#### 5.3.1 API

```ts
import type { ReactNode } from 'react';
import type { ComposantLien } from './LiensRail';

interface ActionMenuCommune {
  /** Identifiant stable dans le menu. */
  id: string;
  /** Le verbe et son objet : « Corriger l’adresse ». */
  libelle: string;
  /** Un geste qui défait : rangé après un filet, écrit en `--erreur`. */
  grave?: boolean | undefined;
}

/** Une destination : l’élément du menu est un lien. */
export interface ActionMenuLien extends ActionMenuCommune {
  href: string;
  /** Un nouvel onglet : `<a target="_blank">` natif, `rel` complété, mention lue. */
  nouvelOnglet?: boolean | undefined;
  onChoisir?: undefined;
}

/** Un geste : l’élément du menu est un bouton. Le menu se referme avant l’appel. */
export interface ActionMenuGeste extends ActionMenuCommune {
  onChoisir: () => void;
  href?: undefined;
  nouvelOnglet?: undefined;
}

export type ActionMenu = ActionMenuLien | ActionMenuGeste;

export interface ProprietesMenuActions {
  /**
   * Le nom du menu : « Actions pour Aïssatou Camara ». Sans `declencheur`, c’est aussi le nom du
   * bouton qui l’ouvre.
   */
  libelle: string;
  /** Les actions, dans l’ordre voulu ; les graves sont rangées après les autres. Vide : rien n’est rendu. */
  actions: readonly ActionMenu[];
  /**
   * Le contenu visible du déclencheur, quand il a un nom visible (le menu de compte du SDK : l’avatar
   * et le nom). Absent : l’icône `Ellipsis` de 16 px, et `libelle` pour nom accessible.
   */
  declencheur?: ReactNode | undefined;
  /** Le lien du routeur du produit ; `a` par défaut. Ignoré pour un nouvel onglet. */
  Lien?: ComposantLien | undefined;
}
```

**Écart de signature avec P10 §7.2**, motivé : P10 proposait `href` et `onChoisir` tous deux
facultatifs sur une même action. L’union interdit l’action qui n’a ni l’un ni l’autre, ou les deux.
`declencheur` et `Lien` sont ajoutés : le premier pour le SDK, dont le déclencheur montre un nom ; le
second parce qu’une action de menu qui mène à une page de la console (« Modifier les informations »,
P10 §5.13) ne doit pas recharger le document.

#### 5.3.2 Rendu

```
<span class="ai5d-menu">
  <button class="ai5d-bouton" data-variante="discret" data-taille="sm"         ← Bouton du système
          aria-haspopup="menu" aria-expanded aria-controls="{id}"
          popovertarget="{id}" aria-label="{libelle}"(sans declencheur)>
    {declencheur ?? <Icone nom={Ellipsis} taille={16} />}
  </button>
  <div id="{id}" role="menu" aria-label="{libelle}" popover="auto"
       class="ai5d-menu__liste">
    <a role="menuitem" tabindex="-1" class="ai5d-menu__element" href>…</a>     ← action lien
    <button type="button" role="menuitem" tabindex="-1" class="ai5d-menu__element">…</button>
    <div role="separator" class="ai5d-menu__filet"></div>                      ← si des graves suivent
    <button … data-grave="">Révoquer</button>
  </div>
</span>
```

`{id}` vient de `useId()`. **Le menu vit dans la couche supérieure** du navigateur par l’attribut
`popover` : il sort de tout conteneur à défilement (la table de P10, qui défile en dernier recours à
1 024 px, P10 §11), sans portail React. `popover="auto"` donne la fermeture au clic extérieur et à
Échap ; le déclencheur porte `popovertarget`, que le navigateur lie au menu pour rendre le focus.

**Le positionnement** se fait par ancre CSS là où le moteur la prend en charge, et par une mesure à
l’ouverture ailleurs :

```css
.ai5d-menu__liste {
  margin: 0; inset: auto;
  min-inline-size: 12rem; max-inline-size: 20rem;
  padding: var(--espace-1);
  background: var(--surface-3);
  border: 1px solid var(--bordure);
  border-radius: var(--rayon-md);
  box-shadow: var(--elevation-3);
}
@supports (anchor-name: --a) {
  .ai5d-menu__liste {
    position-area: block-end span-inline-start;
    position-try-fallbacks: flip-block, flip-inline;
    margin-block-start: var(--espace-1);
  }
}
```

Le déclencheur porte `anchor-name` et le menu `position-anchor`, en style en ligne, par un nom dérivé
de `useId()` (deux menus sur une même ligne ne partagent pas d’ancre). Sans prise en charge, à
l’évènement `toggle` ouvrant, le composant lit `getBoundingClientRect()` du déclencheur et pose `top`
et `left` en coordonnées de la fenêtre, sous le déclencheur et aligné sur son bord de fin ; au-dessus
s’il ne reste pas la place en bas. Un défilement ou un redimensionnement de la fenêtre pendant
l’ouverture **referme** le menu, plutôt que de le laisser flotter à une place fausse.

#### 5.3.3 Ordre des actions

Les actions non graves, dans l’ordre reçu ; puis, **s’il y en a**, un filet (`role="separator"`) et
les graves dans l’ordre reçu. Un menu sans action ne rend rien, ni déclencheur ni menu : un bouton qui
n’ouvre rien est un piège (P10 : « Accès retiré : aucun menu »).

#### 5.3.4 Clavier et focus

Motif « bouton de menu » de l’APG, sans recherche par frappe (hors périmètre, §16).

| Où | Touche | Effet |
| -- | ------ | ----- |
| Déclencheur | Entrée, Espace, clic | Ouvre ; le focus va au premier élément |
| Déclencheur | Flèche bas | Ouvre ; premier élément |
| Déclencheur | Flèche haut | Ouvre ; dernier élément |
| Menu | Flèche bas, flèche haut | Élément suivant, précédent ; boucle aux extrémités ; le filet est sauté |
| Menu | Début, Fin | Premier, dernier élément |
| Menu | Entrée (et Espace sur un bouton) | Choisit : le menu se referme, le focus revient au déclencheur, puis `onChoisir` est appelé ; un lien navigue |
| Menu | Échap | Referme ; focus au déclencheur. Le composant le fait lui-même, sans se reposer sur le seul `popover` |
| Menu | Tab, Maj+Tab | Referme ; focus au déclencheur ; la tabulation suivante reprend l’ordre du document |
| Hors du menu | Clic, toucher | Referme (fermeture légère de `popover="auto"`) ; le focus reste où la personne l’a posé |

**Focus itinérant** : un seul élément du menu porte `tabindex="0"` à la fois, les autres `-1`.
**`onChoisir` après la fermeture** : un geste qui ouvre une `BoiteConfirmation` trouve le focus sur le
déclencheur, et la boîte le lui rendra en se fermant.

#### 5.3.5 États

| Élément | État | Rendu | Sélecteur |
| ------- | ---- | ----- | --------- |
| Déclencheur | Tous | Ceux du `Bouton` `discret` `sm` ; ouvert, fond `var(--surface-selection)` | `[aria-expanded='true']` |
| Élément | Repos | Inter 400 `var(--taille-sm)`, `var(--texte)` (#2B3A45, #C9D4DC), fond transparent ; `min-block-size: var(--hauteur-controle)` ; rembourrage `0 var(--espace-3)` ; rayon `var(--rayon-sm)` ; texte qui passe à la ligne, jamais tronqué | `.ai5d-menu__element` |
| Élément | Survol, pointeur fin | Fond `var(--surface-survol)` (#F4EFE7, #0B1620), transition `background var(--mouvement-retour)` | `@media (hover: hover)` |
| Élément | Focus | Fond `var(--surface-survol)` et anneau 2 px `var(--action)`, décalé de **-2 px** (à l’intérieur : un anneau extérieur serait coupé par le bord du menu) | `:focus-visible` |
| Élément | Appui | Fond `var(--surface-selection)`, sans transition | `:active` |
| Élément grave | Repos, survol, focus | Texte `var(--erreur)` (#B42318, #F27063) ; même fond de survol ; anneau en `var(--erreur)` | `[data-grave]` |
| Filet | | 1 px `var(--bordure)`, marge `var(--espace-1)` au-dessus et au-dessous | `.ai5d-menu__filet` |
| Nouvel onglet | | Mention hors écran « (s’ouvre dans un nouvel onglet) » après le libellé | §5.3.6 |

Contrastes (garde, §6) : `--texte` et `--erreur` sur `--surface-3` (clair 11,71 et 6,57 ; sombre 9,55
et 4,98), et sur `--surface-survol` (§5.2.2).

#### 5.3.6 Voix et textes

Le système n’écrit que la mention du nouvel onglet (`MENTION_NOUVEL_ONGLET`, déjà exportée). Le nom
du menu est celui du produit ; `noyau/formulations.md` reçoit la règle, dans une section « Menus » :
« Actions pour {objet} », où l’objet est nommé (« Actions pour Aïssatou Camara », « Actions de la
formation »), jamais « Plus » ni « Options » seuls. Un libellé d’action est un verbe suivi de son
objet.

#### 5.3.7 Densités, paliers, clair et sombre, accessibilité

Hauteur d’élément sur `var(--hauteur-controle)` : 40 px en `compact` à la souris, 44 px au doigt
(plancher), 48 px en `equilibre`. Aucune requête de palier : la largeur est bornée en `rem`, le texte
passe à la ligne. En sombre, fond `--surface-3` sans ombre (`--elevation-3` vaut `none`), filet
`--bordure` : c’est le filet qui détache le menu. Rôles `menu`, `menuitem`, `separator` ;
`aria-haspopup`, `aria-expanded`, `aria-controls` sur le déclencheur. Mouvement réduit : §7.

#### 5.3.8 Ce que le SDK en ferait, et que ce lot ne fait pas

Le SDK adopterait `MenuActions` dans une version à lui, avec
`<MenuActions libelle="Menu du compte" declencheur={<><Avatar … /><span>{nom}</span></>}
actions={[{ id: 'compte', libelle: 'Mon compte', href }, …]} />`. Ce lot ne touche pas le SDK ; le §13
le lui propose.

---

### 5.4 `Bandeau` qui se ferme et reçoit le focus

`noyau/composants/Bandeau.tsx`, sans directive. **Extension**. Pièce 10 de P10, sous la forme retenue
au §0.6.

#### 5.4.1 API

```ts
import type { HTMLAttributes, ReactNode, Ref } from 'react';

export interface ProprietesBandeau extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  ton?: TonSemantique | undefined;
  titre?: string | undefined;
  children: ReactNode;
  /** Une action unique, à droite. Inchangé. */
  action?: ReactNode | undefined;
  /**
   * Présent : un bouton de fermeture, après l’action. Le produit retire le bandeau ; le système ne
   * le fait pas disparaître de lui-même, et ne le ferme jamais seul.
   */
  onFermer?: (() => void) | undefined;
  /** Le nom du bouton de fermeture. « Fermer ce message » par défaut. */
  libelleFermer?: string | undefined;
  /** Pour y ramener le focus quand l’élément qui l’avait disparaît. Avec `tabIndex={-1}`. */
  ref?: Ref<HTMLDivElement> | undefined;
}
```

#### 5.4.2 Rendu

Inchangé, avec deux ajouts :

| Ajout | Détail |
| ----- | ------ |
| Classe `ai5d-bandeau` | Posée sur la racine, jointe à celle du produit ; une feuille d’une règle : `.ai5d-bandeau:focus-visible { outline: 2px solid var(--action); outline-offset: 2px; }`. Le reste du style reste en ligne, comme aujourd’hui |
| Bouton de fermeture | Si `onFermer` : `Bouton variante="discret" taille="sm" aria-label={libelleFermer}` avec l’icône `X` de 16 px, après l’action, aligné en haut (`align-self: flex-start`) ; il appelle `onFermer` |

`ref` et `tabIndex` passent par les attributs transmis (React 19 transmet `ref` comme une propriété).
Le rôle suit le ton, comme avant : `status` pour information, réussite et neutre ; `alert` pour
attention et erreur, ce que P10 §5.3 demande.

**Ce que le système ne fait pas, et que le Portail fait dans `RegionRetour`** : la position collée
sous l’en-tête (elle dépend de la hauteur de la barre d’onglets du produit), le remplacement d’un
retour par le suivant, le code d’adresse `?annonce=`, le passage du focus, l’animation d’entrée sur
`--mouvement-entree` (P10 §10). Ce sont des règles de la console, pas du bandeau.

#### 5.4.3 Compatibilité, densités, accessibilité

Sans `onFermer`, le rendu visuel est celui de la 1.2.0 ; le DOM gagne la classe `ai5d-bandeau` et la
feuille d’une règle. Aucune densité (le bouton suit `--hauteur-controle`, au moins 44 px). Le nom du
bouton est toujours présent, en texte hors écran par `aria-label` ; l’icône est décorative. Un bandeau
qui reçoit le focus par programme montre l’anneau quand la dernière interaction était au clavier.

---

### 5.5 `EnteteRubrique` et son action

`noyau/composants/EnteteRubrique.tsx`, sans directive. **Extension**. Pièce 6 de P10.

```ts
export interface ProprietesEnteteRubrique {
  icone: LucideIcon;
  titre: string;
  intention: string;
  /**
   * L’action de la rubrique, à droite du titre, sur sa rangée : « Nouvelle formation ». Une seule.
   * Elle passe sous le titre quand la rangée ne la tient plus, sans jamais couper le filet.
   */
  action?: ReactNode | undefined;
}
```

Rendu : la rangée de l’icône et du titre (`EnteteRubrique.tsx:64`) reçoit, **seulement si `action`
est fourni**, `flex-wrap: wrap` et un dernier enfant `<div style={{ marginInlineStart: 'auto' }}>`.
Le filet reste sur le `<header>` (`:55-62`), sous l’intention : l’action est dans l’en-tête, donc au-dessus
du filet. Sans `action`, le HTML est celui de la 1.2.0 au caractère près (instantané
`tests/instantanes/EnteteRubrique-1.2.0.tsx`, comme pour `Bouton` et `CoquilleRail`).

Densités et paliers : aucun ; le retour à la ligne se fait de lui-même. Accessibilité : l’action suit
le `h1` dans l’ordre du document, donc dans l’ordre de tabulation. Le type devient nommé et exporté.

---

### 5.6 Le compteur d’un onglet

`noyau/composants/OngletsRubrique.tsx`, sans directive. **Extension**. Pièce 7 de P10.

#### 5.6.1 API

```ts
export interface OngletRubrique {
  id: string;
  libelle: string;
  href: string;
  icone?: LucideIcon | undefined;
  /** Un nombre, affiché après le libellé. Absent : rien. Le produit décide ce qu’il compte. */
  compteur?: number | undefined;
}

export interface ProprietesOngletsRubrique {
  // … propriétés existantes, inchangées …
  /** Ce que compte le compteur, lu après lui : « à traiter ». Le même pour tous les onglets. */
  libelleCompteur?: string | undefined;
}
```

**Le système n’interprète pas le zéro** : `compteur={0}` affiche « 0 ». P10 compte le travail en
attente et ne passe le compteur que s’il est supérieur à zéro ; un autre produit peut vouloir afficher
zéro.

#### 5.6.2 Rendu

```
<a class="ai5d-onglets-r__lien" aria-current…>
  [icône]
  <span>Participants</span>
  <span class="ai5d-onglets-r__compteur" aria-hidden="true">25</span>   ← Pastille neutre
  <span class="ai5d-hors-ecran">, 25 à traiter</span>
</a>
```

| Élément | Style |
| ------- | ----- |
| Compteur | `Pastille ton="neutre"` : `var(--texte-faible)` sur `var(--surface-chaude)` ; `font-variant-numeric: tabular-nums` ; le nombre formaté par `Intl.NumberFormat('fr-FR')` (« 1 234 » avec l’espace fine insécable) |
| Onglet actif | Le compteur garde le ton `neutre` : l’état actif passe par ses trois signaux, le compteur n’en est pas un |
| Nom accessible | « {libelle}, {nombre} {libelleCompteur} » : « Participants, 25 à traiter ». Sans `libelleCompteur` : « Participants, 25 » |

Le compteur ajoute sa largeur à celle de l’onglet ; au-delà de la place, le défilement et le fondu de
la 1.2.0 prennent le relais. Hauteur inchangée, 44 px. La pastille visible est masquée aux lecteurs
d’écran pour que le nombre ne s’entende pas deux fois.

---

### 5.7 `Chiffre` compact, et son squelette

`noyau/composants/Chiffre.tsx`, `Squelette.tsx`, sans directive. **Extension**. Pièce 11 de P10.

#### 5.7.1 API

```ts
import type { ComposantLien } from './LiensRail';

/** La tuile de la 1.2.0, inchangée. */
interface ProprietesChiffreCarte {
  valeur: string;
  libelle: string;
  cible?: string;
  mise?: boolean;
  compact?: false | undefined;
  href?: undefined;
  Lien?: undefined;
}

/** Une ligne : la valeur et le libellé se lisent comme une phrase, sans carte. */
interface ProprietesChiffreCompact {
  valeur: string;
  libelle: string;
  compact: true;
  /** Présent : l’indicateur entier est un lien vers la liste qu’il compte. */
  href?: string | undefined;
  Lien?: ComposantLien | undefined;
  cible?: undefined;
  mise?: undefined;
}

export type ProprietesChiffre = ProprietesChiffreCarte | ProprietesChiffreCompact;
```

`cible?: string` et `mise?: boolean` gardent leur forme exacte (sans `| undefined`) : un appel du
Portail sous `exactOptionalPropertyTypes` compile tel quel.

#### 5.7.2 Rendu compact

```
<a class="ai5d-chiffre" data-compact href>            ← ou <span> sans href ; Lien du produit sinon <a>
  <span class="ai5d-chiffre__valeur">212</span>
  <span class="ai5d-chiffre__libelle">inscriptions sur 237 personnes</span>
</a>
```

| Élément | Style |
| ------- | ----- |
| Racine | `display: inline-flex; align-items: baseline; flex-wrap: wrap; gap: var(--espace-2)` ; `text-decoration: none` |
| Valeur | `var(--police-titre)` (Fraunces), `var(--graisse-normale)`, `var(--taille-lg)` (18 px), `var(--texte-fort)`, `font-variant-numeric: tabular-nums` |
| Libellé | `var(--police-corps)` (Inter), `var(--taille-sm)`, `var(--texte)` ; en lien, `var(--action)` |

| État (en lien) | Rendu |
| -------------- | ----- |
| Repos | Libellé en `var(--action)` (#2251FF, #6B88FF), sans soulignement |
| Survol, pointeur fin | Libellé souligné (`text-decoration: underline; text-underline-offset: 0.2em`) |
| Focus | Anneau 2 px `var(--action)`, décalé de 2 px, rayon `var(--rayon-sm)` |
| Appui | Fond `var(--surface-selection)`, sans transition |
| Sans lien | Ni soulignement, ni survol, ni curseur de lien : il ne promet pas un déplacement (P10 §5.4) |

La valeur en Fraunces est permise ici, parce que c’est le système qui l’écrit : IP63 de P09 interdit
la police de titre au Portail, pas au système. Une rangée d’indicateurs se compose dans le produit
(un conteneur `flex-wrap` et ses écarts) ; P10 §5.13, rangée 2, y ajoute un second lien sur la même
ligne, qui reste une composition du produit.

#### 5.7.3 `SqueletteIndicateurs compact`

```ts
export function SqueletteIndicateurs(props: {
  nombre?: number;
  colonnes?: string;
  colonnesLarges?: string;
  /** La forme d’une rangée de `Chiffre` compacts : des blocs d’une ligne, sans tuile. */
  compact?: boolean;
}): ReactElement;
```

Compact : une rangée `flex-wrap`, écart `var(--espace-6)`, `nombre` blocs de
`calc(var(--taille-lg) * var(--interligne-titre))` de haut et de `10rem` de large, rayon `sm`. Sans
`compact`, le rendu de la 1.2.0.

Densités et paliers : aucun ; la rangée revient à la ligne. Accessibilité : un indicateur en lien
s’annonce « lien, 212 inscriptions sur 237 personnes » ; le squelette reste `aria-hidden`, comme les
autres.

---

### 5.8 `EnteteObjet`

`noyau/composants/EnteteObjet.tsx`, sans directive. **Composant nouveau**, deuxième consommateur
constaté dans Compte (`EnteteConsole.tsx:25-34`, §0.6, n° 5). Pièce 5 de P10.

#### 5.8.1 API

```ts
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ComposantLien } from './LiensRail';

export interface ElementFil {
  libelle: string;
  href: string;
}

export interface MetadonneeObjet {
  icone: LucideIcon;
  texte: ReactNode;
}

export interface ProprietesEnteteObjet {
  /** Le chemin de retour, du plus large au plus proche. Il ne répète jamais le titre. */
  fil?: readonly ElementFil[] | undefined;
  /** Le nom de l’objet, en `h1`. */
  titre: string;
  /** Son état : une `PastilleEtat`, à côté du titre. */
  etat?: ReactNode | undefined;
  metadonnees?: readonly MetadonneeObjet[] | undefined;
  /** Le pouls : une rangée de `Chiffre` compacts. */
  indicateurs?: ReactNode | undefined;
  /** L’action qui fait avancer l’état. Une seule. */
  action?: ReactNode | undefined;
  /** Un `MenuActions`. */
  menu?: ReactNode | undefined;
  /** Le lien du routeur du produit, pour le fil ; `a` par défaut. */
  Lien?: ComposantLien | undefined;
  /** Le nom du fil pour les lecteurs d’écran. « Fil d’Ariane » par défaut. */
  etiquetteFil?: string | undefined;
}
```

#### 5.8.2 Rendu

```
<header class="ai5d-entete-objet">
  <nav aria-label="Fil d’Ariane"><ol>                     ← si fil
    <li><Lien href>Sessions</Lien><ChevronRight aria-hidden/></li> …
  </ol></nav>
  <div class="ai5d-entete-objet__tete">
    <TitreSection niveau={1} taille="ecran">{titre}</TitreSection>  {etat}
    <div class="ai5d-entete-objet__gestes">{action}{menu}</div>    ← margin-inline-start: auto
  </div>
  <ul class="ai5d-entete-objet__meta">                     ← si metadonnees
    <li><Icone nom={icone} taille={16}/>{texte}</li> …
  </ul>
  <div class="ai5d-entete-objet__indicateurs">{indicateurs}</div>
</header>
```

| Élément | Style |
| ------- | ----- |
| En-tête | Colonne, écart `var(--espace-3)` ; `padding-bottom: var(--espace-6)` ; filet `1px solid var(--bordure)` en bas, comme `EnteteRubrique` |
| Fil | `<ol>` sans puces, en ligne, `flex-wrap` ; liens Inter `var(--taille-sm)` `var(--action)` ; séparateur `ChevronRight` 16 px `var(--texte-faible)`, décoratif ; aucun `aria-current` : le fil s’arrête au parent |
| Tête | `flex`, `flex-wrap: wrap`, `align-items: center`, écart `var(--espace-3)` ; le titre par `TitreSection` (Fraunces, `--taille-2xl`) ; les gestes à la fin de la rangée, sous le titre quand elle ne les tient plus |
| Métadonnées | `<ul role="list">` en ligne, `flex-wrap`, écart `var(--espace-4)` ; chaque élément icône 16 px et texte, Inter `var(--taille-sm)` `var(--texte-faible)` |
| Indicateurs | Tels que le produit les passe |

États : ceux des liens du fil (survol souligné gardé par `(hover: hover)`, focus 2 px, appui) ; le
reste appartient aux composants passés. P10 écrit l’action « à côté de l’état » : elle est sur la même
rangée que l’état, à sa fin ; sur une colonne étroite, elle passe dessous.

Densités, paliers : aucun ; tout revient à la ligne. Accessibilité : un seul `h1` ; le fil est une
`nav` nommée ; les icônes des métadonnées sont décoratives, le texte suffit.

---

### 5.9 `Selecteur`

`noyau/composants/Selecteur.tsx`, `'use client'`. **Composant nouveau**, deuxième consommateur
constaté dans Compte (`apps/compte/components/Selecteur.tsx:19-35`, §0.6, n° 13). Pièce 13 de P10,
pour ce seul champ.

**API du Portail, élargie de ce que Compte emploie** (`components/champs/Selecteur.tsx` du Portail,
SPEC P02 §5.2 ; `libelleMasque` et `invite` viennent de Compte, où le rôle d’une ligne de membre se
lit sans libellé visible et où une invite précède le premier choix) :

```ts
export interface OptionSelecteur {
  valeur: string;
  libelle: string;
  /** Les options d’un même groupe se suivent dans un `<optgroup>`, dans l’ordre de leur premier. */
  groupe?: string | undefined;
}

export interface ProprietesSelecteur {
  libelle: string;
  valeur: string;
  onChange: (valeur: string) => void;
  options: readonly OptionSelecteur[];
  nom: string;
  aide?: ReactNode | undefined;
  erreur?: string | undefined;
  obligatoire?: boolean | undefined;
  id?: string | undefined;
  desactive?: boolean | undefined;
  /** Masqué à l’œil, jamais absent de l’arbre d’accessibilité (Compte, ligne de membre). */
  libelleMasque?: boolean | undefined;
  /** Première option vide, non choisissable une fois une valeur posée (Compte). */
  invite?: string | undefined;
}
```

Rendu : un `<select>` natif, jamais un menu dessiné ; libellé lié ; `aria-invalid`, `aria-required`,
`aria-describedby` vers l’erreur puis l’aide, dans l’ordre de `Champ` ; erreur en `role="alert"` sous
le contrôle. Il porte la classe `ai5d-champ__entree` et la feuille `ai5d-champ` de `Champ` (même clé :
une seule feuille), pour qu’un `<select>` posé à côté d’un `<input>` réagisse pareil. Hauteur
`var(--hauteur-controle)`, `min-height: var(--cible-tactile)`. `CaseACocher`, `ChoixSegmente` et
`ZoneTexte` restent dans le Portail.

---

### 5.10 La réserve basse, sous condition

`CoquilleRail.tsx`, `GabaritApp.tsx`. **Correctif**, appliqué seulement si la mesure de l’étape 0 le
confirme (§0.7). Décision 013 dans ce cas.

La mesure : dans Chromium, sur le spécimen, `CoquilleRail` en mode `complet` avec une barre basse, à
390 px puis à 1 280 px, `getComputedStyle` de `.ai5d-coquille-rail` pour `--reserve-barre` et de
`.ai5d-coquille-rail__contenu` pour `padding-bottom`. Attendu si le constat est juste : à 1 280 px,
`--reserve-barre` vaut encore la hauteur de la barre.

Le correctif, s’il le faut : la réserve quitte le style en ligne et passe dans la feuille, où la règle
de palier peut enfin la remettre à zéro.

```css
.ai5d-coquille-rail[data-mode='complet'] {
  --reserve-barre: calc(var(--hauteur-barre-onglets) + var(--zone-sure-basse, 0px));
}
@media (min-width: 768px) {
  .ai5d-coquille-rail { --reserve-barre: 0px; }
}
```

(`768px` est écrit par la constante `TABLETTE`, comme aujourd’hui.) Même forme pour `GabaritApp`, sur
un attribut `data-barre` posé quand des onglets sont passés. Ce qui change à l’écran : au bureau, en
mode `complet`, la page s’arrête où le contenu s’arrête. Sous 768 px, rien ne change. Un test lit la
feuille : aucune `--reserve-barre` en style en ligne, la règle de palier présente. La mesure « après »
est consignée.

---

## 6. Jetons ajoutés, et la preuve qu’aucune valeur ne change

| Fichier | Nom | Valeur | Nature |
| ------- | --- | ------ | ------ |
| `noyau/jetons.css` | `--surface-survol` | `var(--surface-chaude)` en clair, `var(--surface-1)` en sombre | Jeton de rôle (§5.2) |

- **`tests/instantanes/jetons-1.2.0.json`** : l’instantané de `1.2.0`, engendré une fois au début du
  lot à partir des fichiers de l’étiquette, puis versionné, sur le modèle de celui de la `1.1.0`.
- **`tests/non-regression.test.ts`** reçoit un second instantané : chaque propriété de la `1.2.0` a la
  même valeur effective en `1.3.0`, bloc par bloc ; une propriété absente fait échouer le test. Le
  test ne lit jamais Git.
- **`tests/jetons.test.ts`** : les couples du §5.2.2 qui ne sont pas déjà mesurés, et le témoin
  `--attention` sur `--surface-survol` en clair, qui doit rester sous 4,5 ; les couples du menu sur
  `--surface-3` (§5.3.5) s’ils ne le sont pas déjà. `NOYAU.md` ne recopie aucun total (leçon « Un
  nombre écrit à la main dans une documentation vieillit »).

---

## 7. Animations

Toute durée passe par un jeton ; toute feuille qui déclare `@keyframes` contient
`prefers-reduced-motion`.

| Élément | Propriété | Durée et courbe | Sous `prefers-reduced-motion` |
| ------- | --------- | --------------- | ----------------------------- |
| Menu, ouverture | Opacité 0 à 1, `translateY(calc(var(--espace-1) * -1))` à 0 | `var(--duree-courte) var(--courbe-sortie)`, celle des dialogues (`dialogue.ts:53`) | Opacité seule, 100 ms |
| Menu, fermeture | Aucune : il disparaît | | Identique |
| Élément de menu, survol | `background` | `var(--mouvement-retour)` | 100 ms |
| Élément de menu, appui | `background` | 0 ms à l’appui | Identique |
| Lien du rail, survol (si migré) | `background`, `color` | Inchangés (`--duree-courte`, `--courbe-sortie`) | Aucune (inchangé) |
| `Chiffre` en lien, survol | Soulignement | Aucune transition | Identique |
| Compteur, `EnteteRubrique`, `EnteteObjet`, `Bandeau` | Aucun mouvement | | |
| Feuilles hissées, réserve basse | Aucun mouvement | | |

**Refusés** : l’animation d’une largeur, d’une hauteur ou d’une position (`top`, `left`), la mise à
l’échelle d’un menu, le rebond. L’entrée d’un bandeau de retour appartient au Portail (P10 §10).

---

## 8. Accessibilité

| Exigence | Où |
| -------- | -- |
| Menu au clavier, motif APG « bouton de menu » | §5.3.4 ; prouvé au navigateur, pas dans jsdom |
| Focus rendu au déclencheur à la fermeture, et avant `onChoisir` | §5.3.4 |
| Gestes graves séparés et nommés, jamais par la seule couleur | Filet `role="separator"`, libellé qui nomme le geste (§5.3.3) |
| Nom visible égal au nom accessible | `MenuActions` avec `declencheur` : pas d’`aria-label` ; sans, `libelle` |
| Compteur entendu une fois | Pastille `aria-hidden`, texte hors écran (§5.6.2) |
| Retour qui reçoit le focus | `Bandeau` `ref` et `tabIndex={-1}`, anneau `:focus-visible` (§5.4) |
| Rôle selon le ton | `Bandeau` inchangé : `status` ou `alert` |
| Un seul `h1` | `EnteteObjet`, `EnteteRubrique` |
| Fil d’Ariane | `nav` nommée, `ol` ; aucun `aria-current` (§5.8.2) |
| Cible de 44 px au doigt | Déclencheur (`Bouton` `sm`, `min-height` et `min-width` à `--cible-tactile`), éléments de menu (`--hauteur-controle` relevée au plancher), bouton de fermeture |
| Couleur jamais seule | Survol et sélection se distinguent aussi par la case cochée du produit ; lien d’un `Chiffre` par sa couleur **et** son soulignement au survol |
| Mouvement | §7 |
| Zoom | À 200 %, le menu reste dans la fenêtre (repli d’ancre ou retournement au-dessus) ; l’en-tête revient à la ligne |

---

## 9. Sécurité

Le système ne connaît ni la session, ni les droits, ni le réseau.

| Sujet | Mesure |
| ----- | ------ |
| Feuilles | Constantes du système, jamais un contenu reçu ; le hissage ne change pas leur nature |
| Politique de sécurité du contenu | Aucun script en ligne ajouté ; les feuilles restent des feuilles en ligne (§5.1.4) |
| Liens sortants du menu | `noopener noreferrer` ajouté par `relSur` à tout nouvel onglet |
| Couche supérieure | Le menu est un élément du document, pas une fenêtre : aucune donnée ne quitte la page |
| Données | Aucune donnée personnelle dans le dépôt public : exemples fictifs du PRD du Portail |

---

## 10. Tests et gardes

Les tests s’écrivent avec le code de chaque tâche ; ils ne sont lancés qu’à la vérification finale.

| Fichier | Ce qu’il tient |
| ------- | -------------- |
| `tests/aides/feuille.ts` (nouveau) | `texteFeuille(id)` : la feuille hissée lue dans `document.head` par `style[data-href~="…"]` |
| `tests/feuilles.test.tsx` (nouveau) | Cinq cents `Bouton` rendus au client : **une** balise `data-href="ai5d-bouton"` dans le document, aucune dans le conteneur ; `renderToString` de cinq cents `Bouton` et d’un `Champ` : **une** balise `<style`, `data-href` qui liste les deux clés ; chaque composant de la liste du §0.4 rendu deux fois ne pose qu’une feuille par clé ; aucun `id` de feuille ; un sélecteur `>` reste intact au serveur ; `PRECEDENCE_FEUILLES` vaut `ai5d` |
| `gardes/gardes.test.ts` | `verifierFeuilleUnique` : accepte `noyau/composants/` ; relève une balise `<style id dangerouslySetInnerHTML>` construite, avec son message et sa ligne ; relève une balise ouvrante écrite sur trois lignes ; accepte `createElement('style', { href, precedence }, …)` |
| Les tests de composant du §5.1.7 | Lisent la feuille par `texteFeuille` ; leurs attentes sur le texte des feuilles sont inchangées |
| `tests/jetons.test.ts` | §6 ; `--surface-survol` déclaré dans les quatre blocs de thème, ne pointant que vers des surfaces existantes |
| `tests/non-regression.test.ts` et `tests/instantanes/jetons-1.2.0.json` | §6 |
| `tests/composants/menu-actions.test.tsx` (nouveau) | Structure (rôles, `aria-*`, `popover`, `popovertarget`) ; graves après un filet, dans l’ordre reçu ; aucun filet sans grave ; rien rendu sans action ; lien par `Lien`, nouvel onglet natif avec `rel` et mention ; `declencheur` sans `aria-label` ; clavier (flèches, Début, Fin, Entrée, Échap, Tab) sur `showPopover` et `hidePopover` doublés, et `toggle` émis à la main ; focus itinérant ; `onChoisir` appelé après le retour du focus ; feuille : survol gardé, appui sans transition, anneau intérieur, `prefers-reduced-motion`, `@supports (anchor-name…)`. Le fichier dit, en tête, ce que jsdom ne prouve pas |
| `tests/composants/composants.test.tsx` | `Bandeau` : bouton de fermeture seulement avec `onFermer`, nom par défaut « Fermer ce message », `onFermer` appelé ; `ref` et `tabIndex` transmis ; classe `ai5d-bandeau` jointe à celle du produit ; rôle selon le ton inchangé. `Chiffre` : compact avec et sans `href`, `Lien` employé, chiffres tabulaires, carte inchangée ; `SqueletteIndicateurs compact` |
| `tests/composants/entete-rubrique.test.tsx` (nouveau) et `tests/instantanes/EnteteRubrique-1.2.0.tsx` | Sans `action`, le HTML de la 1.2.0 ; avec, l’action dans l’en-tête, avant le filet, rangée en `flex-wrap` |
| `tests/composants/onglets-rubrique.test.tsx` | Compteur : pastille `neutre` `aria-hidden`, texte hors écran « , 25 à traiter », nombre formaté, zéro affiché, rien sans compteur ; onglet actif avec compteur |
| `tests/composants/entete-objet.test.tsx` (nouveau, si la pièce monte) | Un `h1` ; fil en `nav` et `ol`, sans `aria-current`, `Lien` employé ; métadonnées en liste, icônes décoratives ; gestes après l’état |
| `tests/composants/selecteur.test.tsx` (nouveau, si la pièce monte) | Les cas du test du Portail (`tests/unites/` du Portail), repris : `optgroup`, `aria-describedby` erreur puis aide, feuille `ai5d-champ` partagée |
| `tests/composants/coquille-rail.test.tsx` et `mobile.test.tsx` (si le §5.10 s’applique) | Aucune `--reserve-barre` en style en ligne ; règle de palier dans la feuille ; HTML de la 1.1.0 sans pied, attribut `style` excepté |
| `tests/index.test.ts` | Quarante-deux composants ; `MenuActions` et `Selecteur` déclarent `'use client'`, `EnteteObjet` non ; `PRECEDENCE_FEUILLES` exporté |
| `tests/documentation.test.ts` | Inchangé dans son code : il confrontera `1.3.0`, le nombre de composants et **sept** gardes au README et à `NOYAU.md` |

**Chaque garde et chaque test nouveau est vu échouer une fois** sur un cas construit, avant d’être
considéré comme posé (leçon du dépôt).

La vérification, d’un seul bloc, à la fin :

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test
```

Le dépôt n’a pas de `build`.

---

## 11. Spécimens et preuves

### 11.1 Spécimens

`_build/generer-specimens.mjs` reçoit une section par pièce, dans les quatre densités et les trois
états de thème : un menu ouvert (posé ouvert pour la capture) avec deux gestes, un filet et un geste
grave, dont un élément survolé et un focalisé ; une rangée de trois `Chiffre` compacts, dont deux en
lien ; six onglets avec compteurs, à 390 px et à 1 280 px ; un `Bandeau` de chaque ton avec
fermeture ; un `EnteteRubrique` avec action ; un `EnteteObjet` complet ; un
`Selecteur` à côté d’un `Champ` ; une table factice sur `--surface-2` montrant une ligne
survolée et une ligne sélectionnée côte à côte. La page elle-même ne déborde pas à 320 px (leçon « Une
page de preuve doit tenir au plancher qu’elle prouve »). L’apostrophe droite du constat n° 9 de la
relecture de la 1.2.0 est corrigée.

### 11.2 Preuves, dans `docs/preuves/1.3.0/`

| Fichier | Contenu |
| ------- | ------- |
| `feuilles.md` | Le compte de balises, **avant** (sur `1.2.0`) puis **après** : rendu serveur de 500 boutons et d’un champ, rendu client, et, dans Chromium sur le spécimen, `document.querySelectorAll('style').length` et la liste des `data-href` |
| `reserve-basse.md` | La mesure du §5.10, avant, et après si le correctif s’applique |
| `menu-navigateurs.md` | Dans Chromium, Firefox et WebKit : ouverture au clavier, flèches, Échap et focus rendu, clic extérieur, position par ancre ou par repli, retournement au-dessus en bas de fenêtre ; ce que chaque moteur fait, constaté |
| `survol-{clair,sombre}.png` | Une ligne survolée et une ligne sélectionnée côte à côte, un menu survolé, le rail survolé (avant et après si migré) |
| `specimens-{clair,sombre}-1280.png`, `specimens-clair-1024.png`, `specimens-doigt-clair-390.png` | Les spécimens ; au doigt, `matchMedia('(pointer: coarse)')` vérifié avant la capture |
| `verification.md` | La sortie recopiée de la vérification d’un bloc |
| `montee-portail.md`, `montee-compte.md`, `montee-sdk.md` | Avant l’étiquette : dans une copie de travail de chaque consommateur, le système remplacé par une installation locale de ce dépôt, puis `typecheck`, `lint` et `test` du consommateur lancés **sans changer une ligne**, sortie recopiée ; la copie rendue à son état, aucun commit. Pour le Portail, en plus, une page de la console rendue sur le poste et le compte de ses balises `<style>`. Sans recette, la ligne va dans « Ce qui n’est pas couvert » |
| `README.md` | Ce qui est prouvé, et **« Ce qui n’est pas couvert »** : au moins Safari sans appareil, un téléphone réel, l’ordre de cascade face à une règle de classe hors couche d’un produit si aucune n’a été trouvée, la position d’ancre dans les moteurs qui ne la prennent pas en charge |

---

## 12. L’entrée du journal des changements

À écrire en tête de `CHANGELOG.md`, date du jour de la publication. Brouillon, dans la voix du
journal ; les lignes entre crochets dépendent des points ouverts du §0.9.

```markdown
## 1.3.0 · {date de publication}

Ce que la console du Portail demandait et qu’un deuxième produit partage, et le correctif d’un défaut
que tous les produits portaient : chaque instance d’un composant posait sa propre feuille. Aucune
valeur de jeton ne change.

### Ce qui change à l’écran, sans une ligne de code dans le produit

1. **Une feuille par composant, quel que soit le nombre d’instances.** Les feuilles du système se
   hissent dans `<head>` : une table de 500 lignes à deux boutons posait 1 000 balises identiques, elle
   en pose une. Au serveur, toutes les feuilles du système tiennent dans une balise
   `<style data-precedence="ai5d">`. Décision 010.
2. [**Le survol du rail** prend `--surface-survol` ; en sombre, il ne se confond plus avec la rubrique
   active.]
3. [**Au bureau, en mode `complet`**, la page s’arrête où le contenu s’arrête : la réserve de la barre
   basse retombe à zéro au-delà de 768 px.]

### Ajouts

- `MenuActions` : un menu d’actions au clavier, dans la couche supérieure, gestes graves à part.
- `Bandeau` : `onFermer`, `libelleFermer`, `ref`.
- `EnteteRubrique` : `action`.
- `OngletsRubrique` : `compteur` par onglet, `libelleCompteur`.
- `Chiffre` : forme `compact`, en lien avec `href` et `Lien` ; `SqueletteIndicateurs` : `compact`.
- [`EnteteObjet`.] [`Selecteur`.]
- `--surface-survol`.
- La garde `verifierFeuilleUnique`.

### Compatibilité

Aucune propriété retirée, aucune variante renommée. `ProprietesChiffre` devient une union : les appels
existants compilent tels quels. Les feuilles ne sont plus dans le conteneur du composant mais dans
`<head>`, sans `id` : un test de produit qui lisait une feuille du système dans son conteneur la lit
désormais dans `document.head`, par `style[data-href~="ai5d-…"]`.
```

---

## 13. Guide de montée pour un produit

### 13.1 Le geste, pour tout produit

1. Remplacer l’étiquette : `"@ai5d/design-system": "github:Kaaramo/ai5d-digital-design-system#v1.3.0"`,
   puis `pnpm install`.
2. Relancer sa vérification d’un bloc. Un test qui lit une feuille du système dans le conteneur de
   rendu la lit dans `document.head`.
3. Si le produit a des règles de classe hors couche qui visent les classes `ai5d-…` : les relire, leur
   ordre face aux feuilles du système a pu changer (§5.1.3).
4. Regarder à l’écran les différences du §12.

Aucune adoption n’est obligatoire.

### 13.2 AI5D Portail, de `v1.2.0` à `v1.3.0` (P10)

| Pièce de P10 §7.2 | Ce que la 1.3.0 livre | Ce que P10 écrit dans `components/` |
| ----------------- | --------------------- | ----------------------------------- |
| 1 `TableauDonnees` | `--surface-survol`, `feuille` comme modèle de mécanisme | `TableauDonnees`, API de P10 §7.2, feuille sous la précédence `portail` |
| 2 `BarreActionsGroupees` | | Le composant, API de P10 |
| 3 `PucesFiltre`, `RechercheTable` | | Les deux, API de P10 |
| 4 `MenuActions` | **Le composant** (§5.3) ; API précisée | Rien |
| 5 `EnteteObjet` | Le composant | Aucun |
| 6 `EnteteRubrique`, `action` | **L’emplacement** | Rien |
| 7 Compteur d’onglet | **Le compteur** ; `libelleCompteur="à traiter"` | Rien |
| 8 `--surface-survol` | **Le jeton** | Rien ; le compte `attention` d’une puce porte son fond (§0.5) |
| 9 Injection unique | **Le correctif** | `components/champs/commun.tsx:90-92` sur le même mécanisme, précédence `portail` ; IP19 peut appeler `verifierFeuilleUnique` |
| 10 `Annonce` | **`Bandeau` qui se ferme** | `RegionRetour` composé sur `Bandeau` : collée, remplacement, code d’adresse, focus |
| 11 `Chiffre` compact | **La forme compacte** et son squelette | La rangée et le second lien de la rangée 2 du pouls |
| 12 `BarreEnregistrement` | | Le composant, API de P10 |
| 13 Champs | `Selecteur` | `CaseACocher`, `ChoixSegmente`, `ZoneTexte` |

### 13.3 AI5D Compte, de `v1.2.0` à `v1.3.0`

Non revérifié dans ce lot : les adoptions proposées citeront fichier et ligne après la revérification
du plan. À titre d’hypothèse, tirée de P10 §0.6 : `EnteteConsole` vers `EnteteObjet` ou
`EnteteRubrique` avec `action` ; `Annonce.tsx` vers `Bandeau` avec `onFermer` ; `Selecteur.tsx` vers
`Selecteur` ; `ActionsCompte.tsx` vers `MenuActions` si plusieurs gestes s’y rassemblent.

### 13.4 Le SDK `@ai5d/auth`

Rien n’est requis : il déclare le système en dépendance de pair `*`, et sa montée d’essai (§11.2) le
vérifie. `UserButton.tsx:100-139` pourra passer à `MenuActions` avec `declencheur` dans une version du
SDK : clavier, fermeture au clic extérieur et largeur en `rem` lui viendraient avec.

---

## 14. La publication

**La publication de l’étiquette `v1.3.0` demande l’accord explicite de Karamo.** Elle touche tous les
produits.

Dans cet ordre, et jamais autrement :

1. Vérification d’un bloc verte, sortie recopiée dans `docs/preuves/1.3.0/verification.md`.
2. Comptes de balises, menu au navigateur, captures et montées d’essai consignés ; « Ce qui n’est pas
   couvert » écrit.
3. `CHANGELOG.md`, `README.md` (version, badge, nombre de composants, sept gardes, commandes en
   `#v1.3.0`), `NOYAU.md` à jour : `tests/documentation.test.ts` le confronte.
4. Les points du §0.9 tranchés par Karamo.
5. **Accord explicite de Karamo**, demandé en nommant ce qui sera publié.
6. Étiquette `v1.3.0` sur le commit vérifié, poussée de `main` et de l’étiquette. Jamais de poussée
   forcée ; une étiquette publiée ne se déplace jamais : un défaut trouvé après se corrige en `1.3.1`.

Aucun message de commit, aucune description, aucun fichier ne porte de co-auteur ni de mention
d’outillage.

---

## 15. Critères d’acceptation

**Ouverture**

- [ ] `EnteteConsole.tsx` et `Selecteur.tsx` de Compte revérifiés, fichier et ligne ; verdicts des pièces 5 et 13 consignés au plan
- [ ] Comptes de balises « avant » et mesure de la réserve basse « avant » consignés

**Feuilles**

- [ ] Aucun composant du système ne rend de `<style>` sans `href` ni `precedence` ; `verifierFeuilleUnique` le prouve sur `noyau/composants/` et relève le cas construit
- [ ] Cinq cents `Bouton` posent une seule feuille `ai5d-bouton`, au client comme au serveur ; mesuré aussi dans Chromium
- [ ] Les constantes `STYLE_…` gardent leur nom et leur forme ; les spécimens se régénèrent
- [ ] Décision 010 écrite

**Survol**

- [ ] `--surface-survol` déclaré dans les quatre blocs, vers des surfaces existantes ; paires mesurées ; témoin `--attention` sous 4,5 ; décision 011 écrite
- [ ] Captures d’une ligne survolée et d’une ligne sélectionnée côte à côte, en clair et en sombre ; validées par Karamo
- [ ] `LiensRail` migré et capturé avant et après, ou laissé tel quel, selon le point 3 du §0.9

**Composants et extensions**

- [ ] `MenuActions` : clavier, focus rendu, graves après un filet, sortie de conteneur, constatés dans trois moteurs ; tests jsdom verts
- [ ] `Bandeau` se ferme, reçoit le focus, garde son rôle selon le ton
- [ ] `EnteteRubrique` sans `action` rend le HTML de la 1.2.0 ; avec, l’action au-dessus du filet
- [ ] Onglet avec compteur : nom accessible « Participants, 25 à traiter », nombre tabulaire
- [ ] `Chiffre` compact, en lien et sans lien ; `SqueletteIndicateurs compact` de la même forme
- [ ] `EnteteObjet` et `Selecteur` livrés, ou sortis du lot avec leur motif
- [ ] Réserve basse corrigée et mesurée, ou constat infirmé et consigné

**Qualité et publication**

- [ ] `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test` vert d’un seul bloc, sortie recopiée
- [ ] Aucune dépendance ajoutée ; aucun composant existant ne prend `'use client'`
- [ ] Montées d’essai du Portail, de Compte et du SDK sans changement de code, constatées ou écrites comme non couvertes
- [ ] Nombre de composants et sept gardes dans l’index, le README et `NOYAU.md` ; version `1.3.0`
- [ ] Décisions 010 à 012 (et 013 s’il y a lieu) écrites ; `tasks/todo.md` coché ; leçons consignées
- [ ] Le rapport de preuves porte « Ce qui n’est pas couvert »
- [ ] Chaque message de commit passe la recherche des mentions interdites avec un résultat nul
- [ ] L’étiquette `v1.3.0` n’est posée qu’après l’accord explicite de Karamo

---

## 16. Hors périmètre

| Élément | Motif | Prévu en |
| ------- | ----- | -------- |
| `TableauDonnees`, `BarreActionsGroupees`, `PucesFiltre`, `RechercheTable`, `BarreEnregistrement` | Aucun deuxième consommateur constaté (§0.6) | Dans le Portail, API de P10 §7.2 ; montent au deuxième consommateur |
| `CaseACocher`, `ChoixSegmente`, `ZoneTexte` | Idem | Dans le Portail ; `Selecteur` seul au §5.9 |
| Une région `Annonce` complète (collée, remplacement, codes) | Règles de la console | `RegionRetour` du Portail, sur `Bandeau` |
| `ZoneDepot`, `ChampSuggestions`, `GardeDeSortie`, `EtatErreurZone`, `BarreProgression` | Hors contrat 1.3 (P10 §6) | Dans le Portail |
| `--largeur-lecture` | Retiré en 1.2.0, constante du Portail | `lib/mesures.ts` du Portail |
| Recherche par frappe dans un menu, sous-menus, éléments désactivés | Aucun besoin constaté ; une action indisponible est absente, pas grisée | À la demande d’un produit |
| Fenêtrage d’une table | Aucune table dans le système | Portail, au-delà de 500 lignes (P10 §17) |
| Le survol de `LigneLien` en sombre, égal à son appui | Aucune valeur ne se détache des trois surfaces (§5.2.4) | À trancher avec une nouvelle surface, dans un lot à venir |
| Constats n° 2, 3, 5, 7 et 8 de la relecture de la 1.2.0 | Aucun ne touche la console ; le n° 2 est traité pour la seule garde nouvelle (§5.1.5) | Différés |
| Migration des titres existants vers `TitreSection`, des composants vers les jetons de mouvement | Changement de rendu non demandé | À la demande d’un produit |
| Montée de l’adoption dans le SDK et Compte | Leurs dépôts | Leurs lots |

---

## 17. Écarts avec le contrat de P10, et ce que P10 doit relire

La SPEC P10 §7 dit que le système « décide » l’API, et que P10 s’y conforme. Voici chaque écart.

| # | Contrat de P10 | Ce lot | Motif | Conséquence pour P10 |
| - | -------------- | ------ | ----- | -------------------- |
| 1 | Étiquette prévue `v1.3.0` | `v1.3.0` | Aucun écart | P10 épingle `#v1.3.0` |
| 2 | §7.1 n° 7, `--largeur-lecture` « bloquante » | Non livré, et non bloquant | Retiré en 1.2.0 ; constante `LARGEUR_LECTURE` du Portail | §5.1 règle 1, §5.2, §5.6, §5.8, §5.12, §5.14, §5.19, §11 : lire `LARGEUR_LECTURE` (`lib/mesures.ts`) au lieu du jeton |
| 3 | Pièces 1, 2, 3, 12, trois champs de 13 | Restent au Portail | §0.6 | Écrites dans `components/` avec l’API de P10 (repli prévu par P10) |
| 4 | Pièce 4, `href` et `onChoisir` facultatifs tous deux | Union `ActionMenuLien` ou `ActionMenuGeste` ; `declencheur` et `Lien` ajoutés | §5.3.1 | Chaque action choisit un lien ou un geste ; « Modifier les informations » passe `Lien` |
| 5 | Pièce 4, menu en `popover` ou `<dialog>` non modal | `popover="auto"`, ancre CSS, repli par mesure | §5.3.2 | Aucun code |
| 6 | Pièce 10, `Annonce` composant | Extension de `Bandeau` | §0.6 | `RegionRetour` s’écrit sur `Bandeau` : `onFermer`, `ref`, `tabIndex={-1}` |
| 7 | Pièce 7, `libelleCompteur` | Propriété du composant, non de l’onglet ; zéro affiché | §5.6 | `libelleCompteur="à traiter"` ; ne passer le compteur qu’au-dessus de zéro |
| 8 | Pièce 8, « distinct de `--surface-selection` en sombre » | `--surface-1` en sombre ; portée limitée aux surfaces 2 et 3 | §0.5 | Le compte `attention` de la puce « Envoi échoué » (§5.16) porte son fond, ou la puce ne change pas de fond au survol |
| 9 | Pièce 9, « une seule balise par composant » | Au client, une par composant ; au serveur, **une pour tout le système** | §5.1.2 | §15.5 compte les clés de `data-href`, pas les balises |
| 10 | Pièce 11, `compact`, `href`, `Lien` | Union ; `cible` et `mise` réservés à la tuile | §5.7.1 | Aucun code |
| 11 | §10, ouverture du menu en `--mouvement-sortie` | `--duree-courte` et `--courbe-sortie` par leurs noms, comme les dialogues | §0.7 | Aucun code |
| 12 | §5.21, `ValeurCopiable` avec un bouton `discret` `sm` | Le composant rend un `Bouton` `neutre` `md` ; non demandé au contrat | §0.7 | P10 relit §5.21, ou demande l’extension à un lot suivant |
| 13 | §5.4, `SqueletteIndicateurs` « ramené à la forme de la rangée » | `compact` ajouté | §0.7 | `SqueletteIndicateurs compact nombre={6}` |

---

## 18. Décisions à consigner

| N° | Titre | Contenu |
| -- | ----- | ------- |
| 010 | Les feuilles se hissent | `href` et `precedence`, une clé par composant, `PRECEDENCE_FEUILLES` ; la feuille statique du préréglage écartée (§5.1.6) ; les conséquences hors rendu |
| 011 | Le survol a un jeton, et une portée | `--surface-survol` ; surfaces 2 et 3 ; `--surface-1` en sombre ; `--attention` interdit dessus ; `LigneLien` hors portée |
| 012 | Ce que la console demandait, et ce qui reste au Portail | La décision 009 appliquée aux treize pièces ; le SDK compté comme deuxième consommateur de `MenuActions` ; `Annonce` lue comme une extension de `Bandeau` ; les deux constats dans Compte (`1ef7ef2`) |
| 013 | La réserve basse vit dans la feuille | Seulement si le §5.10 s’applique |

Numéros constatés en machine au plan (`ls docs/decisions/`), à la suite de 009.

---

## 19. Références

- **Le besoin** : SPEC P10 du Portail, `docs/sprints/sprint-p10-v2-console/SPEC-SprintP10-V2-Console.md`,
  §0.2, §0.3, §0.6, §0.9, §0.11, §0.16, §5.1, §5.3, §5.4, §5.13, §5.16, §5.21, §5.23, §6, **§7**,
  §10, §11, §13, §15.5 ; `README.md` du sprint ; `docs/cadrage/v2-design/critique-console.md`, P0-1 à
  P0-5, P1-3, P1-12, P1-19, P1-20, P2-1, P2-2, P2-10, P2-11, P2-14, §4
- **Le deuxième consommateur** : SDK `@ai5d/auth` 1.1.0 installé dans le Portail,
  `src/react/UserButton.tsx`, `OrganizationSwitcher.tsx` ; Compte (`ai5d-platform`, commit `1ef7ef2`),
  relu le 28 septembre 2026
- **Ce dépôt** : `README.md` (« Trois règles qui ne se voient pas dans le code », les gardes),
  `CHANGELOG.md` (1.2.0, 1.1.0, 1.0.0, 0.4.0), `noyau/NOYAU.md`, `noyau/formulations.md`,
  `docs/decisions/004`, `007`, `009`, `docs/superpowers/specs/version-1.2.0-espace-participant/`,
  `docs/preuves/1.2.0/relecture.md`, `tasks/todo.md`, `tasks/lessons.md`
- **Code lu** : `noyau/composants/Bouton.tsx`, `Bandeau.tsx`, `Pastille.tsx`, `PastilleEtat.tsx`,
  `OngletsRubrique.tsx`, `EnteteRubrique.tsx`, `Chiffre.tsx`, `Squelette.tsx`, `LiensRail.tsx`,
  `LigneLien.tsx`, `ListeLignes.tsx`, `ValeurCopiable.tsx`, `Champ.tsx`, `CoquilleRail.tsx`,
  `GabaritApp.tsx`, `TitreSection.tsx`, `dialogue.ts`, `lien.ts`, `index.ts` ; `noyau/jetons.css`,
  `noyau/ai5d.preset.css`, `noyau/paliers.css`, `gardes/index.ts`, `package.json` ;
  `tests/index.test.ts`, `tests/composants/bouton-lien.test.tsx`, `coquille-rail.test.tsx`,
  `composants.test.tsx` ; `react-dom` 19.2.8 (`react-dom-client.development.js`,
  `react-dom-server.node.development.js`), `jsdom` 25.0.1 ; dans le Portail : `package.json`,
  `lib/mesures.ts`, `lib/securite/csp.ts`, `components/champs/`
- **Méthode** : skill `ia5d-product-suite:spec-stories` ; règles globales de Karamo (cycle, moment
  des tests, commits)
- **User Stories** : [`USER-STORIES-Version-1.3.0-Console.md`](USER-STORIES-Version-1.3.0-Console.md)
