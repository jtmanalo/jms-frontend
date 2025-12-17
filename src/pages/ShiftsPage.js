import { useState, useEffect, useCallback } from 'react';
import { Table, Form, Button, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import moment from 'moment-timezone';

function ShiftsPage() {
    const { token } = useAuth();
    const [selectedSeller, setSelectedSeller] = useState('all');
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [shiftEmployees, setShiftEmployees] = useState([]);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [isLoadingShifts, setIsLoadingShifts] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [isLoadingShiftEmployees, setIsLoadingShiftEmployees] = useState(false);
    const [shiftLogs, setShiftLogs] = useState([]);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [currentShiftForLogs, setCurrentShiftForLogs] = useState(null);
    const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
    const [newShiftData, setNewShiftData] = useState({
        branchId: '',
        userId: '',
        startDatetime: moment().tz('Asia/Manila').subtract(1, 'day').format('YYYY-MM-DDTHH:mm'),
        initialCash: '',
        notes: ''
    });
    const [isCreatingShift, setIsCreatingShift] = useState(false);

    const fetchShiftLogs = async (shiftId) => {
        setIsLoadingLogs(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/daily-logs/${shiftId}`
            );
            setShiftLogs(response.data);
            // console.log('Shift logs:', response.data);
        } catch (error) {
            console.error('Error fetching shift logs:', error.response?.data || error.message);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const fetchShiftEmployees = async (shiftId) => {
        setIsLoadingShiftEmployees(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/shift-employees/${shiftId}`
            );
            setShiftEmployees(response.data);
            // console.log('Shift employees:', response.data);
        } catch (error) {
            console.error('Error fetching shift employees:', error.response?.data || error.message);
        } finally {
            setIsLoadingShiftEmployees(false);
        }
    };

    const handleRowClick = (log) => {
        setSelectedLog(log);
    };

    const handleCloseModal = () => {
        setSelectedLog(null);
    };

    const handleViewLogs = async (shiftId) => {
        await fetchShiftLogs(shiftId);
        // Find the shift object to pass to the modal
        const shift = filteredShifts.find(s => s.ShiftID === shiftId);
        setCurrentShiftForLogs(shift);
        setShowLogsModal(true);
    };

    const handleCloseLogsModal = () => {
        setShowLogsModal(false);
        setShiftLogs([]);
        setCurrentShiftForLogs(null);
    };

    const handleEndShift = async (shiftId) => {
        try {
            await axios.put(
                `${process.env.REACT_APP_BASE_URL}/api/shifts/${shiftId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            alert('Shift ended successfully!');
            fetchShifts();
        } catch (error) {
            console.error('Error ending shift:', error.response?.data || error.message);
            alert('Failed to end shift. Please try again.');
        }
    };

    const handleOpenCreateShiftModal = () => {
        setNewShiftData({
            branchId: '',
            userId: '',
            startDatetime: moment().tz('Asia/Manila').subtract(1, 'day').format('YYYY-MM-DDTHH:mm'),
            initialCash: '',
            notes: ''
        });
        setShowCreateShiftModal(true);
    };

    const handleCloseCreateShiftModal = () => {
        setShowCreateShiftModal(false);
    };

    const handleCreateShift = async () => {
        if (!newShiftData.branchId || !newShiftData.userId || !newShiftData.initialCash) {
            alert('Please fill in all required fields');
            return;
        }

        if (parseFloat(newShiftData.initialCash) <= 0) {
            alert('Initial cash must be greater than 0');
            return;
        }

        try {
            setIsCreatingShift(true);
            await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/shifts`,
                {
                    branchId: parseInt(newShiftData.branchId),
                    userId: parseInt(newShiftData.userId),
                    startDatetime: newShiftData.startDatetime,
                    initialCash: parseFloat(newShiftData.initialCash),
                    notes: newShiftData.notes || ''
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // console.log('startDatetime:', newShiftData.startDatetime);
            alert('Shift created successfully!');
            fetchShifts();
            handleCloseCreateShiftModal();
        } catch (error) {
            console.error('Error creating shift:', error.response?.data || error.message);
            alert('Failed to create shift. Please try again.');
        } finally {
            setIsCreatingShift(false);
        }
    };

    // fetch employee details from table ( id, FirstName, LastName, Email, Phone, Position, BranchID, isActive )
    const fetchEmployees = useCallback(async () => {
        setIsLoadingEmployees(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/employees-and-users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setIsLoadingEmployees(false);
        }
    }, [token]);

    // fetch branch details from table ( BranchID, Name, Location, ManagerID, CreatedAt )
    const fetchBranches = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            const formattedBranches = response.data.map(branch => ({
                id: branch.BranchID,
                displayName: `${branch.Name} - ${branch.Location}`
            }));
            setBranches([{ id: 'all', displayName: 'All Branches' }, ...formattedBranches]);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    }, [token]);

    // fetch shift details from table ( branchid, userid, startdatetime, initialcash ) 
    // and ( enddatetime, totalcash ) and action buttons ( end shift, view shift details )
    // should sort by active shifts first ( enddatetime is null ) then by startdatetime descending
    // filter by branchname - location, username, and month/year dropdown
    const fetchShifts = useCallback(async () => {
        setIsLoadingShifts(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/shift-details`);
            console.log('Fetched shifts:', response.data);
            setShifts(response.data);
        } catch (error) {
            console.error('Error fetching shifts:', error);
        } finally {
            setIsLoadingShifts(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);

    const uniqueYears = shifts.length > 0
        ? Array.from(new Set(shifts.map(shift => new Date(shift.StartDatetime).getFullYear()))).sort((a, b) => b - a)
        : [new Date().getFullYear()];

    const handleBranchChange = (e) => {
        setSelectedBranch(e.target.value);
    };

    const handleEmployeeChange = (e) => {
        setSelectedSeller(e.target.value);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const handleViewEmployees = (shiftId) => {
        fetchShiftEmployees(shiftId);
        setShowEmployeeModal(true);
    };

    const handleCloseEmployeeModal = () => {
        setShowEmployeeModal(false);
        setShiftEmployees([]);
    };

    const filteredShifts = Array.isArray(shifts) ? shifts.filter(shift => {
        const branchMatch = selectedBranch === 'all' || shift.BranchID === parseInt(selectedBranch);
        const employeeMatch = selectedSeller === 'all' || shift.Name === selectedSeller;
        const monthMatch = selectedMonth === 'all' || new Date(shift.StartDatetime).getMonth() + 1 === parseInt(selectedMonth);
        const yearMatch = selectedYear === 'all' || new Date(shift.StartDatetime).getFullYear() === parseInt(selectedYear);
        return branchMatch && employeeMatch && monthMatch && yearMatch;
    }) : [];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Shifts</h1>
            </div>
            <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form className="mb-3">
                        <Form.Group controlId="branchSelect" className="d-inline-block me-2">
                            <Form.Label>Branch</Form.Label>
                            <Form.Select value={selectedBranch} onChange={handleBranchChange}>
                                {branches.length === 0 ? (
                                    <option value="all">No Branch Enrolled</option>
                                ) : (
                                    branches.map((branch, index) => (
                                        <option key={branch.id || index} value={branch.id}>{branch.displayName}</option>
                                    ))
                                )}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="employeeSelect" className="d-inline-block me-2">
                            <Form.Label>Employee</Form.Label>
                            <Form.Select value={selectedSeller} onChange={handleEmployeeChange}>
                                <option value="all">All Employees</option>
                                {Array.isArray(employees) && employees.map((employee, index) => (
                                    <option key={employee.id || index} value={employee.FirstName + ' ' + employee.LastName}>
                                        {employee.FirstName} {employee.LastName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="monthSelect" className="d-inline-block me-2">
                            <Form.Label>Month</Form.Label>
                            <Form.Select value={selectedMonth} onChange={handleMonthChange}>
                                <option value="all">All Months</option>
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="yearSelect" className="d-inline-block me-2">
                            <Form.Label>Year</Form.Label>
                            <Form.Select value={selectedYear} onChange={handleYearChange}>
                                <option value="all">All Years</option>
                                {uniqueYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                    </Form>
                </div>
                {isLoadingShifts ? (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading shifts...</span>
                        </Spinner>
                    </div>
                ) : (
                    <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Branch</th>
                                    <th>Employee</th>
                                    <th>Start</th>
                                    <th>Starting Cash</th>
                                    <th>End</th>
                                    <th>Remaining Cash</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShifts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">No shifts found</td>
                                    </tr>
                                ) : (
                                    filteredShifts.map((shift, index) => (
                                        <tr key={shift.ShiftID || `shift-${index}`}>
                                            <td>{shift.Branch}</td>
                                            <td>{shift.Name}</td>
                                            <td>{moment(shift.StartDatetime).format('MMMM DD YYYY, HH:mm')}</td>
                                            <td>{shift.InitialCash}</td>
                                            <td>{shift.EndDatetime ? moment(shift.EndDatetime).format('MMMM DD YYYY, HH:mm') : 'Active'}</td>
                                            <td>{shift.FinalCash !== null ? shift.FinalCash : 'N/A'}</td>
                                            <td>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleViewLogs(shift.ShiftID)}
                                                >
                                                    View Logs
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleViewEmployees(shift.ShiftID)}
                                                >
                                                    View Employees
                                                </Button>
                                                {!shift.EndDatetime && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to end this shift?')) {
                                                                handleEndShift(shift.ShiftID);
                                                            }
                                                        }}
                                                    >
                                                        End Shift
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Logs Modal */}
            <Modal show={showLogsModal} onHide={handleCloseLogsModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Transaction Logs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentShiftForLogs && (
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Initial Cash</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₱{parseFloat(currentShiftForLogs.InitialCash || 0).toFixed(2)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Added Capital</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₱{parseFloat(currentShiftForLogs.AddedCapital || 0).toFixed(2)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Running Total</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₱{parseFloat(currentShiftForLogs.RunningTotal || 0).toFixed(2)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Calculated Final Cash</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        ₱{(parseFloat(currentShiftForLogs.InitialCash || 0) + parseFloat(currentShiftForLogs.AddedCapital || 0) - parseFloat(currentShiftForLogs.RunningTotal || 0)).toFixed(2)}
                                    </div>
                                </div>
                                {currentShiftForLogs.FinalCash !== null && (
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Actual Final Cash</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₱{parseFloat(currentShiftForLogs.FinalCash).toFixed(2)}</div>
                                    </div>
                                )}
                                {currentShiftForLogs.FinalCash !== null && (
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Variance</div>
                                        <div style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            color: Math.abs((parseFloat(currentShiftForLogs.InitialCash || 0) + parseFloat(currentShiftForLogs.AddedCapital || 0) - parseFloat(currentShiftForLogs.RunningTotal || 0)) - parseFloat(currentShiftForLogs.FinalCash)) < 0.01 ? '#28a745' : '#dc3545'
                                        }}>
                                            ₱{((parseFloat(currentShiftForLogs.InitialCash || 0) + parseFloat(currentShiftForLogs.AddedCapital || 0) - parseFloat(currentShiftForLogs.RunningTotal || 0)) - parseFloat(currentShiftForLogs.FinalCash || 0)).toFixed(2)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {isLoadingLogs ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading logs...</span>
                            </Spinner>
                        </div>
                    ) : shiftLogs.length === 0 ? (
                        <p>No transaction logs found for this shift.</p>
                    ) : (
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
                                {shiftLogs.map((log, index) => (
                                    <tr key={index} onClick={() => handleRowClick(log)} style={{ cursor: 'pointer' }}>
                                        <td>{moment(log.TransactionDate).tz('Asia/Manila').format('HH:mm')}</td>
                                        <td>{log.TransactionType.toUpperCase()}</td>
                                        <td>{log.PaymentMethod.toUpperCase()}</td>
                                        <td>{`₱${log.TotalAmount}`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseLogsModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Employee Modal */}
            <Modal show={showEmployeeModal} onHide={handleCloseEmployeeModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Employee List for Shift</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isLoadingShiftEmployees ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading employees...</span>
                            </Spinner>
                        </div>
                    ) : shiftEmployees.length === 0 ? (
                        <p>No other employees found for this shift.</p>
                    ) : (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Position</th>
                                    <th>Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shiftEmployees.map((employee, index) => (
                                    <tr key={employee.EmployeeID || `employee-${index}`}>
                                        <td>{employee.FirstName} {employee.LastName}</td>
                                        <td>{employee.PositionTitle}</td>
                                        <td>{employee.ContactNumber || 'No record'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEmployeeModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            {selectedLog && (
                <Modal show={!!selectedLog} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Transaction Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Date:</strong> {moment(selectedLog.TransactionDate).tz('Asia/Manila').format('MMMM DD, YYYY')}</p>
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

            {/* Create Shift Modal */}
            <Modal show={showCreateShiftModal} onHide={handleCloseCreateShiftModal} centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Shift</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Branch <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Select
                                value={newShiftData.branchId}
                                onChange={(e) => setNewShiftData({ ...newShiftData, branchId: e.target.value })}
                                disabled={isCreatingShift}
                            >
                                <option value="">Select a branch</option>
                                {branches.filter(b => b.id !== 'all').map((branch) => (
                                    <option key={branch.id} value={branch.id}>{branch.displayName}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Employee <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Select
                                value={newShiftData.userId}
                                onChange={(e) => setNewShiftData({ ...newShiftData, userId: e.target.value })}
                                disabled={isCreatingShift}
                            >
                                <option value="">Select an employee</option>
                                {Array.isArray(employees) && employees.map((employee) => (
                                    <option key={employee.UserID} value={employee.UserID}>
                                        {employee.FirstName} {employee.LastName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Start Date & Time <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={newShiftData.startDatetime}
                                onChange={(e) => setNewShiftData({ ...newShiftData, startDatetime: e.target.value })}
                                disabled={isCreatingShift}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Initial Cash <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="Enter initial cash amount"
                                value={newShiftData.initialCash}
                                onChange={(e) => setNewShiftData({ ...newShiftData, initialCash: e.target.value })}
                                disabled={isCreatingShift}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Notes (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter any notes..."
                                value={newShiftData.notes}
                                onChange={(e) => setNewShiftData({ ...newShiftData, notes: e.target.value })}
                                disabled={isCreatingShift}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseCreateShiftModal} disabled={isCreatingShift}>
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleCreateShift}
                        disabled={isCreatingShift || !newShiftData.branchId || !newShiftData.userId || !newShiftData.initialCash}
                    >
                        {isCreatingShift ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Creating...
                            </>
                        ) : (
                            'Create Shift'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ShiftsPage;