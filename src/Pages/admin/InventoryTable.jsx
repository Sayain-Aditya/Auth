import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryTable = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/inventory/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading inventory...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Inventory Items</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Item Name</th>
              <th className="py-2 px-4 border-b text-left">Category</th>
              <th className="py-2 px-4 border-b text-left">Current Stock</th>
              <th className="py-2 px-4 border-b text-left">Min Threshold</th>
              <th className="py-2 px-4 border-b text-left">Reorder Qty</th>
              <th className="py-2 px-4 border-b text-left">Unit</th>
              <th className="py-2 px-4 border-b text-left">Cost/Unit</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  No inventory items found
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item._id} className={item.currentStock <= item.minThreshold ? 'bg-red-50' : ''}>
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b">{item.category}</td>
                  <td className="py-2 px-4 border-b">{item.currentStock}</td>
                  <td className="py-2 px-4 border-b">{item.minThreshold}</td>
                  <td className="py-2 px-4 border-b">{item.reorderQuantity}</td>
                  <td className="py-2 px-4 border-b">{item.unit}</td>
                  <td className="py-2 px-4 border-b">₹{item.costPerUnit}</td>
                  <td className="py-2 px-4 border-b">
                    {item.currentStock <= item.minThreshold ? (
                      <span className="text-red-600 font-semibold">Low Stock</span>
                    ) : item.currentStock === 0 ? (
                      <span className="text-red-800 font-semibold">Out of Stock</span>
                    ) : (
                      <span className="text-green-600">In Stock</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;