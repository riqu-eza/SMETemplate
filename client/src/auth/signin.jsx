import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Signup failed");
      }
      // On successful signup, redirect to homepage (or any other page)
      navigate("/");
    } catch (error) {
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-sky-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-sky-800">
          Register
        </h2>
        <p className="mb-6 text-center text-sky-600">
          Please fill in the following fields
        </p>
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-sky-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-sky-300 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-sky-300 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-sky-300 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-sky-300 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 font-semibold text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sky-700">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
