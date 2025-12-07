import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../App.css';

export const StartShiftModal = ({ show, onClose, onSubmit, startingCash, setStartingCash }) => (
  <Modal
    show={show}
    onHide={onClose}
    centered
    dialogClassName="custom-dark-modal"
  >
    <Modal.Body style={{ padding: '1.25rem 1rem', background: '#232323', borderRadius: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 500, marginRight: '0.75rem', paddingLeft: '1rem' }}>
          Starting cash for shift:
        </span>
        <span style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          ₱ <input
            type="number"
            value={startingCash}
            onChange={e => setStartingCash(e.target.value)}
            style={{ width: 80, fontSize: '1.1rem', textAlign: 'center', border: '1px solid #ccc', borderRadius: 6, padding: '0.25rem', marginLeft: 4, background: '#232323', color: '#fff' }}
          />
        </span>
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
