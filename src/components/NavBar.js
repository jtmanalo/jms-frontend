import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Navbar,
  Button,
  Nav
} from 'react-bootstrap';
import {
  FaHome,
  FaChevronDown,
  FaBars,
  FaUserCog,
  FaListAlt,
  FaSignOutAlt,
  FaClipboardList,
  FaFileInvoice,
  FaUser,
  FaBuilding,
  FaBox,
  FaClock,
  FaUserTie,
  FaHandHoldingUsd
} from 'react-icons/fa';
// import useIsMobile from './useIsMobile';

function UserProfileDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const auth = useAuth();
  const { user } = auth;
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);
  const menuOptions = [
    {
      label: 'Manage Account',
      icon: FaUserCog,
      onClick: () => navigate(`/admin-dashboard/${user?.username}/settings`), // Navigate to SettingsPage
    },
    {
      label: 'Activity Log',
      icon: FaListAlt,
      onClick: () => navigate(`/admin-dashboard/${user?.username}/user-logs`), // Navigate to LogsPage
    },
    {
      label: 'Log out',
      icon: FaSignOutAlt,
      onClick: () => auth.logOut(),
    },
  ];
  // Responsive: track window size with state
  const [isSmallScreen, setIsSmallScreen] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  React.useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const avatarSize = 40;
  const dropdownIconSize = 32;
  const dropdownMenuMinWidth = isSmallScreen ? 48 : 190;
  const dropdownMenuMaxWidth = isSmallScreen ? 64 : 320;
  return (
    <div
      ref={dropdownRef}
      className="d-flex align-items-center justify-content-center position-relative"
      style={{ gap: isSmallScreen ? 0 : 8, minWidth: dropdownMenuMinWidth, maxWidth: dropdownMenuMaxWidth }}
    >
      <img
        src={`https://placehold.co/40x40/dc3545/ffffff?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`}
        alt="User"
        className="rounded-circle"
        style={{ width: avatarSize, height: avatarSize, marginRight: isSmallScreen ? 0 : 8 }
        }
      />
      < div className="d-none d-md-block" >
        <div className="fw-bold small mb-0 lh-1">{user?.username || 'User'}</div>
        <div className="text-muted small lh-1">{user?.userType || 'Admin'}</div>
      </div >
      <button
        type="button"
        className="btn btn-link p-0 m-0"
        style={{ height: dropdownIconSize, width: dropdownIconSize, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: isSmallScreen ? 0 : 8 }}
        onClick={() => setShowDropdown(v => !v)}
      >
        <FaChevronDown size={20} color="#212529" />
      </button>
      {
        showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: dropdownIconSize + 12,
              right: 0,
              minWidth: dropdownMenuMinWidth,
              maxWidth: dropdownMenuMaxWidth,
              background: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              borderRadius: 12,
              zIndex: 100,
              padding: isSmallScreen ? '8px 0' : '12px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isSmallScreen ? 'center' : 'flex-start',
            }}
          >
            {menuOptions.map((option, idx) => (
              <button
                key={option.label}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: isSmallScreen ? '8px 0' : '10px 18px',
                  textAlign: isSmallScreen ? 'center' : 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isSmallScreen ? 0 : 10,
                  fontSize: isSmallScreen ? 0 : 15,
                  color: idx === 3 ? '#E57373' : '#212529',
                  cursor: 'pointer',
                  justifyContent: isSmallScreen ? 'center' : 'flex-start',
                }}
                onClick={option.onClick}
              >
                <option.icon size={18} color={idx === 3 ? '#E57373' : '#3973F3'} />
                <span className="d-none d-md-inline">{option.label}</span>
              </button>
            ))}
          </div>
        )
      }
    </div >
  );
}

const Icon = ({ icon: IconComponent, className = "" }) => (
  <IconComponent size={20} className={`text-light-500 ${className}`} />
);

export function MobileNav({ activePage, setActivePage }) {
  const menuItems = [
    { name: 'Home', icon: FaHome, key: 'home' },
    { name: 'Pricelist', icon: FaClipboardList, key: 'pricelist' },
    { name: 'Logs', icon: FaFileInvoice, key: 'logs' },
    // { name: 'Ongoing', icon: FaSpinner, key: 'ongoing' },
    { name: 'Profile', icon: FaUser, key: 'profile' },
  ];

  return (
    <>
      <Navbar fixed="bottom" className="bg-white border-top shadow-md">
        <Container className="d-flex justify-content-between">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`d-flex flex-column align-items-center p-3 rounded-lg text-decoration-none transition-colors duration-200 ${activePage === item.key ? 'shadow-md bg-dark text-white' : 'hover:bg-gray-200 text-dark'}`}
              style={{
                flex: 1,
                textAlign: 'center',
                background: activePage === item.key ? '#222' : 'transparent',
                color: activePage === item.key ? '#fff' : '#222',
              }}
            >
              <Icon icon={item.icon} className="mb-1" style={{ color: activePage === item.key ? '#fff' : '#222' }} />
              <span className="mt-2 font-medium" style={{ color: activePage === item.key ? '#fff' : '#222' }}>{item.name}</span>
            </Nav.Link>
          ))}
        </Container>
      </Navbar>
    </>
  );
}

export function SideNav({ activePage, setActivePage, isCollapsed, toggleSidebar }) {
  const auth = useAuth();

  const sidebarWidth = isCollapsed ? '72px' : '260px'; // Width for collapsed/expanded state

  const menuItems = [
    { name: 'Dashboard', icon: FaHome, key: 'dashboard' },
    { name: 'Analytics', icon: FaClipboardList, key: 'analytics' },
    { name: 'Inventory', icon: FaFileInvoice, key: 'inventory' },
    { name: 'Items and Pricing', icon: FaBox, key: 'items' },
    { name: 'Buyers and Pricing', icon: FaUserTie, key: 'buyers' },
    { name: 'Loans', icon: FaHandHoldingUsd, key: 'loans' },
    { name: 'Shifts', icon: FaClock, key: 'shifts' },
    { name: 'Employees', icon: FaUser, key: 'employees' },
    { name: 'Branches', icon: FaBuilding, key: 'branches' },
    { name: 'Profile Settings', icon: FaUserCog, key: 'settings' },
    { name: 'Help / Tutorial', icon: FaListAlt, key: 'help' },
    { name: 'Log out', icon: FaSignOutAlt, key: 'logout', onClick: () => auth.logOut() },
  ];

  return (
    <div
      className="bg-white text-gray-900 shadow-sm flex flex-col"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        transition: 'width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 1030,
      }}
    >
      <Nav className="flex-column flex-grow-1 p-2 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.key}
            onClick={item.onClick || (() => setActivePage(item.key))}
            className={`d-flex items-center p-3 rounded-lg text-decoration-none transition-colors duration-200 ${activePage === item.key ? 'shadow-md' : 'hover:bg-gray-800'}`}
            style={{
              ...(isCollapsed ? { justifyContent: 'center' } : {}),
              background: activePage === item.key ? '#222' : 'transparent',
              color: activePage === item.key ? '#fff' : '#222',
            }}
          >
            <Icon icon={item.icon} style={{ color: activePage === item.key ? '#fff' : '#222' }} />
            {!isCollapsed && <span className="ms-3 font-medium" style={{ color: activePage === item.key ? '#fff' : '#222' }}>{item.name}</span>}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
}

export function TopNav({ toggleSidebar, isCollapsed }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Navbar expand="lg" className="bg-white shadow-sm border-bottom py-2 ps-3 pe-4" style={{ position: 'fixed', top: 0, left: isCollapsed ? '72px' : '260px', right: 0, zIndex: 1020, transition: 'left 0.3s ease', minHeight: 55, height: 65 }}>
      <div className="d-flex align-items-center w-100" style={{ minHeight: 40, flexWrap: 'nowrap' }}>
        {/* Menu/Collapse Toggle Button */}
        <Button variant="link" onClick={toggleSidebar} className="text-dark p-0" style={{ marginRight: 12, minWidth: 32 }}>
          <FaBars size={20} color="#212529" />
        </Button>
        {/* Spacer to push right section to the end */}
        <div className="flex-grow-1" />
        {/* Right Side Icons and User Profile */}
        <div className="d-flex align-items-center" style={{ gap: 10, marginRight: 8, flexWrap: 'nowrap', minWidth: 0 }}>
          {/* Conditionally render Employee Dashboard button based on SideNav state */}
          {isCollapsed && (
            <Button
              variant="outline-dark"
              className="me-3"
              style={{
                fontSize: '0.8rem', // Smaller font size for mobile
                padding: '0.4rem 0.6rem', // Adjust padding for smaller buttons
              }}
              onClick={() => navigate(`/employee-dashboard/${user?.username}`)}
            >
              Employee Dashboard
            </Button>
          )}
          {/* User Profile Dropdown */}
          <div style={{ minWidth: 32, flexShrink: 0 }}>
            <UserProfileDropdown />
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .navbar {
            min-height: 55px !important;
            height: 55px !important;
          }
          .navbar .d-flex.align-items-center.w-100 {
            min-height: 40px !important;
            flex-wrap: nowrap !important;
          }
          .navbar .d-flex.align-items-center {
            gap: 4px !important;
            margin-right: 2px !important;
            flex-wrap: nowrap !important;
          }
          .navbar .nav-link {
            margin-right: 2px !important;
            min-width: 28px !important;
          }
        }
      `}</style>
    </Navbar>
  );
}
