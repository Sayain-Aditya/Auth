import React, { useState, useEffect } from 'react';
import HousekeepingTaskForm from './HousekeepingTaskForm';
import HousekeepingTaskList from './HousekeepingTaskList';
import axios from 'axios';

const HousekeepingDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'create'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Decode token to get basic user info
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        
        setUser({
          username: decoded.username || decoded.name || decoded.id || '',
          department: decoded.department,
          role: decoded.role,
        });
      } catch (err) {
        console.error('Error decoding token:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Housekeeping Management</h1>
      
      {/* Tab navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${activeTab === 'tasks' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('tasks')}
        >
          View Tasks
        </button>
        {/* Only show Create Task tab for admin or reception staff */}
        {!loading && user && (user.role === 'admin' || 
          (user.role === 'staff' && 
           ((Array.isArray(user.department) && 
             user.department.some(dep => dep.name?.toLowerCase() === 'reception')) || 
            (typeof user.department === 'object' && user.department.name?.toLowerCase() === 'reception') || 
            (typeof user.department === 'string' && user.department.toLowerCase() === 'reception'))
          )) && (
          <button
            className={`py-2 px-4 ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('create')}
          >
            Create Task
          </button>
        )}
      </div>
      
      {/* Tab content */}
      <div className="bg-gray-50 rounded-lg p-4">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : activeTab === 'tasks' ? (
          <HousekeepingTaskList />
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Only show task form for admin or reception staff */}
            {user && (user.role === 'admin' || 
              (user.role === 'staff' && 
               ((Array.isArray(user.department) && 
                 user.department.some(dep => dep.name?.toLowerCase() === 'reception')) || 
                (typeof user.department === 'object' && user.department.name?.toLowerCase() === 'reception') || 
                (typeof user.department === 'string' && user.department.toLowerCase() === 'reception'))
              )) ? (
              <HousekeepingTaskForm />
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
                You don't have permission to create housekeeping tasks.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HousekeepingDashboard;