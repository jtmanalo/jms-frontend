import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Modal, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

function EmployeesTable() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const currentUsername = user ? user.username : null;
    const [users, setUsers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filter, setFilter] = useState({ userType: 'all', AccountStatus: 'all', EmployeeStatus: 'all' });
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [newEmployeeStatus, setNewEmployeeStatus] = useState('');
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        firstName: '',
        lastName: '',
        positionTitle: '',
        hireDate: '',
        middleName: '',
        nickname: '',
        contactNumber: '',
        address: '',
        status: 'active', // Default status
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showAddSuccessAlert, setShowAddSuccessAlert] = useState(false);
    const [showEditSuccessAlert, setShowEditSuccessAlert] = useState(false);
    const [showApproveSuccessAlert, setShowApproveSuccessAlert] = useState(false);
    const [showRejectSuccessAlert, setShowRejectSuccessAlert] = useState(false);
    // const [undoAction, setUndoAction] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/employees-and-users`);
                const employees = response.data;
                // console.log('Fetched employees:', employees);
                setUsers(employees);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, []);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
    };

    // Update the filteredUsers logic to exclude users with AccountStatus = 'rejected' when filtering for registered employees
    const filteredUsers = Array.isArray(users) ? users.filter((user) => {
        const matchesAccountStatus =
            filter.AccountStatus === 'all' || user.AccountStatus?.toLowerCase() === filter.AccountStatus.toLowerCase();
        const matchesEmployeeStatus =
            filter.EmployeeStatus === 'all' || user.EmployeeStatus?.toLowerCase() === filter.EmployeeStatus.toLowerCase();
        const matchesUserType =
            filter.userType === 'all' ||
            (filter.userType === 'user' && user.AccountStatus && user.AccountStatus.toLowerCase() !== 'rejected') ||
            (filter.userType === 'employee' && !user.AccountStatus);

        // Use username from useAuth context
        const isNotCurrentUser = user.Username !== currentUsername;

        return matchesAccountStatus && matchesEmployeeStatus && matchesUserType && isNotCurrentUser;
    }) : [];

    // FIX SORTING FOR ACCOUNT STATUS
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortConfig.key === 'AccountStatus') {
            const statusOrder = ['approved', 'pending', 'rejected'];
            const aIndex = statusOrder.indexOf(a.AccountStatus?.toLowerCase()) || statusOrder.length;
            const bIndex = statusOrder.indexOf(b.AccountStatus?.toLowerCase()) || statusOrder.length;

            return sortConfig.direction === 'asc' ? aIndex - bIndex : bIndex - aIndex;
        }

        if (sortConfig.key) {
            const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
            const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
        }
        return 0;
    }).map((user) => ({
        ...user,
        EmployeeStatus: user.AccountStatus === 'rejected' ? 'Not Employed' : user.EmployeeStatus
    }));
    // console.log('Sorted users:', sortedUsers);

    const handleActionClick = (action, user) => {
        setModalAction(action);
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleInfoClick = (user) => {
        setSelectedUser(user);
        setModalAction('info');
        setShowModal(true);
    };

    const handleUpdateClick = (user) => {
        setSelectedUser(user);
        setNewEmployeeStatus(user.EmployeeStatus || ''); // Pre-fill with current status
        setShowUpdateModal(true);
    };

    const handleUpdateEmployeeStatus = async () => {
        try {
            setIsSubmitting(true);
            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/employees/${selectedUser.EmployeeID}`, {
                status: newEmployeeStatus,
            });
            // console.log('Update response:', response.data);

            // Refresh the employee list
            const updatedUsers = users.map((user) =>
                user.UserID === selectedUser.UserID
                    ? { ...user, EmployeeStatus: newEmployeeStatus }
                    : user
            );
            setUsers(updatedUsers);

            setShowUpdateModal(false);
            setSelectedUser(null);
            setShowEditSuccessAlert(true);
            setTimeout(() => setShowEditSuccessAlert(false), 3000);
        } catch (error) {
            console.error('Error updating employee status:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmAction = async () => {
        try {
            setIsSubmitting(true);
            if (modalAction === 'approve' || modalAction === 'reject') {
                const updatedStatus = modalAction === 'approve' ? 'approved' : 'rejected';

                // console.log('Token:', token);

                if (!token) {
                    console.error('Error: Missing authentication token. Redirecting to login.');
                    navigate('/login');
                    return;
                }

                // console.log('Using token:', token);
                // console.log('Updating user:', selectedUser.Username, 'with userID', selectedUser.UserID, 'to status:', updatedStatus);

                await axios.put(
                    `${process.env.REACT_APP_BASE_URL}/api/users/${selectedUser.UserID}/approve-reject`,
                    { status: updatedStatus },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Refresh the employee list
                const updatedUsers = users.map((user) =>
                    user.UserID === selectedUser.UserID
                        ? { ...user, AccountStatus: updatedStatus }
                        : user
                );
                setUsers(updatedUsers);

                // setUndoAction(() => async () => {
                //     const revertStatus = updatedStatus === 'approved' ? 'pending' : 'pending';
                //     await axios.put(
                //         `${process.env.REACT_APP_BASE_URL}/api/users/${selectedUser.UserID}/approve-reject`,
                //         { status: revertStatus },
                //         { headers: { Authorization: `Bearer ${token}` } }
                //     );
                //     const revertedUsers = users.map((user) =>
                //         user.UserID === selectedUser.UserID
                //             ? { ...user, AccountStatus: revertStatus }
                //             : user
                //     );
                //     setUsers(revertedUsers);
                //     setUndoAction(null);
                // });

                if (modalAction === 'approve') {
                    setShowApproveSuccessAlert(true);
                    setTimeout(() => setShowApproveSuccessAlert(false), 10000); // Auto-hide after 10 seconds
                } else {
                    setShowRejectSuccessAlert(true);
                    setTimeout(() => setShowRejectSuccessAlert(false), 10000); // Auto-hide after 10 seconds
                }
            }

            setShowModal(false);
            setModalAction(null);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error approving/rejecting user:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelAction = () => {
        setShowModal(false);
        setModalAction(null);
        setSelectedUser(null);
    };

    const handleNewEmployeeChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddEmployeeSubmit = async (e) => {
        e.preventDefault();

        // Explicit validation for required fields
        const { firstName, lastName, positionTitle, hireDate, contactNumber } = newEmployee;
        if (!firstName || !lastName || !positionTitle || !hireDate) {
            alert('Please fill out all required fields: First Name, Last Name, Position Title, and Hire Date.');
            return;
        }

        const employeeData = {
            ...newEmployee,
            contactNumber: contactNumber?.trim() === '' ? null : contactNumber
        };

        try {
            setIsSubmitting(true);
            await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/employees`,
                employeeData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // console.log('Add employee response:', response.data);

            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 5000);

            // Fetch updated employee list
            const updatedResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/employees-and-users`);
            setUsers(updatedResponse.data);

            setShowAddEmployeeModal(false);
            setNewEmployee({
                firstName: '',
                lastName: '',
                positionTitle: '',
                hireDate: '',
                middleName: '',
                nickname: '',
                contactNumber: '',
                address: '',
                status: 'active',
            });
        } catch (error) {
            console.error('Error adding employee:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {/* Success Alerts */}
            {showAddSuccessAlert && (
                <Alert
                    variant="success"
                    onClose={() => setShowAddSuccessAlert(false)}
                    dismissible
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '300px',
                        zIndex: 1050,
                    }}
                >
                    Employee added successfully!
                </Alert>
            )}
            {showEditSuccessAlert && (
                <Alert
                    variant="success"
                    onClose={() => setShowEditSuccessAlert(false)}
                    dismissible
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '300px',
                        zIndex: 1050,
                    }}
                >
                    Employee status updated successfully!
                </Alert>
            )}
            {showApproveSuccessAlert && (
                <Alert
                    variant="success"
                    dismissible
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '300px',
                        zIndex: 1050,
                    }}
                >
                    User approved successfully!
                    {/* <Button variant="link" onClick={undoAction}>Undo</Button> */}
                </Alert>
            )}
            {showRejectSuccessAlert && (
                <Alert
                    variant="danger"
                    dismissible
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '300px',
                        zIndex: 1050,
                    }}
                >
                    User rejected successfully!
                    {/* <Button variant="link" onClick={undoAction}>Undo</Button> */}
                </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>User and Employees</h1>
                <Button variant="outline-dark" onClick={() => setShowAddEmployeeModal(true)} className="me-2 btn-circle">
                    Add Employee
                </Button>
            </div>

            <Form className="mb-3">
                <Form.Group controlId="filterUserType" className="d-inline-block me-3">
                    <Form.Label>User Type</Form.Label>
                    <Form.Select name="userType" value={filter.userType} onChange={handleFilterChange}>
                        <option value="all">All</option>
                        <option value="user">Registered Employees</option>
                        <option value="employee">Employees</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group controlId="filterAccountStatus" className="d-inline-block me-3">
                    <Form.Label>Account Status</Form.Label>
                    <Form.Select name="AccountStatus" value={filter.AccountStatus} onChange={handleFilterChange}>
                        <option value="all">All</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group controlId="filterEmployeeStatus" className="d-inline-block">
                    <Form.Label>Employee Status</Form.Label>
                    <Form.Select name="EmployeeStatus" value={filter.EmployeeStatus} onChange={handleFilterChange}>
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="terminated">Terminated</option>
                    </Form.Select>
                </Form.Group>
            </Form>

            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th style={{ cursor: 'default' }}>#</th>
                            <th onClick={() => handleSort('Name')} style={{ cursor: 'pointer' }}>Name</th>
                            <th onClick={() => handleSort('Email')} style={{ cursor: 'pointer' }}>Email</th>
                            <th onClick={() => handleSort('AccountStatus')} style={{ cursor: 'pointer' }}>Account Status</th>
                            <th onClick={() => handleSort('EmployeeStatus')} style={{ cursor: 'pointer' }}>Employee Status</th>
                            <th style={{ cursor: 'default' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6">No users found</td>
                            </tr>
                        ) : (
                            sortedUsers.map((user, index) => (
                                <tr key={user.UserID || `employee-${index}`}>
                                    <td>{index + 1}</td>
                                    <td>{
                                        `${user.FirstName || ''} ${user.MiddleName ? user.MiddleName + ' ' : ''}${user.LastName || ''}`.trim() || 'N/A'
                                    }</td>
                                    <td>{user.Email || 'Not Registered'}</td>
                                    <td>{user.AccountStatus?.toString().charAt(0).toUpperCase() + user.AccountStatus?.toString().slice(1) || 'No Account'}</td>
                                    <td>{user.EmployeeStatus?.toString().charAt(0).toUpperCase() + user.EmployeeStatus?.toString().slice(1) || 'N/A'}</td>
                                    <td>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleInfoClick(user)}
                                        >
                                            <FaInfoCircle /> Info
                                        </Button>
                                        {(user.AccountStatus === 'approved' || user.AccountStatus === null) ? (
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleUpdateClick(user)}
                                            >
                                                Update
                                            </Button>
                                        ) : user.AccountStatus === 'rejected' ? (
                                            null
                                        ) : (
                                            <>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    disabled={user.AccountStatus !== 'pending'}
                                                    onClick={() => handleActionClick('approve', user)}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    disabled={user.AccountStatus !== 'pending'}
                                                    onClick={() => handleActionClick('reject', user)}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Info Modal */}
            {modalAction === 'info' && selectedUser && (
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Employee Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table striped bordered hover>
                            <tbody>
                                {selectedUser && (
                                    <>
                                        <tr>
                                            <td style={{ width: '35%' }}><strong>First Name</strong></td>
                                            <td style={{ width: '65%' }}>{selectedUser.FirstName || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: '35%' }}><strong>Middle Name</strong></td>
                                            <td style={{ width: '65%' }}>{selectedUser.MiddleName || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: '35%' }}><strong>Last Name</strong></td>
                                            <td style={{ width: '65%' }}>{selectedUser.LastName || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: '35%' }}><strong>Position Title</strong></td>
                                            <td style={{ width: '65%' }}>{selectedUser.PositionTitle || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: '35%' }}><strong>Nickname</strong></td>
                                            <td style={{ width: '65%' }}>{selectedUser.Nickname || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: '35%' }}><strong>Contact Number</strong></td>
                                            <td style={{ width: '65%' }}>{selectedUser.ContactNumber || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: '35%' }}><strong>Address</strong></td>
                                            <td style={{ width: '65%' }}>{selectedUser.Address || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: '35%' }}><strong>Hire Date</strong></td>
                                            <td style={{ width: '65%' }}>{selectedUser.HireDate ? new Date(selectedUser.HireDate).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: '35%' }}><strong>Status</strong></td>
                                            <td style={{ width: '65%' }}>{selectedUser.EmployeeStatus || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: '35%' }}><strong>Created At</strong></td>
                                            <td style={{ width: '65%' }}>{selectedUser.CreatedAt ? new Date(selectedUser.CreatedAt).toLocaleString() : 'N/A'}</td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </Table>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Action Modal */}
            {modalAction !== 'info' && (
                <Modal show={showModal} onHide={handleCancelAction}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Action</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to {modalAction} this user?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleCancelAction} disabled={isSubmitting}>No, cancel</Button>
                        <Button variant={modalAction === 'approve' ? 'outline-primary' : 'outline-danger'} onClick={handleConfirmAction} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Submitting...
                                </>
                            ) : (
                                `Yes, ${modalAction}`
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Update Modal */}
            {showUpdateModal && selectedUser && (
                <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Updating status of {`${selectedUser.FirstName || ''} ${selectedUser.MiddleName ? selectedUser.MiddleName + ' ' : ''}${selectedUser.LastName || ''}`.trim()}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="updateEmployeeStatus">
                                <Form.Label>New Employee Status</Form.Label>
                                <Form.Select
                                    value={newEmployeeStatus}
                                    onChange={(e) => setNewEmployeeStatus(e.target.value)}
                                    disabled={isSubmitting}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="terminated">Terminated</option>
                                </Form.Select>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowUpdateModal(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="outline-primary" onClick={handleUpdateEmployeeStatus} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Submitting...
                                </>
                            ) : (
                                'Update'
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Add Employee Modal */}
            {showAddEmployeeModal && (
                <Modal show={showAddEmployeeModal} onHide={() => setShowAddEmployeeModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Employee</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleAddEmployeeSubmit}>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId="formEmployeeFirstName">
                                        <Form.Label>
                                            First Name <span style={{ color: 'red' }}>*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="First name"
                                            name="firstName"
                                            value={newEmployee.firstName}
                                            onChange={handleNewEmployeeChange}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId="formEmployeeMiddleName">
                                        <Form.Label>Middle Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Middle name"
                                            name="middleName"
                                            value={newEmployee.middleName}
                                            onChange={handleNewEmployeeChange}
                                            disabled={isSubmitting}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId="formEmployeeLastName">
                                        <Form.Label>
                                            Last Name <span style={{ color: 'red' }}>*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Last name"
                                            name="lastName"
                                            value={newEmployee.lastName}
                                            onChange={handleNewEmployeeChange}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3" controlId="formEmployeeNickname">
                                <Form.Label>Nickname</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nickname (optional)"
                                    name="nickname"
                                    value={newEmployee.nickname}
                                    onChange={handleNewEmployeeChange}
                                    disabled={isSubmitting}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formEmployeePosition">
                                <Form.Label>
                                    Position Title <span style={{ color: 'red' }}>*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Position title"
                                    name="positionTitle" // Corrected to match the state key
                                    value={newEmployee.positionTitle}
                                    onChange={handleNewEmployeeChange}
                                    disabled={isSubmitting}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formEmployeeHireDate">
                                <Form.Label>
                                    Date Hired <span style={{ color: 'red' }}>*</span>
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="hireDate"
                                    value={newEmployee.hireDate}
                                    onChange={handleNewEmployeeChange}
                                    disabled={isSubmitting}
                                    required
                                />
                            </Form.Group>


                            <Form.Group className="mb-3" controlId="formEmployeeContactNumber">
                                <Form.Label>Contact Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Contact number (optional)"
                                    name="contactNumber"
                                    value={newEmployee.contactNumber}
                                    onChange={handleNewEmployeeChange}
                                    disabled={isSubmitting}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formEmployeeAddress">
                                <Form.Label>Complete Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Complete address (optional)"
                                    name="address"
                                    value={newEmployee.address}
                                    onChange={handleNewEmployeeChange}
                                    disabled={isSubmitting}
                                />
                            </Form.Group>

                            <Button variant="outline-primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit'
                                )}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}


        </div>
    );
}

export default EmployeesTable;
