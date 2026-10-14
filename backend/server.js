const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, "data.json");

const categories = [
  "Logement",
  "Nourriture",
  "Transport",
  "Études",
  "Loisirs",
  "Autres"
];

// Autoriser le frontend local à communiquer avec le backend.
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ]
}));

// Comprendre les données JSON envoyées au serveur.
app.use(express.json({ limit: "20kb" }));

// Vérifier un montant : nombre, deux décimales maximum.
function validAmount(amount, allowZero = false) {
  return (
    typeof amount === "number" &&
    Number.isFinite(amount) &&
    (allowZero ? amount >= 0 : amount > 0) &&
    amount <= 1000000000 &&
    Math.abs(amount * 100 - Math.round(amount * 100)) < 0.00001
  );
}

// Vérifier une date réelle au format AAAA-MM-JJ.
function validDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(value + "T00:00:00Z");

  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

// Retourner un message si une dépense est invalide.
function validateExpense(expense) {
  if (
    !expense ||
    typeof expense !== "object" ||
    Array.isArray(expense)
  ) {
    return "Les données de la dépense sont requises.";
  }

  if (
    typeof expense.description !== "string" ||
    expense.description.trim().length === 0 ||
    expense.description.trim().length > 150
  ) {
    return "La description doit contenir entre 1 et 150 caractères.";
  }

  if (!validAmount(expense.amount)) {
    return "Le montant doit être positif, avec deux décimales maximum.";
  }

  if (!categories.includes(expense.category)) {
    return "La catégorie est invalide.";
  }

  if (!validDate(expense.date)) {
    return "La date doit être valide et au format AAAA-MM-JJ.";
  }

  return null;
}

// Lire et vérifier le fichier JSON.
function readData() {
  const content = fs.readFileSync(DATA_FILE, "utf8");
  const data = JSON.parse(content);

  if (
    !data ||
    !validAmount(data.monthlyBudget, true) ||
    !Array.isArray(data.expenses)
  ) {
    throw new Error("Structure du fichier JSON invalide.");
  }

  const ids = new Set();

  for (const expense of data.expenses) {
    if (
      validateExpense(expense) ||
      !Number.isSafeInteger(expense.id) ||
      expense.id <= 0 ||
      ids.has(expense.id)
    ) {
      throw new Error("Dépense invalide dans le fichier JSON.");
    }

    ids.add(expense.id);
  }

  return data;
}

// Écrire dans un fichier temporaire avant de remplacer le JSON.
function saveData(data) {
  const temporaryFile = DATA_FILE + ".tmp";

  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(data, null, 2) + "\n",
    "utf8"
  );

  fs.renameSync(temporaryFile, DATA_FILE);
}

// Garder uniquement les champs attendus.
function expenseFields(body) {
  return {
    description: body.description.trim(),
    amount: body.amount,
    category: body.category,
    date: body.date
  };
}

// Convertir l'identifiant présent dans l'adresse.
function getId(req) {
  const value = req.params.id;

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Route d'accueil.
app.get("/", (req, res) => {
  res.send("Bienvenue sur le backend Student Budget Tracker !");
});

// Consulter toutes les dépenses.
app.get("/api/expenses", (req, res) => {
  const data = readData();
  res.json(data.expenses);
});

// Consulter une dépense par son identifiant.
app.get("/api/expenses/:id", (req, res) => {
  const data = readData();
  const expense = data.expenses.find(
    expense => expense.id === getId(req)
  );

  if (!expense) {
    return res.status(404).json({
      error: "Dépense introuvable."
    });
  }

  res.json(expense);
});

// Ajouter une dépense.
app.post("/api/expenses", (req, res) => {
  const error = validateExpense(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const data = readData();

  const highestId = data.expenses.reduce(
    (maximum, expense) => Math.max(maximum, expense.id),
    0
  );

  if (highestId === Number.MAX_SAFE_INTEGER) {
    return res.status(409).json({
      error: "Impossible de générer un nouvel identifiant."
    });
  }

  const newExpense = {
    id: highestId + 1,
    ...expenseFields(req.body)
  };

  data.expenses.push(newExpense);
  saveData(data);

  res.status(201).json(newExpense);
});

// Modifier une dépense : tous les champs sont requis.
app.put("/api/expenses/:id", (req, res) => {
  const data = readData();
  const index = data.expenses.findIndex(
    expense => expense.id === getId(req)
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Dépense introuvable."
    });
  }

  const error = validateExpense(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const updatedExpense = {
    id: data.expenses[index].id,
    ...expenseFields(req.body)
  };

  data.expenses[index] = updatedExpense;
  saveData(data);

  res.json(updatedExpense);
});

// Supprimer une dépense.
app.delete("/api/expenses/:id", (req, res) => {
  const data = readData();
  const index = data.expenses.findIndex(
    expense => expense.id === getId(req)
  );

  if (index === -1) {
    return res.status(404).json({
      error: "Dépense introuvable."
    });
  }

  data.expenses.splice(index, 1);
  saveData(data);

  res.status(204).end();
});

// Consulter le budget.
app.get("/api/budget", (req, res) => {
  const data = readData();

  res.json({
    monthlyBudget: data.monthlyBudget
  });
});

// Modifier le budget.
app.put("/api/budget", (req, res) => {
  const monthlyBudget = req.body?.monthlyBudget;

  if (!validAmount(monthlyBudget, true)) {
    return res.status(400).json({
      error: "Le budget doit être positif ou nul, avec deux décimales maximum."
    });
  }

  const data = readData();
  data.monthlyBudget = monthlyBudget;
  saveData(data);

  res.json({
    monthlyBudget: data.monthlyBudget
  });
});

// Signaler les routes qui n'existent pas.
app.use((req, res) => {
  res.status(404).json({
    error: "Route introuvable."
  });
});

// Gérer les erreurs de JSON et de stockage.
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Le JSON envoyé est invalide."
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "Les données envoyées sont trop volumineuses."
    });
  }

  console.error(error.message);

  res.status(500).json({
    error: "Impossible de lire ou d'enregistrer les données."
  });
});

// Vérifier les données avant de démarrer le serveur.
try {
  readData();

  app.listen(PORT, "127.0.0.1", () => {
    console.log(
      `Serveur démarré sur http://localhost:${PORT}`
    );
  });
} catch (error) {
  console.error("Démarrage impossible :", error.message);
  process.exitCode = 1;
}