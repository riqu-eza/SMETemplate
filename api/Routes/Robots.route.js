import express from 'express';
const router = express.Router();

router.get('/robots.txt', (req, res) => {
  const host = req.hostname;
  res.header('Content-Type', 'text/plain');
  res.send(`
    User-agent: *
    Allow: /
    Disallow: /admin
    Disallow: /login
    Sitemap: https://${host}/sitemap.xml
  `);
});

export default router;
