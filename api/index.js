// ========== Imports & Environment Setup ==========
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";

import listingRouter from "./Routes/Listing.route.js";
import orderRouter from "./Routes/Order.route.js";
import userRouter from "./Routes/User.route.js";
import searchRouter from "./Routes/Search.route.js";
import newsletterRouter from "./Routes/Newsletter.route.js";
import propertyRouter from "./Routes/Shop.route.js";
import paymentsRouter from "./Routes/Payments.route.js";
import blogRouter from "./Routes/blog.route.js";
import inprouter from "./Routes/ipn.route.js";
import tenantRouter from "./Routes/Tenant.route.js";
import sitemapRouter from "./Routes/Sitemap.route.js";
import robotsRouter from "./Routes/Robots.route.js";

import { initSocket } from "./Sockerserver.js";
import { getModels } from "./Models/index.js";

dotenv.config();

// ========== Load Tenant Configurations ==========
const __dirname = path.resolve();
const tenantConfigsPath = path.join(__dirname, "tenant_configs.json");
const tenantConfigs = JSON.parse(fs.readFileSync(tenantConfigsPath, "utf-8"));

// Set default tenant configuration if not provided in lookup.
const defaultTenantConfig = tenantConfigs["smetemplate.xyz"] || {};

// ========== Mongoose Connection Management ==========
const tenantConnections = {};

function getTenantConnection(tenantConfig) {
  // Use the Mongo connection URL as the unique key
  const key = tenantConfig.MONGO;
  if (tenantConnections[key]) return tenantConnections[key];

  // Create a new connection using only the provided URL
  const connection = mongoose.createConnection(tenantConfig.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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


function ensureConnectionOpen(connection) {
  return new Promise((resolve, reject) => {
    if (connection.readyState === 1) {
      resolve();
    } else {
      connection.once("open", resolve);
      connection.once("error", reject);
    }
  });
}

// ========== Express App Setup ==========
const app = express();

// --- CORS Setup ---
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      // Allow both non-www and www versions of each tenant domain.
      const allowedOrigins = Object.keys(tenantConfigs).reduce((acc, domain) => {
        acc.push(`https://${domain}`);
        acc.push(`https://www.${domain}`);
        return acc;
      }, []);
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

// --- Built-in Middleware ---
app.use(express.json());
app.use(cookieParser());

// --- Multi-tenant Middleware ---
app.use(async (req, res, next) => {
  // Log raw Host header.
  console.log(`Raw Host header: ${req.headers.host}`);

  // Normalize hostname by stripping "www." if present.
  const normalizedHost = req.hostname.replace(/^www\./, "");
  console.log(`Received request for tenant: ${normalizedHost}`);

  // Look up the tenant configuration using the normalized hostname.
  req.tenantConfig = tenantConfigs[normalizedHost] || defaultTenantConfig;
  console.log(`Tenant config loaded: ${JSON.stringify(req.tenantConfig)}`);

  if (!req.tenantConfig) {
    return res.status(400).json({
      error: `Tenant configuration not found for host: ${normalizedHost}`,
    });
  }

  // Get (or create) a Mongoose connection for the tenant.
  req.tenantConnection = getTenantConnection(req.tenantConfig);
  try {
    await ensureConnectionOpen(req.tenantConnection);
    console.log(`Connected to tenant environment: ${req.tenantConfig.MONGO}`);
    // Attach tenant-specific models to the request.
    req.models = getModels(req.tenantConnection);
    next();
  } catch (error) {
    next(error);
  }
});

// ========== Server & Socket.IO Setup ==========
const server = createServer(app);
initSocket(server);

server.listen(3011, () => {
  console.log("Server is running on port 3011");
});

// ========== API Routes ==========
app.use("/api/listing", listingRouter);
app.use("/api/property", propertyRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);
app.use("/api/search", searchRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/ipn", inprouter);
app.use("/api/tenant", tenantRouter);
app.use("/", sitemapRouter);
app.use("/", robotsRouter);

// ========== Serve Static Frontend ==========
app.use(express.static(path.join(__dirname, "client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

// ========== Global Error Handler ==========
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
