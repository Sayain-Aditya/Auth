import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RoomBookingCheckout from './RoomBookingCheckout';

const HotelManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    availableRooms: 0,
    pendingCheckouts: 0,
    housekeepingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: token ? `Bearer ${token}` : undefined };

      // Fetch rooms data
      const roomsRes = await axios.get('http://localhost:5000/api/rooms/all', { headers });
      const rooms = roomsRes.data;

      // Fetch bookings data
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings/all', { headers });
      const bookings = bookingsRes.data;

      // Fetch housekeeping tasks
      const tasksRes = await axios.get('http://localhost:5000/api/housekeeping/tasks', { headers });
      const tasks = tasksRes.data.tasks || [];

      // Calculate stats
      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter(room => room.status === 'booked').length;
      const maintenanceRooms = rooms.filter(room => room.status === 'maintenance').length;
      const availableRooms = rooms.filter(room => room.status === 'available').length;
      const pendingCheckouts = bookings.filter(booking => 
        booking.status === 'Checked In' && booking.isActive
      ).length;
      const housekeepingTasks = tasks.filter(task => 
        ['pending', 'in-progress'].includes(task.status)
      ).length;

      setStats({
        totalRooms,
        occupiedRooms,
        maintenanceRooms,
        availableRooms,
        pendingCheckouts,
        housekeepingTasks
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
    setLoading(false);
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-3xl ${color.replace('border-l-', 'text-')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hotel Management Dashboard</h1>
          <p className="text-gray-600">Manage bookings, checkouts, and housekeeping tasks</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('checkout')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'checkout'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Room Checkout
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Rooms"
                value={stats.totalRooms}
                color="border-l-blue-500"
                icon="🏨"
              />
              <StatCard
                title="Occupied Rooms"
                value={stats.occupiedRooms}
                color="border-l-green-500"
                icon="🛏️"
              />
              <StatCard
                title="Available Rooms"
                value={stats.availableRooms}
                color="border-l-emerald-500"
                icon="✅"
              />
              <StatCard
                title="Maintenance Rooms"
                value={stats.maintenanceRooms}
                color="border-l-yellow-500"
                icon="🔧"
              />
              <StatCard
                title="Pending Checkouts"
                value={stats.pendingCheckouts}
                color="border-l-red-500"
                icon="🚪"
              />
              <StatCard
                title="Housekeeping Tasks"
                value={stats.housekeepingTasks}
                color="border-l-purple-500"
                icon="🧹"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('checkout')}
                  className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <span className="text-red-600 font-medium">Process Checkouts</span>
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/housekeeping'}
                  className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <span className="text-purple-600 font-medium">Housekeeping Tasks</span>
                </button>
                <button
                  onClick={() => window.location.href = '/admin/booking-manager'}
                  className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-blue-600 font-medium">Manage Bookings</span>
                </button>
                <button
                  onClick={() => window.location.href = '/admin/room-manager'}
                  className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-green-600 font-medium">Room Management</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Room Occupancy Rate</span>
                  <span className="font-medium">
                    {stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Rooms Needing Attention</span>
                  <span className="font-medium text-yellow-600">
                    {stats.maintenanceRooms} in maintenance
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Pending Tasks</span>
                  <span className="font-medium text-purple-600">
                    {stats.housekeepingTasks} housekeeping tasks
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checkout' && (
          <RoomBookingCheckout />
        )}
      </div>
    </div>
  );
};

export default HotelManagementDashboard;