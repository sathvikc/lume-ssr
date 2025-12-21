/** @jsx h */
import { h } from '../../../src/index.js';

export const TodoItem = ({ todo, index }) => (
    <li
        className={`todo-item ${todo.done ? 'done' : ''} ${todo.priority || ''}`}
    >
        <input
            type="checkbox"
            checked={todo.done}
            className="todo-checkbox"
        />
        <div className="todo-content">
            <span className="todo-text">{todo.text}</span>
            {todo.dueDate && (
                <span className="todo-due-date">Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
            )}
            {todo.priority && (
                <span className={`todo-priority priority-${todo.priority}`}>
                    {todo.priority}
                </span>
            )}
        </div>
        <button
            className="delete-btn"
            data-index={index}
            onclick={`deleteTodo(${index})`}
            title="Delete todo"
        >
            ✕
        </button>
    </li>
);
