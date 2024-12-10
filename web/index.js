// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import fetch from "node-fetch"; // Import node-fetch to make HTTP requests
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import dotenv from 'dotenv';
import mws from 'amazon-mws';
dotenv.config();

console.log(process.env.SHOPIFY_API_KEY);
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// Middleware to validate Shopify session
app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(express.json());

// Fetch all products
app.get("/api/products/all", async (_req, res) => {
  try {
    // Step 1: Validate the session is available and authenticated
    if (!res.locals.shopify.session) {
      return res.status(400).json({ error: "No valid Shopify session found." });
    }

    // Step 2: Fetch products from Shopify API (using REST API)
    const accessToken = res.locals.shopify.session.accessToken;
    const shop = res.locals.shopify.session.shop;
    const apiVersion = "2024-10"; // Make sure this matches the API version you're using
    
    // Construct the Shopify REST API URL for fetching products
    const url = `https://${shop}/admin/api/${apiVersion}/products.json`;

    // Fetch the products from Shopify REST Admin API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Step 3: Return the products data
    res.status(200).json(data.products); // Send the list of products to the frontend
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: 'Failed to fetch products from Shopify' });
  }
});

// Amazon product fetch


// \\\\\\\product low inventory notification
app.get("/api/products/low-inventory", async (_req, res) => {
  try {
    // Step 1: Validate the session is available and authenticated
    if (!res.locals.shopify.session) {
      return res.status(400).json({ error: "No valid Shopify session found." });
    }

    // Step 2: Fetch products from Shopify API (using REST API)
    const accessToken = res.locals.shopify.session.accessToken;
    const shop = res.locals.shopify.session.shop;
    const apiVersion = "2024-10"; // Ensure this matches the Shopify API version you're using
    
    // Construct the Shopify REST API URL for fetching products
    const url = `https://${shop}/admin/api/${apiVersion}/products.json`;

    // Fetch the products from Shopify REST Admin API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Step 3: Filter products for low inventory (less than 10)
    const lowInventoryProducts = data.products.filter((product) => {
      const variant = product.variants[0]; // Assuming we're checking the first variant for each product
      return variant.inventory_quantity < 10; // Only keep products with inventory less than 10
    });

    // Step 4: Return only the low inventory products
    res.status(200).json(lowInventoryProducts);
  } catch (error) {
    console.error("Error fetching low inventory products:", error);
    res.status(500).json({ error: 'Failed to fetch low inventory products from Shopify' });
  }
});




// Fetch the count of products
app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

// Add your product creation endpoint, etc.
app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

// Serve static files for the frontend
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

// Catch-all route for the frontend
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
// Fetch all orders
app.get("/api/orders/all", async (_req, res) => {
  try {
    // Step 1: Validate the session is available and authenticated
    if (!res.locals.shopify.session) {
      return res.status(400).json({ error: "No valid Shopify session found." });
    }

    // Step 2: Fetch orders from Shopify API (using REST API)
    const accessToken = res.locals.shopify.session.accessToken;
    const shop = res.locals.shopify.session.shop;
    const apiVersion = "2024-10"; // Ensure this matches the Shopify API version

    // Construct the Shopify REST API URL for fetching orders
    const url = `https://${shop}/admin/api/${apiVersion}/orders.json`;

    // Fetch the orders from Shopify REST Admin API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Step 3: Return the orders data
    res.status(200).json(data.orders); // Send the list of orders to the frontend
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders from Shopify" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});