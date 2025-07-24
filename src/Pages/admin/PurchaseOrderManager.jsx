import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PurchaseOrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [form, setForm] = useState({
    supplier: { name: '', contact: '', phone: '', email: '' },
    items: [{ inventoryId: '', quantity: '', unitPrice: '' }],
    expectedDelivery: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchOrders();
    fetchItems();
    fetchLowStockItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/purchase-orders/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders');
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

  const fetchLowStockItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/purchase-orders/low-stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLowStockItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch low stock items');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/purchase-orders/orders', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Purchase order created successfully');
      setForm({
        supplier: { name: '', contact: '', phone: '', email: '' },
        items: [{ inventoryId: '', quantity: '', unitPrice: '' }],
        expectedDelivery: '',
        notes: ''
      });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/purchase-orders/orders/${orderId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { inventoryId: '', quantity: '', unitPrice: '' }]
    });
  };

  const removeItem = (index) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = form.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setForm({ ...form, items: updatedItems });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Purchase Order Management</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('orders')}
        >
          All Orders
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('create')}
        >
          Create Order
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'lowstock' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('lowstock')}
        >
          Low Stock Items
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      {/* Orders List */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">PO Number</th>
                <th className="px-4 py-2 text-left">Supplier</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Order Date</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="px-4 py-2 border-b">{order.poNumber}</td>
                  <td className="px-4 py-2 border-b">{order.supplier.name}</td>
                  <td className="px-4 py-2 border-b">₹{order.totalAmount}</td>
                  <td className="px-4 py-2 border-b">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="p-1 border rounded text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="ordered">Ordered</option>
                      <option value="shipped">Shipped</option>
                      <option value="received">Received</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border-b">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border-b">
                    <button className="text-blue-600 text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Form */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Create Purchase Order</h3>
          
          {/* Supplier Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Supplier Name"
              value={form.supplier.name}
              onChange={(e) => setForm({...form, supplier: {...form.supplier, name: e.target.value}})}
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Contact Person"
              value={form.supplier.contact}
              onChange={(e) => setForm({...form, supplier: {...form.supplier, contact: e.target.value}})}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Phone"
              value={form.supplier.phone}
              onChange={(e) => setForm({...form, supplier: {...form.supplier, phone: e.target.value}})}
              className="p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.supplier.email}
              onChange={(e) => setForm({...form, supplier: {...form.supplier, email: e.target.value}})}
              className="p-2 border rounded"
            />
          </div>

          {/* Items */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Items</h4>
            {form.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <select
                  value={item.inventoryId}
                  onChange={(e) => updateItem(index, 'inventoryId', e.target.value)}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Item</option>
                  {items.map(inv => (
                    <option key={inv._id} value={inv._id}>
                      {inv.name} (Stock: {inv.currentStock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  className="p-2 border rounded"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                  disabled={form.items.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Add Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="datetime-local"
              value={form.expectedDelivery}
              onChange={(e) => setForm({...form, expectedDelivery: e.target.value})}
              className="p-2 border rounded"
            />
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              className="p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Purchase Order'}
          </button>
        </form>
      )}

      {/* Low Stock Items */}
      {activeTab === 'lowstock' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-lg font-semibold p-4 border-b">Items Needing Reorder</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-left">Current Stock</th>
                <th className="px-4 py-2 text-left">Min Threshold</th>
                <th className="px-4 py-2 text-left">Reorder Qty</th>
                <th className="px-4 py-2 text-left">Cost/Unit</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map(item => (
                <tr key={item._id} className="bg-red-50">
                  <td className="px-4 py-2 border-b">{item.name}</td>
                  <td className="px-4 py-2 border-b">{item.currentStock}</td>
                  <td className="px-4 py-2 border-b">{item.minThreshold}</td>
                  <td className="px-4 py-2 border-b">{item.reorderQuantity}</td>
                  <td className="px-4 py-2 border-b">₹{item.costPerUnit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderManager;