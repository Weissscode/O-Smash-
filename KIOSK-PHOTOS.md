# Photos et catégories de la borne

Les changements de présentation concernent uniquement `?kiosk=1`.
La caisse conserve son catalogue, ses prix et ses catégories.

## Sources

Photos importées depuis `origin/main`, commit
`c8953a581cb9b75822e01544839a14931c7c344b`.
Elles se trouvent directement dans `public/` sur cette révision.
Le repli historique `public/products/<id>.jpg` reste supporté.

Le fichier `src/data/kioskCatalogue.js` contient les correspondances explicites.
Les noms de certains fichiers sont trompeurs : les associations ont été faites
en regardant les images, et non en déduisant le produit du nom du fichier.
Les PNG sont déjà détourés. Aucun produit ni logo n'a été redessiné ou recoloré.
Les originaux sont conservés, sans compression supplémentaire.

| Catégorie | Fichier utilisé |
| --- | --- |
| Burgers | burger_classic_pickles_bacon.png |
| Menus | CHICKEN MENU .png |
| BAO | burger_black_bun_double_jalapeno.png |
| Riz Crousty | mac_n_cheese_gratin_bis.png |
| Petite faim | onion_rings_twister.png |
| Boissons | boisson .png |
| Milkshakes | milkshake .png |

Logo : `LOGO (1).png`, dans ses couleurs originales, y compris les détails
roses et bleus présents dans le fichier fourni.

## Catalogue et comportements

Menus regroupe les burgers et BAO en mode menu, avec le supplément existant
de 3 euros, ainsi que les anciennes Formules. Les identifiants ne changent pas.
Le choix de boisson et la personnalisation utilisent les composants existants.

Petite faim présente la catégorie Sides de la base actuelle, qui contient déjà
les Loaded. Chaque produit conserve sa route source : aucun doublon n'est ajouté.
Les produits lo- gardent leur bouton de personnalisation dans les suggestions.

Réintégration du 9 septembre sur la base distante `848868c`.
Le catalogue partagé est maintenant la seule source des BAO et des prix.
Le Menu Avocado reprend le prix de 10,50 euros et le supplément menu existant.
Le riz conserve le choix boisson à +1 euro ; son indicateur boisson empêche
les suggestions de boissons supplémentaires.
Le serveur d'impression, les analytics et la migration des erreurs d'impression
de la branche distante sont conservés sans modification.

Les articles dont la photo n'est pas identifiée restent commandables avec
la mention « Photo à venir ». Les produits photographiés sont affichés en premier.
Les images utilisent object-fit: contain et un chargement différé.

## Vérification

`node --test tests/kioskCatalogue.test.mjs tests/kioskUpsell.test.mjs tests/kioskTickets.test.cjs`

Les tests couvrent les routes source, prix et IDs, les fichiers de catégories,
les règles de suggestion et les constructeurs de tickets existants.
Les impressions physiques et la synchronisation Supabase réelle nécessitent
une vérification dans le restaurant.

Douze tests passent après fusion. Parcours réels vérifiés : Original et Canadian
personnalisé (14,40 euros), riz gratiné avec boisson (11,50 euros), Menu Chicken
(9,50 euros), total de contrôle 35,40 euros. La caisse ajoute directement
un Original à 6,50 euros sans upsell. Panier et confirmation vérifiés à 375 px.

Le build local utilise temporairement esbuild-wasm à cause du refus d'accès
du compilateur natif Windows à un dossier parent. Les fichiers de dépendances
ne sont pas modifiés et npm ci restaure les dépendances après vérification.

Le bypass de démonstration et le fichier d'environnement factice doivent
rester absents de tout commit.
