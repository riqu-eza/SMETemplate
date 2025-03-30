// models/Tenant.model.js
import mongoose from "mongoose";

const TenantSchema = new mongoose.Schema(
  {
    domain: { type: String,  unique: true },
    SEO: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    WHATSAPP: {
      phoneNumber: { type: String, default: "" },
      accountName: { type: String, default: "" },
      chatMessage: { type: String, default: "" },
      avatar: { type: String, default: "" },
      statusMessage: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default TenantSchema;
