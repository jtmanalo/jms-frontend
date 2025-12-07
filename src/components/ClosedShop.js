import React, { useState } from 'react';
import {
  Container,
  Button,
  Modal,
  Form
} from 'react-bootstrap';

function ClosedShop() {
  const [showModal, setShowModal] = useState(false);
  const [cashAmount, setCashAmount] = useState('₱1000.00');

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleOpenShop = () => {
    // console.log(`Opening shop with cash amount: ${cashAmount}`);
    handleCloseModal();
  };
  return (
    <>
      <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="6rem"
            height="6rem"
            fill="currentColor"
            className="bi bi-clock"
            viewBox="0 0 16 16"
          >
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
          </svg>
        </div>
        <h2 className="mb-2">Shop is closed</h2>
        <p className="mb-4">Open shop to perform sales</p>
        <Button variant="dark" size="lg" onClick={handleShowModal}>Open Shop</Button>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Specify the amount of cash in your drawer at the start of the day</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="cashAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="text"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleOpenShop}>
            Open Shop
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ClosedShop;
