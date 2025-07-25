import React, { useState } from 'react';
import axios from 'axios';

const PantryItemForm = () => {
  const [form, setForm] = useState({
    name: '',
    category: 'food',
    currentStock: '',
    unit: '',
    location: 'Pantry',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = {
        ...form,
        minThreshold: 0,
        reorderQuantity: 1,
        costPerUnit: 0
      };
      await axios.post('http://localhost:5000/api/pantry/items', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Pantry item added successfully');
      setForm({
        name: '',
        category: 'food',
        currentStock: '',
        unit: '',
        location: 'Pantry',
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add pantry item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add Pantry Item</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={form.name}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          >
            <option value="food">Food</option>
            <option value="beverage">Beverage</option>
            <option value="spices">Spices</option>
            <option value="dairy">Dairy</option>
            <option value="frozen">Frozen</option>
            <option value="dry-goods">Dry Goods</option>
            <option value="other">Other</option>
          </select>
          
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
            type="text"
            name="unit"
            placeholder="Unit (kg, pcs, liters, etc.)"
            value={form.unit}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          

          
          <input
            type="text"
            name="location"
            placeholder="Storage Location"
            value={form.location}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>
        

        
        <div className="mb-4">
          <textarea
            name="notes"
            placeholder="Additional Notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>
        
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Pantry Item'}
        </button>
      </form>
    </div>
  );
};

export default PantryItemForm;