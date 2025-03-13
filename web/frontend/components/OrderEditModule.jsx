import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout, Card, TextField, Button } from "@shopify/polaris";

export function OrderEditModule() { // Make sure it's a named export
  const { orderId } = useParams(); // Extract orderId from URL
  const [order, setOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const accessToken = localStorage.getItem('accessToken'); // If you're storing it in localStorage or another store.
  
      if (!accessToken) {
        console.error('Access token is not available');
        return;
      }
  
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
  
        const data = await response.json();
        setOrder(data);
        setTrackingNumber(data.tracking_number || "");
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };
  
    fetchOrderDetails();
  }, [orderId]);
  

  const handleSaveChanges = () => {
    fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber })
    })
      .then((response) => response.json())
      .then((data) => console.log("Order updated:", data))
      .catch((error) => console.error("Error updating order:", error));
  };

  if (!order) return <p>Loading order details...</p>;

  return (
    <Layout>
      <Layout.Section>
        <h1>Edit Order {order.name}</h1>
        <Card>
          <Card.Section>
            <TextField
              label="Tracking Number"
              value={trackingNumber}
              onChange={setTrackingNumber}
              placeholder="Enter tracking number"
            />
            <Button primary onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Card.Section>
        </Card>
      </Layout.Section>
    </Layout>
  );
}
