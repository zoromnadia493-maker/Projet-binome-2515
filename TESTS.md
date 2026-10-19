# Tests manuels — Student Budget Tracker

Les tests ont été faits avec le backend sur le port 3001
et le frontend sur le port 5173.

## Vérifications réalisées

| Test | Action | Résultat observé |
| --- | --- | --- |
| Consulter les dépenses | Ouvrir /api/expenses | Les dépenses sont retournées en JSON. |
| Consulter le budget | Ouvrir /api/budget | Le serveur retourne monthlyBudget égal à 1000. |
| Consulter une dépense | Ouvrir /api/expenses/1 | La dépense Épicerie est affichée. |
| Ajouter depuis l’API | Envoyer une requête POST avec « Test café » et un montant de 5 | La dépense est créée avec l’identifiant 4. |
| Modifier depuis l’API | Envoyer une requête PUT pour changer le montant à 8 | La modification a été confirmée pendant les essais. |
| Charger les données dans React | Ouvrir le frontend avec le backend démarré | Les dépenses du backend s’affichent dans l’interface. |
| Afficher l’interface mise à jour | Ouvrir la nouvelle version de l’application | L’affichage a été confirmé après le remplacement de App.jsx. |

## Vérifications restant à faire

Ces résultats ne sont pas encore confirmés.

| Test | Action | Résultat attendu |
| --- | --- | --- |
| Ajouter depuis React | Ajouter une dépense avec tous les champs | La dépense apparaît dans la liste et dans data.json. |
| Modifier depuis React | Cliquer sur Edit, changer le montant et enregistrer | La dépense et les totaux sont mis à jour. |
| Supprimer | Cliquer sur Delete et confirmer | La dépense disparaît de la liste et du JSON. |
| Modifier le budget | Entrer un nouveau budget et cliquer sur Save Budget | Le budget et le solde sont mis à jour et enregistrés. |
| Rechercher | Saisir une partie d’une description | Seules les dépenses correspondantes s’affichent. |
| Filtrer | Choisir une catégorie | Seules les dépenses de cette catégorie s’affichent, sans changer les totaux globaux. |
| Dépasser le budget | Enregistrer un budget inférieur au total des dépenses | Le solde devient négatif et un avertissement apparaît. |
| Refuser une saisie invalide | Essayer d’ajouter une dépense avec un montant négatif | La saisie est refusée et aucune dépense n’est enregistrée. |
| Identifiant inexistant | Ouvrir /api/expenses/999999 | Le serveur retourne une erreur 404 si cet identifiant n’existe pas. |
| Conserver les données | Ajouter une dépense, arrêter les serveurs, les relancer et recharger la page | La dépense est toujours présente. |

Les vérifications restantes seront mises à jour avec les
résultats réellement observés avant la remise finale.
