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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [addItemsForm, setAddItemsForm] = useState({
    orderId: '',
    items: [{ itemId: '', quantity: 1 }]
  });
  const [showAddItems, setShowAddItems] = useState(false);
  const [transferForm, setTransferForm] = useState({
    orderId: '',
    currentTable: '',
    newTableNo: '',
    reason: ''
  });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);

  useEffect(() => {
    fetchTables();
    fetchBookings();
    fetchItems();
  }, []);

  useEffect(() => {
    setFilteredBookings(bookings);
  }, [bookings]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/search/universal?query=${query}&type=orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFilteredBookings(res.data.orders || []);
      } catch (err) {
        console.error('Search failed:', err);
        setFilteredBookings([]);
      }
    } else {
      setFilteredBookings(bookings);
    }
  };

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
      const res = await axios.get('http://localhost:5000/api/restaurant-orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings');
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/items/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data || []);
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
      await axios.post('http://localhost:5000/api/restaurant-orders/create', form, {
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
      await axios.patch(`http://localhost:5000/api/restaurant-orders/${bookingId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchBookings();
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/restaurant-orders/details/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderDetails(res.data);
      setSelectedOrder(orderId);
      setActiveTab('details');
    } catch (err) {
      setError('Failed to fetch order details');
    }
  };

  const generateInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/restaurant-orders/invoice/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoice(res.data);
      setSelectedOrder(orderId);
      setActiveTab('invoice');
    } catch (err) {
      setError('Failed to generate invoice');
    }
  };

  const openAddItemsModal = (orderId) => {
    setAddItemsForm({ orderId, items: [{ itemId: '', quantity: 1 }] });
    setShowAddItems(true);
  };

  const handleAddItemChange = (index, field, value) => {
    const updatedItems = [...addItemsForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setAddItemsForm({ ...addItemsForm, items: updatedItems });
  };

  const addNewItemRow = () => {
    setAddItemsForm({
      ...addItemsForm,
      items: [...addItemsForm.items, { itemId: '', quantity: 1 }]
    });
  };

  const removeItemRow = (index) => {
    const updatedItems = addItemsForm.items.filter((_, i) => i !== index);
    setAddItemsForm({ ...addItemsForm, items: updatedItems });
  };

  const submitAddItems = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/restaurant-orders/${addItemsForm.orderId}/add-items`, 
        { items: addItemsForm.items },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setShowAddItems(false);
      setSuccess('Items added successfully');
      fetchBookings();
    } catch (err) {
      setError('Failed to add items');
    }
  };

  const openTransferModal = (booking) => {
    setTransferForm({
      orderId: booking._id,
      currentTable: booking.tableNo,
      newTableNo: '',
      reason: 'Customer request'
    });
    setShowTransferModal(true);
  };

  const submitTransferTable = async () => {
    if (!transferForm.newTableNo) {
      setError('Please select a table');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/restaurant-orders/${transferForm.orderId}/transfer-table`, 
        { 
          newTableNo: transferForm.newTableNo, 
          reason: transferForm.reason 
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setShowTransferModal(false);
      setSuccess('Table transferred successfully');
      fetchBookings();
      fetchTables();
    } catch (err) {
      setError('Failed to transfer table');
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
        {orderDetails && (
          <button
            className={`py-2 px-4 ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('details')}
          >
            Order Details
          </button>
        )}
        {invoice && (
          <button
            className={`py-2 px-4 ${activeTab === 'invoice' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('invoice')}
          >
            Invoice
          </button>
        )}
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
        <div>
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search bookings by staff, phone, table, or status..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          
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
              {filteredBookings.map(booking => (
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
                    <button 
                      onClick={() => viewOrderDetails(booking._id)}
                      className="text-blue-600 text-sm hover:underline mr-2"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => generateInvoice(booking._id)}
                      className="text-green-600 text-sm hover:underline mr-2"
                    >
                      Invoice
                    </button>
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <>
                        <button 
                          onClick={() => openAddItemsModal(booking._id)}
                          className="text-purple-600 text-sm hover:underline mr-2"
                        >
                          Add Items
                        </button>
                        <button 
                          onClick={() => openTransferModal(booking)}
                          className="text-orange-600 text-sm hover:underline"
                        >
                          Transfer Table
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
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

      {/* Order Details */}
      {activeTab === 'details' && orderDetails && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p><strong>Order ID:</strong> {orderDetails._id}</p>
              <p><strong>Staff:</strong> {orderDetails.staffName}</p>
              <p><strong>Phone:</strong> {orderDetails.phoneNumber}</p>
              <p><strong>Table:</strong> {orderDetails.tableNo}</p>
            </div>
            <div>
              <p><strong>Status:</strong> {orderDetails.status}</p>
              <p><strong>Amount:</strong> ₹{orderDetails.amount}</p>
              <p><strong>Discount:</strong> {orderDetails.discount}%</p>
              <p><strong>Date:</strong> {new Date(orderDetails.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <h4 className="font-medium mb-2">Items Ordered:</h4>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left border">Item</th>
                  <th className="px-4 py-2 text-left border">Price</th>
                  <th className="px-4 py-2 text-left border">Quantity</th>
                  <th className="px-4 py-2 text-left border">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border">{item.itemId.name}</td>
                    <td className="px-4 py-2 border">₹{item.itemId.Price}</td>
                    <td className="px-4 py-2 border">{item.quantity}</td>
                    <td className="px-4 py-2 border">₹{(item.itemId.Price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orderDetails.notes && (
            <div className="mt-4">
              <p><strong>Notes:</strong> {orderDetails.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Invoice */}
      {activeTab === 'invoice' && invoice && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">INVOICE</h2>
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print Invoice
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p><strong>Order ID:</strong> {invoice.orderId}</p>
              <p><strong>Table:</strong> {invoice.tableNo}</p>
              <p><strong>Staff:</strong> {invoice.staffName}</p>
            </div>
            <div>
              <p><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
              <p><strong>Phone:</strong> {invoice.phoneNumber}</p>
            </div>
          </div>
          
          <table className="w-full border-collapse border mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Item</th>
                <th className="border px-4 py-2 text-right">Price</th>
                <th className="border px-4 py-2 text-right">Qty</th>
                <th className="border px-4 py-2 text-right">Discount</th>
                <th className="border px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{item.name}</td>
                  <td className="border px-4 py-2 text-right">₹{item.price}</td>
                  <td className="border px-4 py-2 text-right">{item.quantity}</td>
                  <td className="border px-4 py-2 text-right">{item.discount}%</td>
                  <td className="border px-4 py-2 text-right">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="text-right">
            <p className="text-lg"><strong>Subtotal: ₹{invoice.subtotal?.toFixed(2)}</strong></p>
            <p>Order Discount ({invoice.orderDiscount}%): -₹{invoice.orderDiscountAmount?.toFixed(2)}</p>
            <h3 className="text-xl font-bold mt-2">Final Amount: ₹{invoice.finalAmount?.toFixed(2)}</h3>
          </div>
          
          {invoice.notes && (
            <div className="mt-4 pt-4 border-t">
              <p><strong>Notes:</strong> {invoice.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Add Items Modal */}
      {showAddItems && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Items to Order</h3>
            
            {addItemsForm.items.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                <select
                  value={item.itemId}
                  onChange={(e) => handleAddItemChange(index, 'itemId', e.target.value)}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Item</option>
                  {items.map(menuItem => (
                    <option key={menuItem._id} value={menuItem._id}>
                      {menuItem.name} - ₹{menuItem.Price}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleAddItemChange(index, 'quantity', parseInt(e.target.value))}
                  className="p-2 border rounded"
                  min="1"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                  disabled={addItemsForm.items.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addNewItemRow}
              className="w-full mb-4 px-3 py-2 bg-gray-500 text-white rounded"
            >
              Add Another Item
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={submitAddItems}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Items
              </button>
              <button
                onClick={() => setShowAddItems(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Table Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Transfer Table</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Current Table: <span className="font-medium">{transferForm.currentTable}</span>
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 font-medium">Select New Table</label>
              <select
                value={transferForm.newTableNo}
                onChange={(e) => setTransferForm({...transferForm, newTableNo: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Available Table</option>
                {tables
                  .filter(table => table.tableNumber !== transferForm.currentTable)
                  .map(table => (
                    <option key={table._id} value={table.tableNumber}>
                      Table {table.tableNumber} (Capacity: {table.capacity}) - {table.location}
                    </option>
                  ))
                }
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1 font-medium">Reason for Transfer</label>
              <input
                type="text"
                value={transferForm.reason}
                onChange={(e) => setTransferForm({...transferForm, reason: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter reason..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={submitTransferTable}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Transfer Table
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableBooking;