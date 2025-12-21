/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment, renderToString } from '../../src/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Page component
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

// Generate pages
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

// Create output directory
const outDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// Generate each page
pages.forEach(page => {
    const html = renderToString(<Page title={page.title} content={page.content} />);
    fs.writeFileSync(path.join(outDir, page.name), html);
    console.log(`✓ Generated ${page.name}`);
});

console.log(`\n✨ Static site generated to ${outDir}/`);
console.log(`   Open ${outDir}/index.html in your browser`);
