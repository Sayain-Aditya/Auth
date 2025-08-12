import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomInventoryChecklist = ({ taskId, roomId, onComplete }) => {
  const [items, setItems] = useState([]);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomInventory();
  }, [roomId, taskId]);

  const fetchRoomInventory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/inventory/room/${roomId}/checklist?taskId=${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.checklist && response.data.checklist.items.length > 0) {
        setChecklist(response.data.checklist);
        setItems(response.data.checklist.items);
      } else if (response.data.items && response.data.items.length > 0) {
        // Set existing checklist if it exists (even if empty)
        if (response.data.checklist) {
          setChecklist(response.data.checklist);
        }
        
        const inventoryItems = response.data.items.map(item => ({
          inventoryId: item._id,
          itemName: item.name,
          isPresent: true,
          notes: ''
        }));
        setItems(inventoryItems);
        console.log('Mapped items:', inventoryItems);
      } else {
        console.log('No items found in response');
        setItems([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching room inventory:', error);
      setLoading(false);
    }
  };

  const handleItemCheck = (index, isPresent) => {
    const updatedItems = [...items];
    updatedItems[index].isPresent = isPresent;
    setItems(updatedItems);
  };

  const handleNotesChange = (index, notes) => {
    const updatedItems = [...items];
    updatedItems[index].notes = notes;
    setItems(updatedItems);
  };

  const saveChecklist = async () => {
    try {
      if (checklist) {
        await axios.put(`http://localhost:5000/api/inventory/checklist/${checklist._id}`, {
          items,
          status: 'completed'
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/inventory/room/${roomId}/checklist`, {
          housekeepingTaskId: taskId,
          items
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      onComplete();
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading room inventory...</div>;
  }

  const checkInventoryCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory/debug/count', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Inventory debug info:', response.data);
      alert(`Found ${response.data.count} items in inventory`);
    } catch (error) {
      console.error('Error checking inventory:', error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Room Inventory Checklist</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-yellow-800 mb-2">No inventory items found for room checklist.</p>
          <p className="text-sm text-yellow-700 mb-3">Please contact admin to add room inventory items.</p>
          <button 
            onClick={checkInventoryCount}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Check Inventory Count
          </button>
        </div>
      </div>
    );
  }

  const missingItems = items.filter(item => !item.isPresent);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Room Inventory Checklist</h3>
      
      <div className="space-y-3 mb-6">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
            <div className="flex items-center space-x-3 flex-1">
              <input
                type="checkbox"
                checked={item.isPresent}
                onChange={(e) => handleItemCheck(index, e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <div className="flex-1">
                <span className={`font-medium ${!item.isPresent ? 'text-red-600' : 'text-gray-900'}`}>
                  {item.itemName}
                </span>
                {!item.isPresent && (
                  <input
                    type="text"
                    placeholder="Notes about missing item"
                    value={item.notes}
                    onChange={(e) => handleNotesChange(index, e.target.value)}
                    className="mt-2 w-full px-3 py-1 border rounded text-sm"
                  />
                )}
              </div>
            </div>
            
            <div className="ml-4">
              {item.isPresent ? (
                <span className="text-green-600 text-sm">✓ Present</span>
              ) : (
                <span className="text-red-600 text-sm">✗ Missing</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {missingItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <h4 className="text-red-800 font-medium mb-2">Missing Items ({missingItems.length})</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {missingItems.map((item, index) => (
              <li key={index}>• {item.itemName} {item.notes && `- ${item.notes}`}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={saveChecklist}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Complete Inventory Check
      </button>
    </div>
  );
};

export default RoomInventoryChecklist;