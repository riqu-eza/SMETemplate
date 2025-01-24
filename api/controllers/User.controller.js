import User from "../Models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken } from "../utils/verifyUser.js";

export const createUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
  
    try {
      // Check if the user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }
  
      // Create a new user instance
      user = new User({
        firstName,
        lastName,
        email,
        password, // We will hash this below
      });
  
      // Hash the password before saving to the database
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
  
      // Save the user in the database
      await user.save();
  
      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
          role: user.role, 
        },
      };
  
      // Sign JWT token and return it
      jwt.sign(
        payload,
        process.env.JWT_SECRET, // Your JWT secret
        { expiresIn: "1h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  };


  export const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by email
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
  
      // Compare the submitted password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }
  
      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
          role: user.role, // Assuming there are roles like 'admin' or 'user'
        },
      };
  console.log("payload",payload);
      // Sign JWT token and return it
      jwt.sign(
        payload,
        process.env.JWT_SECRET, // Your JWT secret
        { expiresIn: "1h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token, payload});
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  };

  export const getProfile = async (req, res) => {
    try {
      // Assuming userId is extracted from the token in authenticateToken
      const userId = req.user.user.id; 
  
      const user = await User.findById(userId).select("-password"); // Avoid sending password
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  };
  