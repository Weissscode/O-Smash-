# Photos produits

Dépose ici les photos des produits pour qu'elles s'affichent sur les cartes
du menu (caisse et borne). Rien à modifier dans le code : chaque carte
charge automatiquement `/products/<id-du-produit>.jpg` — si le fichier
n'existe pas, la carte reste comme aujourd'hui (nom + prix, pas de photo,
pas de trou dans la mise en page).

**Format borne** : `<id>.webp`, produit détouré sur fond transparent,
rogné au plus près, 640 px max de côté. La borne l'affiche entier
(`object-fit: contain`), jamais recadré. Les fichiers présents ont été
générés depuis les photos déposées à la racine de `public/` ; les menus
(`m-<id>.webp`) sont les burgers et BAO "en menu". Les images de
catégories sont dans `public/categories/<id>.webp`.

La caisse staff, elle, lit `<id>.jpg` (voir `PCard` dans `src/App.jsx`).

**Astuce** : pas besoin de tout fournir d'un coup — ajoute les photos au
fur et à mesure, produit par produit.

## Liste des ids par catégorie

### Burgers
- `b-orig.jpg` — O'Smash Original
- `b-chik.jpg` — O'Smash Chicken
- `b-veg.jpg` — O'Smash Veggy
- `b-smoke.jpg` — O'Smash Smoke
- `b-honey.jpg` — O'Smash Honey
- `b-fren.jpg` — O'Smash Frenchy
- `b-brit.jpg` — O'Smash British
- `b-spicy.jpg` — O'Smash Spicy
- `b-truf.jpg` — O'Smash Truffe
- `b-macc.jpg` — Mac n Cheese Chicken Burger
- `b-macb.jpg` — Mac n Cheese Beef Burger
- `b-wrap.jpg` — Wrap Chicken

### Formules
- `f-etud.jpg` — Menu Étudiant
- `f-duo-s.jpg` — Duo Simple
- `f-duo-g.jpg` — Duo Signature

### Riz Crousty
- `r-riz.jpg` — Riz Crousty
- `r-rizb.jpg` — Riz + Boisson

### Sides
- `si-frit.jpg` — Frites Twister
- `si-chil.jpg` — Chili Cheese x4
- `si-nugg.jpg` — Nuggets x4
- `si-tend.jpg` — Tenders x2
- `si-mac.jpg` — Pâtes Mac n Cheese

### Loaded
- `lo-wing.jpg` — Wings x5 BBQ
- `lo-cana.jpg` — Canadian Cheddar
- `lo-spic.jpg` — Canadian Spicy

### Desserts
- `de-ore.jpg` — Tiramisu Oreo
- `de-nut.jpg` — Tiramisu Nutella
- `de-spe.jpg` — Tiramisu Spéculoos
- `de-coo.jpg` — Tiramisu Cookies
- `de-gal.jpg` — Tiramisu Galettes Caramel
- `de-fra.jpg` — Tiramisu Fraises
- `de-man.jpg` — Tiramisu Mangue Passion
- `de-cb1.jpg` — Cakebowl Fraises Choco Blanc
- `de-cb2.jpg` — Cakebowl Framboise Pistache
- `de-cb3.jpg` — Cakebowl Mangue Passion

### Boissons
- `dr-coca.jpg` — Coca-Cola 33cl
- `dr-zero.jpg` — Coca Zero 33cl
- `dr-cher.jpg` — Coca Cherry 33cl
- `dr-fex.jpg` — Fanta Exotique 33cl
- `dr-for.jpg` — Fanta Orange 33cl
- `dr-itp.jpg` — Ice Tea Peach 33cl
- `dr-itm.jpg` — Ice Tea Menthe 33cl
- `dr-itr.jpg` — Ice Tea Framboise 33cl
- `dr-opc.jpg` — Oasis Pomme Cassis 33cl
- `dr-off.jpg` — Oasis Fraise Framb. 33cl
- `dr-crp.jpg` — Cristalline Pêche 50cl
- `dr-crf.jpg` — Cristalline Fraise 50cl
- `dr-eau.jpg` — Eau 50cl

### Milkshakes
- `mk-van.jpg` — Milkshake Vanille
- `mk-nut.jpg` — Milkshake Nutella
- `mk-spe.jpg` — Milkshake Spéculoos
- `mk-pis.jpg` — Milkshake Pistache
- `mk-elm.jpg` — Milkshake El Mojrdene
- `mk-fra.jpg` — Milkshake Fraise
- `mk-car.jpg` — Milkshake Caramel

### Crêpes
- `cr-van.jpg` — Crêpe Vanille
- `cr-nut.jpg` — Crêpe Nutella
- `cr-spe.jpg` — Crêpe Spéculoos
- `cr-pis.jpg` — Crêpe Pistache
- `cr-elm.jpg` — Crêpe El Mojrdene
- `cr-fra.jpg` — Crêpe Fraise
- `cr-car.jpg` — Crêpe Caramel
