import { useEffect } from "react";
import { Page, Layout } from "@shopify/polaris";
import { useTranslation } from "react-i18next";

export default function PageName() {
  const { t } = useTranslation();

  useEffect(() => {
    fetch("https://provider-weddings-voluntary-designer.trycloudflare.com/api/products/all", {
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
        console.log("Response", data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          {/* You can display the products here */}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
