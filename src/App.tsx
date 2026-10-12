import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Christmas from './pages/Christmas';
import ThankYou from './pages/ThankYou';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Download from './pages/Download';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Christmas />} />
        <Route path="/christmas" element={<Christmas />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/download/:productId" element={<Download />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
