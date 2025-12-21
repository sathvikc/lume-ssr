/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from '../../../src/index.js';
import { TodoItem } from './TodoItem.jsx';

export const TodoList = ({ todos }) => {
    const activeTodos = todos.filter(t => !t.done);
    const completedTodos = todos.filter(t => t.done);

    return (
        <div className="todo-app">
            <h1>📝 My Todo List</h1>
            <p className="subtitle">Server-side rendered, client-side hydrated with Lume.js</p>

            <div className="todo-input-section">
                <input
                    type="text"
                    data-bind="newTodo"
                    placeholder="What needs to be done?"
                    className="todo-input"
                />
                <button id="add-todo-btn" className="btn btn-primary">
                    ➕ Add Todo
                </button>
            </div>

            {todos.length > 0 ? (
                <>
                    <div className="todo-filters">
                        <button className="filter-btn active" onclick="filterTodos('all')">
                            All ({todos.length})
                        </button>
                        <button className="filter-btn" onclick="filterTodos('active')">
                            Active ({activeTodos.length})
                        </button>
                        <button className="filter-btn" onclick="filterTodos('completed')">
                            Completed ({completedTodos.length})
                        </button>
                    </div>

                    <ul className="todo-list" id="todo-list">
                        {todos.map((todo, i) => (
                            <TodoItem todo={todo} index={i} key={i} />
                        ))}
                    </ul>

                    <div className="todo-stats">
                        <div className="stats-left">
                            <span className="stat-item">
                                <strong>{activeTodos.length}</strong> active
                            </span>
                            <span className="stat-item">
                                <strong>{completedTodos.length}</strong> completed
                            </span>
                        </div>
                        <button className="btn-clear" onclick="clearCompleted()">
                            🗑️ Clear completed
                        </button>
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <p>✨ No todos yet. Add one above to get started!</p>
                </div>
            )}

            <style>{`
        .todo-app {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { margin: 0 0 0.5rem 0; color: #2c3e50; }
        .subtitle { color: #7f8c8d; margin: 0 0 2rem 0; font-size: 0.9rem; }
        .todo-input-section {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .todo-input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #ecf0f1;
          border-radius: 8px;
          font-size: 1rem;
        }
        .todo-input:focus {
          outline: none;
          border-color: #3498db;
        }
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #3498db;
          color: white;
        }
        .btn-primary:hover {
          background: #2980b9;
        }
        .todo-filters {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .filter-btn {
          flex: 1;
          padding: 0.5rem;
          border: 2px solid #ecf0f1;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn.active {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }
        .filter-btn:hover:not(.active) {
          border-color: #3498db;
        }
        .todo-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem 0;
        }
        .todo-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border: 2px solid #ecf0f1;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }
        .todo-item:hover {
          border-color: #3498db;
        }
        .todo-item.done {
          opacity: 0.6;
        }
        .todo-item.done .todo-text {
          text-decoration: line-through;
        }
        .todo-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        .todo-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .todo-text {
          font-size: 1rem;
          color: #2c3e50;
        }
        .todo-due-date {
          font-size: 0.85rem;
          color: #7f8c8d;
        }
        .todo-priority {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        .priority-high {
          background: #e74c3c;
          color: white;
        }
        .priority-medium {
          background: #f39c12;
          color: white;
        }
        .priority-low {
          background: #95a5a6;
          color: white;
        }
        .delete-btn {
          padding: 0.5rem;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .delete-btn:hover {
          background: #c0392b;
        }
        .todo-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #ecf0f1;
          border-radius: 8px;
        }
        .stats-left {
          display: flex;
          gap: 1rem;
        }
        .stat-item {
          color: #7f8c8d;
        }
        .btn-clear {
          padding: 0.5rem 1rem;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-clear:hover {
          background: #c0392b;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #95a5a6;
        }
        .empty-state p {
          font-size: 1.2rem;
          margin: 0;
        }
      `}</style>
        </div>
    );
};
