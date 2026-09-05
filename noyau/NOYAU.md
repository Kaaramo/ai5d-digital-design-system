# Le noyau

Ce que le registre applicatif AI5D tient pour acquis. Le noyau bouge presque jamais :
le toucher est un événement, pas une correction.

**Fichiers exécutables :** [`jetons.css`](jetons.css) · [`marque.css`](marque.css) (généré) ·
[`ai5d.preset.css`](ai5d.preset.css) · [`polices/`](polices/) · [`composants/`](composants/)

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

### 1.4 La garde de contraste

`tests/jetons.test.ts` recalcule **44 paires** de contraste à chaque exécution, en clair et
en sombre, et échoue sous 4,5. C'est ce test qui aurait attrapé, dès le premier jour, les
quatre défauts trouvés le 5 septembre 2026.

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

---

## 3. Les huit composants

| Composant   | Ce qu'il garantit                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Logotype`  | Le « 5 » incliné à -5° et bleu, **dans toutes les variantes**. Interdit de la charte mère : ne jamais le redresser, ne jamais le recolorer |
| `Bouton`    | Trois variantes, trois tailles, hauteur pilotée par la densité, plancher tactile respecté, `aria-busy` en chargement                       |
| `Champ`     | Libellé **toujours** lié par `htmlFor`, aide et erreur reliées par `aria-describedby`, erreur jamais portée par la seule couleur           |
| `Carte`     | Padding piloté par la densité. Rend un `<button>` quand elle est cliquable, jamais une `<div>` avec un gestionnaire de clic                |
| `Bandeau`   | Une icône **et** un texte. `role="alert"` pour attention et erreur, `role="status"` pour le reste                                          |
| `Pastille`  | Un état compact, qui contient toujours du texte                                                                                            |
| `Icone`     | Lucide, contour, épaisseur **1,75**. Décorative par défaut, accessible seulement si on lui donne un titre                                  |
| `CarteAuth` | Le gabarit d'authentification. Largeur bloquée à **420 px à toutes les tailles**                                                           |

`CarteAuth` est dans le noyau et non dans l'écosystème parce que tout produit peut avoir à
afficher un écran de session expirée, même si le portail Compte porte l'essentiel des flux.

Les composants ne dépendent d'aucun framework de style : leurs styles passent par les
variables CSS, de sorte qu'un projet sans Tailwind les rend correctement.

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
