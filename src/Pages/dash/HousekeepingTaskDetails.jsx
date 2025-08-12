import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoomInventoryChecklistForm from './RoomInventoryChecklistForm';

const HousekeepingTaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChecklist, setShowChecklist] = useState(false);
  const [showCleaning, setShowCleaning] = useState(false);
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const [cleaningNotes, setCleaningNotes] = useState('');
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchTaskDetails();
    getUserInfo();
  }, [taskId]);

  const getUserInfo = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setUser(decoded);
      }
    } catch (err) {
      console.error('Error decoding token:', err);
    }
  };

  const fetchTaskDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/housekeeping/tasks/${taskId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      setTask(res.data.task);
    } catch (err) {
      setError('Failed to fetch task details');
    }
    setLoading(false);
  };

  const updateTaskStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/housekeeping/tasks/${taskId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      
      setTask(res.data.task);
      setSuccess(`Task status updated to ${newStatus}`);
      
      // For checkout cleaning, show checklist first when starting task
      if (newStatus === 'in-progress' && task.cleaningType === 'checkout') {
        setShowChecklist(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task status');
    }
  };

  const handleChecklistComplete = async (inspectionData) => {
    setSuccess(`Room inspection completed! ${inspectionData.totalCharges > 0 ? `Additional charges: ₹${inspectionData.totalCharges}` : 'No additional charges.'}`);
    setShowChecklist(false);
    
    // Start cleaning process after inventory check
    try {
      const token = localStorage.getItem('token');
      
      // First update to cleaning status
      const cleaningRes = await axios.put(`http://localhost:5000/api/housekeeping/tasks/${taskId}/status`, {
        status: 'cleaning'
      }, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      
      setTask(cleaningRes.data.task);
      setShowCleaning(true);
      setSuccess('Inventory check completed. Starting cleaning process...');
      
    } catch (err) {
      setError('Failed to start cleaning process');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading task details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Task not found</p>
        <button 
          onClick={() => navigate('/dashboard/housekeeping')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  if (showChecklist) {
    return (
      <RoomInventoryChecklistForm 
        taskId={taskId}
        roomId={task.roomId?._id || task.roomId}
        onComplete={handleChecklistComplete}
      />
    );
  }

  // Cleaning Interface
  if (showCleaning) {
    const handleImageUpload = async (files, type) => {
      setUploading(true);
      try {
        const imageUrls = [];
        for (const file of files) {
          const reader = new FileReader();
          const base64Promise = new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          const base64 = await base64Promise;
          imageUrls.push(base64);
        }
        if (type === 'before') {
          setBeforeImages(prev => [...prev, ...imageUrls]);
        } else {
          setAfterImages(prev => [...prev, ...imageUrls]);
        }
      } catch (err) {
        setError('Failed to upload images');
      }
      setUploading(false);
    };

    const addIssue = () => {
      if (newIssue.trim()) {
        setIssues(prev => [...prev, newIssue.trim()]);
        setNewIssue('');
      }
    };

    const removeIssue = (index) => {
      setIssues(prev => prev.filter((_, i) => i !== index));
    };

    const handleCleaningComplete = async () => {
      try {
        const token = localStorage.getItem('token');
        const updateData = {
          status: 'completed',
          notes: cleaningNotes || 'Cleaning completed',
          issues,
          beforeImages,
          afterImages
        };
        
        await axios.put(`http://localhost:5000/api/housekeeping/tasks/${taskId}/status`, updateData, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        
        setShowCleaning(false);
        setSuccess('Room cleaning completed!');
        await fetchTaskDetails();
      } catch (err) {
        setError('Failed to complete cleaning');
      }
    };

    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Room Cleaning in Progress</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Before Images */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Before Cleaning Images</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(Array.from(e.target.files), 'before')}
              className="mb-3"
              disabled={uploading}
            />
            <div className="grid grid-cols-3 gap-3">
              {beforeImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Before ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Issues */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Issues Found</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
              placeholder="Enter issue description"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && addIssue()}
            />
            <button
              onClick={addIssue}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            {issues.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded">
                <span>{item}</span>
                <button
                  onClick={() => removeIssue(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Cleaning Notes</h3>
          <textarea
            value={cleaningNotes}
            onChange={(e) => setCleaningNotes(e.target.value)}
            placeholder="Add any notes about the cleaning process..."
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* After Images */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">After Cleaning Images</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(Array.from(e.target.files), 'after')}
              className="mb-3"
              disabled={uploading}
            />
            <div className="grid grid-cols-3 gap-3">
              {afterImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`After ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowCleaning(false)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCleaningComplete}
            disabled={uploading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Complete Cleaning'}
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'cleaning': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canUpdateStatus = () => {
    return user && (user.role === 'admin' || user.role === 'staff');
  };

  const canVerify = () => {
    return user && user.role === 'admin';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Housekeeping Task Details</h1>
        <button
          onClick={() => navigate('/dashboard/housekeeping')}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Tasks
        </button>
      </div>

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

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Room {task.roomId?.room_number} - {task.cleaningType.replace('-', ' ').toUpperCase()}
            </h2>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Task Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Room:</span> {task.roomId?.room_number}</p>
                <p><span className="font-medium">Category:</span> {task.roomId?.category?.name || 'N/A'}</p>
                <p><span className="font-medium">Cleaning Type:</span> {task.cleaningType}</p>
                <p><span className="font-medium">Priority:</span> {task.priority}</p>
                <p><span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Assignment & Timing</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Assigned To:</span> {task.assignedTo?.username || 'Unassigned'}</p>
                <p><span className="font-medium">Start Time:</span> {task.startTime ? new Date(task.startTime).toLocaleString() : 'Not started'}</p>
                <p><span className="font-medium">End Time:</span> {task.endTime ? new Date(task.endTime).toLocaleString() : 'Not completed'}</p>
                <p><span className="font-medium">Verified By:</span> {task.verifiedBy?.username || 'Not verified'}</p>
              </div>
            </div>
          </div>

          {task.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{task.notes}</p>
            </div>
          )}

          {task.issues && task.issues.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Reported Issues</h3>
              <div className="space-y-2">
                {task.issues.map((issue, index) => (
                  <div key={index} className={`p-3 rounded ${issue.resolved ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className="text-sm">{issue.description}</p>
                    <span className={`text-xs ${issue.resolved ? 'text-green-600' : 'text-red-600'}`}>
                      {issue.resolved ? 'Resolved' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {canUpdateStatus() && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex flex-wrap gap-2">
              {task.status === 'pending' && (
                <button
                  onClick={() => updateTaskStatus('in-progress')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Task
                </button>
              )}
              
              {task.status === 'in-progress' && (
                <button
                  onClick={() => updateTaskStatus('completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Mark Complete
                </button>
              )}
              
              {task.status === 'cleaning' && (
                <button
                  onClick={() => setShowCleaning(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Continue Cleaning
                </button>
              )}
              
              {task.status === 'completed' && task.cleaningType === 'checkout' && (
                <button
                  onClick={() => setShowChecklist(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Room Inventory Check
                </button>
              )}
              
              {task.status === 'completed' && canVerify() && (
                <button
                  onClick={() => updateTaskStatus('verified')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Verify Task
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HousekeepingTaskDetails;