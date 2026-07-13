// Import Lume from CDN using ES modules
import { state, bindDom } from 'https://cdn.jsdelivr.net/npm/lume-js/src/index.js';

// Create reactive store from server state (emitted by serializeState())
const initialState = JSON.parse(document.getElementById('__lume_state__').textContent);
const store = state({
    todos: initialState.todos || [],
    newTodo: initialState.newTodo || ''
});

// Bind newTodo input to DOM
bindDom(document.body, store);

// Function to render todos list
function renderTodos() {
    const list = document.getElementById('todo-list');
    if (!list) return;

    const activeTodos = store.todos.filter(t => !t.done);
    const completedTodos = store.todos.filter(t => t.done);

    list.innerHTML = store.todos.map((todo, i) => `
        <li class="todo-item ${todo.done ? 'done' : ''}" data-index="${i}">
            <input
                type="checkbox"
                ${todo.done ? 'checked' : ''}
                class="todo-checkbox"
                data-todo-index="${i}"
            />
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                ${todo.dueDate ? `<span class="todo-due-date">Due: ${new Date(todo.dueDate).toLocaleDateString()}</span>` : ''}
                ${todo.priority ? `<span class="todo-priority priority-${todo.priority}">${todo.priority}</span>` : ''}
            </div>
            <button
                class="delete-btn"
                data-todo-index="${i}"
                title="Delete todo"
            >
                ✕
            </button>
        </li>
    `).join('');

    // Update counters
    document.querySelectorAll('.stat-item strong').forEach((el, i) => {
        el.textContent = i === 0 ? activeTodos.length : completedTodos.length;
    });

    // Update filter buttons
    const allBtn = document.querySelectorAll('.filter-btn')[0];
    const activeBtn = document.querySelectorAll('.filter-btn')[1];
    const completedBtn = document.querySelectorAll('.filter-btn')[2];
    if (allBtn) allBtn.textContent = `All (${store.todos.length})`;
    if (activeBtn) activeBtn.textContent = `Active (${activeTodos.length})`;
    if (completedBtn) completedBtn.textContent = `Completed (${completedTodos.length})`;

    // Re-attach event listeners
    attachTodoListeners();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function attachTodoListeners() {
    // Checkbox toggles
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.todoIndex);
            // Create new array with updated todo object (immutable pattern)
            store.todos = store.todos.map((todo, i) =>
                i === index ? { ...todo, done: e.target.checked } : todo
            );
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.todoIndex);
            store.todos = store.todos.filter((_, i) => i !== index);
        });
    });
}

// Subscribe to todos changes
store.$subscribe('todos', () => {
    renderTodos();
});

// Add todo functionality
const addBtn = document.getElementById('add-todo-btn');
if (addBtn) {
    addBtn.addEventListener('click', () => {
        if (store.newTodo.trim()) {
            store.todos = [...store.todos, {
                text: store.newTodo,
                done: false,
                priority: 'medium'
            }];
            store.newTodo = '';
        }
    });
}

// Enter key to add todo
const todoInput = document.querySelector('.todo-input');
if (todoInput) {
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
        }
    });
}

// Clear completed
window.clearCompleted = () => {
    store.todos = store.todos.filter(t => !t.done);
};

// Filter todos
window.filterTodos = (filter) => {
    const list = document.getElementById('todo-list');
    const items = list.querySelectorAll('.todo-item');
    const buttons = document.querySelectorAll('.filter-btn');

    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filter items
    items.forEach((item, index) => {
        const todo = store.todos[index];
        if (filter === 'all') {
            item.style.display = 'flex';
        } else if (filter === 'active') {
            item.style.display = todo.done ? 'none' : 'flex';
        } else if (filter === 'completed') {
            item.style.display = todo.done ? 'flex' : 'none';
        }
    });
};

// Initial render
renderTodos();
