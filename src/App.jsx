import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/login';
import Dashboard from './Pages/dash/Dashboard';
import Register from './Pages/Register';

const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* Add more routes here, e.g. dashboard, register, etc. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;