// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import fetch from "node-fetch"; // Import node-fetch to make HTTP requests
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import axios from 'axios'; 
// import dotenv from 'dotenv';
// import mws from 'amazon-mws';
// require('dotenv').config();
// const mws = require('amazon-mws')();

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

// const fetchAllOrders = async (shop, accessToken) => {

//   let orders = [];
//   let url = `https://${shop}/admin/api/2024-10/orders.json?status=any`; // Adjust as needed (add filters for unfulfilled orders)

//   while (url) {
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Access-Token": accessToken,
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch orders: ${response.statusText}`);
//     }

//     const data = await response.json();
//     orders = orders.concat(data.orders);

//     // Check if there is another page of orders and update the URL
//     url = data.next_page_url || null;
//   }

//   return orders;
// };

// Example API endpoint to fetch orders







// Fetch all products with their inventory numbers


app.get("/api/products/inventory", async (req, res) => {
  try {
    if (!res.locals.shopify.session) {
      return res.status(400).json({ error: "No valid Shopify session found." });
    }

    const accessToken = res.locals.shopify.session.accessToken;
    const shop = res.locals.shopify.session.shop;
    const apiVersion = "2024-10"; // Shopify API version

    const url = `https://${shop}/admin/api/${apiVersion}/products.json`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products;

    const inventoryData = await Promise.all(
      products.map(async (product) => {
        const variantInventory = await Promise.all(
          product.variants.map(async (variant) => {
            const inventoryUrl = `https://${shop}/admin/api/${apiVersion}/inventory_items/${variant.inventory_item_id}.json`;
            const inventoryResponse = await fetch(inventoryUrl, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken,
              },
            });

            if (!inventoryResponse.ok) {
              throw new Error(`Failed to fetch inventory data for variant: ${variant.id}`);
            }

            const inventoryData = await inventoryResponse.json();
            return {
              variantId: variant.id,
              title: variant.title,
              inventoryQuantity: inventoryData.inventory_item.inventory_quantity,
            };
          })
        );

        return {
          productId: product.id,
          title: product.title,
          inventory: variantInventory,
        };
      })
    );

    res.status(200).json(inventoryData);
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    res.status(500).json({ error: "Failed to fetch inventory data", details: error.message });
  }
});
app.get("/api/inventory-items", async (req, res) => {
  try {
    if (!res.locals.shopify.session) {
      return res.status(400).json({ error: "No valid Shopify session found." });
    }

    const accessToken = res.locals.shopify.session.accessToken;
    const shop = res.locals.shopify.session.shop;
    const apiVersion = "2024-10";

    // Step 1: Fetch all products and their variants
    const productsUrl = `https://${shop}/admin/api/${apiVersion}/products.json`;
    const productsResponse = await fetch(productsUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
    }

    const productsData = await productsResponse.json();
    const products = productsData.products;

    // Step 2: Extract inventory_item_ids from variants
    const inventoryItemIds = products.flatMap((product) =>
      product.variants.map((variant) => variant.inventory_item_id)
    );

    // Step 3: Fetch inventory items using the extracted IDs
    const inventoryItemsUrl = `https://${shop}/admin/api/${apiVersion}/inventory_items.json?ids=${inventoryItemIds.join(",")}`;
    const inventoryItemsResponse = await fetch(inventoryItemsUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!inventoryItemsResponse.ok) {
      throw new Error(`Failed to fetch inventory items: ${inventoryItemsResponse.statusText}`);
    }

    const inventoryItemsData = await inventoryItemsResponse.json();
    res.status(200).json(inventoryItemsData.inventory_items);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    res.status(500).json({ error: error.message });
  }
});
// Update inventory data
  app.put("/api/products/update-inventory", async (req, res) => {
    const { productId, variantId, inventoryQuantity } = req.body;

    console.log("Received request data:", req.body);

    if (!productId || inventoryQuantity === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const accessToken = res.locals.shopify.session.accessToken;
      const shop = res.locals.shopify.session.shop;
      const apiVersion = "2024-10"; // Shopify API version

      let url;
      if (variantId) {
        url = `https://${shop}/admin/api/${apiVersion}/variants/${variantId}.json`;
      } else {
        url = `https://${shop}/admin/api/${apiVersion}/products/${productId}.json`;
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          variant: {
            id: variantId,
            inventory_quantity: inventoryQuantity,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update inventory: ${response.statusText}`);
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ error: "Failed to update inventory", details: error.message });
    }
  });

  app.put("/api/inventory-items/:id", async (req, res) => {
    const { id } = req.params;
    const { sku, tracked, cost } = req.body;
  
    try {
      if (!res.locals.shopify.session) {
        return res.status(400).json({ error: "No valid Shopify session found." });
      }
  
      const accessToken = res.locals.shopify.session.accessToken;
      const shop = res.locals.shopify.session.shop;
      const apiVersion = "2024-10";
  
      // Update inventory item
      const url = `https://${shop}/admin/api/${apiVersion}/inventory_items/${id}.json`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          inventory_item: {
            sku,
            tracked,
            cost,
          },
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update inventory item");
      }
  
      const data = await response.json();
      res.status(200).json(data.inventory_item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/fulfillment-details", async (req, res) => {
    try {
      if (!res.locals.shopify.session) {
        return res.status(400).json({ error: "No valid Shopify session found." });
      }
  
      const accessToken = res.locals.shopify.session.accessToken;
      const shop = res.locals.shopify.session.shop;
      const apiVersion = "2024-10"; // Shopify API version
  
      // Step 1: Fetch orders
      const ordersUrl = `https://${shop}/admin/api/${apiVersion}/orders.json?status=any`;
      const ordersResponse = await fetch(ordersUrl, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      });
  
      if (!ordersResponse.ok) {
        throw new Error("Failed to fetch orders");
      }
  
      const ordersData = await ordersResponse.json();
      const orders = ordersData.orders;
  
      // Step 2: Extract fulfillment IDs from orders
      const fulfillmentOrderIds = orders.flatMap(order => order.fulfillments.map(fulfillment => fulfillment.id));
  
      if (!fulfillmentOrderIds.length) {
        return res.status(400).json({ error: "No fulfillments found for the orders" });
      }
  
      // Step 3: Fetch fulfillment details using the fulfillmentOrderIds
      const fulfillments = [];
  
      for (let id of fulfillmentOrderIds) {
        const fulfillmentUrl = `https://${shop}/admin/api/2024-10/fulfillment_orders/${id}/fulfillments.json`;
        const fulfillmentResponse = await fetch(fulfillmentUrl, {
          headers: {
            "X-Shopify-Access-Token": accessToken,
          },
        });
  
        if (!fulfillmentResponse.ok) {
          throw new Error(`Failed to fetch fulfillment details for fulfillment order ID: ${id}`);
        }
  
        const fulfillmentData = await fulfillmentResponse.json();
        fulfillments.push(...fulfillmentData.fulfillments);
      }
  
      // Step 4: Return the fulfillment details
      res.status(200).json({ fulfillments });
  
    } catch (error) {
      console.error("Error fetching fulfillment details:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  
  
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



app.get("/api/orders/all", async (req, res) => {


  
  try {
    // Step 1: Validate the session is available and authenticated
    if (!res.locals.shopify.session) {
      return res.status(400).json({ error: "No valid Shopify session found." });
    }

    const accessToken = res.locals.shopify.session.accessToken;
    const shop = res.locals.shopify.session.shop;

    if (!accessToken || !shop) {
      return res.status(400).json({ error: "Access token or shop is missing." });
    }

    const apiVersion = "2024-10"; // Shopify API version
    const url = `https://${shop}/admin/api/${apiVersion}/orders.json?status=any`; // Endpoint to fetch orders

    console.log("Fetching orders from URL:", url);

    // Make API call to Shopify
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken, // Use the access token here for authentication
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error fetching orders:", errorBody);
      return res.status(response.status).json({ error: `Failed to fetch orders: ${errorBody}` });
    }

    const data = await response.json();
    console.log("Fetched orders data:", data); // Log the fetched data for debugging

    // Return the fetched orders to the frontend
    res.status(200).json(data.orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch all orders", details: error.message });
  }
});
// 2. Handle inventory levels (Query inventory)
app.get("/api/products/inventory", async (req, res) => {
  try {
    const { accessToken, shop } = res.locals.shopify.session;
    const apiVersion = "2024-10";
    const url = `https://${shop}/admin/api/${apiVersion}/products.json`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products;

    // Extract inventory data
    const inventoryData = await Promise.all(
      products.map(async (product) => {
        const variantInventory = await Promise.all(
          product.variants.map(async (variant) => {
            const inventoryUrl = `https://${shop}/admin/api/${apiVersion}/inventory_items/${variant.inventory_item_id}.json`;
            const inventoryResponse = await fetch(inventoryUrl, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken,
              },
            });

            const inventoryData = await inventoryResponse.json();
            return {
              variantId: variant.id,
              inventoryQuantity: inventoryData.inventory_item.inventory_quantity,
            };
          })
        );
        return { productId: product.id, title: product.title, inventory: variantInventory };
      })
    );

    res.status(200).json(inventoryData); // Return inventory data
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory data", details: error.message });
  }
});
app.post("/api/orders/update", async (req, res) => {
  const { orderId, customerEmail, shippingAddress, trackingNumber } = req.body;

  try {
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const accessToken = res.locals.shopify.session.accessToken;
    const shop = res.locals.shopify.session.shop;
    const apiVersion = "2024-10";

    const url = `https://${shop}/admin/api/${apiVersion}/orders/${orderId}.json`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        order: {
          id: orderId,
          customer: { email: customerEmail },
          shipping_address: { address1: shippingAddress },
          tracking_number: trackingNumber,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error updating order:", errorBody);
      return res.status(response.status).json({ error: `Failed to update order: ${errorBody}` });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order", details: error.message });
  }
});

// // 3. Create fulfillment order
// app.post("/api/orders/fulfillment", async (req, res) => {
//   try {
//     const { accessToken, shop } = res.locals.shopify.session;
//     const apiVersion = "2024-10";
//     const orderId = req.body.orderId; // Get order ID from the request

//     const url = `https://${shop}/admin/api/${apiVersion}/fulfillments.json`;

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Access-Token": accessToken,
//       },
//       body: JSON.stringify({
//         fulfillment: {
//           order_id: orderId,
//           location_id: req.body.locationId, // Example location ID for fulfillment
//           tracking_numbers: [req.body.trackingNumber],
//         }
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to create fulfillment order: ${response.statusText}`);
//     }

//     const data = await response.json();
//     res.status(200).json(data); // Return fulfillment order data
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create fulfillment order", details: error.message });
//   }
// });

// Amazon product fetch


// \\\\\\\product low inventory notification
// Fetch all products with pagination
const fetchAllProducts = async (shop, accessToken) => {
  let products = [];
  let url = `https://${shop}/admin/api/2024-10/products.json`; // Update API version as needed

  while (url) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    products = products.concat(data.products);

    // Check if there is another page of products and update the URL
    url = data.next_page_url || null;
  }

  return products;
};




// ///////// PRODUCT AMAZON FETCH 

const ZYLA_API_URL = 'https://zylalabs.com/api/4233/amazon+product+extractor+api/5155/product+information';
const API_ACCESS_KEY = '5892|xmNJ3slV06Zfh4pWGXzzFveNstX51nirwZ91tsiG'; // Your ZYLA API access key
app.get('/api/amazon-products', async (req, res) => {
  try {
    const asin = req.query.asin;  // Getting the ASIN from the query parameter

    // Check if ASIN is provided
    if (!asin) {
      return res.status(400).json({ error: 'ASIN is required' });
    }

    // Make the request to ZYLA API to fetch product details
    const response = await axios.get(ZYLA_API_URL, {
      params: {
        asin: asin,  // The ASIN of the Amazon product
      },
      headers: {
        'Authorization': `Bearer ${API_ACCESS_KEY}`,  // Pass the API access key in the Authorization header
      },
    });

    // Check if the response contains product data
    if (response.data) {
      res.status(200).json(response.data); // Send the fetched product data to the frontend
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product from Amazon:', error);
    res.status(500).json({ error: 'Failed to fetch product from Amazon' });
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
// // Fetch all orders
// app.get("/api/orders/all", async (_req, res) => {
//   try {
//     // Step 1: Validate the session
//     if (!res.locals.shopify.session) {
//       return res.status(400).json({ error: "No valid Shopify session found." });
//     }

//     // Step 2: Extract necessary session data
//     const accessToken = res.locals.shopify.session.accessToken;
//     const shop = res.locals.shopify.session.shop;
//     const apiVersion = "2024-10"; // Shopify API version

//     // Step 3: Construct the API URL for orders
//     const url = `https://${shop}/admin/api/${apiVersion}/orders.json`;

//     // Step 4: Fetch orders from Shopify
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Access-Token": accessToken,
//       },
//     });

//     // Step 5: Check if the response is valid
//     if (!response.ok) {
//       throw new Error(`Failed to fetch orders: ${response.statusText}`);
//     }

//     // Parse JSON data
//     const data = await response.json();

//     // Step 6: Return the orders to the client
//     res.status(200).json(data.orders); // Orders are returned as `data.orders`
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ error: "Failed to fetch orders from Shopify" });
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});