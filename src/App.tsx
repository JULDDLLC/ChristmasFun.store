import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Products } from './pages/Products';
import { Dashboard } from './pages/Dashboard';
import { Auth } from './pages/Auth';
import { Success } from './pages/Success';
import Christmas from './pages/Christmas';
import ThankYou from './pages/ThankYou';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Download from './pages/Download';

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
        <Route
          path="/home"
          element={
            <div className="min-h-screen">
              <Header />
              <Home />
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/products"
          element={
            <div className="min-h-screen">
              <Header />
              <Products />
            </div>
          }
        />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <div className="min-h-screen">
              <Header />
              <Dashboard />
            </div>
          }
        />
        <Route
          path="/success"
          element={
            <div className="min-h-screen">
              <Header />
              <Success />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
