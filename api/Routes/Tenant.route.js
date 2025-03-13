import express from 'express';
const router = express.Router();
import dotenv from "dotenv";

// Route to fetch metadata for a given domain
router.get('/:domain/metadata', (req, res) => {

  dotenv.config();
  

  const { domain } = req.params;
  const tenantConfigs = process.env.TENANT_CONFIGS ? JSON.parse(process.env.TENANT_CONFIGS) : {};

  const tenant = tenantConfigs[domain];

  if (!tenant) {
    return res.status(404).json({ message: `Tenant configuration not found for domain: ${domain}` });
  }

  res.json({
    seo: tenant.SEO,
    whatsapp: tenant.WHATSAPP,
  });
});

export default router;
