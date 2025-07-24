import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    inventoryId: '',
    transactionType: 'use',
    quantity: '',
    reason: '',
    roomNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTransactions();
    fetchItems();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/inventory/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions');
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/inventory/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch items');
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
      await axios.post('http://localhost:5000/api/inventory/transactions', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Transaction recorded successfully');
      setForm({ inventoryId: '', transactionType: 'use', quantity: '', reason: '', roomNumber: '' });
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Inventory Transactions</h2>
      
      {/* Add Transaction Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Record Transaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="inventoryId"
            value={form.inventoryId}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Item</option>
            {items.map(item => (
              <option key={item._id} value={item._id}>
                {item.name} (Stock: {item.currentStock})
              </option>
            ))}
          </select>
          
          <select
            name="transactionType"
            value={form.transactionType}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          >
            <option value="use">Use/Consume</option>
            <option value="restock">Restock</option>
            <option value="adjustment">Adjustment</option>
            <option value="transfer">Transfer</option>
            <option value="return">Return</option>
          </select>
          
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          
          <input
            type="text"
            name="reason"
            placeholder="Reason (e.g., Room Service, Purchase)"
            value={form.reason}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          
          <input
            type="text"
            name="roomNumber"
            placeholder="Room Number (e.g., 101)"
            value={form.roomNumber}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>
        
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Recording...' : 'Record Transaction'}
        </button>
      </form>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold p-4 border-b">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Room</th>
                <th className="px-4 py-2 text-left">User</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map(transaction => (
                  <tr key={transaction._id}>
                    <td className="px-4 py-2 border-b">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border-b">{transaction.inventoryId?.name}</td>
                    <td className="px-4 py-2 border-b">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.transactionType === 'restock' ? 'bg-green-100 text-green-800' :
                        transaction.transactionType === 'use' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.transactionType?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">
                      {transaction.transactionType === 'use' ? '-' : '+'}{transaction.quantity}
                    </td>
                    <td className="px-4 py-2 border-b">{transaction.reason}</td>
                    <td className="px-4 py-2 border-b">{transaction.roomNumber || '-'}</td>
                    <td className="px-4 py-2 border-b">{transaction.userId?.username}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryTransactions;