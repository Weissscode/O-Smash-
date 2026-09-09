# Photos du parcours de composition

Les photos déjà identifiées se trouvent à la racine de `public`. `public/products` ne contient actuellement que son README. Les chemins des cartes de composition sont centralisés dans `src/data/kioskCompositionImages.js`. Les vrais produits restent prioritaires ; une image absente affiche « Photo à venir ». Aucun faux aliment n'a été créé.

Déposer les nouveaux fichiers aux chemins ci-dessous suffit, sans changer le panier ou les calculs. Privilégier des photos compressées, détourées, cadrées au centre avec une marge régulière. Les cartes conservent toute l'image, sans découpe automatique.

## Sauces, communes au burger et aux frites

Dans `public/products/`, format WebP :

- [ ] Algérienne : `sauce-algerienne.webp`
- [ ] Biggy : `sauce-biggy.webp`
- [ ] Smoke : `sauce-smoke.webp`
- [ ] Ketchup : `sauce-ketchup.webp`
- [ ] Mayonnaise : `sauce-mayonnaise.webp`
- [ ] BBQ : `sauce-bbq.webp`
- [ ] Honey : `sauce-honey.webp`
- [ ] Spicy : `sauce-spicy.webp`
- [ ] Chicken : `sauce-chicken.webp`
- [ ] Truffe : `sauce-truffe.webp`

## Retraits et suppléments, sans doublons

Dans `public/products/` :

- [ ] Salade : `ingredient-salade.webp`
- [ ] Tomate : `ingredient-tomate.webp`
- [ ] Oignon cru : `ingredient-oignon.webp`
- [ ] Cornichons : `ingredient-cornichon.webp`
- [ ] Sauce de la recette, pour « Sans sauce » : `ingredient-sauce.webp`
- [ ] Cheddar, aussi utilisé pour « Sans fromage » : `ingredient-cheddar.webp`
- [ ] Bacon : `ingredient-bacon.webp`
- [ ] Oignons crispy/frits : `ingredient-oignon-crispy.webp`
- [ ] Œuf : `ingredient-oeuf.webp`
- [ ] Crispy chicken, également retraits/suppléments du Canadian : `ingredient-crispy-chicken.webp`
- [ ] Steak smashé : `ingredient-steak-smashe.webp`

Les frites/Twister réutilisent les photos de bacon, cheddar et oignons frits. Les sauces frites réutilisent celles de la première liste. Aucun doublon à fournir.

## Boissons

Vraies canettes ou bouteilles, dans `public/products/` :

- [ ] Coca-Cola 33cl : `dr-coca.jpg`
- [ ] Coca Zero 33cl : `dr-zero.jpg`
- [ ] Coca Cherry 33cl : `dr-cher.jpg`
- [ ] Fanta Exotique 33cl : `dr-fex.jpg`
- [ ] Fanta Orange 33cl : `dr-for.jpg`
- [ ] Ice Tea Peach 33cl : `dr-itp.jpg`
- [ ] Ice Tea Menthe 33cl : `dr-itm.jpg`
- [ ] Ice Tea Framboise 33cl : `dr-itr.jpg`
- [ ] Oasis Pomme Cassis 33cl : `dr-opc.jpg`
- [ ] Oasis Fraise Framb. 33cl : `dr-off.jpg`
- [ ] Cristalline Pêche 50cl : `dr-crp.jpg`
- [ ] Cristalline Fraise 50cl : `dr-crf.jpg`
- [ ] Eau 50cl : `dr-eau.jpg`

La photo de gobelet `boisson .png` reste le visuel de catégorie. Elle ne représente pas les différentes canettes.

## Extras et produits encore sans photo individuelle associée

Canadian Cheddar et Twister ont déjà leur photo. Pour les autres, confirmer si une des images existantes correspond exactement au produit avant de fournir un nouveau fichier. Les noms de certains PNG existants sont trompeurs ; aucune association n'est inventée.

- [ ] Mac n Cheese Pâte : `public/products/si-mnch.jpg`
- [ ] Mac n Chicken Pâte : `public/products/si-mncp.jpg`
- [ ] Chili Cheese x4 : `public/products/si-chil.jpg`
- [ ] Nuggets x4 : `public/products/si-nugg.jpg`
- [ ] Tenders x2 : `public/products/si-tend.jpg`
- [ ] Wings x5 BBQ : `public/products/lo-wing.jpg`
- [ ] Canadian Spicy : `public/products/lo-spic.jpg`
- [ ] O'Smash Veggy : `public/products/b-veg.jpg`
- [ ] O'Smash Honey : `public/products/b-honey.jpg`
- [ ] O'Smash Truffe seul : `public/products/b-truf.jpg` (photo menu déjà disponible)
- [ ] O'Smash Avocado seul : `public/products/b-avoc.jpg` (photo menu déjà disponible)
- [ ] Mac n Cheese Chicken Burger : `public/products/b-mncc.jpg`
- [ ] Mac n Cheese Beef Burger : `public/products/b-mncb.jpg`

## Vérifications de cette modification

Parcours Chrome réel en local : menu Original, Biggy, sans oignon, supplément cheddar, sauce frites BBQ, bacon sur les frites, Coca-Cola, Canadian Cheddar sans chicken avec bacon. Total attendu et observé : 20,40 €, soit 11,50 € + 8,90 €. Retour conserve les choix ; boisson obligatoire ; ajout au panier testé. Recap et sauces contrôlés à 375 px, sans débordement horizontal. Compteurs textuels retirés, progression conservée.

Tests des calculs, champs panier, suggestions et constructeurs de tickets conservés. Aucune modification des prix, du serveur, des commandes téléphone ou de la caisse staff. Impression physique et commandes Supabase réelles non testées : session locale isolée, sans compte de production.

Les captures sont celles de l'application, avec photos manquantes explicitement signalées. Les visuels de recette ne changent pas en fonction des retraits : les options écrites font foi pour la cuisine.
