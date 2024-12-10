import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  SettingsIcon
} from '@shopify/polaris-icons';
import { Icon } from "@shopify/polaris";
import {
  HomeIcon
} from '@shopify/polaris-icons';
import {
  ChevronRightIcon
} from '@shopify/polaris-icons';
import {
  ChartHistogramFirstIcon
} from '@shopify/polaris-icons';


import {
  ProductFilledIcon
} from '@shopify/polaris-icons';


export function Navigationbar() {
  // State to track whether the sidebar is collapsed or not
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Function to toggle the sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(prevState => !prevState);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle button to collapse/expand the sidebar */}
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isCollapsed ? '⮞' : '⮜'} {/* Change arrow direction based on the state */}
      </button>
      <ul className="menu">
        <li>
          <NavLink to="/" className="ancer-class" title='Dashboard'>
            <i className="fa-solid fa-house"></i><span className='sidebar-icons-spain'><Icon
  source={HomeIcon}
  tone="base"/><h2 className='sidebar-icon-text'>Dashboard</h2></span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/AmazonProduct" className="ancer-class" title='Products'>
            <i className="fa-solid fa-envelope"></i><span className='sidebar-icons-spain'><Icon
  source={ProductFilledIcon}
  tone="base"
/><h2 className='sidebar-icon-text' >Products</h2></span>
          </NavLink>
        </li>
        <li>
          
          <NavLink to="/settings" className="ancer-class" title='Settings'>
            <i className="fa-solid fa-chart-column"></i><span className='sidebar-icons-spain'><Icon
  source={SettingsIcon}
  tone="base"

/><h2 className='sidebar-icon-text'>Settings</h2></span>
          </NavLink>
        </li>
      
        <li>
          <NavLink to="/reports" className="ancer-class" title='Reports'>
            <i className="fa-solid fa-right-from-bracket"></i><span className='sidebar-icons-spain'><Icon
  source={ChartHistogramFirstIcon}
  tone="base"
  style={{
    color: "red", // Change to any color
    fontSize: "24px",
  }}
/><h2 className='sidebar-icon-text'>Reports</h2></span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
