/* eslint-disable react/prop-types */
import { useState } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// import { app } from "PATH_TO_YOUR_FIREBASE_CONFIG";

const EditShop = ({ shop, onUpdate, onClose }) => {
  const [editedShop, setEditedShop] = useState({ ...shop });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Image management state
  const [showImageManager, setShowImageManager] = useState(false);
  const [tempImages, setTempImages] = useState(shop.imageUrls || []);
  const [promotionalImages, setPromotionalImages] = useState(shop.promotionalimages || []);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("contact.")) {
      const field = name.split(".")[1];
      setEditedShop((prev) => ({
        ...prev,
        contact: { ...prev.contact, [field]: value },
      }));
    } else if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      setEditedShop((prev) => ({
        ...prev,
        location: { ...prev.location, [field]: value },
      }));
    } else if (name.startsWith("operationperiods.")) {
      // eslint-disable-next-line no-unused-vars
      const [_, day, period] = name.split(".");
      setEditedShop((prev) => ({
        ...prev,
        operationperiods: {
          ...prev.operationperiods,
          [day]: {
            ...prev.operationperiods[day],
            [period]: value,
          },
        },
      }));
    } else if (name === "socialmedialinks") {
      setEditedShop((prev) => ({
        ...prev,
        socialmedialinks: value.split(",").map((link) => link.trim()),
      }));
    } else if (type === "checkbox") {
      setEditedShop((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEditedShop((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/property/shop/update/${shop._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editedShop,
          imageUrls: tempImages,
          promotionalimages: promotionalImages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedShop = await response.json();
      onUpdate(updatedShop); // Update shop in parent component
      onClose();
    } catch (err) {
      console.error("Error updating shop:", err);
      setError("Failed to update shop. Please try again.");
    }
    setSaving(false);
  };

  // Image upload logic
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

  const handleImageSubmit = async (isPromotional = false) => {
    if (files.length === 0) {
      setImageUploadError("Select images to upload");
      return;
    }
    if ((isPromotional ? promotionalImages.length : tempImages.length) + files.length > 25) {
      setImageUploadError("You can only have up to 25 images in total.");
      return;
    }

    try {
      setUploading(true);
      setImageUploadError(null);

      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      const urls = await Promise.all(promises);
      if (isPromotional) {
        setPromotionalImages((prev) => [...prev, ...urls]);
      } else {
        setTempImages((prev) => [...prev, ...urls]);
      }
      setFiles([]);
    } catch (err) {
      setImageUploadError("Image upload failed (2 MB max per image)");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveImages = () => {
    setEditedShop((prev) => ({
      ...prev,
      imageUrls: tempImages,
      promotionalimages: promotionalImages,
    }));
    setShowImageManager(false);
  };

  const moveImageUp = (index, isPromotional = false) => {
    if (index === 0) return;
    if (isPromotional) {
      setPromotionalImages((prev) => {
        const newImages = [...prev];
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
        return newImages;
      });
    } else {
      setTempImages((prev) => {
        const newImages = [...prev];
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
        return newImages;
      });
    }
  };

  const moveImageDown = (index, isPromotional = false) => {
    if (index === (isPromotional ? promotionalImages.length : tempImages.length) - 1) return;
    if (isPromotional) {
      setPromotionalImages((prev) => {
        const newImages = [...prev];
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        return newImages;
      });
    } else {
      setTempImages((prev) => {
        const newImages = [...prev];
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        return newImages;
      });
    }
  };

  const handleRemoveImage = (index, isPromotional = false) => {
    if (isPromotional) {
      setPromotionalImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setTempImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between">
          <h3 className="text-xl font-semibold">Edit Shop</h3>
          <button onClick={onClose} className="text-white hover:text-red-400">
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[65vh] p-6 space-y-4">
          {error && <p className="text-red-500">{error}</p>}

          <input
            type="text"
            name="name"
            value={editedShop.name}
            onChange={handleInputChange}
            placeholder="Shop Name"
            className="w-full p-2 border border-gray-300 rounded"
          />

          <input
            type="text"
            name="owner"
            value={editedShop.owner}
            onChange={handleInputChange}
            placeholder="Owner Name"
            className="w-full p-2 border border-gray-300 rounded"
          />

          <input
            type="email"
            name="owneremail"
            value={editedShop.owneremail}
            onChange={handleInputChange}
            placeholder="Owner Email"
            className="w-full p-2 border border-gray-300 rounded"
          />

          <input
            type="email"
            name="contact.email"
            value={editedShop.contact.email}
            onChange={handleInputChange}
            placeholder="Contact Email"
            className="w-full p-2 border border-gray-300 rounded"
          />

          <input
            type="text"
            name="contact.phoneno"
            value={editedShop.contact.phoneno}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="w-full p-2 border border-gray-300 rounded"
          />
<input
            type="text"
            name="location.mapurl"
            value={editedShop.location.mapurl}
            onChange={handleInputChange}
            placeholder="map url"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <textarea
            name="companypolicy"
            value={editedShop.companypolicy}
            onChange={handleInputChange}
            placeholder="Company Policy"
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* Days Open & Close */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Opening & Closing Times</h4>
            {Object.entries(editedShop.operationperiods).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-3 mb-2">
                <span className="w-24 font-medium">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
                <input
                  type="time"
                  name={`operationperiods.${day}.open`}
                  value={hours.open}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="time"
                  name={`operationperiods.${day}.close`}
                  value={hours.close}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded"
                />
              </div>
            ))}
          </div>

          {/* Social Media Links */}
          <input
            type="text"
            name="socialmedialinks"
            value={editedShop.socialmedialinks.join(", ")}
            onChange={handleInputChange}
            placeholder="Social Media Links (comma-separated)"
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* Pay on Order */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="payonorder"
              checked={editedShop.payonorder}
              onChange={handleInputChange}
              className="w-5 h-5"
            />
            <label className="text-sm font-medium text-gray-700">Pay on Order</label>
          </div>

          {/* Manage Images Button */}
          <button
            onClick={() => setShowImageManager(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Manage Images
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Image Manager Modal */}
      {showImageManager && (
       <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-20 p-4">
       <div className="bg-white p-6 rounded shadow-lg max-w-3xl w-full relative flex flex-col max-h-[90vh]">
         
         {/* Sticky Header */}
         <div className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
           <h2 className="text-xl font-bold">Manage Images for {editedShop.name}</h2>
           <button
             className="text-white hover:text-red-400 text-lg"
             onClick={() => setShowImageManager(false)}
           >
             ✕
           </button>
         </div>
     
         {/* Scrollable Content */}
         <div className="overflow-y-auto p-4 space-y-6 flex-grow">
           
           {/* Shop Images Section */}
           <div>
             <h3 className="text-lg font-semibold mb-2">Shop Images</h3>
             {tempImages.length === 0 ? (
               <p className="text-sm text-gray-500">No images yet.</p>
             ) : (
               <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {tempImages.map((url, index) => (
                   <li key={index} className="relative border rounded p-2">
                     <img
                       src={url}
                       alt={`shop_image_${index}`}
                       className="w-full h-32 object-cover rounded"
                     />
                     <div className="flex justify-between mt-2">
                       <button
                         className="bg-blue-500 text-white px-2 py-1 text-sm rounded disabled:bg-gray-300"
                         onClick={() => moveImageUp(index)}
                         disabled={index === 0}
                       >
                         Up
                       </button>
                       <button
                         className="bg-blue-500 text-white px-2 py-1 text-sm rounded disabled:bg-gray-300"
                         onClick={() => moveImageDown(index)}
                         disabled={index === tempImages.length - 1}
                       >
                         Down
                       </button>
                       <button
                         className="bg-red-500 text-white px-2 py-1 text-sm rounded"
                         onClick={() => handleRemoveImage(index)}
                       >
                         Remove
                       </button>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
           </div>
     
           {/* Promotional Images Section */}
           <div>
             <h3 className="text-lg font-semibold mb-2">Promotional Images</h3>
             {promotionalImages.length === 0 ? (
               <p className="text-sm text-gray-500">No promotional images yet.</p>
             ) : (
               <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {promotionalImages.map((url, index) => (
                   <li key={index} className="relative border rounded p-2">
                     <img
                       src={url}
                       alt={`promotional_image_${index}`}
                       className="w-full h-32 object-cover rounded"
                     />
                     <div className="flex justify-between mt-2">
                       <button
                         className="bg-blue-500 text-white px-2 py-1 text-sm rounded disabled:bg-gray-300"
                         onClick={() => moveImageUp(index, true)}
                         disabled={index === 0}
                       >
                         Up
                       </button>
                       <button
                         className="bg-blue-500 text-white px-2 py-1 text-sm rounded disabled:bg-gray-300"
                         onClick={() => moveImageDown(index, true)}
                         disabled={index === promotionalImages.length - 1}
                       >
                         Down
                       </button>
                       <button
                         className="bg-red-500 text-white px-2 py-1 text-sm rounded"
                         onClick={() => handleRemoveImage(index, true)}
                       >
                         Remove
                       </button>
                     </div>
                   </li>
                 ))}
               </ul>
             )}
           </div>
     
           {/* Upload New Images Section */}
           <div>
             <h3 className="text-lg font-semibold mb-2">Add New Images</h3>
             <input
               type="file"
               multiple
               onChange={(e) => setFiles([...e.target.files])}
               className="block mb-2"
             />
             <div className="flex gap-4">
               <button
                 onClick={() => handleImageSubmit(false)}
                 className="bg-green-500 text-white px-3 py-1 rounded"
                 disabled={uploading}
               >
                 {uploading ? "Uploading..." : "Upload Shop Images"}
               </button>
               <button
                 onClick={() => handleImageSubmit(true)}
                 className="bg-green-500 text-white px-3 py-1 rounded"
                 disabled={uploading}
               >
                 {uploading ? "Uploading..." : "Upload Promotional Images"}
               </button>
             </div>
             {imageUploadError && <p className="text-red-500 text-sm mt-2">{imageUploadError}</p>}
           </div>
     
         </div>
     
         {/* Sticky Footer */}
         <div className="bg-gray-100 p-4 flex justify-end space-x-3 sticky bottom-0">
           <button
             className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
             onClick={() => setShowImageManager(false)}
           >
             Cancel
           </button>
           <button
             className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
             onClick={handleSaveImages}
           >
             Save Changes
           </button>
         </div>
     
       </div>
     </div>
     
      )}
    </div>
  );
};

export default EditShop;