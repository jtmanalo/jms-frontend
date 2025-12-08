import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import '../App.css';

export const StartShiftModal = ({ show, onClose, onSubmit, startingCash, setStartingCash, notes, setNotes }) => (
  <Modal
    show={show}
    onHide={onClose}
    centered
    dialogClassName="custom-dark-modal"
  >
    <Modal.Body style={{ padding: '1.25rem 1rem', background: '#232323', borderRadius: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 500, marginRight: '0.75rem', paddingLeft: '1rem' }}>
          Starting cash for shift:
        </span>
        <span style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          ₱ <input
            type="number"
            value={startingCash}
            onChange={e => setStartingCash(e.target.value)}
            style={{ width: 150, fontSize: '1.1rem', textAlign: 'center', border: '1px solid #ccc', borderRadius: 6, padding: '0.25rem', marginLeft: 4, background: '#232323', color: '#fff' }}
          />
        </span>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '1rem', color: '#fff', fontWeight: 500, display: 'block', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
          Notes (optional):
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ width: '100%', minHeight: '80px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: 6, padding: '0.5rem', marginLeft: 0, background: '#232323', color: '#fff', resize: 'vertical' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
        <Button variant="link" style={{ color: '#4da3ff', fontSize: '1.1rem', fontWeight: 500, textDecoration: 'none', padding: '0 1rem 0 0' }} onClick={onSubmit}>
          Start shift
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);


export const DeleteConfirmModal = ({ show, onCancel, onConfirm }) => (
  <Modal
    show={show}
    onHide={onCancel}
    centered
    dialogClassName="custom-dark-modal"
  >
    <Modal.Body style={{ padding: '1.25rem 1rem', background: '#232323', borderRadius: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 500, marginRight: '0.75rem', paddingLeft: '1rem' }}>
          Are you sure you want to delete this item?
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
        <Button variant="secondary" style={{ borderRadius: '0.75rem', fontWeight: 600, fontFamily: 'inherit', fontSize: '1rem', letterSpacing: 1, marginRight: '0.5rem' }} onClick={onCancel}>
          No, cancel
        </Button>
        <Button variant="danger" style={{ borderRadius: '0.75rem', fontWeight: 600, fontFamily: 'inherit', fontSize: '1rem', letterSpacing: 1 }} onClick={onConfirm}>
          Yes, delete
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);

export const EndShiftConfirmModal = ({ show, onCancel, onConfirm }) => (
  <Modal
    show={show}
    onHide={onCancel}
    centered
    dialogClassName="custom-dark-modal"
  >
    <Modal.Body style={{ padding: '1.25rem 1rem', background: '#232323', borderRadius: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 500, marginRight: '0.75rem', paddingLeft: '1rem' }}>
          Are you sure you want to end your shift?
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
        <Button variant="secondary" style={{ borderRadius: '0.75rem', fontWeight: 600, fontFamily: 'inherit', fontSize: '1rem', letterSpacing: 1, marginRight: '0.5rem' }} onClick={onCancel}>
          No, cancel
        </Button>
        <Button variant="danger" style={{ borderRadius: '0.75rem', fontWeight: 600, fontFamily: 'inherit', fontSize: '1rem', letterSpacing: 1 }} onClick={onConfirm}>
          Yes, end shift
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);

export const AddCapitalModal = ({ show, onClose, shiftId, token, onSuccess, branchId, userId }) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('AddCapitalModal props:', { show, shiftId, token, branchId, userId });

  const handleAddCapital = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        shiftId,
        amount: parseFloat(amount),
        notes: notes || '',
        branchId,
        userId,
      };

      console.log('Sending add capital request with payload:', payload);
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/shifts/${shiftId}/add-capital`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Capital added successfully!');
      setAmount('');
      setNotes('');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error adding capital:', error.response?.data || error.message);
      alert('Failed to add capital. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Additional Capital</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAddCapital} disabled={isSubmitting || !amount}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Adding...
            </>
          ) : (
            'Add Capital'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
