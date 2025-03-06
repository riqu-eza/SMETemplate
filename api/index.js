import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import listingRouter from "./Routes/Listing.route.js";
import orderRouter from "./Routes/Order.route.js";
import userRouter from "./Routes/User.route.js";
import searchRouter from "./Routes/Search.route.js";
import newsletterRouter from "./Routes/Newsletter.route.js";
import propertyRouter from "./Routes/Shop.route.js";
import paymentsRouter from "./Routes/Payments.route.js";
import blogRouter from "./Routes/blog.route.js";
import inprouter from "./Routes/ipn.route.js";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { createServer } from "http";
import { initSocket } from "./Sockerserver.js";

dotenv.config();

// Parse tenant configurations from the environment variable.
// Example structure in TENANT_CONFIGS env variable:
// {
//   "smetemplate.xyz": { "MONGO": "...", "JWT_SECRET": "...", ... },
//   "domain1.com": { "MONGO": "...", "JWT_SECRET": "...", ... },
//   "domain2.com": { ... }
// }
const tenantConfigs = process.env.TENANT_CONFIGS ? JSON.parse(process.env.TENANT_CONFIGS) : {};

// Select a default tenant configuration (e.g., for your primary domain)
const defaultTenantConfig = tenantConfigs["smetemplate.xyz"] || {};

// Use the default tenant's Mongo URI or fall back to process.env.MONGO if not provided
const MONGO_URI = defaultTenantConfig.MONGO || process.env.MONGO;

// Connect to MongoDB using the default configuration
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

const __dirname = path.resolve();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:6054", "https://smetemplate.xyz/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Middleware to determine tenant configuration based on request hostname
app.use((req, res, next) => {
  const host = req.hostname; // For example: smetemplate.xyz, domain1.com, etc.
  // Use tenant-specific config if available; otherwise fall back to default
  req.tenantConfig = tenantConfigs[host] || defaultTenantConfig;
  if (!req.tenantConfig) {
    return res.status(400).json({ error: `Tenant configuration not found for host: ${host}` });
  }
  next();
});

// Create HTTP server and attach Socket.IO
const server = createServer(app);
initSocket(server); // Initialize Socket.IO with the server

server.listen(3011, () => {
  console.log("Server is running on port 3011");
});

// API routes
app.use("/api/listing", listingRouter);
app.use("/api/property", propertyRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);
app.use("/api/search", searchRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/ipn", inprouter);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
