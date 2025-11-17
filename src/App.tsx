/**
 * Main application component
 */

import './index.css';
import { WebPConverterContainer } from './containers';
import { ErrorBoundary } from './components';

function App() {
  return (
    <ErrorBoundary>
      <WebPConverterContainer />
    </ErrorBoundary>
  );
}

export default App;
