# Management — captures de vérification

Ces captures proviennent de l’application réelle lancée dans Playwright avec des réponses Supabase simulées. Les montants et commandes sont des données de test, sans accès aux données de production.

- [Haut de page mobile, 390 px](management-390-busy.png)
- [Journée complète, 390 px](management-jour-complet.png)
- [Analyse mensuelle complète, 390 px](management-mois-complet.png)
- [Sélecteur de date](calendrier-390.png)
- [Vue desktop, 1280 px](management-1280.png)

Pour reproduire les scénarios à 375, 390 et 430 px, ainsi qu’en tablette et desktop : `npm ci`, puis `npm run test:management`. Les captures supplémentaires et le compte rendu JSON sont enregistrés dans `test-results/management/`.
