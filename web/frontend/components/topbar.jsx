import React, { useEffect, useState } from "react";
import { Icon, Badge, Tooltip, Text } from "@shopify/polaris";
import { NotificationIcon } from '@shopify/polaris-icons';  // Importing the notification icon

export function Topbar() {
  const [lowInventoryCount, setLowInventoryCount] = useState(0);
  const [lowInventoryProducts, setLowInventoryProducts] = useState([]);
  
  // Fetch the low inventory products
  useEffect(() => {
    fetch("/api/products/low-inventory")
      .then(response => response.json())
      .then(data => {
        setLowInventoryProducts(data);
        setLowInventoryCount(data.length); // Set the count of products with low inventory
      })
      .catch(error => {
        console.error("Error fetching low inventory products:", error);
      });
  }, []); // Runs once when component mounts

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent:"flex-end" }}>
      <Tooltip content="Low Inventory">
        <div style={{ position: "relative" }}>
          <Icon
            source={NotificationIcon}
            tone="critical"
            style={{ cursor: "pointer", fontSize: "24px" }}
          />
          
          {/* Show badge only if there are low inventory products */}
          {lowInventoryCount > 0 && (
            <Badge
              status="attention"
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                fontSize: "12px",
                zIndex: 10,
              }}
            >
              {lowInventoryCount}
            </Badge>
          )}
        </div>
      </Tooltip>
      
      {/* Optionally, display a notification message */}
      {lowInventoryCount > 0 && (
        <div style={{ marginLeft: "10px", fontSize: "14px", color: "red" }}>
          <Text>
            <strong>{lowInventoryCount}</strong> product(s) have low inventory!
          </Text>
        </div>
      )}
    </div>
  );
}
