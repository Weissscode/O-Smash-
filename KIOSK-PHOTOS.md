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

Petite faim fusionne visuellement Sides et Loaded. Chaque produit conserve
sa catégorie source pour ouvrir sa personnalisation habituelle.

Les six BAO et leurs prix proviennent du catalogue déjà publié sur main,
commit `0dbc55c`. Ils sont ajoutés à la borne uniquement. Leur préfixe est
reconnu par le regroupement des ventes. Le reste de main n'a pas été fusionné :
pas de mise à jour globale des tarifs ou du catalogue de la caisse.

Les articles dont la photo n'est pas identifiée restent commandables avec
la mention « Photo à venir ». Les produits photographiés sont affichés en premier.
Les images utilisent object-fit: contain et un chargement différé.

## Vérification

`node --test tests/kioskCatalogue.test.mjs tests/kioskUpsell.test.mjs tests/kioskTickets.test.cjs`

Les tests couvrent les routes source, prix et IDs, les fichiers de catégories,
les règles de suggestion et les constructeurs de tickets existants.
Les impressions physiques et la synchronisation Supabase réelle nécessitent
une vérification dans le restaurant.

Le bypass de démonstration et le fichier d'environnement factice doivent
rester absents de tout commit.
