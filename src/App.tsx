import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const WebPConverter = lazy(() => import('./components/Converter/WebPConverter'));
const PresetEditor = lazy(() => import('./components/PresetEditor/PresetEditor'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">Loading...</div>}>
        <Routes>
          <Route path="/" element={<WebPConverter />} />
          <Route path="/preset-editor" element={<PresetEditor />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

