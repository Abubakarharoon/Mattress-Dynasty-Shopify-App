import {
 
  Page,
  IndexTable,
 
} from "@shopify/polaris";
import { AmazonProduct, Indecxtable, Inventorybtn } from "../components";
import { useTranslation, Trans } from "react-i18next";
import { useEffect } from "react";




export default function HomePage() {
  const { t } = useTranslation();
  useEffect(() => {
    fetch("/api/products/all", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();  // Parse the JSON response
      })
      .then((data) => {
        console.log("Fetched products:", data);  // Log the fetched products
      })
      .catch((error) => {
        console.error("There was an error!", error.message);  // Handle any errors
      });
  }, []);  // Empty dependency array ensures this runs only once when the component mounts

  
  return (
    <Page fullWidth>
    
 <div className="d-flexx">

<Indecxtable />
<AmazonProduct />
        
</div>
<div className="all-btn"> 
<Inventorybtn />

</div>
    </Page>
  );
}
