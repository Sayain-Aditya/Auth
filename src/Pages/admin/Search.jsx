import React, { useState } from 'react';
import axios from 'axios';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchTypes = [
    { value: '', label: 'All' },
    { value: 'orders', label: 'Orders' },
    { value: 'kots', label: 'KOTs' },
    { value: 'bills', label: 'Bills' },
    { value: 'items', label: 'Items' },
    { value: 'tables', label: 'Tables' },
    { value: 'users', label: 'Users' },
    { value: 'bookings', label: 'Bookings' },
    { value: 'rooms', label: 'Rooms' }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ query: searchQuery });
      if (searchType) params.append('type', searchType);
      
      const res = await axios.get(`http://localhost:5000/api/search/universal?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResults(res.data);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = (type, data) => {
    if (!data || data.length === 0) return null;

    return (
      <div key={type} className="mb-6">
        <h3 className="text-lg font-semibold mb-3 capitalize">{type}</h3>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded border">
              {renderItem(type, item)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderItem = (type, item) => {
    switch (type) {
      case 'orders':
        return (
          <div>
            <p><strong>Table:</strong> {item.tableNo}</p>
            <p><strong>Staff:</strong> {item.staffName}</p>
            <p><strong>Phone:</strong> {item.phoneNumber}</p>
            <p><strong>Amount:</strong> ₹{item.amount}</p>
            <p><strong>Status:</strong> {item.status}</p>
          </div>
        );
      
      case 'kots':
        return (
          <div>
            <p><strong>KOT #:</strong> {item.kotNumber}</p>
            <p><strong>Table:</strong> {item.tableNo}</p>
            <p><strong>Status:</strong> {item.status}</p>
            <p><strong>Items:</strong> {item.items?.length || 0}</p>
          </div>
        );
      
      case 'bills':
        return (
          <div>
            <p><strong>Bill #:</strong> {item.billNumber}</p>
            <p><strong>Table:</strong> {item.tableNo}</p>
            <p><strong>Amount:</strong> ₹{item.totalAmount}</p>
            <p><strong>Payment:</strong> {item.paymentMethod}</p>
            <p><strong>Status:</strong> {item.paymentStatus}</p>
          </div>
        );
      
      case 'items':
        return (
          <div>
            <p><strong>Name:</strong> {item.name}</p>
            <p><strong>Price:</strong> ₹{item.Price}</p>
            <p><strong>Category:</strong> {item.category}</p>
            {item.description && <p><strong>Description:</strong> {item.description}</p>}
          </div>
        );
      
      case 'tables':
        return (
          <div>
            <p><strong>Table:</strong> {item.tableNumber}</p>
            <p><strong>Capacity:</strong> {item.capacity}</p>
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>Status:</strong> {item.status}</p>
          </div>
        );
      
      case 'users':
        return (
          <div>
            <p><strong>Username:</strong> {item.username}</p>
            <p><strong>Email:</strong> {item.email}</p>
            <p><strong>Role:</strong> {item.role}</p>
            {item.restaurantRole && <p><strong>Restaurant Role:</strong> {item.restaurantRole}</p>}
          </div>
        );
      
      case 'bookings':
        return (
          <div>
            <p><strong>Guest:</strong> {item.guestName}</p>
            <p><strong>Phone:</strong> {item.phoneNumber}</p>
            <p><strong>Email:</strong> {item.email}</p>
          </div>
        );
      
      case 'rooms':
        return (
          <div>
            <p><strong>Room:</strong> {item.room_number}</p>
            <p><strong>Type:</strong> {item.room_type}</p>
            <p><strong>Status:</strong> {item.status}</p>
          </div>
        );
      
      default:
        return <pre>{JSON.stringify(item, null, 2)}</pre>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Universal Search</h2>
      
      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search query..."
            className="flex-1 p-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="p-2 border rounded"
          >
            {searchTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      {/* Search Results */}
      <div className="bg-white rounded-lg shadow p-4">
        {Object.keys(results).length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {loading ? 'Searching...' : 'Enter a search query to see results'}
          </p>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">Search Results</h3>
            {Object.entries(results).map(([type, data]) => renderResults(type, data))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;