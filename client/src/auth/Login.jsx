import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/profile"); // Redirect to profile page
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await fetch("/api/user/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("Login successful", data);
      // Assume API returns a token and payload with user details
      const { token, payload } = data;

      // Save token and user details to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(payload.user));
      // Redirect based on role
      navigate(payload.user.role === "admin" ? "/createlisting" : "/");
    } catch (error) {
      console.log(error);
      alert("Invalid email or password: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-sky-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-4 text-center text-sky-800">Login</h2>
        <p className="mb-6 text-center text-sky-600">
          Sign in with your email and password.
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
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
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sky-700">
          Don`t have an account?{" "}
          <Link to="/signup" className="text-sky-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
