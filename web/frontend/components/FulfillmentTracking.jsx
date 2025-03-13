import { useEffect, useState } from "react";
import { Layout, Card, DataTable, Pagination, TextField } from "@shopify/polaris";

export function FulfillmentTracking() {
  const [fulfillmentData, setFulfillmentData] = useState([]); // State to store fulfillment data
  const [loading, setLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [queryValue, setQueryValue] = useState(""); // State for the search query
  const rowsPerPage = 5; // Rows per page for pagination

  // Fetch fulfillment details on component mount
  useEffect(() => {
   
    fetch(`/api/fulfillment-details`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        setFulfillmentData(data.fulfillments || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching fulfillment data:", error);
        setLoading(false);
      });
  }, []); // Empty dependency array to fetch on component mount

  // Handle search query change
  const handleQueryChange = (value) => {
    setQueryValue(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Filter fulfillment items based on search query
  const filteredItems = fulfillmentData.filter((item) => {
    return (
      item.tracking_number.toLowerCase().includes(queryValue.toLowerCase()) ||
      item.name.toLowerCase().includes(queryValue.toLowerCase())
    );
  });

  // Prepare data for the DataTable
  const rows = filteredItems.map((item) => [
    item.id,
    item.tracking_number || "N/A", 
    item.status || "N/A",
    item.created_at || "N/A",
    item.tracking_url ? (
      <a href={item.tracking_url} target="_blank" rel="noopener noreferrer">
        Track
      </a>
    ) : (
      "N/A"
    ),
  ]);

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
        <h4>Fulfillment Tracking</h4>
        <Card>
          <Card.Section>
            {/* Search Bar */}
            <TextField
              label="Search fulfillment items"
              value={queryValue}
              onChange={handleQueryChange}
              clearButton
              onClear={() => setQueryValue("")}
              placeholder="Search by tracking number or name"
            />

            {loading ? (
              <p>Loading fulfillment...</p>
            ) : (
              <>
                {/* Fulfillment Items Table */}
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text"]}
                  headings={["ID", "Tracking Number", "Status", "Created At", "Tracking URL"]}
                  rows={currentPageRows}
                />

                {/* Pagination component */}
                <Pagination
                  hasPrevious={currentPage > 1}
                  hasNext={currentPage * rowsPerPage < filteredItems.length}
                  onPrevious={() => handlePageChange(currentPage - 1)}
                  onNext={() => handlePageChange(currentPage + 1)}
                  pageCount={Math.ceil(filteredItems.length / rowsPerPage)}
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
