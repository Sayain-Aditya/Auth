import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BillingManagement = () => {
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [billForm, setBillForm] = useState({
    orderId: '',
    discount: 0,
    tax: 0,
    paymentMethod: 'cash'
  });
  const [paymentForm, setPaymentForm] = useState({
    billId: '',
    paidAmount: 0,
    paymentMethod: 'cash'
  });
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchBills();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/restaurant-orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter orders that are ready for billing (served status)
      setOrders(res.data.filter(order => order.status === 'served'));
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/bills/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBills(res.data);
    } catch (err) {
      setError('Failed to fetch bills');
    }
  };

  const openBillModal = (order) => {
    setBillForm({
      orderId: order._id,
      discount: order.discount || 0,
      tax: Math.round(order.amount * 0.18), // 18% GST
      paymentMethod: 'cash'
    });
    setShowBillModal(true);
  };

  const createBill = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/bills/create', billForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowBillModal(false);
      setSuccess('Bill created successfully');
      fetchOrders();
      fetchBills();
    } catch (err) {
      setError('Failed to create bill');
    }
  };

  const openPaymentModal = (bill) => {
    setPaymentForm({
      billId: bill._id,
      paidAmount: bill.totalAmount,
      paymentMethod: bill.paymentMethod
    });
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/bills/${paymentForm.billId}/payment`, {
        paidAmount: paymentForm.paidAmount,
        paymentMethod: paymentForm.paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowPaymentModal(false);
      setSuccess('Payment processed successfully');
      fetchBills();
    } catch (err) {
      setError('Failed to process payment');
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Billing Management</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('orders')}
        >
          Ready for Billing
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'bills' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('bills')}
        >
          All Bills
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      {/* Orders Ready for Billing */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Table</th>
                <th className="px-4 py-2 text-left">Staff</th>
                <th className="px-4 py-2 text-left">Items</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="px-4 py-2 border-b">{order.tableNo}</td>
                  <td className="px-4 py-2 border-b">{order.staffName}</td>
                  <td className="px-4 py-2 border-b">{order.items.length} items</td>
                  <td className="px-4 py-2 border-b">₹{order.amount}</td>
                  <td className="px-4 py-2 border-b">{new Date(order.createdAt).toLocaleTimeString()}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => openBillModal(order)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Create Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Bills */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Bill #</th>
                <th className="px-4 py-2 text-left">Table</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Payment</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill._id}>
                  <td className="px-4 py-2 border-b">{bill.billNumber}</td>
                  <td className="px-4 py-2 border-b">{bill.tableNo}</td>
                  <td className="px-4 py-2 border-b">₹{bill.totalAmount}</td>
                  <td className="px-4 py-2 border-b">{bill.paymentMethod}</td>
                  <td className="px-4 py-2 border-b">
                    <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(bill.paymentStatus)}`}>
                      {bill.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b">
                    {bill.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => openPaymentModal(bill)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Process Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Bill Modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Bill</h3>
            
            <div className="mb-4">
              <label className="block mb-1">Discount (₹)</label>
              <input
                type="number"
                value={billForm.discount}
                onChange={(e) => setBillForm({...billForm, discount: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Tax (₹)</label>
              <input
                type="number"
                value={billForm.tax}
                onChange={(e) => setBillForm({...billForm, tax: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Payment Method</label>
              <select
                value={billForm.paymentMethod}
                onChange={(e) => setBillForm({...billForm, paymentMethod: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="split">Split</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={createBill}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Bill
              </button>
              <button
                onClick={() => setShowBillModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Process Payment</h3>
            
            <div className="mb-4">
              <label className="block mb-1">Amount Paid (₹)</label>
              <input
                type="number"
                value={paymentForm.paidAmount}
                onChange={(e) => setPaymentForm({...paymentForm, paidAmount: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Payment Method</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="split">Split</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={processPayment}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Process Payment
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
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

export default BillingManagement;