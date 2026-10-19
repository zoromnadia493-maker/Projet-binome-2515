# React + Vite
# Student Budget Tracker

Projet en binôme — SED2515
Chamsiya Abdoul Samad et Nadia Zorom

Notre application permet de gérer un budget étudiant,
d’enregistrer des dépenses et de consulter le montant restant.

## Technologies utilisées

- React et Vite pour le frontend.
- Node.js et Express pour le backend.
- Un fichier JSON pour conserver les données.

## Fonctionnalités

- Consulter et modifier le budget.
- Ajouter, modifier et supprimer une dépense.
- Rechercher une dépense par sa description.
- Filtrer les dépenses par catégorie.
- Consulter les totaux par catégorie et le solde restant.
- Afficher un avertissement si le budget est dépassé.

Les filtres changent uniquement la liste affichée.
Les totaux restent calculés sur toutes les dépenses.

## Installation et lancement

Il faut avoir Node.js et npm installés.
Nous avons utilisé Node.js 24.

Télécharger le projet depuis GitHub et décompresser le ZIP.

### 1. Lancer le backend

Ouvrir un terminal dans le dossier principal du projet :

    cd backend
    npm install
    node server.js

Le backend démarre sur :
http://localhost:3001

### 2. Lancer le frontend

Ouvrir un deuxième terminal dans le dossier principal :

    cd frontend
    npm install
    npm run dev

Ouvrir l’adresse affichée par Vite, normalement :
http://localhost:5173

Les deux serveurs doivent rester en marche.
Pour les arrêter, faire Ctrl + C dans chaque terminal.

Le frontend appelle le backend sur le port 3001.
Si le frontend démarre sur un autre port que 5173 ou 3000,
il faut adapter les adresses autorisées dans backend/server.js.

## Organisation du projet

- backend/server.js : serveur, routes API et validation.
- backend/data.json : budget et dépenses enregistrées.
- backend/README.md : documentation du backend.
- frontend/src/App.jsx : interface et appels à l’API.
- frontend/src/App.css : styles de l’interface.
- frontend/src/index.css : styles généraux.

Les commandes de lancement doivent être exécutées dans
backend et frontend, même si des fichiers de configuration
sont aussi présents à la racine du dépôt.

## Source des données

Le fichier utilisé est backend/data.json.
Il contient un budget et une liste de dépenses fictives.

Chaque dépense possède :
- un identifiant ;
- une description ;
- un montant ;
- une catégorie ;
- une date.

Les modifications faites dans l’application sont enregistrées
par le backend dans ce fichier.

Les montants sont en dollars canadiens.
Le prototype utilise un seul budget et compte toutes les
dépenses enregistrées, sans séparation automatique par mois.

## Endpoints API

Adresse de base : http://localhost:3001

| Méthode | Route | Fonction |
| --- | --- | --- |
| GET | /api/expenses | Consulter toutes les dépenses |
| GET | /api/expenses/:id | Consulter une dépense |
| POST | /api/expenses | Ajouter une dépense |
| PUT | /api/expenses/:id | Modifier une dépense |
| DELETE | /api/expenses/:id | Supprimer une dépense |
| GET | /api/budget | Consulter le budget |
| PUT | /api/budget | Modifier le budget |

Pour ajouter ou modifier une dépense, envoyer du JSON :

    {
      "description": "Épicerie",
      "amount": 50,
      "category": "Nourriture",
      "date": "2026-10-01"
    }

Le serveur génère l’identifiant lors de l’ajout.
Pour une modification, tous les champs sont requis.

Pour modifier le budget :

    {
      "monthlyBudget": 1000
    }

Les catégories acceptées sont Nourriture, Transport, Études,
Logement, Loisirs et Autres.

## Validation et erreurs

Les dépenses doivent avoir un montant positif, une description
de 1 à 150 caractères, une catégorie acceptée et une date valide.
Le budget peut être égal à zéro.

Les montants acceptent deux décimales maximum et ne doivent
pas dépasser 1 milliard.

Principaux codes HTTP :
- 200 : consultation ou modification réussie.
- 201 : dépense ajoutée.
- 204 : dépense supprimée.
- 400 : données invalides.
- 404 : dépense ou route introuvable.
- 500 : problème de lecture ou d’enregistrement.

Les erreurs sont retournées sous la forme :

    {"error": "Message expliquant le problème"}

## Démo

L’application s’exécute localement.
Aucune démo en ligne n’est hébergée actuellement.

L’adresse localhost fonctionne uniquement sur l’ordinateur
où les serveurs sont lancés.
