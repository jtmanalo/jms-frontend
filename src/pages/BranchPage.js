import { useCallback, useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';

function BranchPage() {
    const [branches, setBranches] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '', openingDate: '', status: '' });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [showAddSuccessAlert, setShowAddSuccessAlert] = useState(false);
    const [showEditSuccessAlert, setShowEditSuccessAlert] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    // // console.log('User from context:', user);
    // // console.log('Authenticated User:', user.username);
    // // console.log('User ID:', user?.userID);

    const fetchBranches = useCallback(() => {
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches`)
            .then(response => {
                // // console.log('API Response:', response.data);
                setBranches(response.data);
            })
            .catch(error => {
                console.error('Error fetching branches:', error);
            });
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const handleAddBranch = () => {
        setShowAdd(true);
    };

    const handleCloseAdd = () => {
        setShowAdd(false);
        setFormData({ name: '', location: '', openingDate: '', status: '' });
    };

    const handleEditBranch = (BranchID) => {
        BranchID = Number(BranchID);
        // // console.log('BranchID:', BranchID);
        const branch = branches.find(branch => branch.BranchID === BranchID);
        // // console.log('Found Branch:', branch);
        if (!branch) {
            console.error('Branch not found!');
        }
        // else {
        // // console.log('Selected Branch:', branch);
        // }
        setFormData({
            name: branch?.Name || '',
            location: branch?.Location || '',
            openingDate: branch?.OpeningDate || '',
            status: branch?.Status || '',
            BranchID: branch?.BranchID || ''
        });
        setShowEdit(true);
    };

    const handleCloseEdit = () => {
        setShowEdit(false);
        setFormData({ name: '', location: '', openingDate: '', status: '' });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // // console.log('Submitting Edit Form with data:', formData);
        try {
            await axios.put(`${process.env.REACT_APP_BASE_URL}/api/branches/${formData.BranchID}`, {
                name: formData.name,
                location: formData.location,
                openingDate: formData.openingDate,
                status: formData.status
            });
            setShowEdit(false);
            fetchBranches();
            setShowEditSuccessAlert(true);
            setFormData({ name: '', location: '', openingDate: '', status: '' });
            setTimeout(() => setShowEditSuccessAlert(false), 3000);
        } catch (error) {
            console.error('Error updating branch:', error);
            alert('Failed to update branch. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // console.log('Submitting Add Form with data:', formData);
        // // console.log('User inside handleAddFormSubmit:', user); // Log the user object
        // // console.log('User ID inside handleAddFormSubmit:', user?.userID); // Log userID

        try {
            // // console.log('User ID:', user?.userID);
            // // console.log('User Type:', user?.userType);

            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/branches`, {
                name: formData.name,
                location: formData.location,
                openingDate: formData.openingDate,
                username: user?.username
            });
            // console.log('Branch added successfully');
            setShowAdd(false);
            fetchBranches();
            setShowAddSuccessAlert(true);
            setFormData({ name: '', location: '', openingDate: '', status: '' });
            setTimeout(() => setShowAddSuccessAlert(false), 3000);
        } catch (error) {
            console.error('Error adding branch:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedBranches = [...branches].sort((a, b) => {
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
    });

    return (
        <div>
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
                    Branch added successfully!
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
                    Branch updated successfully!
                </Alert>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Branches</h1>
                <Button variant="outline-dark"
                    className="me-2 btn-circle" onClick={handleAddBranch}>
                    Add Branch
                </Button>
            </div>
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th onClick={() => handleSort('Name')} style={{ cursor: 'pointer' }}>Name</th>
                            <th onClick={() => handleSort('OpeningDate')} style={{ cursor: 'pointer' }}>Opening Date</th>
                            <th onClick={() => handleSort('Status')} style={{ cursor: 'pointer' }}>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedBranches.length === 0 ? (
                            <tr>
                                <td colSpan="5">No branches found</td>
                            </tr>
                        ) : (
                            sortedBranches.map((branch, index) => (
                                <tr key={branch.BranchID}>
                                    <td>{index + 1}</td>
                                    <td>{`${branch.Name} - ${branch.Location}`}</td>
                                    <td>{branch.OpeningDate ? new Date(branch.OpeningDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>{branch.Status}</td>
                                    <td>
                                        <Button
                                            onClick={() => handleEditBranch(branch.BranchID)}
                                            variant="outline-success"
                                            size="sm"
                                            className="me-2"
                                        >
                                            Edit
                                        </Button>

                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            <Modal show={showAdd} onHide={handleCloseAdd}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Branch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddFormSubmit}>
                        <Form.Group className="mb-3" controlId="formBranchName">
                            <Form.Label>
                                Branch Name <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Branch name"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBranchLocation">
                            <Form.Label>
                                Branch Location <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Branch location"
                                name="location"
                                value={formData.location}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBranchOpeningDate">
                            <Form.Label>
                                Opening Date <span style={{ color: 'red' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="date"
                                name="openingDate"
                                value={formData.openingDate}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleCloseAdd} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="outline-primary" type="submit" onClick={handleAddFormSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={showEdit} onHide={handleCloseEdit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Branch</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditFormSubmit}>
                        <Form.Group className="mb-3" controlId="formBranchName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter branch name"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBranchLocation">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter branch location"
                                name="location"
                                value={formData.location}
                                onChange={handleFormChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBranchStatus">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="closed">Closed</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleCloseEdit} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="outline-primary" type="submit" onClick={handleEditFormSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Submitting...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default BranchPage;