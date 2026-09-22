# Adresse permanente des plaques fidélité O’SMASH

Adresse à graver dans le QR et la puce NFC, après activation et vérification de la redirection :

`https://osmash.fr/fidelite`

Le domaine `osmash.fr` est hébergé chez OVH. La redirection HTTP se configure dans le fichier `.htaccess` à la racine de cet hébergement. Le fichier `ops/ovh/fidelite.htaccess.snippet` contient la règle à insérer dans le `.htaccess` existant. Il ne faut pas remplacer les autres règles du site.

La destination actuelle est `https://o-smash.vercel.app/r/osmash-2/fidelite`. La route publique résout ensuite le slug `osmash-2` dans Supabase. Elle ne demande pas de connexion. Les autres restaurants gardent leurs propres slugs.

Pour changer la destination plus tard, modifier uniquement l'URL située après `RewriteRule ^fidelite/?$` dans le `.htaccess` OVH. Garder l'adresse imprimée et le code 302. Vérifier que la nouvelle destination ne redirige pas vers `https://osmash.fr/fidelite`, pour éviter une boucle. Tester ensuite la réponse HTTP, l'ouverture de la page et la résolution du restaurant.

Avant toute impression, vérifier depuis un téléphone que `https://osmash.fr/fidelite` renvoie une redirection 302 vers la page fidélité du bon restaurant et que le formulaire s'affiche. Cette règle n'est pas déployée par Vercel : publier le dépôt ne suffit pas à l'activer chez OVH.
