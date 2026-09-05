# Formulations de référence

Le répertoire des phrases transverses. Un produit y puise plutôt que de réinventer sa
formulation — c'est ce qui évite qu'un même refus soit dit de quatre façons dans quatre
produits.

Les règles de voix sont dans [`NOYAU.md`](NOYAU.md), section 5.

## Authentification

| Situation           | Formulation                                                                                             | La règle derrière                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Échec de connexion  | « Adresse ou mot de passe incorrect. »                                                                  | **Jamais** lequel des deux : le dire révèle quelles adresses existent |
| Mot de passe oublié | « Si un compte existe pour cette adresse, vous recevrez un lien dans quelques minutes. »                | La réponse est identique que l'adresse existe ou non                  |
| Compte verrouillé   | « Trop de tentatives. Réessayez dans cinq minutes. »                                                    | On dit toujours **quand** le verrou se lève                           |
| Courriel non reçu   | « Le courriel peut mettre quelques minutes. Vérifiez vos indésirables avant d'en demander un nouveau. » | On propose l'action utile avant l'action coûteuse                     |
| Session expirée     | « Votre session a expiré. Reconnectez-vous pour reprendre où vous en étiez. »                           | On promet la reprise, sinon la personne craint d'avoir tout perdu     |

## Accès et droits

| Situation                  | Formulation                                                                                                   | La règle derrière                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Accès refusé, organisation | « Votre organisation n'a pas d'accès à ce produit. Demandez-le à son administrateur. »                        | On nomme **qui** peut lever le blocage   |
| Accès refusé, personnel    | « Vous n'avez pas accès à ce produit. » suivi de l'action d'obtention                                         | Un refus sans issue est un cul-de-sac    |
| Accès expiré               | « Votre accès a pris fin le 4 septembre. »                                                                    | On donne la date, pas une durée relative |
| État vide                  | « Vous n'avez encore accès à aucun produit AI5D. Vos accès apparaîtront ici dès votre première inscription. » | On dit ce qui remplira l'espace          |

## Actions engageantes

| Situation                     | Formulation                                                                                                                                  | La règle derrière                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Avant une suppression         | « Votre compte sera supprimé dans trente jours, avec vos accès à tous les produits AI5D. D'ici là, une simple connexion annule la demande. » | On nomme la conséquence **et** la sortie                |
| Après une réinitialisation    | « Votre mot de passe est modifié. Toutes vos autres sessions ont été fermées. »                                                              | On dit l'effet de bord : il rassure au lieu d'inquiéter |
| Fermeture de session distante | « Cet appareil sera déconnecté immédiatement. »                                                                                              | Le présent, pas le conditionnel                         |

## États techniques

| Situation                | Formulation                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| Hors ligne               | « Vous êtes hors ligne. Vos saisies sont conservées. »             |
| Information indisponible | « Nous ne pouvons pas afficher cette information pour le moment. » |
| Maintenance              | « Le service est en maintenance. Il revient à 14 h. »              |

**Assumer l'absence.** « Nous ne pouvons pas afficher cette information » plutôt qu'une
valeur inventée ou un tiret. Vaut pour l'interface comme pour les courriels.
