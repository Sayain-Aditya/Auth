import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HousekeepingPhotoUpload from './HousekeepingPhotoUpload';

const HousekeepingTaskForm = () => {
  const [rooms, setRooms] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [form, setForm] = useState({
    roomId: '',
    cleaningType: 'daily',
    notes: '',
    priority: 'medium',
    assignedTo: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchAvailableStaff();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/rooms/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchAvailableStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/housekeeping/available-staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableStaff(res.data.availableStaff || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/housekeeping/tasks', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Task assigned successfully!');
      setCurrentTaskId(response.data.task._id);
      setShowPhotoUpload(true);
      
      setForm({
        roomId: '',
        cleaningType: 'daily',
        notes: '',
        priority: 'medium',
        assignedTo: ''
      });
      fetchAvailableStaff(); // Refresh available staff
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Assign Housekeeping Task</h2>
      
      {message && (
        <div className={`p-2 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block mb-1">Room</label>
          <select 
            name="roomId" 
            value={form.roomId} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Room</option>
            {rooms.map(room => (
              <option key={room._id} value={room._id}>
                {room.title} (Room #{room.room_number})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-3">
          <label className="block mb-1">Cleaning Type</label>
          <select 
            name="cleaningType" 
            value={form.cleaningType} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="daily">Daily Cleaning</option>
            <option value="deep-clean">Deep Clean</option>
            <option value="checkout">Checkout Clean</option>
            <option value="special-request">Special Request</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label className="block mb-1">Priority</label>
          <select 
            name="priority" 
            value={form.priority} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label className="block mb-1">Assign To</label>
          <select 
            name="assignedTo" 
            value={form.assignedTo} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Unassigned</option>
            {availableStaff.map(staff => (
              <option key={staff._id} value={staff._id}>
                {staff.username}
              </option>
            ))}
          </select>
          <small className="text-gray-500">
            {availableStaff.length === 0 ? 'No housekeeping staff available' : `${availableStaff.length} staff available`}
          </small>
        </div>
        
        <div className="mb-3">
          <label className="block mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Assigning...' : 'Assign Task'}
        </button>
      </form>
      
      {showPhotoUpload && currentTaskId && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Upload Room Photos</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please upload photos of the room before and after cleaning.
          </p>
          <HousekeepingPhotoUpload taskId={currentTaskId} />
        </div>
      )}
    </div>
  );
};

export default HousekeepingTaskForm;