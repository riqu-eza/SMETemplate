import { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
const Addblog = () => {
  const [files, setFiles] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [blogData, setBlogData] = useState({
    title: "",
    content: "",
    imageUrls: [],
  });

  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + blogData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setBlogData({
            ...blogData,
            imageUrls: blogData.imageUrls.concat(urls),
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
    setBlogData({
      ...blogData,
      imageUrls: blogData.imageUrls.filter((_, i) => i !== index),
    });
  };
  // Update state when input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlogData({
      ...blogData,
      [name]: value, // Dynamically update either title or content
    });
  };

  // Handle form submission and send data to an API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/blog/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogData), // Send blogData as JSON
      });
console.log("respon", response);
      if (response.ok) {
        console.log("Blog submitted successfully!");
        // Reset the form
        setBlogData({ title: "", content: "" });
      } else {
        console.error("Failed to submit blog");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="p-4 bg-gray-100 rounded-md">
        <h2 className="text-2xl font-bold mb-4">Add a New Blog</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Blog Title Input */}
          <div>
            <label htmlFor="title" className="block text-lg font-medium mb-1">
              Blog Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={blogData.title}
              onChange={handleChange}
              placeholder="Enter blog title"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Blog Content Textarea */}
          <div>
            <label htmlFor="content" className="block text-lg font-medium mb-1">
              Blog Content
            </label>
            <textarea
              id="content"
              name="content"
              value={blogData.content}
              onChange={handleChange}
              placeholder="Write your blog content here..."
              rows="6"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <p className="font-semibold">Image:</p>
            <div className="flex gap-4">
              <input
                onChange={(e) => setFiles(Array.from(e.target.files))} // Convert FileList to Array
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
            {blogData.imageUrls.length > 0 &&
              blogData.imageUrls.map((url, index) => (
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

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Submit Blog
          </button>
        </form>
      </div>
    </>
  );
};

export default Addblog;
