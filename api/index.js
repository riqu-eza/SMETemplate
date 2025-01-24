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

mongoose
  .connect(process.env.MONGO)
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

// Create HTTP server and attach Socket.IO
const server = createServer(app);
initSocket(server); // Initialize Socket.IO with the server

server.listen(3003, () => {
  console.log("Server is running on port 3003");
});

app.use("/api/listing", listingRouter);
app.use("/api/property", propertyRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);
app.use("/api/search", searchRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/ipn", inprouter);

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
