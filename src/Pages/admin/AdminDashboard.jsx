import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const AdminDashboard = () => {
  const navigate = useNavigate();

  // Example axios usage for demonstration (not needed for navigation)
  // You can use axios for API calls in other admin pages

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <button
            onClick={() => navigate('/admin/customers')}
            className="block w-full text-left p-6 bg-purple-100 rounded-lg shadow hover:bg-purple-200 transition"
          >
            <h2 className="text-xl font-semibold text-purple-800 mb-2">Customer Details</h2>
            <p className="text-gray-600">View all customer (guest) details and bookings.</p>
          </button>
          <button
            onClick={() => navigate('/admin/categories')}
            className="block w-full text-left p-6 bg-blue-100 rounded-lg shadow hover:bg-blue-200 transition"
          >
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Manage Categories</h2>
            <p className="text-gray-600">Add, edit, or remove room categories and set their available rooms.</p>
          </button>
          <button
            onClick={() => navigate('/admin/rooms')}
            className="block w-full text-left p-6 bg-yellow-100 rounded-lg shadow hover:bg-yellow-200 transition"
          >
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Manage Rooms</h2>
            <p className="text-gray-600">Create, view, and manage rooms for each category.</p>
          </button>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="block w-full text-left p-6 bg-green-100 rounded-lg shadow hover:bg-green-200 transition"
          >
            <h2 className="text-xl font-semibold text-green-800 mb-2">Manage Bookings</h2>
            <p className="text-gray-600">Book rooms, view all bookings, and manage room allocations.</p>
          </button>
          <button
            onClick={() => navigate('/admin/housekeepings')}
            className="block w-full text-left p-6 bg-purple-100 rounded-lg shadow hover:bg-purple-200 transition"
          >
            <h2 className="text-xl font-semibold text-purple-800 mb-2">Manage Housekeeping</h2>
            <p className="text-gray-600">Assign, track, and review housekeeping tasks.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 