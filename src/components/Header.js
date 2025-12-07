import React from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import {
  Row,
  Col,
  Container,
  Image,
  Button,
  Card
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export const Header = () => {
  return (
    <Container fluid className="py-3 px-4" style={{ backgroundColor: '#e9ecef' }}>
      <Row className="d-flex align-items-center">
        <Col xs={6}>
          <p className="mb-0 fs-5 fw-bold">Remaining: ₱0.00</p>
          <p className="mb-0 fs-6">Starting: ₱0.00</p>
        </Col>
        <Col xs={6} className="text-end">
          <p className="mb-0 fw-bold fs-5">You are in:</p>
          <p className="mb-0 fs-6">Alaminos</p>
        </Col>
      </Row>
    </Container>
  );
};

export const MobileHeader = ({ nickname, userType }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  // console.log('Nickname prop:', nickname);

  return (
    <Container fluid className="bg-white text-dark py-3 shadow-sm">
      <Row className="align-items-center">
        <Col xs={12}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div className="d-flex align-items-center">
              <Image src="/jmslogo.png" alt="Logo" style={{ height: 32, marginRight: 8 }} />
              <span style={{ fontFamily: 'inherit', fontSize: '1.25rem', fontWeight: 600, letterSpacing: 1, verticalAlign: 'middle', marginTop: '4px', display: 'inline-block' }}>Hello{nickname ? `, ${nickname}` : ''}!</span>
            </div>
            <div>
              {userType === 'owner' && (
                <Button
                  variant="outline-dark"
                  className="me-3"
                  onClick={() => navigate(`/admin-dashboard/${nickname}`)}
                >
                  Back to Admin
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                style={{ fontFamily: 'inherit', fontWeight: 'bold', backgroundColor: '#232323', borderColor: '#343a40', marginLeft: 8 }}
                onClick={() => auth.logOut()}
              >
                LOGOUT
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export const BackHeader = ({ text, onBack }) => {
  const navigate = useNavigate();

  return (
    <Card.Header className="d-flex align-items-center" style={{ background: '#fff', borderBottom: '1px solid #343a40', paddingLeft: '0.5rem' }}>
      <Button
        variant="link"
        style={{ color: '#343a40', fontSize: '1.5rem', marginRight: '0.5rem', paddingLeft: 0 }}
        onClick={onBack ? onBack : () => navigate(-1)}
      >
        <FaChevronLeft />
      </Button>
      <span style={{ fontFamily: 'inherit', fontSize: '1.25rem', fontWeight: 600, letterSpacing: 1, verticalAlign: 'middle', marginTop: '4px', display: 'inline-block' }}>{text}</span>
    </Card.Header>
  )
};

export const DesktopHeader = ({ title, subtitle }) => (
  <div style={{ padding: '16px 32px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{title}</h1>
    {subtitle && <p style={{ margin: 0, fontSize: '1rem', color: '#666' }}>{subtitle}</p>}
  </div>
);
