import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/login';
import Dashboard from './Pages/dash/Dashboard';
import Register from './Pages/Register';
import AdminDashboard from './Pages/admin/AdminDashboard';
import CategoryManager from './Pages/admin/CategoryManager';
import BookingManager from './Pages/admin/BookingManager';


const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<CategoryManager />} />
          <Route path="/admin/bookings" element={<BookingManager />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;