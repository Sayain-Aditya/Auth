import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomBookingCheckout = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkoutModal, setCheckoutModal] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [housekeepingStatus, setHousekeepingStatus] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('initial'); // 'initial', 'housekeeping', 'completed'
  const [housekeepingStaff, setHousekeepingStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');

  useEffect(() => {
    fetchActiveBookings();
    fetchHousekeepingStaff();
  }, []);

  const fetchHousekeepingStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/housekeeping/available-staff', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      setHousekeepingStaff(res.data.availableStaff || []);
    } catch (err) {
      console.error('Failed to fetch housekeeping staff:', err);
    }
  };

  const fetchActiveBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/bookings/all', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      // Filter bookings that are ready for checkout (Booked status)
      const activeBookings = res.data.filter(booking => 
        booking.status === 'Booked' && booking.isActive
      );
      

      setBookings(activeBookings);
    } catch (err) {
      setError('Failed to fetch bookings');
      setBookings([]);
    }
    setLoading(false);
  };

  const handleCheckout = async (booking) => {
    setCheckoutModal(booking);
    setError('');
    setSuccess('');
  };

  const confirmCheckout = async () => {
    if (!checkoutModal) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Set room to maintenance status
      const roomRes = await axios.get(`http://localhost:5000/api/rooms/all`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      
      const room = roomRes.data.find(r => r.room_number === checkoutModal.roomNumber);
      if (room) {
        await axios.put(`http://localhost:5000/api/rooms/update/${room._id}`, {
          status: 'maintenance'
        }, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });

        // 2. Create housekeeping task with assigned staff
        const taskRes = await axios.post('http://localhost:5000/api/housekeeping/tasks', {
          roomId: room._id,
          cleaningType: 'checkout',
          notes: `Room checkout cleaning and inventory check for ${checkoutModal.name}`,
          priority: 'high',
          assignedTo: selectedStaff || undefined
        }, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });

        setHousekeepingStatus({
          taskId: taskRes.data.task._id,
          roomId: room._id,
          status: 'pending'
        });
        setCheckoutStep('housekeeping');
        setSuccess('Housekeeping task created. Waiting for room inspection to complete before generating invoice.');
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed');
    }
    setLoading(false);
  };

  const closeInvoiceModal = () => {
    setInvoiceData(null);
    setCheckoutModal(null);
    setCheckoutStep('initial');
    setHousekeepingStatus(null);
  };

  const checkHousekeepingStatus = async () => {
    if (!housekeepingStatus) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/housekeeping/tasks/${housekeepingStatus.taskId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      
      if (res.data.task.status === 'completed') {
        // Generate invoice after housekeeping completion
        await generateFinalInvoice();
      }
    } catch (err) {
      setError('Failed to check housekeeping status');
    }
  };

  const generateFinalInvoice = async () => {
    if (!checkoutModal) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Update booking status to 'Checked Out'
      await axios.put(`http://localhost:5000/api/bookings/update/${checkoutModal._id}`, {
        status: 'Checked Out'
      }, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });

      // 2. Get all invoices for this booking (including room inspection charges)
      const invoicesRes = await axios.get(`http://localhost:5000/api/invoices/booking/${checkoutModal._id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });

      if (invoicesRes.data.invoices && invoicesRes.data.invoices.length > 0) {
        setInvoiceData({
          ...invoicesRes.data.invoices[0],
          totalAmount: invoicesRes.data.grandTotal,
          additionalCharges: invoicesRes.data.invoices.length > 1
        });
      } else {
        // Create basic booking invoice if none exists
        const invoiceRes = await axios.post('http://localhost:5000/api/invoices/create', {
          serviceType: 'Booking',
          serviceRefId: checkoutModal._id,
          tax: 0,
          discount: 0,
          paymentMode: 'Cash'
        }, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        setInvoiceData(invoiceRes.data.invoice);
      }

      setCheckoutStep('completed');
      setSuccess('Room inspection completed! Final invoice generated with all charges.');
      fetchActiveBookings();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Invoice generation failed');
    }
    setLoading(false);
  };



  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Room Booking & Checkout</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}

      {/* Active Bookings Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Active Bookings (Ready for Checkout)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in/Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No active bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.salutation} {booking.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.mobileNo}
                        </div>
                        <div className="text-xs text-gray-400">
                          GRC: {booking.grcNo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Room {booking.roomNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.categoryId?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>In: {new Date(booking.checkInDate).toLocaleDateString()}</div>
                      <div>Out: {new Date(booking.checkOutDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{booking.rate || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleCheckout(booking)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                      >
                        Checkout
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Confirmation Modal */}
      {checkoutModal && checkoutStep === 'initial' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Checkout</h3>
            <div className="mb-4">
              <p><strong>Guest:</strong> {checkoutModal.salutation} {checkoutModal.name}</p>
              <p><strong>Room:</strong> {checkoutModal.roomNumber}</p>
              <p><strong>Amount:</strong> ₹{checkoutModal.rate || 0}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Housekeeping Staff</label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Auto-assign available staff</option>
                {housekeepingStaff.map(staff => (
                  <option key={staff._id} value={staff._id}>
                    {staff.username}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This will:
              <br />• Set room to maintenance
              <br />• Create housekeeping task for room inspection
              <br />• Generate final invoice after inspection
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCheckoutModal(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckout}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Start Checkout Process'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Housekeeping Status Modal */}
      {checkoutStep === 'housekeeping' && housekeepingStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Housekeeping in Progress</h3>
            <div className="mb-4">
              <p><strong>Guest:</strong> {checkoutModal.salutation} {checkoutModal.name}</p>
              <p><strong>Room:</strong> {checkoutModal.roomNumber}</p>
              <p><strong>Status:</strong> Waiting for room inspection</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                🧹 Housekeeping task has been assigned. The final invoice will be generated automatically once the room inspection is completed by housekeeping staff.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setCheckoutModal(null);
                  setCheckoutStep('initial');
                  setHousekeepingStatus(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={generateFinalInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Generate Invoice Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invoice Generated</h3>
              <button
                onClick={closeInvoiceModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="border rounded-lg p-4 mb-4" id="invoice-content">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">Hotel Invoice</h2>
                <p className="text-sm text-gray-600">Invoice #: {invoiceData.invoiceNumber}</p>
                <p className="text-sm text-gray-600">Date: {new Date(invoiceData.issueDate).toLocaleDateString()}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Items:</h4>
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-1">
                    <span>{item.description}</span>
                    <span>₹{item.amount}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{invoiceData.subTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{invoiceData.tax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>₹{invoiceData.discount}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{invoiceData.totalAmount}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={printInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Print Invoice
              </button>
              <button
                onClick={closeInvoiceModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBookingCheckout;