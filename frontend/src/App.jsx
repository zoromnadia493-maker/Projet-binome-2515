import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:3001/api';

const categories = [
  'Nourriture',
  'Transport',
  'Études',
  'Logement',
  'Loisirs',
  'Autres',
];

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function money(amount) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

async function request(route, method = 'GET', data) {
  const options = { method };

  if (data !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API}${route}`, options);

  if (response.status === 204) {
    return null;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'La requête a échoué.');
  }

  return result;
}

function App() {
  const [budget, setBudget] = useState(0);
  const [budgetInput, setBudgetInput] = useState('');
  const [expenses, setExpenses] = useState([]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Nourriture');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [expensesData, budgetData] = await Promise.all([
          request('/expenses'),
          request('/budget'),
        ]);

        if (active) {
          setExpenses(expensesData);
          setBudget(budgetData.monthlyBudget);
          setBudgetInput(String(budgetData.monthlyBudget));
        }
      } catch (error) {
        if (active) {
          setError(`Chargement impossible : ${error.message}`);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Calculer en centimes pour éviter les erreurs de décimales.
  const totalCents = expenses.reduce(
    (total, expense) => total + Math.round(expense.amount * 100),
    0
  );

  const totalExpenses = totalCents / 100;
  const remainingBalance =
    (Math.round(budget * 100) - totalCents) / 100;

  // Les filtres changent la liste, pas les totaux.
  const visibleExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase());

    const matchesCategory =
      categoryFilter === '' || expense.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  function resetForm() {
    setName('');
    setCategory('Nourriture');
    setAmount('');
    setDate(today());
    setEditingId(null);
  }

  async function saveExpense(event) {
    event.preventDefault();

    if (busy) return;

    setError('');
    setMessage('');

    const numericAmount = Number(amount);

    if (
      !name.trim() ||
      !amount ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !date
    ) {
      setError('Remplis les champs avec un montant positif.');
      return;
    }

    const expenseData = {
      description: name.trim(),
      amount: numericAmount,
      category,
      date,
    };

    setBusy(true);

    try {
      const isEditing = editingId !== null;

      const savedExpense = await request(
        isEditing ? `/expenses/${editingId}` : '/expenses',
        isEditing ? 'PUT' : 'POST',
        expenseData
      );

      setExpenses((current) =>
        isEditing
          ? current.map((expense) =>
              expense.id === savedExpense.id ? savedExpense : expense
            )
          : [...current, savedExpense]
      );

      resetForm();

      setMessage(
        isEditing ? 'Dépense modifiée.' : 'Dépense ajoutée.'
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  function editExpense(expense) {
    setEditingId(expense.id);
    setName(expense.description);
    setCategory(expense.category);
    setAmount(String(expense.amount));
    setDate(expense.date);
    setError('');
    setMessage('');

    document.getElementById('add-expense')?.scrollIntoView({
      behavior: 'smooth',
    });
  }

  async function deleteExpense(expense) {
    if (busy) return;

    if (!window.confirm(`Supprimer « ${expense.description} » ?`)) {
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      await request(`/expenses/${expense.id}`, 'DELETE');

      setExpenses((current) =>
        current.filter((item) => item.id !== expense.id)
      );

      if (editingId === expense.id) {
        resetForm();
      }

      setMessage('Dépense supprimée.');
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveBudget(event) {
    event.preventDefault();

    if (busy) return;

    setError('');
    setMessage('');

    const numericBudget = Number(budgetInput);

    if (
      budgetInput === '' ||
      !Number.isFinite(numericBudget) ||
      numericBudget < 0
    ) {
      setError('Le budget doit être un nombre positif ou nul.');
      return;
    }

    setBusy(true);

    try {
      const result = await request('/budget', 'PUT', {
        monthlyBudget: numericBudget,
      });

      setBudget(result.monthlyBudget);
      setBudgetInput(String(result.monthlyBudget));
      setMessage('Budget enregistré.');
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  const progress =
    budget > 0
      ? Math.min((totalExpenses / budget) * 100, 100)
      : totalExpenses > 0
        ? 100
        : 0;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">💜 BudgetBuddy</h2>

        <nav>
          <a href="#dashboard" className="nav-link active">
            🏠 Dashboard
          </a>
          <a href="#expenses" className="nav-link">
            💳 My Expenses
          </a>
          <a href="#budget" className="nav-link">
            💰 My Budget
          </a>
        </nav>

        <div className="sidebar-footer">
          <p>Student Budget Tracker</p>
          <small>Manage your money wisely.</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <p className="eyebrow">YOUR PERSONAL FINANCE SPACE</p>
            <h1>Student Dashboard</h1>
            <p className="subtitle">
              Take control of your money, one day at a time.
            </p>
          </div>

          <div className="profile">
            <span className="profile-icon">🎓</span>
            <div>
              <strong>Student</strong>
              <small>Budget tracker</small>
            </div>
          </div>
        </header>

        {error && (
          <div className="panel" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              disabled={busy}
            >
              Reload
            </button>
          </div>
        )}

        {message && <p role="status">{message}</p>}

        {loading ? (
          <p role="status">Loading data...</p>
        ) : (
          <>
            <section className="summary-grid" id="dashboard">
              <div className="summary-card budget-card">
                <div className="card-top">
                  <span>Monthly Budget</span>
                  <span className="card-icon">💰</span>
                </div>
                <h2>{money(budget)}</h2>
                <p>Your planned monthly spending</p>
              </div>

              <div className="summary-card expense-card">
                <div className="card-top">
                  <span>Total Expenses</span>
                  <span className="card-icon">💳</span>
                </div>
                <h2>{money(totalExpenses)}</h2>
                <p>All recorded expenses</p>
              </div>

              <div className="summary-card balance-card">
                <div className="card-top">
                  <span>Remaining Balance</span>
                  <span className="card-icon">✨</span>
                </div>
                <h2>{money(remainingBalance)}</h2>
                <p>Money left in your budget</p>
              </div>
            </section>

            {remainingBalance < 0 && (
              <p role="alert" className="budget-tip">
                ⚠️ You have exceeded your budget by{' '}
                {money(-remainingBalance)}.
              </p>
            )}

            <section className="content-grid">
              <div className="panel" id="budget">
                <div className="panel-heading">
                  <div>
                    <h2>Monthly Budget</h2>
                    <p>Set your spending limit</p>
                  </div>
                  <span className="panel-icon">🎯</span>
                </div>

                <form onSubmit={saveBudget}>
                  <label htmlFor="budget-input">Your budget ($)</label>

                  <input
                    id="budget-input"
                    type="number"
                    min="0"
                    max="1000000000"
                    step="0.01"
                    value={budgetInput}
                    onChange={(event) =>
                      setBudgetInput(event.target.value)
                    }
                    required
                    disabled={busy}
                  />

                  <button
                    type="submit"
                    className="add-button"
                    disabled={busy}
                  >
                    Save Budget
                  </button>
                </form>

                <div className="progress-info">
                  <span>Budget used</span>
                  <strong>
                    {budget > 0
                      ? `${Math.round(
                          (totalExpenses / budget) * 100
                        )}%`
                      : totalExpenses > 0
                        ? 'Over budget'
                        : '0%'}
                  </strong>
                </div>

                <div className="progress-bar">
                  <div
                    className={`progress-fill ${
                      remainingBalance < 0 ? 'over-budget' : ''
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="budget-tip">
                  {remainingBalance >= 0
                    ? '🌱 Your expenses are within your budget.'
                    : '⚠️ You have exceeded your monthly budget.'}
                </p>
              </div>

              <div className="panel" id="add-expense">
                <div className="panel-heading">
                  <div>
                    <h2>
                      {editingId === null
                        ? 'Add an Expense'
                        : 'Edit Expense'}
                    </h2>
                    <p>Record or update a purchase</p>
                  </div>
                  <span className="panel-icon">➕</span>
                </div>

                <form
                  onSubmit={saveExpense}
                  className="expense-form"
                >
                  <div className="form-group">
                    <label htmlFor="expense-name">Expense name</label>
                    <input
                      id="expense-name"
                      type="text"
                      maxLength="150"
                      placeholder="e.g. Coffee, groceries..."
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      required
                      disabled={busy}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        value={category}
                        onChange={(event) =>
                          setCategory(event.target.value)
                        }
                        disabled={busy}
                      >
                        {categories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="amount">Amount ($)</label>
                      <input
                        id="amount"
                        type="number"
                        min="0.01"
                        max="1000000000"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(event) =>
                          setAmount(event.target.value)
                        }
                        required
                        disabled={busy}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="expense-date">Date</label>
                    <input
                      id="expense-date"
                      type="date"
                      value={date}
                      onChange={(event) =>
                        setDate(event.target.value)
                      }
                      required
                      disabled={busy}
                    />
                  </div>

                  <button
                    type="submit"
                    className="add-button"
                    disabled={busy}
                  >
                    {busy
                      ? 'Please wait...'
                      : editingId === null
                        ? '+ Add Expense'
                        : 'Save Changes'}
                  </button>

                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Expenses by Category</h2>
                  <p>Totals include all recorded expenses.</p>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((item) => {
                      const categoryTotal =
                        expenses
                          .filter(
                            (expense) => expense.category === item
                          )
                          .reduce(
                            (total, expense) =>
                              total +
                              Math.round(expense.amount * 100),
                            0
                          ) / 100;

                      return (
                        <tr key={item}>
                          <td>{item}</td>
                          <td className="amount-cell">
                            {money(categoryTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section
              className="panel expenses-panel"
              id="expenses"
            >
              <div className="panel-heading">
                <div>
                  <h2>My Expenses</h2>
                  <p>Search and manage your expenses</p>
                </div>
                <span className="expense-count">
                  {visibleExpenses.length} expenses
                </span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="search">Search by description</label>
                  <input
                    id="search"
                    type="search"
                    placeholder="Search..."
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category-filter">
                    Filter by category
                  </label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(event.target.value)
                    }
                  >
                    <option value="">All categories</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p>
                Filters only change the list. Budget totals stay
                the same.
              </p>

              {visibleExpenses.length === 0 ? (
                <div className="empty-state">
                  <span>🧾</span>
                  <p>No expenses to display.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Expense</th>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>
                            <div className="expense-name">
                              <span className="expense-dot">●</span>
                              {expense.description}
                            </div>
                          </td>
                          <td>{expense.date}</td>
                          <td>
                            <span className="category-badge">
                              {expense.category}
                            </span>
                          </td>
                          <td className="amount-cell">
                            {money(expense.amount)}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => editExpense(expense)}
                              disabled={busy}
                              aria-label={`Edit ${expense.description}`}
                            >
                              Edit
                            </button>{' '}
                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => deleteExpense(expense)}
                              disabled={busy}
                              aria-label={`Delete ${expense.description}`}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        <footer className="footer">
          Made for students, with 💜 · Student Budget Tracker
          <p>Amounts in Canadian dollars.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
