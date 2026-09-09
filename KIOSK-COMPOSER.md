# Composition par étapes dans la borne

Le parcours concerne uniquement les burgers et BAO, seuls ou en menu,
dans la borne (?kiosk=1). Les formules Duo et Étudiant, le riz et la caisse
du personnel conservent leurs interfaces existantes.

## Parcours

Six étapes pour un burger seul : format, sauces, retraits, suppléments,
extras, récapitulatif. Neuf en menu, avec sauce frites, suppléments frites
et boisson avant les extras. L'ajout au panier est l'action du récapitulatif.

Une seule section est visible, sans dialogue de personnalisation. Retour
et Passer conservent les choix. Pour enlever un choix, toucher à nouveau
son bouton. Le brouillon menu est conservé si le client revient au burger
seul, mais les options menu ne sont ni facturées ni envoyées au ticket
tant que le format burger seul est actif.

Les extras configurables ont deux sous-étapes dans la même page.
Leur personnalisation est facultative. La sortie du parcours demande
confirmation dans la page et ne modifie pas le panier.
L'inactivité conserve la règle existante de retour à l'accueil après 60 secondes.

## Compatibilité

Les prix et libellés viennent des constantes actuelles du catalogue.
Le supplément menu reste à 3 euros. Les champs cust utilisés par les
générateurs de tickets sont conservés, notamment fritesSauce, fritesSupps,
drink, inMenu, sauces, retraits et supplements.
Les extras sont des lignes normales du panier, avec leurs propres identifiants.

Le panier est modifié une seule fois, à la fin. L'édition conserve l'identifiant
et la quantité de la ligne existante ; ses extras précédents restent des lignes
indépendantes. Les nouveaux extras sélectionnés pendant l'édition s'ajoutent
séparément, une unité chacun. Le récapitulatif montre ces quantités et totaux.
Une protection empêche le second appui d'un double appui d'ouvrir le paiement.

Aucune modification du serveur d'impression, de la synchronisation des commandes,
du catalogue partagé, des commandes téléphone ou des statistiques.

## Tests

Commande : node --test tests/*.test.*

19 tests automatisés, dont le passage des lignes composées dans les vrais
générateurs ESC/POS sans démarrer de connexion aux imprimantes.

Contrôles Chrome : menu Original avec cheddar, sauce BBQ et bacon sur les
frites, Coca-Cola, Canadian sans chicken avec bacon : 20,40 euros.
Retour entre étapes, personnalisation d'extra sans modale, double appui,
édition d'une ligne de quantité 2, passage menu vers burger seul, abandon
avec conservation du panier, burger seul avec étapes facultatives et caisse
staff. Affichage contrôlé en 1080 x 1920 et 375 x 812.

Les tests ne certifient pas la réception physique des tickets ou la synchronisation
Supabase en production. Le build local utilise esbuild-wasm temporairement,
le compilateur natif Windows étant bloqué par un accès refusé à un dossier parent.
