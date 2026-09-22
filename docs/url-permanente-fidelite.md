# Adresse permanente des plaques fidélité O’SMASH

Adresse à encoder dans le QR et dans la puce NFC, après vérification de sa disponibilité :

`https://fidelite.osmash54.fr`

Le sous-domaine appartient à `osmash54.fr`, enregistré dans le compte OVH O’SMASH. Son enregistrement DNS est géré chez OVH. Il pointe vers le projet Vercel `o-smash`, qui délivre le certificat HTTPS. La règle de redirection se trouve dans `vercel.json` et ne s'applique qu'au nom d'hôte `fidelite.osmash54.fr`.

La destination actuelle est `https://o-smash.vercel.app/r/osmash-2/fidelite`. Cette route publique retrouve le restaurant par son slug dans Supabase et ne demande pas de connexion. La redirection utilise le code 307, afin de ne pas conserver en cache une ancienne destination.

Pour changer la page ou le frontend, modifier uniquement `destination` dans la règle de `vercel.json`, puis déployer la branche `main`. Garder la source `/` et le filtre d'hôte. Vérifier que la destination ne revient pas vers `https://fidelite.osmash54.fr`, pour éviter une boucle.

Pour quitter Vercel complètement, conserver le sous-domaine et modifier son DNS dans la zone OVH pour pointer vers le nouveau service de redirection HTTPS. Recréer sur ce service une redirection temporaire vers la nouvelle page. Le texte imprimé sur les plaques ne change pas. Le domaine doit rester renouvelé et le certificat HTTPS valide.

Avant toute impression, vérifier que l'adresse renvoie un 307 vers la page fidélité du bon restaurant, puis ouvrir cette page sur iPhone et Android. Si les plaques doivent identifier plusieurs restaurants, chacun doit avoir sa propre adresse ou une page de sélection, car la même adresse pointe actuellement vers `osmash-2`.
