import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';


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
          <NavLink to="/" className="ancer-class">
            <i className="fa-solid fa-house"></i><span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/pagename" className="ancer-class">
            <i className="fa-solid fa-envelope"></i><span>Emails</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/pagename" className="ancer-class">
            <i className="fa-solid fa-chart-column"></i><span>Charts</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/pagename" className="ancer-class">
            <i className="fa-solid fa-gem"></i><span>Premium</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/pagename" className="ancer-class">
            <i className="fa-solid fa-right-from-bracket"></i><span>Logout</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
