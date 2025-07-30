import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KOTManagement = () => {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ status: '', priority: '' });

  useEffect(() => {
    fetchKOTs();
  }, [filter]);

  const fetchKOTs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);
      
      const res = await axios.get(`http://localhost:5000/api/kot/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKots(res.data);
    } catch (err) {
      setError('Failed to fetch KOTs');
    } finally {
      setLoading(false);
    }
  };

  const updateKOTStatus = async (kotId, status, actualTime = null) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { status };
      if (actualTime) payload.actualTime = actualTime;
      
      await axios.patch(`http://localhost:5000/api/kot/${kotId}/status`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKOTs();
    } catch (err) {
      setError('Failed to update KOT status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">KOT Management</h2>
      
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="served">Served</option>
        </select>
        
        <select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        
        <button
          onClick={fetchKOTs}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kots.map(kot => (
            <div key={kot._id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{kot.kotNumber}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(kot.priority)}`}>
                    {kot.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(kot.status)}`}>
                    {kot.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <p><strong>Table:</strong> {kot.tableNo}</p>
                <p><strong>Time:</strong> {new Date(kot.createdAt).toLocaleTimeString()}</p>
                {kot.estimatedTime && <p><strong>Est. Time:</strong> {kot.estimatedTime} min</p>}
                {kot.actualTime && <p><strong>Actual Time:</strong> {kot.actualTime} min</p>}
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Items:</h4>
                {kot.items.map((item, index) => (
                  <div key={index} className="text-sm bg-gray-50 p-2 rounded mb-1">
                    <span className="font-medium">{item.itemName}</span> x {item.quantity}
                    {item.specialInstructions && (
                      <div className="text-gray-600 text-xs mt-1">
                        Note: {item.specialInstructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                {kot.status === 'pending' && (
                  <button
                    onClick={() => updateKOTStatus(kot._id, 'preparing')}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Start Preparing
                  </button>
                )}
                
                {kot.status === 'preparing' && (
                  <button
                    onClick={() => {
                      const actualTime = prompt('Enter actual preparation time (minutes):');
                      if (actualTime) updateKOTStatus(kot._id, 'ready', parseInt(actualTime));
                    }}
                    className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Mark Ready
                  </button>
                )}
                
                {kot.status === 'ready' && (
                  <button
                    onClick={() => updateKOTStatus(kot._id, 'served')}
                    className="flex-1 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Mark Served
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && kots.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No KOTs found
        </div>
      )}
    </div>
  );
};

export default KOTManagement;