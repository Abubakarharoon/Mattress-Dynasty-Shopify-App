import React, { useEffect, useState } from "react";
import { Page, IndexTable } from "@shopify/polaris";

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/orders/all", {
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
        setOrders(data); // Save orders to state
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error.message);
        setError("Failed to fetch orders.");
      });
  }, []);

  if (error) return <p>{error}</p>;
  if (orders.length === 0) return <p>Loading orders...</p>;

  return (
    
      <IndexTable
        itemCount={orders.length}
        headings={[
          { title: "Order ID" },
          { title: "Customer Name" },
          { title: "Total Price" },
          { title: "Created At" },
        ]}
        selectable={false}
        rows={orders.map((order) => [
          order.id,
          `${order.customer?.first_name} ${order.customer?.last_name}`,
          order.total_price,
          new Date(order.created_at).toLocaleString(),
        ])}
      />
  
  );
}
