import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            WebP Converter
          </h1>
          <p className="text-lg text-gray-600">
            Vite + TypeScript + React Refactoring (v3.0.0-alpha)
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Foundation Setup Complete!</h2>
          <div className="space-y-3 text-gray-700">
            <p>✅ Vite + TypeScript configured</p>
            <p>✅ React 18 installed</p>
            <p>✅ Tailwind CSS configured</p>
            <p>✅ Project structure created</p>
            <p>✅ ESLint and Prettier set up</p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
              <li>Phase 2: Define TypeScript types</li>
              <li>Phase 3: Extract utility functions</li>
              <li>Phase 4: Create custom hooks</li>
              <li>Phase 5: Build React components</li>
            </ul>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              Legacy builds available in <code className="bg-gray-100 px-1 rounded">legacy/</code> directory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
