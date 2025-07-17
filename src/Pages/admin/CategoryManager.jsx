import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/categories/all');
      setCategories(res.data);
    } catch (err) {
      setError('Failed to fetch categories');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name) {
      setError('Please enter a category name');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/categories/add', { name, description, status });
      setName('');
      setDescription('');
      setStatus('active');
      setSuccess('Category created successfully');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Category Management</h2>
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block mb-1 font-medium">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Deluxe"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Spacious rooms with city view"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
        {error && <div className="text-red-600 mt-3">{error}</div>}
        {success && <div className="text-green-600 mt-3">{success}</div>}
      </form>
      <h3 className="text-lg font-semibold mb-2">Existing Categories</h3>
      {loading ? <p>Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Description</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td className="py-2 px-4 border-b">{cat.name}</td>
                  <td className="py-2 px-4 border-b">{cat.description || '-'}</td>
                  <td className="py-2 px-4 border-b">{cat.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryManager; 