import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TableBooking = () => {
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    staffName: '',
    phoneNumber: '',
    tableNo: '',
    items: [{ itemId: '', quantity: 1, price: 0 }],
    notes: '',
    amount: 0,
    discount: 0,
    couponCode: '',
    isMembership: false,
    isLoyalty: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('book');

  useEffect(() => {
    fetchTables();
    fetchBookings();
    fetchItems();
  }, []);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/restaurant/tables', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(res.data.tables || []);
    } catch (err) {
      console.error('Failed to fetch tables');
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/restaurant/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch bookings');
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/restaurant/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch items');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total amount
    const total = updatedItems.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
    
    setForm({ ...form, items: updatedItems, amount: total });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { itemId: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const updatedItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updatedItems });
    
    // Recalculate total
    const total = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setForm(prev => ({ ...prev, amount: total }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/restaurant/orders', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Table booked successfully');
      setForm({
        staffName: '',
        phoneNumber: '',
        tableNo: '',
        items: [{ itemId: '', quantity: 1, price: 0 }],
        notes: '',
        amount: 0,
        discount: 0,
        couponCode: '',
        isMembership: false,
        isLoyalty: false
      });
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book table');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/restaurant/orders/${bookingId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchBookings();
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Table Booking Management</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'book' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('book')}
        >
          Book Table
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'bookings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('bookings')}
        >
          All Bookings
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'tables' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('tables')}
        >
          Available Tables
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      {/* Book Table Form */}
      {activeTab === 'book' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Book Table</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              name="staffName"
              placeholder="Staff Name"
              value={form.staffName}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
            
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
            
            <select
              name="tableNo"
              value={form.tableNo}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            >
              <option value="">Select Table</option>
              {tables.filter(table => table.status === 'available').map(table => (
                <option key={table._id} value={table.tableNumber}>
                  {table.tableNumber} (Capacity: {table.capacity}) - {table.location}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              name="couponCode"
              placeholder="Coupon Code (optional)"
              value={form.couponCode}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </div>

          {/* Items */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Items</h4>
            {form.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <select
                  value={item.itemId || ''}
                  onChange={(e) => {
                    const selectedItem = items.find(i => i._id === e.target.value);
                    const updatedItems = [...form.items];
                    updatedItems[index] = {
                      ...updatedItems[index],
                      itemId: e.target.value,
                      price: selectedItem ? selectedItem.Price : 0
                    };
                    const total = updatedItems.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
                    setForm({ ...form, items: updatedItems, amount: total });
                  }}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Item</option>
                  {items.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name} - ₹{item.Price}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  className="p-2 border rounded"
                  min="1"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={item.price || 0}
                  className="p-2 border rounded bg-gray-100"
                  readOnly
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
              type="number"
              step="0.01"
              name="discount"
              placeholder="Discount"
              value={form.discount}
              onChange={handleChange}
              className="p-2 border rounded"
            />
            
            <input
              type="number"
              step="0.01"
              name="amount"
              placeholder="Total Amount"
              value={form.amount}
              onChange={handleChange}
              className="p-2 border rounded"
              readOnly
            />
          </div>

          <div className="flex gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isMembership"
                checked={form.isMembership}
                onChange={handleChange}
                className="mr-2"
              />
              Membership Discount
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isLoyalty"
                checked={form.isLoyalty}
                onChange={handleChange}
                className="mr-2"
              />
              Loyalty Program
            </label>
          </div>

          <textarea
            name="notes"
            placeholder="Special Notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4"
            rows="3"
          />

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book Table'}
          </button>
        </form>
      )}

      {/* Bookings List */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Staff</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Table</th>
                <th className="px-4 py-2 text-left">Items</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking._id}>
                  <td className="px-4 py-2 border-b">{booking.staffName}</td>
                  <td className="px-4 py-2 border-b">{booking.phoneNumber}</td>
                  <td className="px-4 py-2 border-b">{booking.tableNo}</td>
                  <td className="px-4 py-2 border-b">{booking.items.length} items</td>
                  <td className="px-4 py-2 border-b">₹{booking.amount}</td>
                  <td className="px-4 py-2 border-b">
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                      className="p-1 border rounded text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="served">Served</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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

      {/* Available Tables */}
      {activeTab === 'tables' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Table Number</th>
                <th className="px-4 py-2 text-left">Capacity</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {tables.map(table => (
                <tr key={table._id}>
                  <td className="px-4 py-2 border-b">{table.tableNumber}</td>
                  <td className="px-4 py-2 border-b">{table.capacity}</td>
                  <td className="px-4 py-2 border-b">{table.location}</td>
                  <td className="px-4 py-2 border-b">
                    <span className={`px-2 py-1 rounded text-sm ${
                      table.status === 'available' ? 'bg-green-100 text-green-800' :
                      table.status === 'occupied' ? 'bg-red-100 text-red-800' :
                      table.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {table.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TableBooking;