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
                            <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        </div>
    );
}

export default LogsPage;