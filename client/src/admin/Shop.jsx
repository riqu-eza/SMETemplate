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
import EditShop from "./Editshop";

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
    promotionalimages: [],
    companypolicy: "",
    operationperiods: "",
    socialmedialinks: [],
    payonorder: true,
  });
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [promoUploading, setPromoUploading] = useState(false);
  const [promoUploadError, setPromoUploadError] = useState(false);
  const [error, setError] = useState(null);
  const [editingShop, setEditingShop] = useState(null);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [promoFiles, setPromoFiles] = useState([]);

  const [message, setMessage] = useState("");

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
    const { name, value, type, checked } = e.target;

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
    } else if (name.startsWith("operationperiods.")) {
      // eslint-disable-next-line no-unused-vars
      const [_, day, period] = name.split(".");
      setNewShop((prev) => ({
        ...prev,
        operationperiods: {
          ...prev.operationperiods,
          [day]: {
            ...prev.operationperiods[day],
            [period]: value,
          },
        },
      }));
    } else if (type === "checkbox") {
      setNewShop((prev) => ({ ...prev, [name]: checked }));
    } else {
      setNewShop((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission for creating a new shop
  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      console.log(newShop);
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
  const handleImageSubmit = async (type) => {
    let selectedFiles = type === "images" ? files : promoFiles;
    let setUploadingState =
      type === "images" ? setUploading : setPromoUploading;
    let setErrorState =
      type === "images" ? setImageUploadError : setPromoUploadError;
    let updateField = type === "images" ? "imageUrls" : "promotionalimages";

    if (
      selectedFiles.length > 0 &&
      selectedFiles.length + newShop[updateField].length < 7
    ) {
      setUploadingState(true);
      setErrorState(false);
      const promises = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        promises.push(storeImage(selectedFiles[i]));
      }

      Promise.all(promises)
        .then((urls) => {
          setNewShop((prev) => ({
            ...prev,
            [updateField]: [...prev[updateField], ...urls],
          }));
          setErrorState(false);
          setUploadingState(false);
        })
        .catch(() => {
          setErrorState("Image upload failed (2MB max per image)");
          setUploadingState(false);
        });
    } else if (selectedFiles.length === 0) {
      setErrorState("Select images to upload");
      setUploadingState(false);
    } else {
      setErrorState("You can only upload 6 images per category");
      setUploadingState(false);
    }
  };
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageref = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageref, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
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
  const handleRemoveImage = (type, index) => {
    setNewShop((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };
  const handleEditShop = (shop) => {
    setEditingShop(shop);
  };
  const handleUpdateShop = (updatedShop) => {
    setShops((prevShops) =>
      prevShops.map((shop) => (shop._id === updatedShop._id ? updatedShop : shop))
    );
    setEditingShop(null);
    setMessage("Shop updated successfully!");
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
                      onClick={() => handleEditShop(shop)}
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
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Conditionally Render Create New Shop Section */}
        {shops.length === 0 && (
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
                placeholder="Shops Email"
                value={newShop.contact.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Contact Phone Number */}
              <input
                type="tel"
                name="contact.phoneno"
                placeholder=" Phone Number"
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
                value={newShop.location.mapurl.join(", ")}
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
              {/* Company Policy */}
              <textarea
                name="companypolicy"
                placeholder="Company Policy"
                value={newShop.companypolicy}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Operation Periods */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Operation Periods
                </label>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <span className="w-24">{day}</span>
                    <input
                      type="time"
                      name={`operationperiods.${day.toLowerCase()}.open`}
                      placeholder="Open Time"
                      value={
                        newShop.operationperiods[day.toLowerCase()]?.open || ""
                      }
                      onChange={(e) => {
                        const { name, value } = e.target;
                        const dayName = name.split(".")[1];
                        setNewShop((prev) => ({
                          ...prev,
                          operationperiods: {
                            ...prev.operationperiods,
                            [dayName]: {
                              ...prev.operationperiods[dayName],
                              open: value,
                            },
                          },
                        }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="time"
                      name={`operationperiods.${day.toLowerCase()}.close`}
                      placeholder="Close Time"
                      value={
                        newShop.operationperiods[day.toLowerCase()]?.close || ""
                      }
                      onChange={(e) => {
                        const { name, value } = e.target;
                        const dayName = name.split(".")[1];
                        setNewShop((prev) => ({
                          ...prev,
                          operationperiods: {
                            ...prev.operationperiods,
                            [dayName]: {
                              ...prev.operationperiods[dayName],
                              close: value,
                            },
                          },
                        }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
              {/* Social Media Links */}
              <input
                type="text"
                name="socialmedialinks"
                placeholder="Social Media Links (comma separated)"
                value={newShop.socialmedialinks.join(", ")}
                onChange={(e) => {
                  const links = e.target.value
                    .split(",")
                    .map((link) => link.trim());
                  setNewShop((prev) => ({
                    ...prev,
                    socialmedialinks: links,
                  }));
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Pay on Order */}
              <div className="flex items-center space-x-2">
                <label className="block text-sm font-medium text-gray-700">
                  Pay on Order
                </label>
                <input
                  type="checkbox"
                  name="payonorder"
                  checked={newShop.payonorder}
                  onChange={(e) => {
                    setNewShop((prev) => ({
                      ...prev,
                      payonorder: e.target.checked,
                    }));
                  }}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="font-semibold">Main Images:</p>
              <div className="flex gap-4">
                <input
                  onChange={(e) => setFiles(e.target.files)}
                  className="p-3 border border-gray-300 rounded w-full"
                  type="file"
                  accept="image/*"
                  multiple
                />
                <button
                  disabled={uploading}
                  type="button"
                  onClick={() => handleImageSubmit("images")}
                  className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
              <p className="text-red-700 text-sm">
                {imageUploadError && imageUploadError}
              </p>
              {newShop.imageUrls.map((url, index) => (
                <div
                  key={url}
                  className="flex justify-between p-3 border items-center"
                >
                  <img
                    src={url}
                    alt="shop"
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("imageUrls", index)}
                    className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                  >
                    Delete
                  </button>
                </div>
              ))}

              <p className="font-semibold">Promotional Images:</p>
              <div className="flex gap-4">
                <input
                  onChange={(e) => setPromoFiles(e.target.files)}
                  className="p-3 border border-gray-300 rounded w-full"
                  type="file"
                  accept="image/*"
                  multiple
                />
                <button
                  disabled={promoUploading}
                  type="button"
                  onClick={() => handleImageSubmit("promotionalimages")}
                  className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
                >
                  {promoUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
              <p className="text-red-700 text-sm">
                {promoUploadError && promoUploadError}
              </p>
              {newShop.promotionalimages.map((url, index) => (
                <div
                  key={url}
                  className="flex justify-between p-3 border items-center"
                >
                  <img
                    src={url}
                    alt="promo"
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveImage("promotionalimages", index)
                    }
                    className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Add Shop
              </button>
            </form>
          </div>
        )}
      </div>

      {editingShop && (
        <EditShop shop={editingShop} onUpdate={handleUpdateShop} onClose={() => setEditingShop(null)} />
      )}
    </div>
  );
};

export default ShopList;
