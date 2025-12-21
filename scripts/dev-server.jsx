/** @jsx h */
/** @jsxFrag Fragment */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderToString, h, Fragment } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from examples
app.use('/public', express.static(path.join(rootDir, 'examples')));

// Dashboard component
const Dashboard = ({ isDevMode = false }) => {
  const examples = [
    {
      id: '01-basic',
      title: '01. Basic Example',
      description: 'Simple server rendering static components with no client-side hydration.',
      status: 'SSR'
    },
    {
      id: '02-todo-lume',
      title: '02. Lume.js Hydration',
      description: 'Enhanced todo app with priorities, filters, and Lume.js reactivity.',
      status: 'SSR + Lume.js'
    },
    {
      id: '03-todo-alpine',
      title: '03. Alpine.js Hydration',
      description: 'Todo app using Alpine.js directives for declarative client-side logic.',
      status: 'SSR + Alpine.js'
    },
    {
      id: '04-todo-vanilla',
      title: '04. Vanilla JS Hydration',
      description: 'Todo app using plain JavaScript for manual DOM manipulation.',
      status: 'SSR + Vanilla JS'
    },
    {
      id: '05-static',
      title: '05. Static Site Generation',
      description: 'Multi-page static site with navigation (build only).',
      status: 'SSG'
    },
    {
      id: '06-blog',
      title: '06. Blog with Markdown',
      description: 'Static blog generated from markdown files (build only).',
      status: 'SSG + Markdown'
    }
  ];

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Lume-SSR Examples{isDevMode ? ' - Dev Server' : ''}</title>
        <style>{`
          body { 
            font-family: system-ui, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 2rem; 
            background: #f4f4f9; 
          }
          h1 { 
            color: #333; 
            text-align: center; 
            margin-bottom: 2rem; 
          }
          .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 1.5rem; 
          }
          .card { 
            background: white; 
            padding: 1.5rem; 
            border-radius: 8px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            transition: transform 0.2s; 
          }
          .card:hover { 
            transform: translateY(-5px); 
          }
          .card h2 { 
            margin-top: 0; 
            color: #2c3e50; 
          }
          .card p { 
            color: #666; 
            line-height: 1.5; 
          }
          .btn { 
            display: inline-block; 
            background: #3498db; 
            color: white; 
            padding: 0.5rem 1rem; 
            text-decoration: none; 
            border-radius: 4px; 
            margin-top: 1rem; 
          }
          .btn:hover { 
            background: #2980b9; 
          }
          .btn.disabled { 
            background: #95a5a6; 
            cursor: not-allowed; 
          }
          .status { 
            display: inline-block; 
            padding: 0.25rem 0.5rem; 
            border-radius: 4px; 
            font-size: 0.875rem; 
            font-weight: bold; 
            margin-bottom: 1rem; 
            background: #e8f5e9; 
            color: #2e7d32; 
          }
          .note {
            font-size: 0.875rem;
            color: #95a5a6;
            margin-top: 0.5rem;
          }
        `}</style>
      </head>
      <body>
        <h1>🚀 Lume-SSR Examples{isDevMode ? ' (Dev Server)' : ''}</h1>
        <div className="grid">
          {examples.map(example => (
            <div className="card" key={example.id}>
              <span className="status">{example.status}</span>
              <h2>{example.title}</h2>
              <p>{example.description}</p>
              {(example.id === '05-static' || example.id === '06-blog') ? (
                <>
                  <span className="btn disabled">Build Only</span>
                  <p className="note">Run npm run build:examples to generate</p>
                </>
              ) : (
                <a href={`/${example.id}`} className="btn">View Demo →</a>
              )}
            </div>
          ))}
        </div>
      </body>
    </html>
  );
};

// Dashboard - Landing page
app.get('/', (req, res) => {
    const html = renderToString(<Dashboard isDevMode={true} />);
    res.send(html);
});

// 01-basic
app.get('/01-basic', async (req, res) => {
    const { Layout, Heading, Card, List, Button } = await import('../examples/01-basic/components.jsx');
    const items = ['Item 1', 'Item 2', 'Item 3'];

    const App = () => (
        <Layout title="Basic Example">
            <Heading level={1}>Welcome to Lume-SSR</Heading>
            <Card
                title="Card Title"
                content={<p>This is some content inside a card.</p>}
                footer={<Button onClick="alert('Clicked!')">Click Me</Button>}
            />
            <Heading level={2}>List Example</Heading>
            <List
                items={items}
                renderItem={(item) => <span>{item}</span>}
            />
        </Layout>
    );

    const html = renderToString(<App />);
    res.send(html);
});

// 02-todo-lume
app.use('/02-todo-lume/public', express.static(path.join(rootDir, 'examples/02-todo-lume/public')));

let todos = [
    { text: 'Learn Lume-SSR', done: false, priority: 'high', dueDate: new Date(Date.now() + 86400000).toISOString() },
    { text: 'Build awesome apps', done: false, priority: 'medium' },
    { text: 'Read documentation', done: true, priority: 'low' },
    { text: 'Try client-side hydration', done: false, priority: 'high' }
];

app.get('/02-todo-lume', async (req, res) => {
    const { App } = await import('../examples/02-todo-lume/components/App.jsx');

    const state = {
        todos,
        newTodo: ''
    };

    const html = renderToString(<App todos={todos} />);

    // Inject state and client script
    const fullHtml = html.replace(
        '</body>',
        `
      <script>window.__STATE__ = ${JSON.stringify(state)};</script>
      <script type="module" src="/02-todo-lume/public/client.js"></script>
    </body>
    `
    );

    res.send(fullHtml);
});

// 03-todo-alpine
app.get('/03-todo-alpine', async (req, res) => {
    const alpineTodos = [
        { text: 'Learn Lume-SSR', done: false },
        { text: 'Build awesome apps', done: false }
    ];

    const TodoApp = ({ todos }) => (
        <div x-data={`{ todos: ${JSON.stringify(todos)}, newTodo: '' }`}>
            <h1>Todos (Alpine.js)</h1>

            <ul>
                <template x-for="(todo, i) in todos" x-bind:key="i">
                    <li>
                        <input type="checkbox" x-model="todo.done" />
                        <span x-text="todo.text" x-bind:class="{ 'done': todo.done }"></span>
                    </li>
                </template>
            </ul>

            <input x-model="newTodo" placeholder="Add todo" />
            <button x-on:click="if(newTodo.trim()) { todos.push({ text: newTodo, done: false }); newTodo = ''; }">
                Add
            </button>

            <style>{`
                .done { text-decoration: line-through; color: #888; }
            `}</style>
        </div>
    );

    const html = renderToString(<TodoApp todos={alpineTodos} />);

    const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Todo App (Alpine.js)</title>
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

    res.send(fullHtml);
});

// 04-todo-vanilla
app.get('/04-todo-vanilla', (req, res) => {
    const vanillaTodos = [
        { text: 'Learn Lume-SSR', done: false },
        { text: 'Build awesome apps', done: false }
    ];

    const TodoApp = ({ todos }) => (
        <div id="app">
            <h1>Todos (Vanilla JS)</h1>

            <ul id="todo-list">
                {todos.map((todo, i) => (
                    <li key={i}>
                        <span className={todo.done ? 'done' : ''}>{todo.text}</span>
                    </li>
                ))}
            </ul>

            <input id="new-todo" placeholder="Add todo" />
            <button id="add-btn">Add</button>

            <style>{`
                .done { text-decoration: line-through; color: #888; }
            `}</style>
        </div>
    );

    const html = renderToString(<TodoApp todos={vanillaTodos} />);

    const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Todo App (Vanilla JS)</title>
      </head>
      <body>
        ${html}
        <script>
          document.getElementById('add-btn').onclick = () => {
            const input = document.getElementById('new-todo');
            const list = document.getElementById('todo-list');
            
            if (input.value.trim()) {
              const li = document.createElement('li');
              const span = document.createElement('span');
              span.textContent = input.value;
              li.appendChild(span);
              list.appendChild(li);
              
              input.value = '';
            }
          };
        </script>
      </body>
    </html>
  `;

    res.send(fullHtml);
});

app.listen(port, () => {
    console.log(`\n🚀 Lume-SSR Dev Server running at http://localhost:${port}`);
    console.log(`\n📋 Available examples:`);
    console.log(`   http://localhost:${port}/01-basic`);
    console.log(`   http://localhost:${port}/02-todo-lume`);
    console.log(`   http://localhost:${port}/03-todo-alpine`);
    console.log(`   http://localhost:${port}/04-todo-vanilla`);
    console.log(`\n💡 Tip: Visit http://localhost:${port} for the dashboard`);
    console.log(`\n📦 Note: Examples 05-static and 06-blog are static generation only.`);
    console.log(`   Run 'npm run build:examples' to generate them.\n`);
});
