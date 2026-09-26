/**
 * La durée pendant laquelle `ValeurCopiable` dit qu'une valeur est copiée, en millisecondes.
 *
 * Elle vit dans ce module pur, sans directive, et non dans le fichier du composant : celui-là est un
 * module client, et une constante importée d'un module client par un composant serveur vaut
 * `undefined` sous Next, sans erreur (leçon du dépôt : une constante lue par le serveur ne vit pas
 * dans un module client).
 */
export const DUREE_SUCCES_COPIE_MS = 2000;
