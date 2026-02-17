import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout';
import Dashboard from './pages/Dashboard';
import Attacks from './pages/Attacks';
import Sessions from './pages/Sessions';
import Commands from './pages/Commands';

/**
 * Root application component.
 * Sets up routing and the main layout structure.
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-soc-bg">
        {/* Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attacks" element={<Attacks />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/commands" element={<Commands />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-soc-border mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-xs text-soc-muted">
              Honeypot Security Monitor • Built for Honours Project
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
