# Backend — Student Budget Tracker

Cette partie du projet utilise Node.js et Express pour gérer
le budget et les dépenses. Les données sont enregistrées
dans le fichier data.json.

## Installer et lancer le backend

Il faut avoir Node.js et npm installés.

Dans le terminal, se placer dans le dossier backend :

    cd backend

Installer les dépendances :

    npm install

Lancer le serveur :

    node server.js

Le serveur est accessible à cette adresse :
http://localhost:3001

Pour l’arrêter, appuyer sur Ctrl + C dans le terminal.

## Les fichiers

- server.js : contient le serveur, les routes et la validation.
- data.json : contient le budget et les dépenses.
- package.json : contient les informations du projet
  et les dépendances.
- package-lock.json : conserve les versions des dépendances.

## Les routes API

| Méthode | Adresse | Utilisation |
| --- | --- | --- |
| GET | /api/expenses | Afficher toutes les dépenses |
| GET | /api/expenses/:id | Afficher une dépense |
| POST | /api/expenses | Ajouter une dépense |
| PUT | /api/expenses/:id | Modifier une dépense |
| DELETE | /api/expenses/:id | Supprimer une dépense |
| GET | /api/budget | Afficher le budget |
| PUT | /api/budget | Modifier le budget |

Pour ajouter ou modifier une dépense, on envoie du JSON :

    {
      "description": "Épicerie",
      "amount": 50,
      "category": "Nourriture",
      "date": "2026-10-01"
    }

Le serveur crée automatiquement l’identifiant lors de l’ajout.
Pour modifier une dépense, il faut envoyer tous ses champs.

Pour modifier le budget :

    {
      "monthlyBudget": 1000
    }

## Vérification des données

Le serveur vérifie les données avant de les enregistrer :

- La description doit contenir entre 1 et 150 caractères.
- Le montant d’une dépense doit être supérieur à zéro.
- Le budget peut être égal à zéro.
- Les montants acceptent deux décimales au maximum
  et ne peuvent pas dépasser 1 milliard.
- La date doit être valide et écrite sous la forme AAAA-MM-JJ.
- La catégorie doit être Logement, Nourriture, Transport,
  Études, Loisirs ou Autres.

Si les données sont incorrectes, le serveur renvoie
un message d’erreur.

## Réponses du serveur

- 200 : consultation ou modification réussie.
- 201 : dépense ajoutée.
- 204 : dépense supprimée.
- 400 : données invalides.
- 404 : dépense ou route introuvable.
- 409 : aucun nouvel identifiant disponible.
- 413 : trop de données envoyées.
- 500 : problème de lecture ou d’enregistrement du fichier.

## Tests manuels

Les vérifications faites jusqu’ici sont :

- Afficher la liste des dépenses.
- Afficher le budget de 1000.
- Consulter une dépense avec son identifiant.
- Ajouter « Test café » avec un montant de 5.
- Modifier son montant à 8.

Il reste à vérifier la suppression, les erreurs et la
conservation des données après un redémarrage du serveur.

## Connexion avec le frontend

Le frontend peut envoyer ses requêtes à :
http://localhost:3001/api

Les adresses locales autorisées sont localhost et 127.0.0.1
sur les ports 5173 et 3000.

## Limites du projet

Le fichier JSON contient un seul budget et une liste de dépenses.
Toutes les dépenses sont comptées, sans séparation automatique
par mois. Il faut lancer une seule instance du backend à la fois.
