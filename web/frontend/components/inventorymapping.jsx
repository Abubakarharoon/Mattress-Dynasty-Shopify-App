import { Layout, ButtonGroup,Card, Button} from '@shopify/polaris';
import React from 'react';

export function Inventorybtn() {
  return (
    <Layout>
      <Layout.Section fullWidth>
      
    <Card>
          <Card.Section>
          <ButtonGroup>
      <Button>ADD A product</Button>
      <Button variant="primary">MAPPING PRODUCT</Button>
    </ButtonGroup>
          </Card.Section>
        </Card>
        </Layout.Section>
        </Layout>
      
  );
}