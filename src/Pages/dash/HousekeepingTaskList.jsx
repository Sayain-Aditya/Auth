import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HousekeepingTaskDetails from './HousekeepingTaskDetails';

const HousekeepingTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    cleaningType: ''
  });
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [user, setUser] = useState(null);
  const [isHousekeepingStaff, setIsHousekeepingStaff] = useState(false);

  useEffect(() => {
    // Get user info from token
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Decode token to get basic user info
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        
        const userData = {
          id: decoded.id,
          username: decoded.username || decoded.name || '',
          department: decoded.department,
          role: decoded.role,
        };
        
        setUser(userData);
        
        // Check if user is housekeeping staff
        const isHousekeeping = 
          userData.role === 'staff' && (
            (Array.isArray(userData.department) && 
              userData.department.some(dep => dep.name?.toLowerCase() === 'housekeeping')) ||
            (typeof userData.department === 'object' && 
              userData.department.name?.toLowerCase() === 'housekeeping') ||
            (typeof userData.department === 'string' && 
              userData.department.toLowerCase() === 'housekeeping')
          );
        
        setIsHousekeepingStaff(isHousekeeping);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    };
    
    fetchUserData().then(() => fetchTasks());
  }, []);
  
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [filters, user]);

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.cleaningType) queryParams.append('cleaningType', filters.cleaningType);
      
      let url;
      
      // If user is housekeeping staff, only show tasks assigned to them
      if (isHousekeepingStaff && user.id) {
        url = `http://localhost:5000/api/housekeeping/staff/${user.id}/tasks?${queryParams.toString()}`;
      } else {
        // Admin or reception staff can see all tasks
        url = `http://localhost:5000/api/housekeeping/tasks?${queryParams.toString()}`;
      }
      
      const response = await axios.get(url, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTasks(response.data.tasks || []);
      setError('');
    } catch (err) {
      setError(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Housekeeping Tasks</h2>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="text-lg font-semibold mb-2">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="verified">Verified</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Priority</label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Cleaning Type</label>
            <select
              name="cleaningType"
              value={filters.cleaningType}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Types</option>
              <option value="daily">Daily</option>
              <option value="deep-clean">Deep Clean</option>
              <option value="checkout">Checkout</option>
              <option value="special-request">Special Request</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <div className="text-center p-4">Loading tasks...</div>
      ) : (
        <>
          {/* Task list */}
          {tasks.length === 0 ? (
            <div className="bg-white p-4 rounded shadow text-center">
              No tasks found matching the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tasks.map(task => (
                <div key={task._id} className="bg-white rounded shadow overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                    onClick={() => handleTaskClick(task._id)}
                  >
                    <div>
                      <div className="font-semibold">
                        Room: {task.roomId?.title} (#{task.roomId?.room_number})
                      </div>
                      <div className="text-sm text-gray-600">
                        {task.cleaningType} • {task.priority} priority • 
                        {task.assignedTo ? ` Assigned to ${task.assignedTo.username}` : ' Unassigned'}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusBadgeClass(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="ml-2">
                        {selectedTaskId === task._id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Task details */}
                  {selectedTaskId === task._id && (
                    <div className="border-t border-gray-200">
                      <HousekeepingTaskDetails taskId={task._id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HousekeepingTaskList;