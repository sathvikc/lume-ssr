/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment, renderToString } from '../../src/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple markdown parser (basic implementation)
function parseMarkdown(content) {
  // Extract frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content };
  }

  const frontmatterText = match[1];
  const markdownContent = match[2];

  // Parse frontmatter
  const frontmatter = {};
  frontmatterText.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      frontmatter[key.trim()] = valueParts.join(':').trim();
    }
  });

  // Convert markdown to HTML (basic implementation)
  let html = markdownContent
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>');

  // Wrap in paragraphs
  html = '<p>' + html + '</p>';

  // Fix list items
  html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

  return { frontmatter, content: html };
}

// Blog layout component
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
        .header h1 {
          margin: 0;
        }
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
        .post-list h2 {
          margin-top: 0;
        }
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

// Read all posts
const postsDir = path.join(__dirname, 'posts');
const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const posts = postFiles.map(file => {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
  const { frontmatter, content: html } = parseMarkdown(content);
  const slug = file.replace('.md', '');
  return { slug, frontmatter, html };
});

// Sort posts by date (newest first)
posts.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));

// Create output directory
const outDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate index page
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
fs.writeFileSync(path.join(outDir, 'index.html'), `<!DOCTYPE html>\n${indexHtml}`);
console.log('✓ Generated index.html');

// Generate individual post pages
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
  fs.writeFileSync(path.join(outDir, `${post.slug}.html`), `<!DOCTYPE html>\n${postHtml}`);
  console.log(`✓ Generated ${post.slug}.html`);
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
fs.writeFileSync(path.join(outDir, 'about.html'), `<!DOCTYPE html>\n${aboutHtml}`);
console.log('✓ Generated about.html');

console.log(`\n✨ Blog generated to ${outDir}/`);
console.log(`   ${posts.length} posts created`);
console.log(`   Open ${outDir}/index.html in your browser`);
