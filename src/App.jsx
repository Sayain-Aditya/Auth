import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/login';
import Dashboard from './Pages/dash/Dashboard';
import Register from './Pages/Register';
import Rooms from './Pages/dash/RoomBookingAdmin'
import CategoryCreateAdmin from './Pages/dash/CategoryCreateAdmin';
import RoomManageAdmin from './Pages/dash/RoomManageAdmin';

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
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/categories/create" element={<CategoryCreateAdmin />} />
          <Route path="/rooms/manage" element={<RoomManageAdmin />} />
          {/* Add more routes for admin and staff as needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;