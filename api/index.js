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
const tenantConfigs = process.env.TENANT_CONFIGS ? JSON.parse(process.env.TENANT_CONFIGS) : {};

// Select a default tenant configuration (e.g., for smetemplate.xyz)
const defaultTenantConfig = tenantConfigs["smetemplate.xyz"] || {};

// Cache for tenant-specific Mongoose connections
const tenantConnections = {};

// Helper function to create or retrieve a connection for a given tenant configuration.
function getTenantConnection(tenantConfig) {
  // Use the MONGO URI (and optionally a DB name) as a key.
  const key = tenantConfig.MONGO + (tenantConfig.DB_NAME || "");
  if (tenantConnections[key]) return tenantConnections[key];
  const connection = mongoose.createConnection(tenantConfig.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: tenantConfig.DB_NAME // optional if tenants use separate databases
  });
  connection.once("open", () => {
    console.log(`Connection opened for tenant: ${tenantConfig.MONGO}`);
  });
  connection.on("error", (err) => {
    console.error("Connection error for tenant:", err);
  });
  tenantConnections[key] = connection;
  return connection;
}

// Helper to wait until a connection is open
function ensureConnectionOpen(connection) {
  return new Promise((resolve, reject) => {
    if (connection.readyState === 1) {
      // 1 means connected
      resolve();
    } else {
      connection.once("open", resolve);
      connection.once("error", reject);
    }
  });
}

const __dirname = path.resolve();
const app = express();

// --- CORS Setup ---
// You can adjust this dynamic function if needed.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      // Build allowed origins based on tenant configurations
      const allowedOrigins = Object.keys(tenantConfigs).map(domain => `https://${domain}`);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// --- Multi-Tenant Middleware ---
// Determine tenant config based on hostname, get connection, and wait until it's open.
app.use(async (req, res, next) => {
  const host = req.hostname; // e.g., smetemplate.xyz, lskinessentials.com, etc.
  req.tenantConfig = tenantConfigs[host] || defaultTenantConfig;
  if (!req.tenantConfig) {
    return res.status(400).json({ error: `Tenant configuration not found for host: ${host}` });
  }
  req.tenantConnection = getTenantConnection(req.tenantConfig);
  try {
    await ensureConnectionOpen(req.tenantConnection);
    next();
  } catch (error) {
    next(error);
  }
});

// --- Socket.IO Initialization ---
const server = createServer(app);
initSocket(server);

server.listen(3011, () => {
  console.log("Server is running on port 3011");
});

// --- API Routes ---
// IMPORTANT: Update your route handlers to use req.tenantConnection to create/retrieve models.
// For example, in Listing.route.js, use req.tenantConnection.model('Listing', ListingSchema)
app.use("/api/listing", listingRouter);
app.use("/api/property", propertyRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);
app.use("/api/search", searchRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/ipn", inprouter);

// --- Serve Static Frontend ---
app.use(express.static(path.join(__dirname, "client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
