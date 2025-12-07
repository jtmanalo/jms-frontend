import { useState, useEffect } from 'react';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment-timezone';

function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filterAction, setFilterAction] = useState('');
    const [filterUser, setFilterUser] = useState('');

    useEffect(() => {
        fetchActivityLogs();
    }, []);

    const fetchActivityLogs = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/activity-logs`);
            const sortedLogs = response.data.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
            setLogs(sortedLogs);
        } catch (error) {
            console.error('Error fetching activity logs:', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (log) => {
        setSelectedLog(log);
    };

    const handleCloseModal = () => {
        setSelectedLog(null);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'success':
                return 'text-success';
            case 'failed':
                return 'text-danger';
            case 'pending':
                return 'text-warning';
            default:
                return '';
        }
    };

    const filteredLogs = logs.filter(log => {
        const actionMatch = filterAction === '' || log.Action?.includes(filterAction);
        const userMatch = filterUser === '' || log.User?.includes(filterUser);
        return actionMatch && userMatch;
    });

    return (
        <div className="container-fluid" style={{ maxWidth: '90vw', padding: '20px' }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Activity Logs</h3>

            {/* Filters */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <Form.Group style={{ minWidth: '200px' }}>
                    <Form.Label>Action</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g., Create, Update, Login"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    />
                </Form.Group>
                <Form.Group style={{ minWidth: '200px' }}>
                    <Form.Label>User</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                    />
                </Form.Group>
            </div>

            {isLoading ? (
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
            ) : filteredLogs.length === 0 ? (
                <div>
                    <p style={{ textAlign: 'center' }}>No activity logs found.</p>
                </div>
            ) : (
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Table striped bordered hover responsive>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, index) => (
                                <tr
                                    key={index}
                                    onClick={() => handleRowClick(log)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>{moment(log.Timestamp).format('MMM DD, YYYY HH:mm:ss')}</td>
                                    <td>{log.User || 'N/A'}</td>
                                    <td>{log.Action || 'N/A'}</td>
                                    <td>{log.Details || 'N/A'}</td>

                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Detail Modal */}
            <Modal show={selectedLog !== null} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Activity Log Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedLog && (
                        <div>
                            <p><strong>Timestamp:</strong> {moment(selectedLog.Timestamp).format('MMM DD, YYYY HH:mm:ss')}</p>
                            <p><strong>User:</strong> {selectedLog.User || 'N/A'}</p>
                            <p><strong>Action:</strong> {selectedLog.Action || 'N/A'}</p>
                            <p><strong>Entity:</strong> {selectedLog.Entity || 'N/A'}</p>
                            <p><strong>Details:</strong> {selectedLog.Details || 'N/A'}</p>
                            <p><strong>Status:</strong> <span className={getStatusColor(selectedLog.Status)}>{selectedLog.Status || 'N/A'}</span></p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ActivityLogs;
