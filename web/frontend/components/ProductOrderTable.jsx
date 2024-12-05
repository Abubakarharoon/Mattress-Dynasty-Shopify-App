import { useEffect, useState } from "react";
import { Page, Layout, Card, DataTable, Button } from "@shopify/polaris";
import { useTranslation } from "react-i18next";
export function ProductOrderTable() {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    fetch("/api/products/all", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); 
      })
      .then((data) => {
        setProducts(data); 
        setLoading(false);   
      })
      .catch((error) => {
        console.error("There was an error fetching products!", error);
        setLoading(false);  
      });
  }, []);  

  // Prepare data for the DataTable
  const rows = products.map(product => {
    const variant = product.variants[0];  // Assuming we're showing the first variant's details
    const sku = variant.sku;
    const price = variant.price;
    const inventory = variant.inventory_quantity;
    const imageUrl = product.images.length > 0 ? product.images[0].src : ""; // Get first image

    return [
      <img src={imageUrl} alt={product.title} style={{ width: "50px", height: "50px" }} />,
      product.title,
      sku,  
      
      inventory,   
      <h4 onClick={() => handleEditProduct(product)}>0</h4> ,
      <h4 >0</h4> 
      
    ];
  });

  const handleEditProduct = (product) => {
    // Add your logic to handle product editing (e.g., opening a modal or redirecting to edit page)
    console.log("Edit Product:", product);
  };

  return (
      <Layout>
        <Layout.Section fullWidth>
        <h4 className="h1-1">Product Orders Table</h4>

          <Card>
            <Card.Section>
              {loading ? (
                <p>Loading products...</p>
              ) : (
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text' ]}
                  headings={['Image', 'Title', 'SKU',  'Inventory', 'Orders', 'Fullfill']}
                  rows={rows}
                />
              )}
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
  );
}

