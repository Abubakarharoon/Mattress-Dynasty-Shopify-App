import {
 
  Page,
 
 
} from "@shopify/polaris";

import { useTranslation, Trans } from "react-i18next";
import { OrderGraph } from "../components";




export default function HomePage() {
  const { t } = useTranslation();
  return (
    <Page narrowWidth>
    
 
       <OrderGraph />



        

    </Page>
  );
}
