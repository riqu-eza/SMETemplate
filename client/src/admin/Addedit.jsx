/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";

const AddEditForm = ({ editingItem, setEditingItem, refreshData, shopId }) => {
  const [formData, setFormData] = useState({
    ...editingItem,
    imageUrls: editingItem?.imageUrls || [], // Ensure imageUrls is initialized
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);

  useEffect(() => {
    setFormData({
      ...editingItem,
      imageUrls: editingItem?.imageUrls || [],
    });
  }, [editingItem]);

  // -------------------------------------
  // ------------ HANDLERS ---------------
  // -------------------------------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Variants
  const handleVariantsChange = (index, field, value) => {
    const updatedVariants = (formData.variants || []).map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { size: "", stock: 0 }],
    }));
  };

  // Submit item data
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingItem?._id
      ? `/api/property/products/${editingItem._id}/${shopId}`
      : `/api/property/products/${shopId}`; // Adjust as needed for API
    const method = editingItem?._id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(
          `Failed to ${method === "POST" ? "add" : "update"} item: ${errorMessage}`
        );
      }

      await response.json();
      setEditingItem(null);
      refreshData();
    } catch (error) {
      console.error("Error saving item:", error.message);
    }
  };

  // -------------------------------------
  // ------- IMAGE UPLOAD / REMOVE -------
  // -------------------------------------

  const handleImageSubmit = () => {
    // Limit images total to 6
    if (files.length > 0 && files.length + formData.imageUrls.length <= 6) {
      setUploading(true);
      setImageUploadError(false);

      const promises = files.map((file) => storeImage(file));
      Promise.all(promises)
        .then((urls) => {
          setFormData((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, ...urls],
          }));
          setUploading(false);
        })
        .catch((err) => {
          console.error(err);
          setImageUploadError("Image upload failed (2 MB max per image)");
          setUploading(false);
        });
    } else if (files.length === 0) {
      setImageUploadError("Select images to upload");
    } else {
      setImageUploadError("You can only have a maximum of 6 images");
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
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  // -------------------------------------
  // ---------- IMAGE REORDERING ---------
  // -------------------------------------

  const handleMoveImage = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.imageUrls.length) return; // boundary check

    // Create a new array so React sees the update
    const updatedImageUrls = [...formData.imageUrls];
    // Swap positions
    [updatedImageUrls[index], updatedImageUrls[newIndex]] = [
      updatedImageUrls[newIndex],
      updatedImageUrls[index],
    ];

    setFormData((prev) => ({
      ...prev,
      imageUrls: updatedImageUrls,
    }));
  };

  // -------------------------------------
  // -------------- RENDER ---------------
  // -------------------------------------
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded p-6 relative max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-700">
        {editingItem?._id ? "Edit" : "Add"} Product
      </h2>

      {/* Name */}
      <label className="block mb-2">
        <span className="text-gray-700 font-semibold">Name</span>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name || ""}
          onChange={handleInputChange}
          required
          className="border rounded w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        />
      </label>

      {/* Description */}
      <label className="block mb-2">
        <span className="text-gray-700 font-semibold">Description</span>
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description || ""}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        />
      </label>

      {/* Price */}
      <label className="block mb-2">
        <span className="text-gray-700 font-semibold">Price</span>
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price || ""}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        />
      </label>

      {/* Stock */}
      <label className="block mb-2">
        <span className="text-gray-700 font-semibold">Stock</span>
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={formData.stock || ""}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        />
      </label>

      {/* Type */}
      <label className="block mb-2">
        <span className="text-gray-700 font-semibold">Type (if any)</span>
        <input
          type="text"
          name="Type"
          placeholder="Type"
          value={formData.Type || ""}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        />
      </label>

      {/* Pricing Type */}
      <label className="block mb-2">
        <span className="text-gray-700 font-semibold">Pricing Type</span>
        <select
          name="pricingType"
          value={formData.pricingType || ""}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Pricing Type</option>
          <option value="Fixed">Fixed</option>
          <option value="Variable">Variable</option>
          <option value="Negotiable">Negotiable</option>
        </select>
      </label>

      {/* Discounts */}
      <label className="block mb-2">
        <span className="text-gray-700 font-semibold">Discounts</span>
        <input
          type="text"
          name="discounts"
          placeholder="Discounts"
          value={formData.discounts || ""}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        />
      </label>

      {/* Availability Hours */}
      <label className="block mb-2">
        <span className="text-gray-700 font-semibold">Availability Hours</span>
        <input
          type="text"
          name="availabilityHours"
          placeholder="Availability Hours"
          value={formData.availabilityHours || ""}
          onChange={handleInputChange}
          className="border rounded w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        />
      </label>

      {/* Availability Days */}
      <label className="block mb-2">
        <span className="text-gray-700 font-semibold">Availability Days</span>
        <input
          type="text"
          name="availabilityDays"
          placeholder="Availability Days (comma separated)"
          value={formData.availabilityDays?.join(", ") || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              availabilityDays: e.target.value
                .split(",")
                .map((day) => day.trim()),
            }))
          }
          className="border rounded w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
        />
      </label>

      {/* Variants */}
      <div className="mb-4 mt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Variants</h3>
        {(formData.variants || []).map((variant, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Size"
              value={variant.size || ""}
              onChange={(e) =>
                handleVariantsChange(index, "size", e.target.value)
              }
              className="border rounded w-1/2 p-2 focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              placeholder="Stock"
              value={variant.stock || ""}
              onChange={(e) =>
                handleVariantsChange(index, "stock", e.target.value)
              }
              className="border rounded w-1/2 p-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddVariant}
          className="bg-green-600 text-white px-3 py-2 mt-2 rounded hover:bg-green-500"
        >
          + Add Variant
        </button>
      </div>

      {/* Image Upload */}
      <div className="mt-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Upload Images (Max 6):
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files))}
          className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {imageUploadError && (
          <p className="text-red-600 mt-1">{imageUploadError}</p>
        )}

        <button
          type="button"
          onClick={handleImageSubmit}
          disabled={uploading}
          className="bg-blue-600 text-white rounded px-4 py-2 mt-2 hover:bg-blue-500"
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
      </div>

      {/* Display Uploaded Images with Reorder & Remove */}
      {formData.imageUrls.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Uploaded Images:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {formData.imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative border border-gray-200 rounded overflow-hidden"
              >
                <img
                  src={url}
                  alt={`Uploaded ${index}`}
                  className="w-full h-32 object-cover"
                />
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 text-white bg-red-500 hover:bg-red-600 rounded-full p-1"
                  title="Remove Image"
                >
                  &times;
                </button>
                {/* Move Up */}
                {index > 0 && (
                  <button
                    onClick={() => handleMoveImage(index, "up")}
                    className="absolute bottom-1 left-1 text-white bg-blue-600 hover:bg-blue-500 rounded-full p-1"
                    title="Move Up"
                  >
                    ↑
                  </button>
                )}
                {/* Move Down */}
                {index < formData.imageUrls.length - 1 && (
                  <button
                    onClick={() => handleMoveImage(index, "down")}
                    className="absolute bottom-1 right-1 text-white bg-blue-600 hover:bg-blue-500 rounded-full p-1"
                    title="Move Down"
                  >
                    ↓
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save / Cancel Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Save
        </button>
        <button
          type="button"
          className="text-red-500 underline hover:text-red-600 ml-4"
          onClick={() => setEditingItem(null)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddEditForm;
