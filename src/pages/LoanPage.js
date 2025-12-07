import { useState, useEffect, useCallback } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { Table, Form, Button, Modal, Alert, Tabs, Tab, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { useMatch } from 'react-router-dom';

// Page tab 1 to add/manage sellers, view their details, and keep track of their loans and payments
// Page tab 2 to keep track of employee loans and payments
function LoanPage() {
    const { token, user } = useAuth();
    const matchMobileRoute = useMatch('/mobileroute/*');
    const matchEmployeeDashboard = useMatch('/employee-dashboard/*');
    const isMobileRoute = matchMobileRoute || matchEmployeeDashboard;
    // const [errors, setErrors] = useState({});
    const [sellers, setSellers] = useState([]);
    const [employees, setEmployees] = useState([]);
    // const [selectedEmployee, setSelectedEmployee] = useState('all');
    // const [selectedSeller, setSelectedSeller] = useState('all');
    const [showSellerModal, setShowSellerModal] = useState(false);
    const [showEditSellerModal, setShowEditSellerModal] = useState(false);
    const [selectedSellerDetails, setSelectedSellerDetails] = useState(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionType, setTransactionType] = useState('loan');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [showAddSellerModal, setShowAddSellerModal] = useState(false);
    const [newSellerName, setNewSellerName] = useState('');
    const [newSellerContact, setNewSellerContact] = useState('');
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [sellerSearch, setSellerSearch] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [actualBranchId, setActualBranchId] = useState(null);

    // useEffect(() => {
    //     const fetchActiveShift = async () => {
    //         if (!user?.userID) return;
    //         try {
    //             const response = await axios.get(
    //                 `${process.env.REACT_APP_BASE_URL}/api/shifts/active/${user.userID}`
    //             );
    //             const { BranchID } = response.data[0];
    //             setActualBranchId(BranchID);
    //         } catch (error) {
    //             console.error('Error fetching active shift:', error);
    //         }
    //     };

    //     fetchActiveShift();
    // }, [user]);

    // console.log('Branch ID in LoanPage:', actualBranchId);

    // fetch sellers from table ( name, contact number, createdat )
    // joined with transaction table details ( loan amount, payment amount, 
    // outstanding balance, last transaction date ) and action buttons ( add loan, add payment, view seller details )
    const fetchSellers = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/seller-loans`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            const formattedSellers = response.data.map(seller => ({
                id: seller.SellerID,
                displayName: seller.Name,
                contactNumber: seller.ContactNumber,
                loanAmount: seller.LoanAmount,
                repaymentAmount: seller.RepaymentAmount,
                outstandingBalance: seller.OutstandingBalance,
                lastTransactionDate: seller.LastTransactionDate,
                createdAt: seller.CreatedAt
            }));
            // console.log('Fetched sellers with loans:', formattedSellers);
            setSellers(formattedSellers);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    }, [token]);

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/employee-loans`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            const formattedEmployees = response.data.map(employee => ({
                id: employee.EmployeeID,
                displayName: employee.Name,
                positionTitle: employee.PositionTitle,
                nickname: employee.Nickname,
                address: employee.Address,
                hireDate: employee.HireDate,
                status: employee.Status,
                contactNumber: employee.ContactNumber,
                loanAmount: employee.LoanAmount,
                repaymentAmount: employee.RepaymentAmount,
                outstandingBalance: employee.OutstandingBalance,
                lastTransactionDate: employee.LastTransactionDate,
                createdAt: employee.CreatedAt
            }));
            // console.log('Fetched employees with loans:', formattedEmployees);
            setEmployees(formattedEmployees);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    }, [token]);


    useEffect(() => {
        fetchSellers();
        fetchEmployees();
    }, [fetchSellers, fetchEmployees]);

    const handleInfoClick = (seller) => {
        setSelectedSellerDetails(seller);
        setShowSellerModal(true);
    };

    const handleCloseModal = () => {
        setShowSellerModal(false);
        setShowEditSellerModal(false);
        setSelectedSellerDetails(null);
    };

    const handleUpdateClick = (seller) => {
        setSelectedSellerDetails(seller);
        setShowEditSellerModal(true);
    };

    const handleDeleteSeller = async (sellerId) => {
        if (!window.confirm('Are you sure you want to delete this seller? This action cannot be undone.')) {
            return;
        }
        try {
            setIsSubmitting(true);
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/delete-seller/${sellerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setSuccessMessage('Seller deleted successfully!');
            setShowSuccessAlert(true);
            fetchSellers();
        } catch (error) {
            console.error('Error deleting seller:', error);
            alert('Failed to delete seller. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSellerSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/sellers/${selectedSellerDetails.id}`, {
                name: selectedSellerDetails.displayName,
                contactNumber: selectedSellerDetails.contactNumber,
            });
            setShowEditSellerModal(false);
            setSelectedSellerDetails(null);
            fetchSellers();
        } catch (error) {
            console.error('Error updating seller:', error);
            alert('Failed to update seller. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // const handleTransactionClick = (person, personType, type) => {
    //     setSelectedPerson({ ...person, isSeller: personType === 'seller' });
    //     setTransactionType(type);
    //     setShowTransactionModal(true);
    // };

    // const handleTransactionSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const endpoint = transactionType === 'repayment' ? '/api/repayments' : '/api/loans';
    //         console.log('Selected person:', selectedPerson);
    //         console.log("isseller:", selectedPerson.isSeller);
    //         console.log('Submitting transaction:', {
    //             endpoint,
    //             name: selectedPerson.displayName,
    //             amount: Number(amount),
    //             notes,
    //             paymentMethod,
    //             partyType: selectedPerson.isSeller ? 'seller' : 'employee'
    //         });
    //         const fetchFunction = selectedPerson.isSeller ? fetchSellers : fetchEmployees;

    //         const response = await axios.post(
    //             `${process.env.REACT_APP_BASE_URL}${endpoint}`,
    //             {
    //                 branchId: actualBranchId,
    //                 userId: user?.userID,
    //                 name: selectedPerson.displayName,
    //                 totalAmount: Number(amount),
    //                 notes: notes,
    //                 paymentMethod: paymentMethod,
    //                 partyType: selectedPerson.isSeller ? 'seller' : 'employee'
    //             }
    //         );
    //         console.log(`${transactionType === 'repayment' ? 'Repayment' : 'Loan'} Recorded:`, response.data);
    //         setSuccessMessage('Transaction successful!');
    //         setShowSuccessAlert(true);
    //         setShowTransactionModal(false);
    //         setAmount('');
    //         setNotes('');
    //         setPaymentMethod('cash');
    //         await fetchFunction(); // Use appropriate fetch function to refresh data
    //     } catch (error) {
    //         console.error('Error recording transaction:', error);
    //         alert('An error occurred while processing the transaction. Please try again.');
    //     }
    // };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const handleAddSeller = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/sellers`,
                {
                    name: newSellerName,
                    contactNumber: newSellerContact || null,
                    userId: user?.userID,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // console.log('Seller added:', response.data);
            setSuccessMessage('Seller added successfully!');
            setShowSuccessAlert(true);
            setShowAddSellerModal(false);
            setNewSellerName('');
            setNewSellerContact('');
            await fetchSellers();
        } catch (error) {
            console.error('Error adding seller:', error);
            alert('Failed to add seller.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRowClick = (person, isSeller) => {
        if (isMobileRoute) {
            setSelectedPerson({ ...person, isSeller });
            if (isSeller) {
                setSelectedSellerDetails(person);
                setShowSellerModal(true);
            } else {
                setSelectedEmployeeDetails(person);
                setShowEmployeeModal(true);
            }
        }
    };

    const handleEmployeeInfoClick = (employee) => {
        setSelectedEmployeeDetails(employee);
        setShowEmployeeModal(true);
    };

    const handleCloseEmployeeModal = () => {
        setShowEmployeeModal(false);
        setSelectedEmployeeDetails(null);
    };

    const filteredSellers = sellers.filter(seller =>
        seller.displayName.toLowerCase().includes(sellerSearch.toLowerCase())
    );

    const filteredEmployees = employees.filter(employee =>
        employee.displayName.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    return (
        <div>
            <div className="container-fluid" style={{ maxWidth: '90vw' }}>
                {showSuccessAlert && (
                    <Alert
                        variant="success"
                        onClose={() => setShowSuccessAlert(false)}
                        dismissible
                        style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            width: '300px',
                            zIndex: 1050,
                        }}
                    >
                        {successMessage}
                    </Alert>
                )}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1>Loans</h1>
                </div>
                <Card className="mb-3">
                    <Card.Header>
                        <Tabs defaultActiveKey="sellers" id="sellers-employees-tabs">
                            <Tab eventKey="sellers" title="Sellers">
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <Form>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search seller..."
                                                value={sellerSearch}
                                                onChange={(e) => setSellerSearch(e.target.value)}
                                                className="mb-3"
                                            />
                                        </Form>
                                        <Button variant="outline-dark" onClick={() => setShowAddSellerModal(true)}>Add Seller</Button>
                                    </div>
                                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Loan Amount</th>
                                                    <th>Repayment Amount</th>
                                                    <th>Outstanding Balance</th>
                                                    <th>Last Transaction Date</th>
                                                    {!isMobileRoute && <th>Actions</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredSellers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={isMobileRoute ? 5 : 6} className="text-center">No sellers found</td>
                                                    </tr>
                                                ) : (
                                                    filteredSellers.map((seller) => (
                                                        <tr key={seller.id} onClick={() => handleRowClick(seller, true)} style={isMobileRoute ? { cursor: 'pointer' } : {}}>
                                                            <td>{seller.displayName}</td>
                                                            <td>{seller.loanAmount}</td>
                                                            <td>{seller.repaymentAmount}</td>
                                                            <td>{seller.outstandingBalance}</td>
                                                            <td>{seller.lastTransactionDate}</td>
                                                            {!isMobileRoute && (
                                                                <td>
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => handleInfoClick(seller)}
                                                                    >
                                                                        <FaInfoCircle /> Info
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => handleUpdateClick(seller)}
                                                                    >
                                                                        Edit Profile
                                                                    </Button>
                                                                    {user?.userType === 'owner' && (
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteSeller(seller.id)}
                                                                            disabled={isSubmitting}
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    )}
                                                                    {/* <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => handleTransactionClick(seller, 'seller', 'loan')}
                                                                    >
                                                                        Add Loan
                                                                    </Button>{' '}
                                                                    <Button
                                                                        variant="outline-success"
                                                                        size="sm"
                                                                        onClick={() => handleTransactionClick(seller, 'seller', 'repayment')}
                                                                    >
                                                                        Add Payment
                                                                    </Button> */}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </Tab>
                            <Tab eventKey="employees" title="Employees">
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <Form>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search employee..."
                                                value={employeeSearch}
                                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                                className="mb-3"
                                            />
                                        </Form>
                                    </div>
                                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Loan Amount</th>
                                                    <th>Repayment Amount</th>
                                                    <th>Outstanding Balance</th>
                                                    <th>Last Transaction Date</th>
                                                    {!isMobileRoute && <th>Actions</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredEmployees.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={isMobileRoute ? 5 : 6} className="text-center">No employees found</td>
                                                    </tr>
                                                ) : (
                                                    filteredEmployees.map((employee) => (
                                                        <tr key={employee.id} onClick={() => handleRowClick(employee, false)} style={isMobileRoute ? { cursor: 'pointer' } : {}}>
                                                            <td>{employee.displayName}</td>
                                                            <td>{employee.loanAmount}</td>
                                                            <td>{employee.repaymentAmount}</td>
                                                            <td>{employee.outstandingBalance}</td>
                                                            <td>{employee.lastTransactionDate}</td>
                                                            {!isMobileRoute && (
                                                                <td>
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        size="sm"
                                                                        className="me-2"
                                                                        onClick={() => handleEmployeeInfoClick(employee)}
                                                                    >
                                                                        <FaInfoCircle /> Info
                                                                    </Button>
                                                                    {/* <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handleTransactionClick(employee, 'employee', 'loan')}
                                                                >
                                                                    Add Loan
                                                                </Button>{' '}
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => handleTransactionClick(employee, 'employee', 'repayment')}
                                                                >
                                                                    Add Payment
                                                                </Button> */}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </Card.Header>
                </Card>
                {/* Modal for displaying seller details */}
                <Modal show={showEditSellerModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Seller Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedSellerDetails && (
                            <Form onSubmit={handleUpdateSellerSubmit}>
                                <Form.Group className="mb-3" controlId="editSellerName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={selectedSellerDetails.displayName}
                                        onChange={(e) => setSelectedSellerDetails({ ...selectedSellerDetails, displayName: e.target.value })}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="editSellerContact">
                                    <Form.Label>Contact Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={selectedSellerDetails.contactNumber}
                                        onChange={(e) => setSelectedSellerDetails({ ...selectedSellerDetails, contactNumber: e.target.value })}
                                        disabled={isSubmitting}
                                    />
                                </Form.Group>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button>
                                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </Button>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Modal.Body>
                </Modal>

                {/* Modal for displaying seller details */}
                <Modal show={showSellerModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Seller Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedSellerDetails && (
                            <Table striped bordered hover>
                                <tbody>
                                    <tr>
                                        <td><strong>Name</strong></td>
                                        <td>{selectedSellerDetails.displayName}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Contact Number</strong></td>
                                        <td>{selectedSellerDetails.contactNumber || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Created At</strong></td>
                                        <td>{selectedSellerDetails.createdAt}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal for displaying employee details */}
                <Modal show={showEmployeeModal} onHide={handleCloseEmployeeModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Employee Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedEmployeeDetails && (
                            <Table striped bordered hover>
                                <tbody>
                                    <tr>
                                        <td><strong>Name</strong></td>
                                        <td>{selectedEmployeeDetails.displayName}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Position Title</strong></td>
                                        <td>{selectedEmployeeDetails.positionTitle}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Nickname</strong></td>
                                        <td>{selectedEmployeeDetails.nickname || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Contact Number</strong></td>
                                        <td>{selectedEmployeeDetails.contactNumber || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Address</strong></td>
                                        <td>{selectedEmployeeDetails.address || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Hire Date</strong></td>
                                        <td>{selectedEmployeeDetails.hireDate}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Status</strong></td>
                                        <td>{selectedEmployeeDetails.status}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Created At</strong></td>
                                        <td>{selectedEmployeeDetails.createdAt}</td>
                                    </tr>
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

                {/* Modal for adding loan or repayment */}
                {/* <Modal show={showTransactionModal} onHide={() => setShowTransactionModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{transactionType === 'repayment' ? 'Add Repayment' : 'Add Loan'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedPerson && (
                            <div>
                                <p><strong>Name:</strong> {selectedPerson.displayName}</p>
                            </div>
                        )}
                        <Form onSubmit={handleTransactionSubmit} id="transactionForm">
                            <Form.Group className="mb-3" controlId="paymentMethod">
                                <Form.Label>Payment Method</Form.Label>
                                <Form.Select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="credit">Credit</option>
                                    <option value="bank">Bank Transfer</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="amount">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    required
                                    min="0"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="notes">
                                <Form.Label>Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowTransactionModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" form="transactionForm">
                            Submit
                        </Button>
                    </Modal.Footer>
                </Modal> */}

                {/* Modal for adding a new seller */}
                <Modal show={showAddSellerModal} onHide={() => setShowAddSellerModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Seller</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleAddSeller}>
                            <Form.Group className="mb-3" controlId="newSellerName">
                                <Form.Label>Name <span style={{ color: 'red' }}>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newSellerName}
                                    onChange={(e) => setNewSellerName(e.target.value)}
                                    placeholder="Enter seller name"
                                    disabled={isSubmitting}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="newSellerContact">
                                <Form.Label>Contact Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newSellerContact}
                                    onChange={(e) => setNewSellerContact(e.target.value)}
                                    placeholder="Enter contact number (optional)"
                                    disabled={isSubmitting}
                                />
                            </Form.Group>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowAddSellerModal(false)} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Seller'
                                    )}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div >
        </div>
    )
}

export default LoanPage;