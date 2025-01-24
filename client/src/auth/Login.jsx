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
    setFormData({
      ...formData,
      [name]: value,
    });
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
      // Assume API returns a token and role
      const { token, payload } = data; // role can be 'admin' or 'user'

      // Save token to localStorage or sessionStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(payload.user)); 
      // Redirect based on role
      navigate(payload.user.role === "admin" ? "/createlisting" : "/");
    } catch (error) {
      console.log(error);
      alert("Invalid email or password  " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center  bg-gray-100">
      <div className="w-full  p-8  ">
        <h2 className="text-2xl font-bold p-3 text-center">Login</h2>
        <h3 className="text-xl text-center p-4 text-[#BFA181]">
          Sign in with your email and password.
        </h3>
        <div className="  ">
          <form
            onSubmit={handleLogin}
            className=" max-w-md text-center ml-[9.5cm]   space-y-4"
          >
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
              Login
            </button>
          </form>
        </div>
        <p className="text-center">
          Don &apos t have an account?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
