import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PantryItemList from './PantryItemList';
import PantryOrderList from './PantryOrderList';
import CreatePantryOrder from './CreatePantryOrder';
import PantryItemForm from '../admin/PantryItemForm';

const PantryDashboard = () => {
  const [activeTab, setActiveTab] = useState('items');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in PantryDashboard, redirecting to login');
      navigate('/login');
    } else {
      console.log('Token found in PantryDashboard:', token.substring(0, 20) + '...');
    }
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 mt-8">
      <h2 className="text-2xl font-bold mb-6">Pantry Management</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="bg-gray-100 p-3 rounded-t-lg font-medium">Navigation</div>
            <div>
              <nav className="flex flex-col">
                <button 
                  className={`p-3 text-left hover:bg-gray-50 ${activeTab === 'items' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                  onClick={() => setActiveTab('items')}
                >
                  Pantry Items
                </button>
                <button 
                  className={`p-3 text-left hover:bg-gray-50 ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  Orders
                </button>
                <button 
                  className={`p-3 text-left hover:bg-gray-50 ${activeTab === 'create-order' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                  onClick={() => setActiveTab('create-order')}
                >
                  Create Order
                </button>
                <button 
                  className={`p-3 text-left hover:bg-gray-50 ${activeTab === 'add-item' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                  onClick={() => setActiveTab('add-item')}
                >
                  Add Item
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        <div className="md:w-3/4">
          {activeTab === 'items' && <PantryItemList />}
          {activeTab === 'orders' && <PantryOrderList />}
          {activeTab === 'create-order' && <CreatePantryOrder />}
          {activeTab === 'add-item' && <PantryItemForm />}
        </div>
      </div>
    </div>
  );
};

export default PantryDashboard;