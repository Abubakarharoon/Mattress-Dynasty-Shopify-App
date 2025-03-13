import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useEffect, useState } from "react";
import { Layout, Card, DataTable, Button, Pagination, TextField, Modal } from "@shopify/polaris";

export function OrderTrackingModule() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryValue, setQueryValue] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const rowsPerPage = 5;

  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch unfulfilled orders on component mount
  useEffect(() => {
    fetch("/api/orders/all")
      .then((response) => response.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      });
  }, []);

  // Handle search query change
  const handleQueryChange = (value) => {
    setQueryValue(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) =>
    order.name.toLowerCase().includes(queryValue.toLowerCase())
  );

  // Prepare data for the DataTable
  const rows = filteredOrders.map((order) => {
    const customerEmail = order.customer ? order.customer.email : "N/A";
    const financialStatus = order.financial_status || "N/A";
    const fulfillmentStatus = order.fulfillment_status || "Unfulfilled";

    return [
      order.name,
      customerEmail,
      financialStatus,
      fulfillmentStatus,
      order.tracking_number,
      <Button onClick={() => setSelectedOrder(order)}>Assign Tracking</Button>,
      <Button onClick={() => navigate(`/order/edit/${order.id}`)}>Edit</Button>, // Navigate to edit page
    ];
  });

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
        <h1>Order Tracking Management</h1>
        <Card>
          <Card.Section>
            {/* Search Bar */}
            <TextField
              label="Search orders"
              value={queryValue}
              onChange={handleQueryChange}
              clearButton
              onClear={() => setQueryValue("")}
              placeholder="Search by order name"
            />

            {loading ? (
              <p>Loading orders...</p>
            ) : (
              <>
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "text", "text"]}
                  headings={["Order Name", "Customer Email", "Payment Status", "Fulfillment Status", "Tracking Number", "Assign Tracking", "Actions"]}
                  rows={currentPageRows}
                />

                {/* Pagination */}
                <Pagination
                  hasPrevious={currentPage > 1}
                  hasNext={currentPage * rowsPerPage < filteredOrders.length}
                  onPrevious={() => handlePageChange(currentPage - 1)}
                  onNext={() => handlePageChange(currentPage + 1)}
                  pageCount={Math.ceil(filteredOrders.length / rowsPerPage)}
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
