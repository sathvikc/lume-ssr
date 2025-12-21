
import { renderToString, h, Fragment } from '../src/index.js';
import assert from 'assert';

console.log('🧪 Testing Lume-SSR Async Support...\n');

const runTests = async () => {
    // 1. Sync Component (Should return string immediately)
    {
        const Header = ({ title }) => `<h1>${title}</h1>`;
        const result = renderToString(<Header title="Sync" />);
        assert.strictEqual(result, '<h1>Sync</h1>');
        console.log('✅ Sync Component: Passed');
    }

    // 2. Async Component (Should return Promise that resolves to string)
    {
        const AsyncHeader = async ({ title }) => {
            await new Promise(r => setTimeout(r, 10));
            return `<h1>${title}</h1>`;
        };
        const promise = renderToString(<AsyncHeader title="Async" />);
        assert.ok(promise instanceof Promise, 'Should return a Promise');
        const result = await promise;
        assert.strictEqual(result, '<h1>Async</h1>');
        console.log('✅ Async Component: Passed');
    }

    // 3. Nested Async (Async child in Sync parent)
    {
        const AsyncChild = async () => {
            await new Promise(r => setTimeout(r, 10));
            return <span>Child</span>;
        };
        const SyncParent = ({ children }) => <div>{children}</div>;

        // This is tricky: SyncParent calls AsyncChild. 
        // SyncParent itself returns a JSX object (SafeString wrapping string).
        // But if children contains a Promise, the children map logic in `h` needs to handle it.
        const promise = renderToString(<SyncParent><AsyncChild /></SyncParent>);
        const result = await promise;
        assert.strictEqual(result, '<div><span>Child</span></div>');
        console.log('✅ Nested Async: Passed');
    }

    console.log('\n🎉 All tests passed!');
};

runTests().catch(err => {
    console.error('❌ Test Failed:', err);
    process.exit(1);
});
