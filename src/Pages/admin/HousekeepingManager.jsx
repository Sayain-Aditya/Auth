import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HousekeepingCreate from './HousekeepingCreate';

const API_BASE = 'http://localhost:5000/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const HousekeepingManager = () => {
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Properly load all data and respond to array/object API response formats
  const fetchRooms = async () => {
    const res = await axios.get(`${API_BASE}/rooms/all`);
    setRooms(Array.isArray(res.data) ? res.data : res.data.rooms || []);
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE}/auth/users/all`, {
      headers: { Authorization: token ? `Bearer ${token}` : undefined }
    });
    const all = Array.isArray(res.data) ? res.data : res.data.users || [];
    setUsers(all.filter(
      u =>
        u.role === 'staff' &&
        (u.department?.name?.toLowerCase() === 'housekeeping' ||
         u.department === 'housekeeping' ||
         u.department?.id === '5')
    ));
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/housekeeping-tasks`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      setTasks(Array.isArray(res.data) ? res.data : res.data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch tasks');
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadAll = async () => {
      setError('');
      setLoading(true);
      try {
        await Promise.all([fetchRooms(), fetchUsers()]);
        await fetchTasks();
      } catch (err) {
        setError('Failed to load initial data');
      }
      setLoading(false);
    };
    loadAll();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <HousekeepingCreate
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => { setShowModal(false); fetchTasks(); }}
        rooms={rooms}
        users={users}
      />
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-700">Housekeeping Management</h2>
          <div>
            <button
              className="px-4 py-2 mr-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              onClick={() => setShowModal(true)}
              disabled={loading || rooms.length === 0 || users.length === 0}
            >+ Create Task</button>
            <button
              className="px-4 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
              onClick={fetchTasks}
              disabled={loading}
            >
              {loading ? "Loading..." : "Reload"}
            </button>
          </div>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow border-collapse">
            <thead>
              <tr className="bg-purple-50">
                <th className="py-2 px-4 border-b">Room Number</th>
                <th className="py-2 px-4 border-b">Task Type</th>
                <th className="py-2 px-4 border-b">Priority</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Assigned To</th>
                <th className="py-2 px-4 border-b">Scheduled For</th>
                <th className="py-2 px-4 border-b">Notes</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">No tasks found</td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task._id} className="hover:bg-purple-50 transition">
                    <td className="py-2 px-4 border-b">{task.room?.room_number || 'N/A'}</td>
                    <td className="py-2 px-4 border-b capitalize">{task.taskType}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded ${
                        task.priority === 'high' ? 'bg-red-200 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className={`py-2 px-4 border-b capitalize`}>
                      <span className={`px-2 py-1 rounded ${statusColors[task.status] || 'bg-gray-200 text-gray-800'}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {typeof task.assignedTo === "object"
                        ? task.assignedTo.username
                        : 'Unassigned'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {task.scheduledFor ? new Date(task.scheduledFor).toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-4 border-b">{task.notes || '-'}</td>
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

export default HousekeepingManager;
