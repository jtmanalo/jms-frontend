import { useState, useEffect } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import { useAuth } from '../services/AuthContext';
import axios from 'axios';

function SettingsPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        FirstName: '',
        MiddleName: '',
        LastName: '',
        Email: '',
        Username: '',
        PositionTitle: '',
        ContactNumber: '',
        Address: '',
        DisplayPictureURL: '',
        HireDate: '',
        Status: '',
    });
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                // console.log('Fetching user details for:', user?.username);  
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/user-details?username=${user?.username}`);

                // console.log('API Response:', response.data);  
                const userDetails = response.data;
                // console.log('Mapped User Details:', userDetails);  
                setFormData({
                    Name: userDetails.Name || '',
                    FirstName: userDetails.FirstName || '',
                    MiddleName: userDetails.MiddleName || '',
                    LastName: userDetails.LastName || '',
                    Username: userDetails.Username || '',
                    Email: userDetails.Email || '',
                    PositionTitle: userDetails.PositionTitle || '',
                    ContactNumber: userDetails.ContactNumber || '',
                    Address: userDetails.Address || '',
                    DisplayPictureURL: userDetails.DisplayPictureURL || '',
                    HireDate: userDetails.HireDate || '',
                    Status: userDetails.EmployeeStatus || '',
                });
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        const fetchBranches = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches`, {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });
                // console.log('Branches Response:', response.data);  
                setBranches(response.data);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };

        if (user) {
            fetchUserDetails();
            fetchBranches();
        } else {
            console.warn('User context is undefined');
        }
    }, [user]);

    useEffect(() => {
        // console.log('Updated formData:', formData);
    }, [formData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            // console.log('Updated user details:', formData);  
            // console.log('User ID:', user.userID);  

            const url = `${process.env.REACT_APP_BASE_URL}/api/users-update/${user.userID}`;
            // console.log('PUT Request URL:', url);  

            const response = await axios.put(
                url,
                {
                    ...formData,
                    userType: user.userType,
                    branchId: formData.BranchID
                },
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );

            // console.log('Save response:', response.data);
            alert('User details updated successfully! Please log out and log back in to apply the default branch update.');
        } catch (error) {
            console.error('Error saving user details:', error);
            alert('Failed to update user details. Please try again.');
        }
    };

    if (!user) {
        return <div>Loading user context...</div>;
    }

    return (
        <div>
            <h1>Settings</h1>
            <div style={{ maxWidth: '600px', margin: '0 auto', overflowX: 'auto', maxHeight: '50vh' }}>
                <Table striped bordered hover>
                    <tbody>
                        {user?.userType === 'owner' && (
                            <>
                                <tr>
                                    <th>Name</th>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            name="Name"
                                            value={formData.Name || ''}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Username</th>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            name="Username"
                                            value={formData.Username || ''}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Password</th>
                                    <td>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Email</th>
                                    <td>
                                        <Form.Control
                                            type="email"
                                            name="Email"
                                            value={formData.Email || ''}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Default Branch</th>
                                    <td>
                                        <Form.Control
                                            as="select"
                                            name="BranchID"
                                            value={formData.BranchID || ''}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select a branch</option>
                                            {branches.map((branch) => (
                                                <option key={branch.BranchID} value={branch.BranchID}>
                                                    {branch.Name} - {branch.Location}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </td>
                                </tr>
                            </>
                        )}

                        {user?.userType === 'employee' && (
                            <>
                                <tr>
                                    <th>First Name</th>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            name="FirstName"
                                            value={formData.FirstName || ''}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Middle Name</th>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            name="MiddleName"
                                            value={formData.MiddleName || ''}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Last Name</th>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            name="LastName"
                                            value={formData.LastName || ''}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Username</th>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            name="Username"
                                            value={formData.Username || ''}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Password</th>
                                    <td>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Email</th>
                                    <td>
                                        <Form.Control
                                            type="email"
                                            name="Email"
                                            value={formData.Email || ''}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Contact Number</th>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            name="ContactNumber"
                                            value={formData.ContactNumber || ''}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Complete Address</th>
                                    <td>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="Address"
                                            value={formData.Address || ''}
                                            onChange={handleInputChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>Default Branch</th>
                                    <td>
                                        <Form.Control
                                            as="select"
                                            name="BranchID"
                                            value={formData.BranchID || ''}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select a branch</option>
                                            {branches.map((branch) => (
                                                <option key={branch.BranchID} value={branch.BranchID}>
                                                    {branch.Name} - {branch.Location}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </Table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

export default SettingsPage;