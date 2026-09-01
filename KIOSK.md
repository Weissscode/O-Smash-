# Mode borne de commande

L'app peut tourner en libre-service sur la borne, en plus de la caisse normale.
Aucune app séparée : c'est la même app O'Smash, juste ouverte avec `?kiosk=1`
dans l'URL.

## Ce que ça change

- **Écran d'accueil** : "Touchez l'écran pour commander" — évite qu'un écran
  figé sur le dernier client reste affiché entre deux commandes.
- **Commande** : le client parcourt le même menu, les mêmes modales de
  personnalisation (burger, riz, frites, milkshake...) et le même panier que
  la caisse — rien à dupliquer côté logique produit.
- **Validation** : pas de choix de mode de paiement à la borne. Le client
  choisit juste Sur place / À emporter, valide, récupère un ticket avec son
  numéro, et règle au comptoir. Ça tombe dans la même file "commandes en
  attente" que les commandes téléphone (onglet Téléphone côté caisse).
- **Impression** : dès la validation, le ticket cuisine part en cuisine (la
  préparation démarre tout de suite) + un ticket est imprimé à la borne pour
  le client (numéro de commande, articles, total, "à régler en caisse"). Le
  ticket caisse (paiement) est imprimé plus tard, quand le client vient payer
  et que la caissière clique "Encaisser" dans l'onglet Téléphone.
- **Onglets caisse/stock/dashboard/analytics** : masqués en mode borne. Pour
  repasser en mode caisse normal sur cet écran, taper 7 fois rapidement sur
  le logo (écran d'accueil ou en-tête) → code PIN → retour à l'URL sans
  `?kiosk=1`.

## Configuration de l'imprimante de la borne

Dans `server.js`, à côté de `CAISSE` et `CUISINE` :

```js
const KIOSK = { ip: '192.168.1.39', port: 9100 };
```

Remplacer `192.168.1.39` par l'IP réelle de l'imprimante branchée sur/à côté
de la borne (même réseau que le PC qui fait tourner `node server.js`). Un
`/test-kiosk` (POST) est disponible pour tester l'impression sans passer une
vraie commande.

## Mettre la borne en plein écran / verrouillée

L'app se charge dans le navigateur de la borne comme n'importe quelle page
web : `https://<url-de-l-app>/?kiosk=1`. Selon l'OS de la borne :

- **Android** (le plus courant sur ce type de borne pas cher) : installer un
  navigateur kiosque type **Fully Kiosk Browser** (gratuit en version de
  base), mettre l'URL ci-dessus en "Start URL", activer "Kiosk Mode" /
  "Lock Screen Off" / masquer la barre de statut. Alternative sans app tierce :
  Chrome avec le flag `--kiosk <url>` si l'OS permet de lancer Chrome avec des
  flags au démarrage.
- **Windows** : Edge en mode kiosque —
  `msedge --kiosk "<url>" --edge-kiosk-type=fullscreen`, ou configurer un
  compte "Accès affecté" (Assigned Access) dans les paramètres Windows pour
  verrouiller la session sur ce navigateur au démarrage.

Dans les deux cas, l'app elle-même demande le plein écran (Fullscreen API) au
premier tap sur l'écran d'accueil — la config OS ci-dessus sert surtout à
empêcher le client de sortir du navigateur (bouton retour, barre d'adresse,
autres apps).

Le modèle exact de la borne achetée sur Alibaba (OS, launcher préinstallé)
n'était pas connu au moment d'écrire ce doc — si un launcher/mode kiosque
est déjà fourni avec la borne, l'utiliser directement plutôt que Fully Kiosk
Browser, et pointer simplement son "Start URL" vers l'app avec `?kiosk=1`.
