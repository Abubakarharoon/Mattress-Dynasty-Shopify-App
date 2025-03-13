import { useEffect, useState } from "react";
import { Layout, Card, DataTable, Button, Pagination, TextField, Modal } from "@shopify/polaris";

export function LowInventoryProducts() {
  const [inventoryData, setInventoryData] = useState([]); // State to store inventory data
  const [loading, setLoading] = useState(true); // Loading state for the table
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [queryValue, setQueryValue] = useState(""); // State for the search query
  const [inventoryToEdit, setInventoryToEdit] = useState(null); // Track which inventory is being edited
  const [newInventoryQuantity, setNewInventoryQuantity] = useState(""); // New value for inventory quantity
  const rowsPerPage = 4; // Rows per page for pagination

  // Fetch inventory data on component mount
  useEffect(() => {
    fetch("/api/products/inventory", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched inventory data:", data);
        setInventoryData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching inventory data:", error);
        setLoading(false);
      });
  }, []);

  // Handle search query change
  const handleQueryChange = (value) => {
    setQueryValue(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Filter inventory data based on search query
  const filteredData = inventoryData.filter((product) =>
    product.title.toLowerCase().includes(queryValue.toLowerCase())
  );

  // Prepare data for the DataTable
  const rows = filteredData.map((product) => {
    return [
      product.title,
      product.inventory.map((variant) => {
        return (
          <div key={variant.variantId}>
            <p>
              {variant.title}: {variant.inventoryQuantity}
            </p>
            <Button onClick={() => handleEditProduct(variant, product)}>
              Edit Inventory
            </Button>
          </div>
        );
      }),
      // Add a button for products without variants
      product.inventory.length === 0 && (
        <Button onClick={() => handleEditProduct(null, product)}>
          Edit Product Inventory
        </Button>
      ),
    ];
  });

  // Handle editing a product or variant
  const handleEditProduct = (variant, product) => {
    if (!product) {
      console.error("Product is undefined. Cannot edit inventory.");
      return;
    }

    console.log("Edit Product:", product);
    console.log("Edit Variant:", variant);

    if (!product.inventory || product.inventory.length === 0) {
      console.log("This product has no variants.");
      const updatedInventoryQuantity = prompt("Enter new inventory quantity for the product:");
      if (updatedInventoryQuantity !== null) {
        handleUpdateInventory(product.productId, null, updatedInventoryQuantity);
      }
      return;
    }

    const updatedInventoryQuantity = prompt("Enter new inventory quantity:", variant.inventoryQuantity);
    if (updatedInventoryQuantity !== null) {
      handleUpdateInventory(product.productId, variant.variantId, updatedInventoryQuantity);
    }
  };

  // Handle updating inventory
  const handleUpdateInventory = (productId, variantId, inventoryQuantity) => {
    console.log("Sending data to update inventory:", {
      productId,
      variantId,
      inventoryQuantity,
    });

    fetch("/api/products/update-inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: productId,
        variantId: variantId,
        inventoryQuantity: inventoryQuantity,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update inventory");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Inventory updated successfully:", data);
        // Update the inventoryData state
        setInventoryData((prevData) =>
          prevData.map((product) =>
            product.productId === productId
              ? {
                  ...product,
                  inventory: product.inventory.map((variant) =>
                    variant.variantId === variantId
                      ? { ...variant, inventoryQuantity: parseInt(inventoryQuantity) }
                      : variant
                  ),
                }
              : product
          )
        );
      })
      .catch((error) => {
        console.error("Error updating inventory:", error);
      });
  };

  // Pagination handling
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPageRows = rows.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Layout>
      <Layout.Section fullWidth>
        <h4 className="h1-1">Inventory Tracking Table with Edition</h4>
        <Card>
          <Card.Section>
            {/* Search Bar */}
            <TextField
              label="Search products"
              value={queryValue}
              onChange={handleQueryChange}
              clearButton
              onClear={() => setQueryValue("")}
              placeholder="Search by product title"
            />

            {loading ? (
              <p>Loading inventory...</p>
            ) : (
              <>
                <DataTable
                  columnContentTypes={["text", "text", "text"]}
                  headings={["Title", "Variants & Inventory", "Actions"]}
                  rows={currentPageRows}
                />

                {/* Pagination component */}
                <Pagination
                  hasPrevious={currentPage > 1}
                  hasNext={currentPage * rowsPerPage < filteredData.length}
                  onPrevious={() => handlePageChange(currentPage - 1)}
                  onNext={() => handlePageChange(currentPage + 1)}
                  pageCount={Math.ceil(filteredData.length / rowsPerPage)}
                  currentPage={currentPage}
                />
              </>
            )}
          </Card.Section>
        </Card>
      </Layout.Section>
    </Layout>
  );
}