import { Nav } from 'react-bootstrap';

export const BottomNav = ({ href, icon: Icon, label }) => {
  return (
    <Nav.Link href={href} className="text-center d-flex flex-column align-items-center py-1 px-2">
      <Icon size={24} className="text-gray-450" />
      <span className="text-gray-450 text-xs" style={{ fontSize: '18px' }}>
        {label}
      </span>
    </Nav.Link>
  );
};

export const TopNav = ({ href, icon: Icon, label }) => {
  return (
    <Nav.Link href={href} className="text-center d-flex flex-column align-items-center py-1 px-2">
      <Icon size={24} className="text-gray-450" />
      <span className="text-gray-450 text-xs" style={{ fontSize: '18px' }}>
        {label}
      </span>
    </Nav.Link>
  );
};
