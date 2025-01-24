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
    setFormData({
      ...formData,
      [name]: value,
    });
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
      // Handle signup success (e.g., redirect)
      navigate("/");
    } catch (error) {
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <>
   
    <div className="flex items-center justify-center ">
        
      <div className="w-full max-w-md p-8 space-y-4 ">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <p className="text-2xl font-bold text-center" >
            Please fill in the following fields
        </p>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default Signup;
