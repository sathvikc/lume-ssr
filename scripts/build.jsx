/** @jsx h */
/** @jsxFrag Fragment */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderToString, h, Fragment, serializeState } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Clean and create dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

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
      description: 'Multi-page static site with navigation.',
      status: 'SSG'
    },
    {
      id: '06-blog',
      title: '06. Blog with Markdown',
      description: 'Static blog generated from markdown files.',
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
              <a href={`${example.id}/index.html`} className="btn">View Demo →</a>
            </div>
          ))}
        </div>
      </body>
    </html>
  );
};

// Build dashboard
function buildDashboard() {
  const html = renderToString(<Dashboard isDevMode={false} />);
  fs.writeFileSync(path.join(distDir, 'index.html'), `<!DOCTYPE html>\n${html}`);
  console.log('✓ Built dashboard');
}

// Build 01-basic example
async function buildBasicExample() {
  const { Layout, Heading, Card, List, Button } = await import('../examples/01-basic/components.jsx');
  
  const items = ['Item 1', 'Item 2', 'Item 3'];
  
  const App = () => h(Layout, { title: 'Basic Example' },
    h(Heading, { level: 1 }, 'Welcome to Lume-SSR'),
    h(Card, {
      title: 'Card Title',
      content: h('p', null, 'This is some content inside a card.'),
      footer: h(Button, { onClick: "alert('Clicked!')" }, 'Click Me')
    }),
    h(Heading, { level: 2 }, 'List Example'),
    h(List, {
      items: items,
      renderItem: (item) => h('span', null, item)
    })
  );

  const html = renderToString(<App />);
  
  const exampleDir = path.join(distDir, '01-basic');
  fs.mkdirSync(exampleDir, { recursive: true });
  fs.writeFileSync(path.join(exampleDir, 'index.html'), `<!DOCTYPE html>\n${html}`);
  
  console.log('✓ Built 01-basic');
}

// Build 02-todo-lume example
async function buildLumeExample() {
  const { App } = await import('../examples/02-todo-lume/components/App.jsx');
  
  const todos = [
    { text: 'Learn Lume-SSR', done: false, priority: 'high', dueDate: new Date(Date.now() + 86400000).toISOString() },
    { text: 'Build awesome apps', done: false, priority: 'medium' },
    { text: 'Read documentation', done: true, priority: 'low' },
    { text: 'Try client-side hydration', done: false, priority: 'high' }
  ];
  
  const state = { todos, newTodo: '' };
  const html = renderToString(<App todos={todos} />);
  
  // Inject state and client script
  const fullHtml = html.replace(
    '</body>',
    `
      ${serializeState(state)}
      <script type="module" src="client.js"></script>
    </body>
    `
  );
  
  const exampleDir = path.join(distDir, '02-todo-lume');
  fs.mkdirSync(exampleDir, { recursive: true });
  fs.writeFileSync(path.join(exampleDir, 'index.html'), `<!DOCTYPE html>\n${fullHtml}`);
  
  // Copy client.js
  fs.copyFileSync(
    path.join(rootDir, 'examples/02-todo-lume/public/client.js'),
    path.join(exampleDir, 'client.js')
  );
  
  console.log('✓ Built 02-todo-lume');
}

// Build 03-todo-alpine example
async function buildAlpineExample() {
  const todos = [
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
  
  const html = renderToString(<TodoApp todos={todos} />);
  
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
  
  const exampleDir = path.join(distDir, '03-todo-alpine');
  fs.mkdirSync(exampleDir, { recursive: true });
  fs.writeFileSync(path.join(exampleDir, 'index.html'), fullHtml);
  
  console.log('✓ Built 03-todo-alpine');
}

// Build 04-todo-vanilla example
async function buildVanillaExample() {
  const todos = [
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
  
  const html = renderToString(<TodoApp todos={todos} />);
  
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
  
  const exampleDir = path.join(distDir, '04-todo-vanilla');
  fs.mkdirSync(exampleDir, { recursive: true });
  fs.writeFileSync(path.join(exampleDir, 'index.html'), fullHtml);
  
  console.log('✓ Built 04-todo-vanilla');
}

// Build 05-static example
async function buildStaticExample() {
  const exampleSrcDir = path.join(rootDir, 'examples/05-static');
  const exampleDistDir = path.join(distDir, '05-static');
  fs.mkdirSync(exampleDistDir, { recursive: true });
  
  // Import Page component and pages from generate script
  const { h: _h, Fragment, renderToString: _renderToString } = await import('../src/index.js');
  
  const Page = ({ title, content }) => (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <style>{`
          body {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            background: #f8f9fa;
          }
          h1 { color: #2c3e50; }
          .card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
          }
          .nav {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
          }
          .nav a {
            color: #3498db;
            text-decoration: none;
          }
          .nav a:hover {
            text-decoration: underline;
          }
        `}</style>
      </head>
      <body>
        <nav className="nav">
          <a href="index.html">Home</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </nav>
        <div className="card">
          {content}
        </div>
      </body>
    </html>
  );
  
  const pages = [
    {
      name: 'index.html',
      title: 'Home - Static Site Example',
      content: (
        <>
          <h1>🏠 Welcome to Static Site Generation</h1>
          <p>This is a demonstration of static site generation using Lume-SSR.</p>
          <p>All pages are pre-rendered at build time to pure HTML files.</p>
          <h2>Features:</h2>
          <ul>
            <li>✅ No server required</li>
            <li>✅ Fast page loads</li>
            <li>✅ SEO friendly</li>
            <li>✅ Easy deployment</li>
          </ul>
        </>
      )
    },
    {
      name: 'about.html',
      title: 'About - Static Site Example',
      content: (
        <>
          <h1>📖 About This Project</h1>
          <p>This static site was generated using Lume-SSR, a minimal JSX-to-HTML rendering library.</p>
          <h2>How it works:</h2>
          <ol>
            <li>Write components using JSX</li>
            <li>Run the generator script</li>
            <li>Get pure HTML files</li>
            <li>Deploy anywhere!</li>
          </ol>
        </>
      )
    },
    {
      name: 'contact.html',
      title: 'Contact - Static Site Example',
      content: (
        <>
          <h1>📧 Contact Us</h1>
          <p>This is a static contact page. In a real application, you would add a form here.</p>
          <p>For now, this demonstrates how easy it is to create multiple pages with Lume-SSR.</p>
        </>
      )
    }
  ];
  
  pages.forEach(page => {
    const html = renderToString(<Page title={page.title} content={page.content} />);
    fs.writeFileSync(path.join(exampleDistDir, page.name), `<!DOCTYPE html>\n${html}`);
  });
  
  console.log('✓ Built 05-static');
}

// Build 06-blog example
async function buildBlogExample() {
  const exampleSrcDir = path.join(rootDir, 'examples/06-blog');
  const exampleDistDir = path.join(distDir, '06-blog');
  const postsDir = path.join(exampleSrcDir, 'posts');
  fs.mkdirSync(exampleDistDir, { recursive: true });
  
  // Simple markdown parser
  function parseMarkdown(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return { frontmatter: {}, content };
    }
    
    const frontmatterText = match[1];
    const markdownContent = match[2];
    
    const frontmatter = {};
    frontmatterText.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        frontmatter[key.trim()] = valueParts.join(':').trim();
      }
    });
    
    let html = markdownContent
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    html = '<p>' + html + '</p>';
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    
    return { frontmatter, content: html };
  }
  
  const BlogLayout = ({ title, children }) => (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <style>{`
          body {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            background: #f8f9fa;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
          }
          .header h1 { margin: 0; }
          .nav {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
          }
          .nav a {
            color: #3498db;
            text-decoration: none;
            padding: 0.5rem 1rem;
            background: white;
            border-radius: 4px;
          }
          .nav a:hover {
            background: #3498db;
            color: white;
          }
          .content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .post-meta {
            color: #7f8c8d;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #ecf0f1;
          }
          .post-list {
            list-style: none;
            padding: 0;
          }
          .post-list li {
            background: white;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .post-list h2 { margin-top: 0; }
          .post-list a {
            color: #2c3e50;
            text-decoration: none;
          }
          .post-list a:hover {
            color: #3498db;
          }
          code {
            background: #ecf0f1;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
          pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
          }
          pre code {
            background: none;
            padding: 0;
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h1>📝 Lume-SSR Blog</h1>
          <p>A static blog built with JSX and Markdown</p>
        </div>
        <nav className="nav">
          <a href="index.html">Home</a>
          <a href="about.html">About</a>
        </nav>
        <div className="content">
          {children}
        </div>
      </body>
    </html>
  );
  
  // Read and parse posts
  const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  const posts = postFiles.map(file => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const { frontmatter, content: html } = parseMarkdown(content);
    const slug = file.replace('.md', '');
    return { slug, frontmatter, html };
  });
  
  posts.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
  
  // Generate index
  const indexHtml = renderToString(
    <BlogLayout title="Lume-SSR Blog">
      <h1>Recent Posts</h1>
      <ul className="post-list">
        {posts.map(post => (
          <li key={post.slug}>
            <h2><a href={`${post.slug}.html`}>{post.frontmatter.title}</a></h2>
            <div className="post-meta">
              By {post.frontmatter.author} on {new Date(post.frontmatter.date).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </BlogLayout>
  );
  fs.writeFileSync(path.join(exampleDistDir, 'index.html'), `<!DOCTYPE html>\n${indexHtml}`);
  
  // Generate post pages
  posts.forEach(post => {
    const postHtml = renderToString(
      <BlogLayout title={`${post.frontmatter.title} - Lume-SSR Blog`}>
        <article>
          <h1>{post.frontmatter.title}</h1>
          <div className="post-meta">
            By {post.frontmatter.author} on {new Date(post.frontmatter.date).toLocaleDateString()}
            {post.frontmatter.tags && ` • Tags: ${post.frontmatter.tags}`}
          </div>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
          <hr />
          <a href="index.html">← Back to all posts</a>
        </article>
      </BlogLayout>
    );
    fs.writeFileSync(path.join(exampleDistDir, `${post.slug}.html`), `<!DOCTYPE html>\n${postHtml}`);
  });
  
  // Generate about page
  const aboutHtml = renderToString(
    <BlogLayout title="About - Lume-SSR Blog">
      <h1>About This Blog</h1>
      <p>This blog is built using Lume-SSR, demonstrating static site generation with JSX and Markdown.</p>
      <h2>Features:</h2>
      <ul>
        <li>✅ Markdown posts with frontmatter</li>
        <li>✅ JSX components for layout</li>
        <li>✅ Static HTML generation</li>
        <li>✅ No runtime dependencies</li>
      </ul>
      <a href="index.html">← Back to home</a>
    </BlogLayout>
  );
  fs.writeFileSync(path.join(exampleDistDir, 'about.html'), `<!DOCTYPE html>\n${aboutHtml}`);
  
  console.log('✓ Built 06-blog');
}

// Build all examples
console.log('Building static site...\n');

buildDashboard();
await buildBasicExample();
await buildLumeExample();
await buildAlpineExample();
await buildVanillaExample();
await buildStaticExample();
await buildBlogExample();

console.log('\n✓ Static site built to dist/');
console.log('  Run npm run serve:examples to preview');
