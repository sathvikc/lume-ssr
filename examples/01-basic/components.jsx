/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from '../../src/index.js';

// Simple component
export const Heading = ({ level = 1, children }) => {
    const Tag = `h${level}`;
    return <Tag>{children}</Tag>;
};

// Component with props
export const Button = ({
    variant = 'primary',
    type = 'button',
    onClick,
    children
}) => (
    <button
        type={type}
        className={`btn btn-${variant}`}
        onclick={onClick}
    >
        {children}
    </button>
);

// Component with conditional rendering
export const Card = ({ title, content, footer }) => (
    <div className="card">
        {title && (
            <div className="card-header">
                <h3>{title}</h3>
            </div>
        )}
        <div className="card-body">
            {content}
        </div>
        {footer && (
            <div className="card-footer">
                {footer}
            </div>
        )}
    </div>
);

// List component
export const List = ({ items, renderItem }) => (
    <ul>
        {items.map((item, i) => (
            <li key={i}>{renderItem(item, i)}</li>
        ))}
    </ul>
);

// Layout component
export const Layout = ({ title, children }) => (
    <html lang="en">
        <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{title}</title>
            <link rel="stylesheet" href="/styles.css" />
        </head>
        <body>
            <header>
                <nav>
                    <a href="/">Home</a>
                    <a href="/about">About</a>
                </nav>
            </header>
            <main>{children}</main>
            <footer>
                <p>&copy; 2025 My App</p>
            </footer>
        </body>
    </html>
);
