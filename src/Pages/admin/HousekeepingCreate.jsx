import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HousekeepingCreate = ({ open, onClose, onCreated, rooms = [], users = [] }) => {
  const [form, setForm] = useState({
    room: '',
    assignedTo: '',
    taskType: '',
    priority: 'medium',
    scheduledFor: '',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        room: '',
        assignedTo: '',
        taskType: '',
        priority: 'medium',
        scheduledFor: '',
        notes: ''
      });
      setError('');
    }
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // For both dropdowns: selecting from either will update the `room` field in form
  const handleSelectRoom = (e) => {
    setForm({ ...form, room: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.room || !form.assignedTo || !form.taskType) {
      setError('Room, assigned staff, and task type are required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/housekeeping-tasks', form, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      onCreated && onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-10">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>×</button>
        <h2 className="text-xl font-bold mb-4">Create New Housekeeping Task</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Dropdown 1: AVAILABLE Rooms */}
          <div>
            <label className="block mb-1">Available Rooms</label>
            <select
              name="availableRoom"
              className="w-full border rounded p-2"
              value={form.room && rooms.find(r => r._id === form.room && r.status === "available") ? form.room : ''}
              onChange={handleSelectRoom}
              disabled={rooms.length === 0}
            >
              <option value="">Select Available Room</option>
              {rooms.filter(room => room.status === "available").map(room => (
                <option key={room._id} value={room._id}>
                  {room.room_number} – {room.title}{room.category ? ` (${room.category.name})` : ""}
                </option>
              ))}
            </select>
          </div>
          
          {/* Dropdown 2: BOOKED/MAINTENANCE Rooms */}
          <div>
            <label className="block mb-1">Booked or Maintenance Rooms</label>
            <select
              name="bookedOrMaintRoom"
              className="w-full border rounded p-2"
              value={form.room && rooms.find(r => r._id === form.room && (r.status === "booked" || r.status === "maintenance")) ? form.room : ''}
              onChange={handleSelectRoom}
              disabled={rooms.length === 0}
            >
              <option value="">Select Booked/Maintenance Room</option>
              {rooms.filter(room => room.status === "booked" || room.status === "maintenance").map(room => (
                <option key={room._id} value={room._id}>
                  {room.room_number} – {room.title}{room.category ? ` (${room.category.name})` : ""}
                  {" [" + room.status.charAt(0).toUpperCase() + room.status.slice(1) + "]"}
                </option>
              ))}
            </select>
          </div>

          {/* Assign To (Staff) */}
          <div>
            <label className="block mb-1">Assign To *</label>
            <select
              name="assignedTo"
              className="w-full border rounded p-2"
              value={form.assignedTo}
              onChange={handleChange}
              required
              disabled={users.length === 0}
            >
              <option value="">Select Staff</option>
              {users.length === 0
                ? <option disabled>Loading staff...</option>
                : users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.username} {u.name ? `(${u.name})` : ""}
                    </option>
                  ))}
            </select>
          </div>
          
          {/* Task Type */}
          <div>
            <label className="block mb-1">Task Type *</label>
            <select
              name="taskType"
              className="w-full border rounded p-2"
              value={form.taskType}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="cleaning">Cleaning</option>
              <option value="laundry">Laundry</option>
              <option value="maintenance">Maintenance</option>
              <option value="sanitization">Sanitization</option>
              <option value="inspection">Inspection</option>
              <option value="restock minibar">Restock Minibar</option>
            </select>
          </div>
          {/* Priority */}
          <div>
            <label className="block mb-1">Priority</label>
            <select
              name="priority"
              className="w-full border rounded p-2"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          {/* Scheduled For */}
          <div>
            <label className="block mb-1">Scheduled For (optional)</label>
            <input
              type="datetime-local"
              name="scheduledFor"
              className="w-full border rounded p-2"
              value={form.scheduledFor}
              onChange={handleChange}
            />
          </div>
          {/* Notes */}
          <div>
            <label className="block mb-1">Notes (optional)</label>
            <input
              type="text"
              name="notes"
              className="w-full border rounded p-2"
              value={form.notes}
              onChange={handleChange}
            />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <button
            className="w-full py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
            type="submit"
            disabled={rooms.length === 0 || users.length === 0}
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default HousekeepingCreate;
