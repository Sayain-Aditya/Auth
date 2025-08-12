import React, { useState, useEffect } from "react";
import axios from "axios";
import HousekeepingPhotoUpload from "./HousekeepingPhotoUpload";
import RoomInventoryChecklist from "./RoomInventoryChecklist";

const HousekeepingTaskDetails = ({ taskId }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [canUpdateStatus, setCanUpdateStatus] = useState(false);

  useEffect(() => {
    // Get user info from token
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Decode token to get basic user info
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));

        const userData = {
          id: decoded.id,
          username: decoded.username || decoded.name || "",
          department: decoded.department,
          role: decoded.role,
        };

        setUser(userData);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (taskId && user) {
      fetchTaskDetails();
    }
  }, [taskId, user]);

  const fetchTaskDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/housekeeping/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const taskData = response.data.task;
      setTask(taskData);

      // Check if user can update this task's status
      if (user) {
        // Admin can update any task
        if (user.role === "admin") {
          setCanUpdateStatus(true);
        }
        // All staff can update tasks for now
        else if (user.role === "staff") {
          setCanUpdateStatus(true);
        }
      }

      setError("");
    } catch (err) {
      setError(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/housekeeping/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // If task is completed, update the room status to available
      if (newStatus === "completed" && task.roomId?._id) {
        await axios.put(
          `http://localhost:5000/api/rooms/update/${task.roomId._id}`,
          { status: 'available' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      fetchTaskDetails();
    } catch (err) {
      setError(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <div className="p-4">Loading task details...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!task) return <div className="p-4">No task found</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Task Details</h2>

      {/* Visual workflow indicator */}
      <div className="mb-6">
        <div className="flex items-center">
          <div
            className={`w-1/4 text-center ${
              task.status !== "pending" ? "opacity-50" : ""
            }`}
          >
            <div
              className={`h-8 w-8 rounded-full mx-auto flex items-center justify-center ${
                task.status === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              1
            </div>
            <div className="mt-1 text-xs">Pending</div>
          </div>
          <div className="w-1/4 h-1 bg-gray-200"></div>
          <div
            className={`w-1/4 text-center ${
              task.status !== "in-progress" ? "opacity-50" : ""
            }`}
          >
            <div
              className={`h-8 w-8 rounded-full mx-auto flex items-center justify-center ${
                task.status === "in-progress"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              2
            </div>
            <div className="mt-1 text-xs">In Progress</div>
          </div>
          <div className="w-1/4 h-1 bg-gray-200"></div>
          <div
            className={`w-1/4 text-center ${
              task.status !== "completed" && task.status !== "verified"
                ? "opacity-50"
                : ""
            }`}
          >
            <div
              className={`h-8 w-8 rounded-full mx-auto flex items-center justify-center ${
                task.status === "completed" || task.status === "verified"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              3
            </div>
            <div className="mt-1 text-xs">Completed</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p>
            <span className="font-semibold">Room:</span> {task.roomId?.title} (#
            {task.roomId?.room_number})
          </p>
          <p>
            <span className="font-semibold">Status:</span>
            <span
              className={`ml-2 px-2 py-1 rounded text-sm ${
                task.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : task.status === "in-progress"
                  ? "bg-blue-100 text-blue-800"
                  : task.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {task.status === "pending"
                ? "Pending"
                : task.status === "in-progress"
                ? "In Progress"
                : task.status === "completed"
                ? "Completed"
                : "Verified"}
            </span>
          </p>
          <p>
            <span className="font-semibold">Type:</span> {task.cleaningType}
          </p>
          <p>
            <span className="font-semibold">Priority:</span> {task.priority}
          </p>
        </div>
        <div>
          <p>
            <span className="font-semibold">Assigned to:</span>{" "}
            {task.assignedTo?.username || "Unassigned"}
          </p>
          <p>
            <span className="font-semibold">Created:</span>{" "}
            {new Date(task.createdAt).toLocaleString()}
          </p>
          {task.startTime && (
            <p>
              <span className="font-semibold">Started:</span>{" "}
              {new Date(task.startTime).toLocaleString()}
            </p>
          )}
          {task.endTime && (
            <p>
              <span className="font-semibold">Completed:</span>{" "}
              {new Date(task.endTime).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {task.notes && (
        <div className="mb-4">
          <h3 className="font-semibold">Notes:</h3>
          <p className="bg-gray-50 p-2 rounded">{task.notes}</p>
        </div>
      )}

      {/* Status update buttons - only show if user has permission */}
      {canUpdateStatus ? (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Update Status:</h3>

          {/* Workflow guide */}
          <div className="mb-3 p-3 bg-blue-50 text-blue-700 rounded border border-blue-200">
            <p className="font-medium">Cleaning Workflow:</p>
            <ol className="list-decimal ml-5 mt-1">
              <li>Click "Start Cleaning" when you begin cleaning the room</li>
              <li>Upload "Before Cleaning" photos</li>
              <li>
                After cleaning is complete, upload "After Cleaning" photos
              </li>
              <li>Click "Mark Completed" when the room is clean</li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateTaskStatus("in-progress")}
              disabled={task.status !== "pending"}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300"
            >
              Start Cleaning
            </button>
            <button
              onClick={() => updateTaskStatus("completed")}
              disabled={task.status !== "in-progress"}
              className="px-3 py-1 bg-green-600 text-white rounded disabled:bg-gray-300"
            >
              Mark Completed
            </button>
            {/* Only admin can verify cleaning */}
            {user && user.role === "admin" && (
              <button
                onClick={() => updateTaskStatus("verified")}
                disabled={task.status !== "completed"}
                className="px-3 py-1 bg-purple-600 text-white rounded disabled:bg-gray-300"
              >
                Verify Cleaning
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-3 bg-gray-50 text-gray-600 rounded border border-gray-200">
          <p>You don't have permission to update this task's status.</p>
          {task.assignedTo && (
            <p className="mt-1">
              This task is assigned to:{" "}
              <span className="font-medium">{task.assignedTo.username}</span>
            </p>
          )}
        </div>
      )}

      {/* Room Inventory Checklist - only show when task is in progress */}
      {task.status === "in-progress" && canUpdateStatus && (
        <div className="mb-6">
          <RoomInventoryChecklist 
            taskId={taskId} 
            roomId={task.roomId?._id}
            onComplete={() => {
              alert('Room inventory check completed!');
              fetchTaskDetails();
            }}
          />
        </div>
      )}

      {/* Photo upload section */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Room Photos:</h3>
        <HousekeepingPhotoUpload taskId={taskId} />
      </div>

      {/* Display existing photos */}
      {task.images && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before cleaning photos */}
          <div>
            <h3 className="font-semibold mb-2">Before Cleaning:</h3>
            {task.images.before && task.images.before.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {task.images.before.map((image, index) => (
                  <div key={`before-${index}`} className="relative">
                    <img
                      src={image.url}
                      alt={`Before cleaning ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No before cleaning photos</p>
            )}
          </div>

          {/* After cleaning photos */}
          <div>
            <h3 className="font-semibold mb-2">After Cleaning:</h3>
            {task.images.after && task.images.after.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {task.images.after.map((image, index) => (
                  <div key={`after-${index}`} className="relative">
                    <img
                      src={image.url}
                      alt={`After cleaning ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <span className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No after cleaning photos</p>
            )}
          </div>
        </div>
      )}
      {/* Issue reporting section */}
      {task.status === "in-progress" && canUpdateStatus && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Report Broken Item:</h3>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const description = e.target.description.value;
                const severity = e.target.severity.value;
                if (!description) return;

                try {
                  const token = localStorage.getItem("token");
                  await axios.post(
                    `http://localhost:5000/api/housekeeping/tasks/${taskId}/issues`,
                    { description, severity },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  e.target.reset();
                  setError("");
                  fetchTaskDetails();
                  alert("Issue reported successfully");
                } catch (err) {
                  setError(
                    `Error reporting issue: ${
                      err.response?.data?.error || err.message
                    }`
                  );
                }
              }}
            >
              <div className="mb-3">
                <label className="block mb-1">
                  Description of broken item:
                </label>
                <input
                  type="text"
                  name="description"
                  className="w-full p-2 border rounded"
                  placeholder="e.g. Broken lamp, TV not working"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Severity:</label>
                <select name="severity" className="w-full p-2 border rounded">
                  <option value="low">Low - Not urgent</option>
                  <option value="medium">Medium - Needs attention soon</option>
                  <option value="high">
                    High - Requires immediate attention
                  </option>
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Report Issue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Display reported issues */}
      {task.issues && task.issues.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Reported Issues:</h3>
          <div className="border rounded divide-y">
            {task.issues.map((issue, index) => (
              <div key={index} className="p-3">
                <div className="flex justify-between">
                  <span className="font-medium">{issue.description}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      issue.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : issue.severity === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {issue.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Reported: {new Date(issue.reportedAt).toLocaleString()}
                </div>
                {issue.resolved && (
                  <div className="mt-1 text-sm text-green-600">
                    ✓ Resolved: {issue.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingTaskDetails;