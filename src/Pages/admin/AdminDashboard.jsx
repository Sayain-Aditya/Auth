import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/admin/categories" className="block p-6 bg-blue-100 rounded-lg shadow hover:bg-blue-200 transition">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Manage Categories</h2>
          <p className="text-gray-600">Add, edit, or remove room categories and set their available rooms.</p>
        </Link>
        <Link to="/admin/bookings" className="block p-6 bg-green-100 rounded-lg shadow hover:bg-green-200 transition">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Manage Bookings</h2>
          <p className="text-gray-600">Book rooms, view all bookings, and manage room allocations.</p>
        </Link>
      </div>
    </div>
  </div>
);

export default AdminDashboard; 