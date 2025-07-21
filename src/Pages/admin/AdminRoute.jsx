import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Allow admin access
    if (payload.role === 'admin') {
      return children;
    }
    
    // Allow reception staff access to booking pages
    if (payload.role === 'staff' && 
        Array.isArray(payload.department) && 
        payload.department.some(dep => dep.name?.toLowerCase() === 'reception') &&
        window.location.pathname.includes('/book-room')) {
      return children;
    }
    
    // Not authorized
    return <Navigate to="/dashboard" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute; 