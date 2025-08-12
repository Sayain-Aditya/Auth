import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomInventoryChecklistForm = ({ taskId, roomId, onComplete }) => {
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoomInventory();
    }
  }, [roomId]);

  const fetchRoomInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/housekeeping/checklist/${roomId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      
      // Initialize checklist with default values
      const initialChecklist = res.data.checklist.map(item => ({
        ...item,
        status: 'ok',
        quantity: item.quantity || 1,
        remarks: ''
      }));
      
      setChecklist(initialChecklist);
    } catch (err) {
      setError('Failed to fetch room inventory');
      console.error(err);
    }
    setLoading(false);
  };

  const handleItemChange = (index, field, value) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      [field]: value
    };
    setChecklist(updatedChecklist);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Get user info from token
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      const userId = decoded.id;

      // Get booking ID from the housekeeping task
      let bookingId = null;
      try {
        const taskRes = await axios.get(`http://localhost:5000/api/housekeeping/tasks/${taskId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        
        // Find booking for this room
        const bookingsRes = await axios.get('http://localhost:5000/api/bookings/all', {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        
        const roomNumber = taskRes.data.task.roomId.room_number;
        const booking = bookingsRes.data.find(b => 
          b.roomNumber === roomNumber && b.status === 'Booked' && b.isActive
        );
        
        if (booking) {
          bookingId = booking._id;
        }
      } catch (err) {
        console.error('Failed to get booking ID:', err);
      }

      // Submit room inspection
      const inspectionData = {
        roomId,
        bookingId,
        inspectedBy: userId,
        inspectionType: 'checkout',
        checklist: checklist.map(item => ({
          inventoryId: item.inventoryId,
          item: item.item,
          quantity: item.quantity,
          status: item.status,
          remarks: item.remarks
        }))
      };
      


      const res = await axios.post('http://localhost:5000/api/housekeeping/room-inspection', 
        inspectionData,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        }
      );

      setSuccess(`Inspection completed! ${res.data.totalCharges > 0 ? `Additional charges: ₹${res.data.totalCharges}` : 'No additional charges.'}`);
      
      if (onComplete) {
        onComplete(res.data);
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit inspection');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading room inventory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Room Inventory Checklist</h2>
      
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

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Check each item and mark its condition</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {checklist.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.item}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={item.status}
                        onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                        className={`px-3 py-1 rounded text-sm border ${
                          item.status === 'ok' ? 'bg-green-100 border-green-300 text-green-800' :
                          item.status === 'missing' ? 'bg-red-100 border-red-300 text-red-800' :
                          item.status === 'damaged' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                          'bg-gray-100 border-gray-300 text-gray-800'
                        }`}
                      >
                        <option value="ok">OK</option>
                        <option value="missing">Missing</option>
                        <option value="damaged">Damaged</option>
                        <option value="used">Used/Consumed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                        placeholder="Add remarks if needed"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Inspection'}
          </button>
        </div>
      </form>

      {/* Summary of issues */}
      {checklist.some(item => item.status !== 'ok') && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Items with Issues:</h4>
          <ul className="text-sm text-yellow-700">
            {checklist
              .filter(item => item.status !== 'ok')
              .map((item, index) => (
                <li key={index} className="mb-1">
                  • {item.item} - {item.status.toUpperCase()} 
                  {item.remarks && ` (${item.remarks})`}
                </li>
              ))
            }
          </ul>
          <p className="text-xs text-yellow-600 mt-2">
            * Additional charges may apply for missing or damaged items
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomInventoryChecklistForm;