import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryManager = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    currentStock: '',
    minThreshold: '',
    reorderQuantity: '',
    unit: '',
    costPerUnit: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setError('Failed to fetch inventory items');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/inventory/items', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Item added successfully');
      setForm({ name: '', category: '', currentStock: '', minThreshold: '', reorderQuantity: '', unit: '', costPerUnit: '' });
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (itemId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/inventory/items/${itemId}/stock`, 
        { currentStock: newQuantity },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchItems();
    } catch (err) {
      setError('Failed to update stock');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Inventory Management</h2>
      
      {/* Add Item Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={form.name}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="currentStock"
            placeholder="Current Stock"
            value={form.currentStock}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="minThreshold"
            placeholder="Min Threshold"
            value={form.minThreshold}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="reorderQuantity"
            placeholder="Reorder Quantity"
            value={form.reorderQuantity}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="unit"
            placeholder="Unit (pcs, kg, etc.)"
            value={form.unit}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="costPerUnit"
            placeholder="Cost per Unit"
            value={form.costPerUnit}
            onChange={handleChange}
            className="p-2 border rounded"
            step="0.01"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Item'}
        </button>
      </form>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      {/* Items List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Current Stock</th>
              <th className="px-4 py-2 text-left">Min Threshold</th>
              <th className="px-4 py-2 text-left">Reorder Qty</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Cost/Unit</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id} className={item.currentStock <= item.minThreshold ? 'bg-red-50' : ''}>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.category}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    defaultValue={item.currentStock}
                    onBlur={(e) => updateStock(item._id, e.target.value)}
                    className="w-20 p-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2">{item.minThreshold}</td>
                <td className="px-4 py-2">{item.reorderQuantity}</td>
                <td className="px-4 py-2">{item.unit}</td>
                <td className="px-4 py-2">₹{item.costPerUnit}</td>
                <td className="px-4 py-2">
                  {item.currentStock <= item.minThreshold && (
                    <span className="text-red-600 text-sm">Low Stock!</span>
                  )}
                </td>
              </tr>
            ))})
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManager;
