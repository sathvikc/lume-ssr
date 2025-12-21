/** @jsx h */
import { h } from '../../../src/index.js';
import { TodoList } from './TodoList.jsx';

export const App = ({ todos }) => (
    <html lang="en">
        <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Todo App - Lume.js</title>
            <style>{`
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
      `}</style>
        </head>
        <body>
            <TodoList todos={todos} />
        </body>
    </html>
);
