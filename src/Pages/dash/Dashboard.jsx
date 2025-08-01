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
        // Decode token to get basic user info
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        
        // Set basic user info
        setUser({
          username: decoded.username || decoded.name || decoded.id || '',
          department: decoded.department,
          role: decoded.role,
          restaurantRole: decoded.restaurantRole,
        });
        
        // Fetch detailed staff data from backend
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
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <NotificationSystem />
      </div>
      
      <div className="mb-4">
        <span className="font-semibold">Username:</span> {user.username}
      </div>
      
      <div className="mb-4">
        <span className="font-semibold">Role:</span> {user.role}
        {user.role === 'restaurant' && user.restaurantRole && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
            {user.restaurantRole.charAt(0).toUpperCase() + user.restaurantRole.slice(1)}
          </span>
        )}
      </div>
      
      {/* Display staff-specific data */}
      {staffData && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Your Profile</h3>
          
          <div className="mb-2">
            <span className="font-medium">Email:</span> {staffData.email}
          </div>
          
          <div className="mb-2">
            <span className="font-medium">Department(s):</span>
            <ul className="list-disc ml-5 mt-1">
              {Array.isArray(staffData.departments) ? (
                staffData.departments.map((dept, index) => (
                  <li key={index}>
                    {dept.name} (ID: {dept.id})
                  </li>
                ))
              ) : (
                <li>{typeof staffData.departments === 'object' ? 
                    staffData.departments.name : 
                    staffData.departments || 'No department assigned'}
                </li>
              )}
            </ul>
          </div>
          
          {/* Show restaurant role for restaurant users */}
          {staffData.restaurantRole && (
            <div className="mb-2">
              <span className="font-medium">Restaurant Role:</span> 
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {staffData.restaurantRole.charAt(0).toUpperCase() + staffData.restaurantRole.slice(1)}
              </span>
            </div>
          )}
          
          {/* Show account creation date */}
          <div className="mb-2">
            <span className="font-medium">Account Created:</span> {
              new Date(staffData.createdAt).toLocaleDateString()
            }
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      {/* Show housekeeping form for reception staff */}
      {user.role === 'staff' && Array.isArray(user.department) && 
        user.department.some(dep => dep.name?.toLowerCase() === 'reception') && (
        <div className="mt-6">
          <HousekeepingTaskForm />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {user.role === 'admin' && (
          <>
            <button 
              onClick={() => navigate('/admin')}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              Admin Dashboard
            </button>
            <button 
              onClick={() => navigate('/admin/kot-management')}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
              KOT Management
            </button>
            <button 
              onClick={() => navigate('/admin/billing-management')}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
              Billing Management
            </button>
            <button 
              onClick={() => navigate('/admin/user-management')}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
              User Management
            </button>
          </>
        )}
        
        {/* Add Book Room button for reception staff */}
        {user.role === 'staff' && Array.isArray(user.department) && 
          user.department.some(dep => dep.name?.toLowerCase() === 'reception') && (
          <button 
            onClick={() => navigate('/admin/book-room-by-category')}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
            Book Room for Customer
          </button>
        )}
        
        {/* Add Housekeeping Dashboard button for housekeeping staff */}
        {user.role === 'staff' && Array.isArray(user.department) && 
          user.department.some(dep => dep.name?.toLowerCase() === 'housekeeping') && (
          <button 
            onClick={() => navigate('/housekeeping')}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
            Housekeeping Dashboard
          </button>
        )}
        
        {/* Add Pantry Management button for kitchen and pantry staff */}
        {user.role === 'staff' && Array.isArray(user.department) && 
          user.department.some(dep => ['kitchen', 'pantry'].includes(dep.name?.toLowerCase())) && (
          <button 
            onClick={() => navigate('/pantry')}
            className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition">
            Pantry Management
          </button>
        )}
        
        {/* Add Table Booking button for restaurant staff and cashier */}
        {user.role === 'restaurant' && (user.restaurantRole === 'staff' || user.restaurantRole === 'cashier') && (
          <button 
            onClick={() => navigate('/admin/table-booking')}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
            Table Booking Management
          </button>
        )}
        
        {/* Add KOT Management button for restaurant chef */}
        {user.role === 'restaurant' && user.restaurantRole === 'chef' && (
          <button 
            onClick={() => navigate('/admin/kot-management')}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
            KOT Management
          </button>
        )}
        
        {/* Add Billing Management button for restaurant cashier */}
        {user.role === 'restaurant' && user.restaurantRole === 'cashier' && (
          <button 
            onClick={() => navigate('/admin/billing-management')}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
            Billing Management
          </button>
        )}
        
        {/* Universal Search button for all users */}
        <button 
          onClick={() => navigate('/search')}
          className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition">
          Search
        </button>
      </div>
    </div>
  );
};

export default Dashboard;