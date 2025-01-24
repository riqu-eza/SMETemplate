import { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
// Define categories and subcategories

const CreateListing = () => {
  // Form data state
  const [files, setFiles] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    count: "",
    category: "",
    ingridients: [""],
    howtouse: [""],
    imageUrls: [],
  });
  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        // eslint-disable-next-line no-unused-vars
        .catch((err) => {
          setImageUploadError("Image upload fail (2 mb max per image)");
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
      const storageref = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageref, file);
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
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };
  const categoryOptions = [
    "body butter",
    "body oils",
    "Scented candles",
    "beard growth",
    "Hair growth",
    "Gift set packages",
  ];
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({
      ...formData,
      category: selectedCategory,
      // No need to reset subcategory since it doesn't exist
    });
  };
  // Change handler for regular inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Change handler for category dropdown

  // Ingredient and How to Use change handler (for array fields)
  const handleArrayChange = (e, index, key) => {
    const updatedArray = [...formData[key]];
    updatedArray[index] = e.target.value;
    setFormData({ ...formData, [key]: updatedArray });
  };

  // Add more inputs for ingridients/howtouse
  const addInputField = (key) => {
    setFormData({ ...formData, [key]: [...formData[key], ""] });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default form submission behavior

    try {
      const response = await fetch("/api/listing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Check if the response was successful (status code 2xx)
      if (response.ok) {
        const data = await response.json(); // Parse response as JSON

        console.log("Form submitted successfully", data);
        alert("Listing created successfully!"); // Show success message

        // Reset the form after successful submission
        setFormData({
          name: "",
          description: "",
          price: "",
          discount: "",
          location: "",
          category: "",
          subcategory: "",
          ingridients: [],
          howtouse: [],
          imageUrls: [],
        });
      } else {
        // Handle non-successful responses
        const errorData = await response.json();
        console.error("Error submitting form", errorData);
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto p-8 bg-white shadow-md rounded-md"
    >
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500"
          required
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Price
        </label>
        <input
          type="text"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Discount
        </label>
        <input
          type="text"
          name="discount"
          value={formData.discount}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Count
        </label>
        <input
          type="number"
          name="count"
          value={formData.count}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Category Dropdown */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleCategoryChange}
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500"
          required
        >
          <option value="">Select Category</option>
          {categoryOptions.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Ingredients
        </label>
        {formData.ingridients.map((ing, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={ing}
              onChange={(e) => handleArrayChange(e, index, "ingridients")}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500"
              required
            />
            {index === formData.ingridients.length - 1 && (
              <button
                type="button"
                onClick={() => addInputField("ingridients")}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm"
              >
                Add
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          How to Use
        </label>
        {formData.howtouse.map((step, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={step}
              onChange={(e) => handleArrayChange(e, index, "howtouse")}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-blue-500"
              required
            />
            {index === formData.howtouse.length - 1 && (
              <button
                type="button"
                onClick={() => addInputField("howtouse")}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm"
              >
                Add
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <p className="font-semibold">Image:</p>
        <div className="flex gap-4">
          <input
            onChange={(e) => setFiles(e.target.files)}
            className="p-3 border border-gray-300 rounded w-full"
            type="file"
            id="images"
            accept="image/*"
            multiple
          />
          <button
            disabled={uploading}
            type="button"
            onClick={handleImageSubmit}
            className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
          >
            {uploading ? "uploading" : "upload"}
          </button>
        </div>
        <p className="text-red-700 text-sm">
          {imageUploadError && imageUploadError}
        </p>
        {formData.imageUrls.length > 0 &&
          formData.imageUrls.map((url, index) => (
            <div
              key={url}
              className="flex justify-between p-3 border items-center"
            >
              <img
                src={url}
                alt="listing image"
                className="w-20 h-20 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
              >
                Delete
              </button>
            </div>
          ))}
      </div>

      <div className="mb-4">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600"
        >
          Submit Listing
        </button>
      </div>
    </form>
  );
};

export default CreateListing;
