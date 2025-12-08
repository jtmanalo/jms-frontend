import { useState, useEffect } from 'react';
import { Table, Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment-timezone';
import { useDashboard } from '../services/DashboardContext';

function LogsPage() {
    const { shiftId } = useDashboard();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeShiftError, setActiveShiftError] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // console.log('LogsPage shiftId:', shiftId);

    // useEffect(() => {
    //     const fetchActiveShift = async () => {
    //         try {
    //             const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/shifts/active/${user.userID}`);
    //             if (!response.data || Object.keys(response.data).length === 0) {
    //                 throw new Error('No active shift found');
    //             }
    //             const { ShiftID } = response.data[0];
    //             console.log('Active ShiftID:', ShiftID);
    //         } catch (error) {
    //             console.error('Error fetching active shift:', error.message);
    //             setActiveShiftError('Shift has not yet started.');
    //         }
    //     };

    //     fetchActiveShift();
    // });

    useEffect(() => {
        if (!shiftId) {
            // console.log('Shift ID is null, skipping fetchLogs');
            return;
        }

        const fetchLogs = async () => {
            setIsLoading(true);
            // console.log('Fetching logs for shiftId:', shiftId);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/daily-logs/${shiftId}`);
                const sortedLogs = response.data.sort((a, b) => new Date(b.TransactionDate) - new Date(a.TransactionDate));
                setLogs(sortedLogs);
            } catch (error) {
                console.error('Error fetching logs:', error.response?.data || error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [shiftId]);

    const handleRowClick = (log) => {
        setSelectedLog(log);
    };

    const handleCloseModal = () => {
        setSelectedLog(null);
    };

    const handleVoidClick = () => {
        setShowPasswordModal(true);
        setPassword('');
    };

    const handlePasswordCancel = () => {
        setShowPasswordModal(false);
        setPassword('');
        setPasswordError('');
    };

    const handlePasswordConfirm = async () => {
        if (!password) {
            setPasswordError('Please enter a password.');
            return;
        }

        setIsSubmitting(true);
        setPasswordError('');

        try {
            console.log('Voiding transaction with ID:', selectedLog.TransactionID, password);
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/transactions/void/${selectedLog.TransactionID}`,
                { password },
            );
            console.log('Void response:', response.data);
            alert('Transaction voided successfully.');
            setShowPasswordModal(false);
            setPassword('');
            setPasswordError('');
            setSelectedLog(null);

            // Refresh logs
            const logsResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/daily-logs/${shiftId}`);
            const sortedLogs = logsResponse.data.sort((a, b) => new Date(b.TransactionDate) - new Date(a.TransactionDate));
            setLogs(sortedLogs);
        } catch (error) {
            console.error('Error voiding transaction:', error.response?.data || error.message);

            if (error.response?.status === 401) {
                setPasswordError('Incorrect password. Please try again.');
            } else if (error.response?.status === 404) {
                setPasswordError('Transaction not found.');
            } else {
                setPasswordError(error.response?.data?.error || 'Failed to void transaction. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="container-fluid" style={{ maxWidth: '90vw' }}>
                {activeShiftError ? (
                    <div className="alert alert-danger text-center">
                        {activeShiftError}
                    </div>
                ) : isLoading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        backgroundColor: '#f8f9fa',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        zIndex: 1050,
                    }}>
                        <span className="spinner-border" role="status" aria-hidden="true"></span>
                    </div>
                ) : logs.length === 0 ? (
                    <div>
                        <h3 style={{ textAlign: 'center' }}>Transaction Logs</h3>
                        <p style={{ textAlign: 'center' }}>No transactions found.</p>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ textAlign: 'center' }}>Transaction Logs</h3>
                        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Type</th>
                                        <th>Method</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={index} onClick={() => handleRowClick(log)} style={{ cursor: 'pointer' }}>
                                            <td>{moment(log.TransactionDate).tz('Asia/Manila').format('HH:mm')}</td>
                                            <td>{log.TransactionType.toUpperCase()}</td>
                                            <td>{log.PaymentMethod.toUpperCase()}</td>
                                            <td>{`₱${log.TotalAmount}`}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                )}

                {selectedLog && (
                    <Modal show={!!selectedLog} onHide={handleCloseModal} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Transaction Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p><strong>Date:</strong> {moment(selectedLog.TransactionDate).tz('Asia/Manila').format('MMMM DD, YYYY')}</p>
                            {selectedLog.PartyName ? <p><strong>Name:</strong> {selectedLog.PartyName}</p> : null}
                            <p><strong>Time:</strong> {moment(selectedLog.TransactionDate).tz('Asia/Manila').format('HH:mm')}</p>
                            <p><strong>Transaction Type:</strong> {selectedLog.TransactionType.toUpperCase()}</p>
                            <p><strong>Payment Method:</strong> {selectedLog.PaymentMethod.toUpperCase()}</p>
                            <p><strong>Notes:</strong> {selectedLog.Notes ? selectedLog.Notes : 'N/A'}</p>
                            <p><strong>Amount:</strong> ₱{selectedLog.TotalAmount}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={handleVoidClick}>
                                Void
                            </Button>
                            <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                )}

                {showPasswordModal && (
                    <Modal show={showPasswordModal} onHide={handlePasswordCancel} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Void Transaction</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Enter owner password to confirm voiding this transaction.</p>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Owner Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                onKeyPress={(e) => e.key === 'Enter' && handlePasswordConfirm()}
                            />
                            {passwordError && (
                                <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                    {passwordError}
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handlePasswordCancel} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handlePasswordConfirm} disabled={isSubmitting || !password}>
                                {isSubmitting ? 'Confirming...' : 'Confirm Void'}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        </div>
    );
}

export default LogsPage;