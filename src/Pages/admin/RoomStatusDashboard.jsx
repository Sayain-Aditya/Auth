import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomStatusDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/rooms/all', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      setRooms(res.data);
    } catch (err) {
      setError('Failed to fetch room data');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500 text-white';
      case 'booked': return 'bg-blue-500 text-white';
      case 'maintenance': return 'bg-red-500 text-white';
      case 'cleaning': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return '✓';
      case 'booked': return '👤';
      case 'maintenance': return '🔧';
      case 'cleaning': return '🧹';
      default: return '?';
    }
  };

  const statusCounts = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading room status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Room Status Dashboard</h1>
        <button
          onClick={fetchRooms}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-800">{statusCounts.available || 0}</div>
          <div className="text-green-600">Available</div>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-800">{statusCounts.booked || 0}</div>
          <div className="text-blue-600">Booked</div>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-800">{statusCounts.maintenance || 0}</div>
          <div className="text-red-600">Maintenance</div>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-800">{statusCounts.cleaning || 0}</div>
          <div className="text-yellow-600">Cleaning</div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Room Grid</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3">
          {rooms.map((room) => (
            <div
              key={room._id}
              className={`p-3 rounded-lg text-center cursor-pointer transition-all hover:scale-105 ${getStatusColor(room.status)}`}
              title={`Room ${room.room_number} - ${room.status} - ${room.category?.name || 'No Category'}`}
            >
              <div className="text-lg font-bold">{room.room_number}</div>
              <div className="text-sm">{getStatusIcon(room.status)}</div>
              <div className="text-xs mt-1">{room.category?.name || 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span>Cleaning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomStatusDashboard;