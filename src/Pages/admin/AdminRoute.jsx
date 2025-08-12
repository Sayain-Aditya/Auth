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
    
    // Allow reception staff access to booking, room management, and inventory pages
    if (payload.role === 'staff' && Array.isArray(payload.department)) {
      const hasReception = payload.department.some(dep => dep.name?.toLowerCase() === 'reception');
      
      if (hasReception && (
        window.location.pathname.includes('/book-room') ||
        window.location.pathname.includes('/bookings') ||
        window.location.pathname.includes('/rooms') ||
        window.location.pathname.includes('/checkout') ||
        window.location.pathname.includes('/inventory') ||
        window.location.pathname.includes('/purchase-orders') ||
        window.location.pathname.includes('/pantry')
      )) {
        return children;
      }
    }
    
    // Allow staff with reception department access to main admin pages
    if (payload.role === 'staff') {
      const department = payload.department;
      const hasReception = Array.isArray(department) 
        ? department.some(dep => dep.name?.toLowerCase() === 'reception')
        : (typeof department === 'object' && department.name?.toLowerCase() === 'reception') ||
          (typeof department === 'string' && department.toLowerCase() === 'reception');
      
      if (hasReception && (
        window.location.pathname === '/admin' ||
        window.location.pathname.includes('/admin/dashboard') ||
        window.location.pathname.includes('/bookings') ||
        window.location.pathname.includes('/rooms') ||
        window.location.pathname.includes('/checkout')
      )) {
        return children;
      }
    }
    
    // Allow restaurant staff and cashier access to table-booking
    if (payload.role === 'restaurant' && 
        (payload.restaurantRole === 'staff' || payload.restaurantRole === 'cashier') &&
        window.location.pathname.includes('/table-booking')) {
      return children;
    }
    
    // Allow restaurant chef and admin access to KOT management
    if (((payload.role === 'restaurant' && payload.restaurantRole === 'chef') ||
        payload.role === 'admin') &&
        window.location.pathname.includes('/kot-management')) {
      return children;
    }
    
    // Allow restaurant cashier and admin access to billing management
    if (((payload.role === 'restaurant' && payload.restaurantRole === 'cashier') ||
        payload.role === 'admin') &&
        window.location.pathname.includes('/billing-management')) {
      return children;
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