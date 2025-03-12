import express from 'express';
const router = express.Router();

router.get('/sitemap.xml', (req, res) => {
  const host = req.hostname;
  const sitemapUrls = [
    { loc: `https://${host}/` },
    { loc: `https://${host}/products` },
    { loc: `https://${host}/alllisting` },
    { loc: `https://${host}/About` },
  ];

  res.header('Content-Type', 'application/xml');
  res.send(`
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemapUrls.map(url => `
        <url>
          <loc>${url.loc}</loc>
        </url>`).join('')}
    </urlset>
  `);
});

export default router;
