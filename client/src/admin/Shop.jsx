/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";

const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [newShop, setNewShop] = useState({
    name: "",
    owner: "",
    owneremail: "",
    contact: {
      email: "",
      phoneno: "",
    },
    location: {
      address: "",
      mapurl: [],
    },
    imageUrls: [],
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [message, setMessage] = useState("");

  // State for editing shops
  const [editingShopId, setEditingShopId] = useState(null);
  const [editShopData, setEditShopData] = useState({
    name: "",
    owner: "",
    owneremail: "",
    contact: {
      email: "",
      phoneno: "",
    },
    location: {
      address: "",
      mapurl: [],
    },
    imageUrls: [],
  });
  const [editFiles, setEditFiles] = useState([]);
  const [editUploading, setEditUploading] = useState(false);
  const [editImageUploadError, setEditImageUploadError] = useState(false);
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch("/api/property/shop/getall");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setShops(data);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError("Failed to load shops. Please try again later.");
      }
    };
    fetchShops();
  }, []);

  // Handle form input changes for creating a new shop
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Handle nested state for contact and location
    if (name.startsWith("contact.")) {
      const field = name.split(".")[1];
      setNewShop((prev) => ({
        ...prev,
        contact: { ...prev.contact, [field]: value },
      }));
    } else if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      setNewShop((prev) => ({
        ...prev,
        location: { ...prev.location, [field]: value },
      }));
    } else {
      setNewShop((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission for creating a new shop
  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/property/shop/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newShop),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setShops((prevShops) => [...prevShops, data]); // Add the new shop to the list
      setNewShop({
        name: "",
        owner: "",
        owneremail: "",
        contact: { email: "", phoneno: "" },
        location: { address: "", mapurl: [] },
        imageUrls: [],
      }); // Reset the form
      setFiles([]);
      setMessage("Shop created successfully!");
    } catch (err) {
      console.error("Error creating shop:", err);
      setError("Failed to create shop. Please try again.");
    }
  };

  // Handle image upload (both for create and edit)
  const handleImageUpload = async (files, setImageState) => {
    if (files.length === 0) {
      setImageUploadError("Select images to upload.");
      return;
    }

    const maxImages = 6;
    if (files.length + setImageState.imageUrls.length > maxImages) {
      setImageUploadError(`You can only upload up to ${maxImages} images.`);
      return;
    }

    setUploading(true);
    setImageUploadError(false);

    try {
      const uploadPromises = files.map((file) => storeImage(file));
      const urls = await Promise.all(uploadPromises);
      setImageState((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...urls],
      }));
      setUploading(false);
    } catch (err) {
      console.error("Image upload error:", err);
      setImageUploadError("Image upload failed. Please try again.");
      setUploading(false);
    }
  };

  // Handle image upload for creating a new shop
  const handleImageSubmit = () => {
    handleImageUpload(files, setNewShop);
    setFiles([]); // Clear selected files after upload
  };

  // Handle image upload for editing a shop
  const handleEditImageSubmit = () => {
    handleImageUpload(editFiles, setEditShopData);
    setEditFiles([]); // Clear selected files after upload
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "_" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`The progress is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  // Handle image removal for creating a new shop
  const handleRemoveImage = (index) => {
    setNewShop((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  // Handle image removal for editing a shop
  const handleEditRemoveImage = (index) => {
    setEditShopData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  // Handle initiating edit
  const initiateEdit = (shop) => {
    setEditingShopId(shop._id);
    setEditShopData({
      name: shop.name,
      owner: shop.owner,
      owneremail: shop.owneremail,
      contact: { ...shop.contact },
      location: { ...shop.location },
      imageUrls: [...shop.imageUrls],
    });
    setEditMessage("");
    setEditFiles([]);
  };

  // Handle cancelling edit
  const cancelEdit = () => {
    setEditingShopId(null);
    setEditShopData({
      name: "",
      owner: "",
      owneremail: "",
      contact: { email: "", phoneno: "" },
      location: { address: "", mapurl: [] },
      imageUrls: [],
    });
    setEditFiles([]);
    setEditMessage("");
  };

  // Handle form input changes for editing a shop
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contact.")) {
      const field = name.split(".")[1];
      setEditShopData((prev) => ({
        ...prev,
        contact: { ...prev.contact, [field]: value },
      }));
    } else if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      setEditShopData((prev) => ({
        ...prev,
        location: { ...prev.location, [field]: value },
      }));
    } else {
      setEditShopData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle submitting edit
  const handleUpdateShop = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/property/shop/${editingShopId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editShopData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedShop = await response.json();
      setShops((prevShops) =>
        prevShops.map((shop) =>
          shop._id === updatedShop._id ? updatedShop : shop
        )
      );
      setEditingShopId(null);
      setEditShopData({
        name: "",
        owner: "",
        owneremail: "",
        contact: { email: "", phoneno: "" },
        location: { address: "", mapurl: [] },
        imageUrls: [],
      });
      setEditFiles([]);
      setEditMessage("Shop updated successfully!");
    } catch (err) {
      console.error("Error updating shop:", err);
      setEditMessage("Failed to update shop. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Shop Management
      </h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {message && <p className="text-green-500 text-center mb-4">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shop List Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            Shop List
          </h3>
          <ul className="space-y-4">
            {Array.isArray(shops) &&
              shops.map((shop) => (
                <li
                  key={shop._id}
                  className="flex items-center justify-between"
                >
                  <button
                    className="text-lg font-medium text-blue-600 hover:text-blue-800"
                    onClick={() => navigate(`/add-products/${shop._id}`)}
                  >
                    {shop.name}
                  </button>
                  <div className="flex space-x-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => initiateEdit(shop)}
                      className="text-yellow-500 hover:text-yellow-700"
                      title="Edit Shop"
                    >
                      {/* Edit Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M17.414 2.586a2 2 0 010 2.828L7.828 15H5v-2.828l9.586-9.586a2 2 0 012.828 0z" />
                        <path
                          fillRule="evenodd"
                          d="M2 5a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v5a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {/* Delete Button (Optional) */}
                    {/* Implement delete functionality if needed */}
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Create New Shop Section */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            Create a New Shop
          </h3>
          <form onSubmit={handleCreateShop} className="space-y-4">
            {/* Shop Name */}
            <input
              type="text"
              name="name"
              placeholder="Shop Name"
              value={newShop.name}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Owner Name */}
            <input
              type="text"
              name="owner"
              placeholder="Owner Name"
              value={newShop.owner}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Owner Email */}
            <input
              type="email"
              name="owneremail"
              placeholder="Owner Email"
              value={newShop.owneremail}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Contact Email */}
            <input
              type="email"
              name="contact.email"
              placeholder="Contact Email"
              value={newShop.contact.email}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Contact Phone Number */}
            <input
              type="tel"
              name="contact.phoneno"
              placeholder="Contact Phone Number"
              value={newShop.contact.phoneno}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Shop Address */}
            <input
              type="text"
              name="location.address"
              placeholder="Shop Address"
              value={newShop.location.address}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Map URLs */}
            <input
              type="text"
              name="location.mapurl"
              placeholder="Map URL (comma separated)"
              value={newShop.location.mapurl.join(", ")} // Joining to input as string
              onChange={(e) => {
                const mapUrls = e.target.value
                  .split(",")
                  .map((url) => url.trim());
                setNewShop((prev) => ({
                  ...prev,
                  location: { ...prev.location, mapurl: mapUrls },
                }));
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Image Upload Section */}
            <div className="col-span-full">
              <label className="block text-gray-700 font-bold mb-2">
                Upload Images (Max 6):
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="border rounded p-2 w-full"
              />
              {imageUploadError && (
                <p className="text-red-600">{imageUploadError}</p>
              )}
              <button
                type="button"
                onClick={handleImageSubmit}
                disabled={uploading}
                className="mt-2 bg-blue-500 text-white rounded p-2 w-full hover:bg-blue-600 transition-colors"
              >
                {uploading ? "Uploading..." : "Upload Images"}
              </button>
            </div>

            {/* Display Uploaded Images */}
            {newShop.imageUrls.length > 0 && (
              <div className="col-span-full mt-4">
                <h4 className="text-lg font-semibold">Uploaded Images:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {newShop.imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Uploaded ${index}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Remove Image"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Add Shop
            </button>
          </form>
        </div>
      </div>

      {/* Edit Shop Modal */}
      {editingShopId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 p-6 rounded-lg shadow-lg overflow-y-auto max-h-full">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Edit Shop
            </h3>
            {editMessage && (
              <p
                className={`mb-4 text-sm ${
                  editMessage.includes("successfully")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {editMessage}
              </p>
            )}
            <form onSubmit={handleUpdateShop} className="space-y-4">
              {/* Shop Name */}
              <input
                type="text"
                name="name"
                placeholder="Shop Name"
                value={editShopData.name}
                onChange={handleEditInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Owner Name */}
              <input
                type="text"
                name="owner"
                placeholder="Owner Name"
                value={editShopData.owner}
                onChange={handleEditInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Owner Email */}
              <input
                type="email"
                name="owneremail"
                placeholder="Owner Email"
                value={editShopData.owneremail}
                onChange={handleEditInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Contact Email */}
              <input
                type="email"
                name="contact.email"
                placeholder="Contact Email"
                value={editShopData.contact.email}
                onChange={handleEditInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Contact Phone Number */}
              <input
                type="tel"
                name="contact.phoneno"
                placeholder="Contact Phone Number"
                value={editShopData.contact.phoneno}
                onChange={handleEditInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Shop Address */}
              <input
                type="text"
                name="location.address"
                placeholder="Shop Address"
                value={editShopData.location.address}
                onChange={handleEditInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Map URLs */}
              <input
                type="text"
                name="location.mapurl"
                placeholder="Map URL (comma separated)"
                value={editShopData.location.mapurl.join(", ")} // Joining to input as string
                onChange={(e) => {
                  const mapUrls = e.target.value
                    .split(",")
                    .map((url) => url.trim());
                  setEditShopData((prev) => ({
                    ...prev,
                    location: { ...prev.location, mapurl: mapUrls },
                  }));
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Image Upload Section */}
              <div className="col-span-full">
                <label className="block text-gray-700 font-bold mb-2">
                  Upload Images (Max 6):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setEditFiles(Array.from(e.target.files))}
                  className="border rounded p-2 w-full"
                />
                {editImageUploadError && (
                  <p className="text-red-600">{editImageUploadError}</p>
                )}
                <button
                  type="button"
                  onClick={handleEditImageSubmit}
                  disabled={editUploading}
                  className="mt-2 bg-blue-500 text-white rounded p-2 w-full hover:bg-blue-600 transition-colors"
                >
                  {editUploading ? "Uploading..." : "Upload Images"}
                </button>
              </div>

              {/* Display Uploaded Images */}
              {editShopData.imageUrls.length > 0 && (
                <div className="col-span-full mt-4">
                  <h4 className="text-lg font-semibold">Uploaded Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {editShopData.imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Uploaded ${index}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          onClick={() => handleEditRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Remove Image"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Update Shop
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="ml-4 py-3 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 focus:outline-none transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopList;
