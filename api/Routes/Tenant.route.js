// routes/tenant.router.js
import express from "express";
const router = express.Router();

/**
 * GET /api/metadata
 * Retrieves the tenant metadata. Assumes a single tenant record exists.
 */
router.get("/", async (req, res) => {
  try {
    const { Tenant } = req.models; // Attached by your multi-tenant middleware
    const tenant = await Tenant.findOne({});
    if (!tenant) {
      return res.status(404).json({ message: "Tenant metadata not found" });
    }
    res.json({
      domain: tenant.domain,
      seo: tenant.SEO,
      whatsapp: tenant.WHATSAPP,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/metadata
 * Creates new tenant metadata.
 */
router.post("/", async (req, res) => {
  try {
    const { Tenant } = req.models;
    const { domain, seo, whatsapp } = req.body;

    // Check if metadata for this domain already exists
    const existing = await Tenant.findOne({ domain });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Tenant metadata already exists for this domain" });
    }

    const newTenant = new Tenant({
      domain,
      SEO: seo,
      WHATSAPP: whatsapp,
    });
    await newTenant.save();
    res.status(201).json(newTenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/metadata
 * Updates the tenant metadata.
 */
router.put("/", async (req, res) => {
  try {
    const { Tenant } = req.models;
    const { domain, seo, whatsapp } = req.body;

    // Find the tenant metadata by domain (or assume a single record)
    const tenant = await Tenant.findOne({ domain });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant metadata not found" });
    }

    tenant.SEO = seo;
    tenant.WHATSAPP = whatsapp;
    await tenant.save();
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE /api/metadata
 * Deletes the tenant metadata.
 */
router.delete("/", async (req, res) => {
  try {
    const { Tenant } = req.models;
    const { domain } = req.body;

    const tenant = await Tenant.findOneAndDelete({ domain });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant metadata not found" });
    }
    res.json({ message: "Tenant metadata deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
