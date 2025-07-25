import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    
    // Allow admin access to all admin pages
    if (payload.role === 'admin') {
      return children;
    }
    
    // Allow reception staff access to booking and inventory pages
    if (payload.role === 'staff' && Array.isArray(payload.department)) {
      const hasReception = payload.department.some(dep => dep.name?.toLowerCase() === 'reception');
      
      if (hasReception && (
        window.location.pathname.includes('/book-room') ||
        window.location.pathname.includes('/inventory') ||
        window.location.pathname.includes('/purchase-orders') ||
        window.location.pathname.includes('/pantry')
      )) {
        return children;
      }
    }
    
    // Not authorized
    console.log('Not authorized for this page');
    return <Navigate to="/dashboard" replace />;
  } catch (error) {
    console.log('Token decode error:', error);
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute; 