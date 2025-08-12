import React, { useState } from 'react';
import axios from 'axios';

const InventorySeeder = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const seedInventory = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/room-inventory-seed/seed', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage('Room inventory items added successfully!');
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Setup Room Inventory</h3>
      <p className="text-gray-600 mb-4">
        Click below to add standard room inventory items (towels, sheets, toiletries, etc.)
      </p>
      <button
        onClick={seedInventory}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Adding Items...' : 'Add Room Inventory Items'}
      </button>
      {message && (
        <div className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default InventorySeeder;