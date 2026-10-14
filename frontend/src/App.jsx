import { useState } from 'react';
import './App.css';

function App() {
  const [budget, setBudget] = useState(1000);

  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Groceries', category: 'Food', amount: 120 },
    { id: 2, name: 'Bus Pass', category: 'Transport', amount: 90 },
    { id: 3, name: 'Textbooks', category: 'Education', amount: 80 },
  ]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const remainingBalance = budget - totalExpenses;

  const addExpense = (event) => {
    event.preventDefault();

    if (!name.trim() || !amount || Number(amount) <= 0) {
      alert('Please enter a valid expense name and amount.');
      return;
    }

    const newExpense = {
      id: Date.now(),
      name: name.trim(),
      category,
      amount: Number(amount),
    };

    setExpenses([...expenses, newExpense]);
    setName('');
    setCategory('Food');
    setAmount('');
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

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
              <small>My account</small>
            </div>
          </div>
        </header>

        <section className="summary-grid" id="dashboard">
          <div className="summary-card budget-card">
            <div className="card-top">
              <span>Monthly Budget</span>
              <span className="card-icon">💰</span>
            </div>
            <h2>${budget.toFixed(2)}</h2>
            <p>Your planned monthly spending</p>
          </div>

          <div className="summary-card expense-card">
            <div className="card-top">
              <span>Total Expenses</span>
              <span className="card-icon">💳</span>
            </div>
            <h2>${totalExpenses.toFixed(2)}</h2>
            <p>Money spent this month</p>
          </div>

          <div className="summary-card balance-card">
            <div className="card-top">
              <span>Remaining Balance</span>
              <span className="card-icon">✨</span>
            </div>
            <h2>${remainingBalance.toFixed(2)}</h2>
            <p>Money left in your budget</p>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel" id="budget">
            <div className="panel-heading">
              <div>
                <h2>Monthly Budget</h2>
                <p>Set your spending limit</p>
              </div>
              <span className="panel-icon">🎯</span>
            </div>

            <label htmlFor="budget">Your budget ($)</label>

            <input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(event) =>
                setBudget(Math.max(0, Number(event.target.value)))
              }
            />

            <div className="progress-info">
              <span>Budget used</span>
              <strong>
                {budget > 0
                  ? `${Math.round((totalExpenses / budget) * 100)}%`
                  : totalExpenses > 0
                    ? 'Over budget'
                    : '0%'}
              </strong>
            </div>

            <div className="progress-bar">
              <div
                className={`progress-fill ${
                  totalExpenses > budget ? 'over-budget' : ''
                }`}
                style={{
                  width: `${
                    budget > 0
                      ? Math.min((totalExpenses / budget) * 100, 100)
                      : 0
                  }%`,
                }}
              />
            </div>

            <p className="budget-tip">
              {remainingBalance >= 0
                ? '🌱 You are making progress. Keep it up!'
                : '⚠️ You have exceeded your monthly budget.'}
            </p>
          </div>

          <div className="panel" id="add-expense">
            <div className="panel-heading">
              <div>
                <h2>Add an Expense</h2>
                <p>Record a new purchase</p>
              </div>
              <span className="panel-icon">➕</span>
            </div>

            <form onSubmit={addExpense} className="expense-form">
              <div className="form-group">
                <label htmlFor="expense-name">Expense name</label>
                <input
                  id="expense-name"
                  type="text"
                  placeholder="e.g. Coffee, groceries..."
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Education">Education</option>
                    <option value="Housing">Housing</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Amount ($)</label>
                  <input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="add-button">
                + Add Expense
              </button>
            </form>
          </div>
        </section>

        <section className="panel expenses-panel" id="expenses">
          <div className="panel-heading">
            <div>
              <h2>Recent Expenses</h2>
              <p>Your latest spending activity</p>
            </div>
            <span className="expense-count">
              {expenses.length} expenses
            </span>
          </div>

          {expenses.length === 0 ? (
            <div className="empty-state">
              <span>🧾</span>
              <p>No expenses yet. Add your first expense above!</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>
                        <div className="expense-name">
                          <span className="expense-dot">●</span>
                          {expense.name}
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">
                          {expense.category}
                        </span>
                      </td>
                      <td className="amount-cell">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteExpense(expense.id)}
                          aria-label={`Delete ${expense.name}`}
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

        <footer className="footer">
          Made for students, with 💜 · Student Budget Tracker
        </footer>
      </main>
    </div>
  );
}

export default App;