// Import necessary modules
import express from 'express';
import cors from 'cors';  // Import CORS
import shopify from './shopify.js';  // Your Shopify SDK
import productCreator from './product-creator.js';  // Your product creation logic
import { readFileSync } from 'fs';
import { join } from 'path';
import serveStatic from 'serve-static';

// Initialize Express app
const app = express();
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

// Set up CORS middleware before any route handling
app.use(cors({
  origin: "https://provider-weddings-voluntary-designer.trycloudflare.com", 
  methods: ['GET', 'POST'],
  credentials: true,  // Allow credentials if necessary (cookies, headers, etc.)
}));

// Static path setup based on the environment
const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

// Example API routes
app.get('/admin/api/2022-10/products.json', async (request, response) => {
  const test_session = await Shopify.Utils.loadCurrentSession(request, response);
  const app = express();
  app.use(cors());
  await Product.all({
    session: test_session,
  });
});

app.get("/api/store/info", async (_req, res) => {
  try {
    const storeInfo = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    });
    res.status(200).send(storeInfo);
  } catch (error) {
    console.error("Error fetching store info:", error);
    res.status(500).json({ error: 'Failed to fetch store info from Shopify' });
  }
});

// Your other Shopify routes, webhooks, and static file handling
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

// Ensure that Shopify session is authenticated for routes that need it
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
