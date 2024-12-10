import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Button, Tabs, Tab } from '@mui/material';
import { Card } from '@shopify/polaris';

// CustomTabPanel to handle showing and hiding content based on the selected tab
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

// a11yProps to manage aria-label for accessibility
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Settings() {
  // Define states to hold the form field values
  const [amazonSellerId, setAmazonSellerId] = React.useState('');
  const [amazonMarketplaceId, setAmazonMarketplaceId] = React.useState('');
  const [mwsAuthToken, setMwsAuthToken] = React.useState('');
  const [amazonAccessKeyId, setAmazonAccessKeyId] = React.useState('');
  const [amazonSecretAccessKey, setAmazonSecretAccessKey] = React.useState('');

  // State for handling the tab selection
  const [value, setValue] = React.useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  // Handle input changes for each field
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'AMAZON_SELLER_ID':
        setAmazonSellerId(value);
        break;
      case 'AMAZON_MARKETPLACE_ID':
        setAmazonMarketplaceId(value);
        break;
      case 'MWS_AUTH_TOKEN':
        setMwsAuthToken(value);
        break;
      case 'AMAZON_ACCESS_KEY_ID':
        setAmazonAccessKeyId(value);
        break;
      case 'AMAZON_SECRET_ACCESS_KEY':
        setAmazonSecretAccessKey(value);
        break;
      default:
        break;
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Log the values or send them to an API
    console.log({
      AMAZON_SELLER_ID: amazonSellerId,
      AMAZON_MARKETPLACE_ID: amazonMarketplaceId,
      MWS_AUTH_TOKEN: mwsAuthToken,
      AMAZON_ACCESS_KEY_ID: amazonAccessKeyId,
      AMAZON_SECRET_ACCESS_KEY: amazonSecretAccessKey,
    });
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="Connet Seller Account" {...a11yProps(0)} />
            <Tab label="Sync Settings" {...a11yProps(1)} />
          </Tabs>
        </Box>

        {/* Tab Panel for Amazon Account */}
        <CustomTabPanel value={value} index={0}>
          <div className="amazon-acc-card">
            <Box
              component="form"
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'start',
                height: '100vh',
                flexDirection: 'column',
                '& > :not(style)': {
                  m: 5,
                  width: '50%',
                },
              }}
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
            >
              <Card>
                <Card.Section>
                  <h1 className="settings-seller-heading text-white">Connect Your Amazon Seller Account</h1>
                  <Box sx={{ width: '100%' }} className="settings-text-box">
                    <TextField
                      label="AMAZON ACCESS KEY ID"
                      variant="outlined"
                      name="AMAZON_ACCESS_KEY_ID"
                      value={amazonAccessKeyId}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      margin="dense"
                      inputProps={{ style: { fontSize: 12 } }}
                      InputLabelProps={{ style: { fontSize: 12 } }}
                    />
                    <TextField
                      label="AMAZON SECRET ACCESS KEY"
                      variant="outlined"
                      name="AMAZON_SECRET_ACCESS_KEY"
                      value={amazonSecretAccessKey}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      margin="dense"
                      inputProps={{ style: { fontSize: 12 } }}
                      InputLabelProps={{ style: { fontSize: 12 } }}
                    />
                    <TextField
                      label="AMAZON SELLER ID"
                      variant="outlined"
                      name="AMAZON_SELLER_ID"
                      value={amazonSellerId}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      margin="dense"
                      inputProps={{ style: { fontSize: 12 } }}
                      InputLabelProps={{ style: { fontSize: 12 } }}
                    />
                    <TextField
                      label="AMAZON MARKETPLACE ID"
                      variant="outlined"
                      name="AMAZON_MARKETPLACE_ID"
                      value={amazonMarketplaceId}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      margin="dense"
                      inputProps={{ style: { fontSize: 12 } }}
                      InputLabelProps={{ style: { fontSize: 12 } }}
                    />
                    <TextField
                      label="MWS AUTH TOKEN"
                      variant="outlined"
                      name="MWS_AUTH_TOKEN"
                      value={mwsAuthToken}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      margin="dense"
                      inputProps={{ style: { fontSize: 12 } }}
                      InputLabelProps={{ style: { fontSize: 12 } }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      className="settings-submit-button"
                      sx={{ mt: 2 }}
                    >
                      Save and Connect
                    </Button>
                  </Box>
                </Card.Section>
              </Card>
            </Box>
          </div>
        </CustomTabPanel>

        {/* Tab Panel for Amazon Sync */}
        <CustomTabPanel value={value} index={1}>
          <div className="amazon-sync-card">
        <Card>
          <Card.Section>
            <div className="card-heading">
              <h3 className='text-white'>Sync Settings</h3>
            </div>
            <div className="sync-prod sync-flexbox">
                  <div className='sync-title'>
                    Sync Price
                  </div>
                <div className="flipswitch">
                <input
                  defaultChecked
                  id="fs"
                  className="flipswitch-cb"
                  name="flipswitch"
                  type="checkbox"
                />
                <label htmlFor="fs" className="flipswitch-label">
                  <div className="flipswitch-inner"></div>
                  <div className="flipswitch-switch"></div>
                </label>
              </div>
            </div>
      
            <div className="sync-prod sync-flexbox">
                  <div className='sync-title'>
                    Sync Inventory
                  </div>
                <div className="flipswitch">
                <input
                  defaultChecked
                  id="fsi"
                  className="flipswitch-cb"
                  name="flipswitch"
                  type="checkbox"
                />
                <label htmlFor="fsi" className="flipswitch-label">
                  <div className="flipswitch-inner"></div>
                  <div className="flipswitch-switch"></div>
                </label>
              </div>
            </div>
      
            <div className="sync-prod sync-flexbox">
                  <div className='sync-title'>
                    Auto Sync 
                  </div>
                <div className="flipswitch">
                <input
                  defaultChecked
                  id="fsa"
                  className="flipswitch-cb"
                  name="flipswitch"
                  type="checkbox"
                />
                <label htmlFor="fsa" className="flipswitch-label">
                  <div className="flipswitch-inner"></div>
                  <div className="flipswitch-switch"></div>
                </label>
              </div>
            </div>
      

          </Card.Section>
        </Card>
          </div>
        </CustomTabPanel>
      </Box>
    </>
  );
}
