import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/search/universal?query=${query}&type=users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFilteredUsers(res.data.users || []);
      } catch (err) {
        console.error('Search failed:', err);
        setFilteredUsers([]);
      }
    } else {
      setFilteredUsers(users);
    }
  };

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/auth/all-users?page=${page}&limit=15`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role, restaurantRole) => {
    const baseClass = "px-2 py-1 rounded text-xs";
    
    if (role === 'admin') {
      return <span className={`${baseClass} bg-red-100 text-red-800`}>Admin</span>;
    } else if (role === 'staff') {
      return <span className={`${baseClass} bg-blue-100 text-blue-800`}>Staff</span>;
    } else if (role === 'restaurant') {
      const subRoleClass = restaurantRole === 'chef' ? 'bg-orange-100 text-orange-800' :
                          restaurantRole === 'cashier' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800';
      return (
        <div className="flex gap-1">
          <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>Restaurant</span>
          <span className={`${baseClass} ${subRoleClass}`}>{restaurantRole}</span>
        </div>
      );
    }
    return <span className={`${baseClass} bg-gray-100 text-gray-800`}>{role}</span>;
  };

  const formatDepartments = (departments) => {
    if (!departments) return 'None';
    if (Array.isArray(departments)) {
      return departments.map(dep => dep.name || dep).join(', ');
    }
    return departments.name || departments;
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setEditUser({ ...user, password: '' });
    setShowEditModal(true);
  };

  const updateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const updateData = { ...editUser };
      
      // Only include password if it's provided
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }
      
      await axios.put(`http://localhost:5000/api/auth/users/${editUser._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      setSuccess('User updated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to update user');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users by username, email, or role..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      {loading ? (
        <div className="text-center">Loading users...</div>
      ) : (
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td className="px-4 py-2 border-b font-medium">{user.username}</td>
                    <td className="px-4 py-2 border-b">{user.email}</td>
                    <td className="px-4 py-2 border-b">
                      {getRoleBadge(user.role, user.restaurantRole)}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {formatDepartments(user.department)}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 text-sm hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {!searchQuery && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-4 py-2 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsers(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-white border rounded">
                  {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchUsers(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            
            <div className="mb-4">
              <label className="block mb-1">Username</label>
              <input
                type="text"
                value={editUser.username}
                onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={editUser.password || ''}
                onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter new password or leave blank"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Role</label>
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="restaurant">Restaurant</option>
              </select>
            </div>
            
            {editUser.role === 'staff' && (
              <div className="mb-4">
                <label className="block mb-1">Department</label>
                <select
                  multiple
                  value={Array.isArray(editUser.department) ? editUser.department.map(d => d.id?.toString() || d.toString()) : []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => ({
                      id: parseInt(option.value),
                      name: option.text
                    }));
                    setEditUser({...editUser, department: selected});
                  }}
                  className="w-full p-2 border rounded"
                  size="6"
                >
                  <option value="1">kitchen</option>
                  <option value="2">laundry</option>
                  <option value="3">reception</option>
                  <option value="4">maintenance</option>
                  <option value="5">other</option>
                  <option value="6">housekeeping</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            )}
            
            {editUser.role === 'restaurant' && (
              <div className="mb-4">
                <label className="block mb-1">Restaurant Role</label>
                <select
                  value={editUser.restaurantRole || ''}
                  onChange={(e) => setEditUser({...editUser, restaurantRole: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="staff">Staff</option>
                  <option value="cashier">Cashier</option>
                  <option value="chef">Chef</option>
                </select>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={updateUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;