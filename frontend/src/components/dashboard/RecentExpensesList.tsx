import { useState } from 'react';
import './dashboard-widgets.css';

export type RecentExpense = {
  id: string;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
};

type RecentExpensesListProps = {
  title: string;
  expenses: RecentExpense[];
};

export function RecentExpensesList({ title, expenses }: RecentExpensesListProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleExpenses = showAll ? expenses : expenses.slice(0, 10);

  return (
    <article className="card border-0 shadow-sm dashboard-widget-card">
      <div className="card-body">
        <h2 className="h5 mb-3">{title}</h2>
        <div className="dashboard-recent-expenses">
          {expenses.length === 0 ? (
            <p className="text-muted small">No hay gastos registrados</p>
          ) : (
            visibleExpenses.map(expense => (
              <div key={expense.id} className="border-bottom pb-2 mb-2">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-0 small fw-500">{expense.descripcion}</p>
                    <small className="text-muted">{expense.categoria}</small>
                  </div>
                  <div className="text-end">
                    <p className="mb-0 small fw-bold text-danger">-${expense.monto.toFixed(2)}</p>
                    <small className="text-muted">{expense.fecha}</small>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-3">
          {!showAll && expenses.length > 0 && (
            <button className="btn btn-sm btn-outline-primary w-100" onClick={() => setShowAll(true)}>
              Ver todos los gastos
            </button>
          )}
          {showAll && (
            <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setShowAll(false)}>
              Mostrar menos
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
