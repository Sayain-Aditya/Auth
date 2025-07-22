import React, { useState, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase"; // adjust path as needed
import axios from "axios";

const HousekeepingPhotoUpload = ({ taskId }) => {
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadType, setUploadType] = useState("before");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (uploadType === "before") setBeforeImages(files);
    else setAfterImages(files);
  };

  // Upload a single file to Firebase Storage and get its URL
  const uploadToFirebase = async (file) => {
    const storageRef = ref(storage, `housekeeping/photos/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleUpload = async () => {
    setUploading(true);
    setMessage("");
    try {
      const imagesToUpload = uploadType === "before" ? beforeImages : afterImages;
      const uploadedUrls = [];
      for (let i = 0; i < imagesToUpload.length; i++) {
        const url = await uploadToFirebase(imagesToUpload[i]);
        uploadedUrls.push(url);
      }
      // Send URLs to backend to associate with the task
      const token = localStorage.getItem("token");
      const taskEndpoint = `http://localhost:5000/api/housekeeping/tasks/${taskId}/images/${uploadType}`;
      await axios.post(
        taskEndpoint,
        { imageUrls: uploadedUrls },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`${uploadType === "before" ? "Before" : "After"} cleaning photos uploaded successfully!`);
      if (uploadType === "before") setBeforeImages([]);
      else setAfterImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <h3 className="text-lg font-semibold mb-3">Room Photos</h3>
      {message && (
        <div className={`p-2 mb-4 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {message}
        </div>
      )}
      <div className="mb-4">
        <div className="flex space-x-2 mb-3">
          <button
            type="button"
            onClick={() => setUploadType("before")}
            className={`px-3 py-1 rounded ${uploadType === "before" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Before Cleaning
          </button>
          <button
            type="button"
            onClick={() => setUploadType("after")}
            className={`px-3 py-1 rounded ${uploadType === "after" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            After Cleaning
          </button>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
          ref={fileInputRef}
        />
        <div className="mt-2 text-sm text-gray-600">
          {uploadType === "before" ? `${beforeImages.length} files selected` : `${afterImages.length} files selected`}
        </div>
      </div>
      <button
        onClick={handleUpload}
        disabled={uploading || (uploadType === "before" ? !beforeImages.length : !afterImages.length)}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : `Upload ${uploadType === "before" ? "Before" : "After"} Photos`}
      </button>
      {(uploadType === "before" ? beforeImages : afterImages).length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Preview:</h4>
          <div className="grid grid-cols-3 gap-2">
            {(uploadType === "before" ? beforeImages : afterImages).map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingPhotoUpload;