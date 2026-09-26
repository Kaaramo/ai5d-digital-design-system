# Leçons du système de design

Une leçon par erreur payée, avec ce qu'elle change dans la façon de travailler.

---

## Sprint 17 · La 1.0.0

### Un inventaire se fait avec l'outil, pas de mémoire

Le plan annonçait quatre espacements en dur dans les composants. La garde, lancée sur le dépôt avant
d'en fixer la portée, en a trouvé trente-deux. Une garde écrite pour quatre cas aurait été calibrée
faux : exceptions trop larges, ou suite rouge au premier passage.

**Avant de fixer ce qu'une garde tolère, la lancer telle quelle et lire ce qu'elle trouve.**

### Un script d'édition passé au shell perd ses échappements

Un script Python envoyé par un heredoc a écrit de vrais retours à la ligne là où les chaînes de test
portaient `\n`. Le fichier des gardes ne s'analysait plus, et les six gardes auraient échoué ensemble
à la vérification, sans dire laquelle était fausse. Trouvé par Prettier deux tâches plus tard.

**Les scripts d'édition s'écrivent dans un fichier, jamais en ligne dans le shell.**

### `Parameters<>` ne s'applique pas à un `ComponentType`

`ComponentType` est l'union d'une fonction et d'une classe, et une classe n'a pas de signature
d'appel. `Parameters<ComposantLien>[0]` ne se résolvait pas. `ComponentProps<>` est l'outil prévu.

### jsdom ne connaît pas `showModal()`

jsdom 25 n'implémente ni `showModal()`, ni l'inertie du document, ni l'Échap qui émet `cancel`. Un
test de dialogue peut simuler l'ouverture au strict minimum et vérifier la structure ; il ne prouve
rien du clavier. **Le comportement au clavier d'un dialogue se prouve au navigateur**, et le fichier
de tests doit le dire.

### Un nombre écrit à la main dans une documentation vieillit

En 0.8.1, le README annonçait la version 0.8.0, 192 tests, onze composants dans son schéma et dix-neuf
dans son titre ; `NOYAU.md` en annonçait douze. Il y en avait trente-quatre. Chacun de ces nombres
était juste le jour où il a été écrit.

**Un nombre qu'une documentation affirme est soit lu par un test, soit retiré.**
`tests/documentation.test.ts` confronte la version, le nombre de composants et les gardes au code.

### Une feuille injectée par le système ne pose pas de nom commun

Les pages de document de Compte employaient `.page-document` et `.section-document`. Injectées par le
système dans tous les produits, ces classes auraient coloré les pages de n'importe quel produit qui
emploie déjà ces noms. **Toute classe d'une feuille du système porte le préfixe `ai5d-`**, et une garde
le vérifie pour le document.

### Une constante lue par le serveur ne vit pas dans un module client

Leçon payée dans Compte, et qui touche chaque produit consommateur : Next remplace un module
`'use client'` importé depuis un composant serveur par une référence, jamais par ses exports. Une
constante importée ainsi vaut `undefined`, sans erreur. C'est pourquoi le thème s'expose par
`@ai5d/design-system/theme`, un module sans directive, et non depuis le fichier de `SelecteurTheme`.

---

## Version 1.2.0

### Un test qui recopie une forme protège aussi son défaut

De la 0.1.0 à la 1.1.0, `tests/densites.test.ts` et `verifierPlancherTactile` exigeaient au caractère
près `max(var(--hauteur-controle), 44px)`. Cette forme se lit elle-même et ne vaut rien au calcul : sur
tout écran tactile, chaque bouton de chaque produit valait 44 px. Le test ne pouvait pas le voir, parce
qu'il lisait la forme, et jsdom ne calcule aucune propriété personnalisée. La garde, distribuée aux
produits, aurait fait échouer celui qui corrigeait la feuille chez lui.

**Une règle CSS qui produit une valeur se teste par sa valeur** (un résolveur à chaque exécution, puis
une mesure dans un vrai navigateur), jamais par sa seule forme.

### Une sonde de types se fait chez le consommateur, avec ses options

L'écart E2 du plan avait conclu que le `Link` de Next restait assignable au `ComposantLien` élargi. La
sonde avait été faite dans ce dépôt, où Next n'est pas installé. Dans Compte, sous
`exactOptionalPropertyTypes`, six vérifications de types échouaient : Next redéclare trois
gestionnaires sans `| undefined`. Seule la montée d'essai de Compte, avant publication, l'a montré.

**Un type public qui doit accepter le composant d'un cadriciel se vérifie contre les vrais types de ce
cadriciel, avec les options du consommateur** (une réplique fidèle dans les tests, et la montée d'un
produit réel avant toute étiquette), jamais par un raisonnement dans le dépôt qui ne l'installe pas.

### Une base flexible change de sens quand la rangée s'empile

`ValeurCopiable` donnait au champ `flex: 1 1 16rem`, pensé pour une rangée. Sous 24rem, la rangée
passe en colonne, et la même base devient une hauteur de 256 px : un vide de 180 px entre le champ et
son bouton, au doigt. jsdom ne calcule aucune mise en page ; seule la capture l'a montré.

**Toute règle qui fait basculer `flex-direction` revoit les `flex-basis` des enfants dans le même
bloc**, et une pièce qui s'empile se regarde au doigt avant d'être déclarée faite.

### Une page de preuve doit tenir au plancher qu'elle prouve

La page des spécimens débordait à 320 px (414 px, 400 déjà en 1.1.0), par son propre en-tête. En
émulation mobile, Chromium élargit alors le viewport de mise en page et décale le viewport visuel :
les captures d'élément tombaient ailleurs que sur leur cible, pendant que les mesures numériques
restaient justes.

**Une capture qui prouve un rendu au téléphone se fait sur une page qui ne déborde pas elle-même**, et
on vérifie `scrollWidth` et `visualViewport.offsetTop` avant de croire ce que montre l'image.
