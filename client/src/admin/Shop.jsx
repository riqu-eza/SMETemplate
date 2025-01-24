import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Assuming React Router is used
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

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch("/api/property/shop/getall"); // Update with your API
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

  // Handle form input changes
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
        images: [],
      }); // Reset the form
    } catch (err) {
      console.error("Error creating shop:", err);
      setError("Failed to create shop. Please try again.");
    }
  };
  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + newShop.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setNewShop((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.concat(urls),
          }));
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2 MB max per image)", err);
          setUploading(false);
        });
    } else if (files.length === 0) {
      setImageUploadError("Select images to upload");
      setUploading(false);
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
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

  const handleRemoveImage = (index) => {
    setNewShop((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Shop Management
      </h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </li>
              ))}
          </ul>
        </div>

        {/* Create New Shop Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            Create a New Shop
          </h3>
          <form onSubmit={handleCreateShop} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Shop Name"
              value={newShop.name}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="owner"
              placeholder="Owner Name"
              value={newShop.owner}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="owneremail"
              placeholder="Owner Email"
              value={newShop.owneremail}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="contact.email"
              placeholder="Contact Email"
              value={newShop.contact.email}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              name="contact.phoneno"
              placeholder="Contact Phone Number"
              value={newShop.contact.phoneno}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="location.address"
              placeholder="Shop Address"
              value={newShop.location.address}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Assuming you will collect map URLs separately */}
            <input
              type="text"
              name="location.mapurl"
              placeholder="Map URL (comma separated)"
              value={newShop.location.mapurl.join(", ")} // Joining to input as string
              onChange={(e) => {
                const mapUrls = e.target.value
                  .split(",")
                  .map((url) => url.trim());
                setNewShop({
                  ...newShop,
                  location: { ...newShop.location, mapurl: mapUrls },
                });
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="col-span-full">
          <label className="block text-gray-700 font-bold mb-2">
            Upload Images (Max 6):
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="border rounded p-2"
          />
          {imageUploadError && (
            <p className="text-red-600">{imageUploadError}</p>
          )}
          <button
            type="button"
            onClick={handleImageSubmit}
            disabled={uploading}
            className="mt-2 bg-blue-500 text-white rounded p-2"
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>

        {/* Display Uploaded Images */}
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
                  className="absolute top-1 right-1 text-red-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Shop
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopList;
