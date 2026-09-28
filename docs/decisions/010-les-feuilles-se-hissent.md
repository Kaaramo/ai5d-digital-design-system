```markdown
# 010 · Les feuilles se hissent

**Date :** 28 septembre 2026 · **Statut :** appliquée · **Version :** 1.3.0

## Contexte

Depuis la 0.4.0, un composant qui a des états porte sa feuille dans une constante `STYLE_…` et la
rendait, à chaque rendu, dans une balise `<style id>` posée devant lui. Vingt-six balises dans vingt et
un fichiers. Mesuré le 28 septembre 2026 sur le banc d'essai (`docs/preuves/1.3.0/feuilles.md`) : cinq
cents boutons et un champ posaient 501 balises, 499 identifiants dupliqués, dans le HTML transmis comme
dans le document. La console du Portail rend des tables de cinq cents lignes.

## Options

**A. Une feuille statique importée par le préréglage.** Aucun geste pour un produit qui importe déjà
`@ai5d/design-system/preset`. Mais toutes les feuilles chargées à chaque page, et chaque feuille
séparée de son composant : deux lieux à tenir ensemble, ce que le dépôt a refusé depuis la 0.4.0.

**B. Les feuilles hissées par React.** Une balise `<style>` qui porte `href` et `precedence` est
hissée dans `<head>` et dédupliquée par `href`, au serveur comme au client ; au serveur, toutes les
feuilles d'une précédence tiennent dans une balise. React 19 est déjà exigé en pair.

## Décision

**B.** Une seule fonction, `feuille(id, css)`, dans un module pur (`noyau/composants/feuille.ts`),
pose `<style href={id} precedence="ai5d">`. Le texte passe en enfant. `PRECEDENCE_FEUILLES` est
exporté pour qu'un produit compte les feuilles du système ; `feuille` ne l'est pas : un produit pose
les siennes sous sa propre précédence (le Portail : `portail`). La septième garde,
`verifierFeuilleUnique`, refuse toute balise `<style>` ou tout `createElement('style')` sans
`precedence`.

## Conséquences

- La feuille n'est plus dans le conteneur du composant mais dans `<head>`, sans `id`. Un test qui la
  lisait par son conteneur ou son `id` la lit par `style[data-href~="ai5d-…"]` (`tests/aides/feuille.ts`).
  Cinquante-deux lectures migrées dans ce dépôt, dont une qui passait à vide sur `null`.
- Au serveur, une balise pour tout le système, dont `data-href` liste les composants employés : une
  recette compte les clés, pas les balises.
- Démontée, une feuille reste dans `<head>` : elle ne coûte rien, et la retirer ferait clignoter la
  prochaine instance.
- L'ordre dans la cascade change face à une règle de classe d'un produit, hors couche et de même
  spécificité ; face aux utilitaires de Tailwind 4, rangés dans une couche, rien ne change.
- Une politique de sécurité du contenu à nonce devra fournir le nonce au rendu de React.
