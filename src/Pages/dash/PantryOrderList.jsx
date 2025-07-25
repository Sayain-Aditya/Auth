import React, { useState, useEffect } from 'react';

const PantryOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filterType, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('orderType', filterType);
      if (filterStatus) params.append('status', filterStatus);
      
      const url = `http://localhost:5000/api/pantry/orders${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pantry/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update order status');
      fetchOrders();
    } catch (err) {
      alert(`Error updating order: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      fulfilled: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-red-600">
        <h5 className="text-lg font-medium">Error: {error}</h5>
        <button 
          className="mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
          onClick={fetchOrders}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="bg-gray-100 p-4 rounded-t-lg flex justify-between items-center">
        <h5 className="font-medium">Pantry Orders</h5>
        <div className="flex space-x-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="kitchen-to-pantry">Kitchen to Pantry</option>
            <option value="pantry-to-reception">Pantry to Reception</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Order #</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Requested By</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-center text-gray-500">No orders found</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm">
                      {order.orderType === 'kitchen-to-pantry' ? 'Kitchen → Pantry' : 'Pantry → Reception'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{order.items.length} items</td>
                  <td className="px-4 py-3">{getPriorityBadge(order.priority)}</td>
                  <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-3">{order.requestedBy?.username || 'Unknown'}</td>
                  <td className="px-4 py-3">
                    {order.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateOrderStatus(order._id, 'approved')}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {order.status === 'approved' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'fulfilled')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PantryOrderList;