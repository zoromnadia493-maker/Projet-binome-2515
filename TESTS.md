# Tests manuels — Student Budget Tracker

Les tests ont été réalisés avec le backend sur le port 3001
et le frontend sur le port 5173.

## Tests du backend

| Test | Action | Résultat observé | État |
| --- | --- | --- | --- |
| Consulter les dépenses | Ouvrir /api/expenses | Les dépenses sont retournées en JSON. | Réussi |
| Consulter le budget | Ouvrir /api/budget | Le budget enregistré est retourné en JSON. | Réussi |
| Consulter une dépense | Ouvrir /api/expenses/1 | La dépense Épicerie est affichée. | Réussi |
| Ajouter une dépense | Envoyer une requête POST avec « Test café » et un montant de 5 | La dépense est créée avec un identifiant. | Réussi |
| Modifier une dépense | Envoyer une requête PUT pour changer son montant à 8 | Le montant est modifié. | Réussi |
| Identifiant inexistant | Demander une dépense avec un identifiant absent | Le serveur retourne une erreur 404. | Réussi |

## Tests de l’application

| Test | Action | Résultat observé | État |
| --- | --- | --- | --- |
| Charger les données | Ouvrir l’application avec le backend démarré | Le budget et les dépenses du JSON s’affichent. | Réussi |
| Ajouter une dépense | Remplir le formulaire et cliquer sur Add Expense | La dépense apparaît dans la liste et dans data.json. Les totaux sont mis à jour. | Réussi |
| Modifier une dépense | Cliquer sur Edit, changer le montant et enregistrer | La modification est enregistrée et les totaux sont recalculés. | Réussi |
| Supprimer une dépense | Cliquer sur Delete et confirmer | La dépense disparaît de la liste et du JSON. Les totaux sont recalculés. | Réussi |
| Modifier le budget | Entrer un nouveau montant et cliquer sur Save Budget | Le budget est enregistré et le solde est recalculé. | Réussi |
| Rechercher | Saisir une partie de la description | Seules les dépenses correspondantes s’affichent. | Réussi |
| Filtrer par catégorie | Choisir une catégorie | Seules les dépenses de cette catégorie s’affichent. Les totaux globaux restent inchangés. | Réussi |
| Dépasser le budget | Enregistrer un budget inférieur aux dépenses | Le solde devient négatif et un avertissement apparaît. | Réussi |
| Refuser un montant invalide | Essayer d’ajouter une dépense avec un montant négatif | La saisie est refusée et aucune dépense n’est ajoutée. | Réussi |
| Conserver les données | Enregistrer une dépense, arrêter les serveurs, les relancer et recharger la page | La dépense enregistrée est toujours présente. | Réussi |

## Bilan

Les tests manuels ci-dessus ont donné les résultats attendus.
Ils couvrent les principales fonctions de l’application.

Ces vérifications sont manuelles et ne constituent pas
des tests automatisés.
