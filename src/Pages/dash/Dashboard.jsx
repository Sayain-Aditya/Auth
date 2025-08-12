import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HousekeepingTaskForm from "./HousekeepingTaskForm";
import NotificationSystem from "../../components/NotificationSystem";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        
        setUser({
          username: decoded.username || decoded.name || decoded.id || '',
          department: decoded.department,
          role: decoded.role,
          restaurantRole: decoded.restaurantRole,
        });
        
        if (token) {
          try {
            const response = await axios.get('http://localhost:5000/api/auth/staff-profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            setStaffData(response.data);
          } catch (err) {
            console.error("Error fetching staff data:", err);
            setError("Could not load your profile data");
          }
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening in your workspace today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationSystem />
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.username}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {user.role}
                </span>
                {user.role === 'restaurant' && user.restaurantRole && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {user.restaurantRole.charAt(0).toUpperCase() + user.restaurantRole.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {staffData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{staffData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Created</p>
                <p className="font-medium text-gray-900">{new Date(staffData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {user.role === 'staff' && Array.isArray(user.department) && 
          user.department.some(dep => dep.name?.toLowerCase() === 'reception') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Housekeeping Task</h3>
            <HousekeepingTaskForm />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.role === 'admin' && (
              <>
                <div className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/admin')}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Admin Dashboard</h4>
                      <p className="text-sm text-gray-600">Manage system settings</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/admin/user-management')}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">User Management</h4>
                      <p className="text-sm text-gray-600">Manage staff & permissions</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/admin/pantry')}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Pantry Management</h4>
                      <p className="text-sm text-gray-600">Manage pantry items</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/admin/inventory')}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Inventory</h4>
                      <p className="text-sm text-gray-600">Manage inventory items</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/admin/table-booking')}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Restaurant</h4>
                      <p className="text-sm text-gray-600">Manage table bookings</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-teal-50 hover:bg-teal-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/admin/kot-management')}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">KOT Management</h4>
                      <p className="text-sm text-gray-600">Manage kitchen orders</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 hover:bg-green-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/admin/billing-management')}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Bills</h4>
                      <p className="text-sm text-gray-600">Manage billing</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {user.role === 'staff' && Array.isArray(user.department) && 
              user.department.some(dep => dep.name?.toLowerCase() === 'reception') && (
              <div className="p-4 bg-green-50 hover:bg-green-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/admin/book-room-by-category')}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Book Room</h4>
                    <p className="text-sm text-gray-600">Reserve rooms for customers</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'staff' && Array.isArray(user.department) && 
              user.department.some(dep => dep.name?.toLowerCase() === 'housekeeping') && (
              <div className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/housekeeping')}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Housekeeping</h4>
                    <p className="text-sm text-gray-600">Manage cleaning tasks</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'staff' && Array.isArray(user.department) && 
              user.department.some(dep => ['kitchen', 'pantry'].includes(dep.name?.toLowerCase())) && (
              <div className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/pantry')}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Pantry Management</h4>
                    <p className="text-sm text-gray-600">Manage inventory & supplies</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate('/search')}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Search</h4>
                  <p className="text-sm text-gray-600">Find anything quickly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;