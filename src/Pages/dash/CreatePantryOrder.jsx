import React, { useState, useEffect } from 'react';

const CreatePantryOrder = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [orderType, setOrderType] = useState('kitchen-to-pantry');
  const [selectedItems, setSelectedItems] = useState([]);
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPantryItems();
  }, []);

  const fetchPantryItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pantry/items', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch pantry items');
      const data = await response.json();
      // Filter pantry items (food, beverage categories or Pantry location)
      const pantryItems = (data.items || []).filter(item => 
        ['food', 'beverage'].includes(item.category) || 
        item.location === 'Pantry'
      );
      setPantryItems(pantryItems);
    } catch (err) {
      setError(err.message);
    }
  };

  const addItem = () => {
    if (pantryItems.length === 0) return;
    
    const firstItem = pantryItems[0];
    setSelectedItems([...selectedItems, {
      pantryItemId: firstItem._id,
      name: firstItem.name,
      quantity: 1,
      unit: firstItem.unit,
      notes: ''
    }]);
  };

  const removeItem = (index) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...selectedItems];
    
    if (field === 'pantryItemId') {
      const selectedPantryItem = pantryItems.find(item => item._id === value);
      if (selectedPantryItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          pantryItemId: value,
          name: selectedPantryItem.name,
          unit: selectedPantryItem.unit
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'quantity' ? Number(value) : value
      };
    }
    
    setSelectedItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      setError('Please add at least one item to the order');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const orderData = {
        orderType,
        items: selectedItems,
        priority,
        notes
      };
      
      const response = await fetch('http://localhost:5000/api/pantry/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Failed to create order');
      setSuccess(true);
      setSelectedItems([]);
      setNotes('');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="bg-gray-100 p-4 rounded-t-lg">
        <h5 className="font-medium">Create Pantry Order</h5>
      </div>
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Order created successfully!
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="kitchen-to-pantry">Kitchen to Pantry</option>
                <option value="pantry-to-reception">Pantry to Reception</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h6 className="font-medium">Items</h6>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition"
              >
                Add Item
              </button>
            </div>
            
            {selectedItems.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                No items added yet. Click "Add Item" to add items to this order.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                    <select
                      value={item.pantryItemId}
                      onChange={(e) => updateItem(index, 'pantryItemId', e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {pantryItems.map(pantryItem => (
                        <option key={pantryItem._id} value={pantryItem._id}>
                          {pantryItem.name}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="w-20 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    <span className="text-sm text-gray-600">{item.unit}</span>
                    
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || selectedItems.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePantryOrder;