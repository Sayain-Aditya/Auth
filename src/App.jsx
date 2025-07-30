import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/login';
import Dashboard from './Pages/dash/Dashboard';
import HousekeepingDashboard from './Pages/dash/HousekeepingDashboard';
import Register from './Pages/Register';
import AdminDashboard from './Pages/admin/AdminDashboard';
import CategoryManager from './Pages/admin/CategoryManager';
import BookingManager from './Pages/admin/BookingManager';
import RoomManager from './Pages/admin/RoomManager';
import BookRoomByCategory from './Pages/admin/BookRoomByCategory';
import AdminRoute from './Pages/admin/AdminRoute';
import CustomerList from './Pages/admin/CustomerList';
import InventoryManager from './Pages/admin/InventoryManager';
import InventoryTable from './Pages/admin/InventoryTable';
import InventoryTransactions from './Pages/admin/InventoryTransactions';
import PurchaseOrderManager from './Pages/admin/PurchaseOrderManager';
import PantryDashboard from './Pages/dash/PantryDashboard';
import PantryItemForm from './Pages/admin/PantryItemForm';
import TableBooking from './Pages/admin/TableBooking';
import KOTManagement from './Pages/admin/KOTManagement';
import BillingManagement from './Pages/admin/BillingManagement';
import Search from './Pages/admin/Search';
import UserManagement from './Pages/admin/UserManagement';
import OrderDetails from './Pages/OrderDetails';


const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/housekeeping" element={<HousekeepingDashboard />} />
          <Route path="/pantry" element={<PantryDashboard />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><CategoryManager /></AdminRoute>} />
          <Route path="/admin/rooms" element={<AdminRoute><RoomManager /></AdminRoute>} />
          <Route path="/admin/book-room-by-category" element={<AdminRoute><BookRoomByCategory /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><BookingManager /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><CustomerList /></AdminRoute>} />
          <Route path="/admin/inventory" element={<AdminRoute><InventoryManager /></AdminRoute>} />
          <Route path="/admin/inventory-table" element={<AdminRoute><InventoryTable /></AdminRoute>} />
          <Route path="/admin/inventory-transactions" element={<AdminRoute><InventoryTransactions /></AdminRoute>} />
          <Route path="/admin/purchase-orders" element={<AdminRoute><PurchaseOrderManager /></AdminRoute>} />
          <Route path="/admin/pantry" element={<AdminRoute><PantryDashboard /></AdminRoute>} />
          <Route path="/admin/pantry/add-item" element={<AdminRoute><PantryItemForm /></AdminRoute>} />
          <Route path="/admin/table-booking" element={<AdminRoute><TableBooking /></AdminRoute>} />
          <Route path="/admin/kot-management" element={<AdminRoute><KOTManagement /></AdminRoute>} />
          <Route path="/admin/billing-management" element={<AdminRoute><BillingManagement /></AdminRoute>} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin/user-management" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/orders" element={<OrderDetails />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;