import { useState, useEffect } from 'react';
import {
    Container,
    Card,
    Form,
    Row,
    Col,
    Button
} from 'react-bootstrap';
import { BackHeader } from '../components/Header';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { useDashboard } from '../services/DashboardContext';
import { useNavigate } from 'react-router-dom';

function DebtPage() {
    const { actualBranchId } = useDashboard();
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [transactionType, setTransactionType] = useState('loan');
    const [role, setRole] = useState('seller');
    const [people, setPeople] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPeople = async () => {
            try {
                if (role === 'seller') {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/sellers`);
                    const sellers = response.data;
                    // // console.log('Fetched sellers:', sellers);
                    setPeople(sellers);
                    return;
                } else if (role === 'employee') {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/employees-and-users`);
                    const employees = response.data;
                    // // console.log('Fetched employees:', employees);
                    setPeople(employees);
                    return;
                }
            } catch (error) {
                console.error('Error fetching sellers:', error);
            }
        };
        fetchPeople();
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log('Submitting transaction:', {
        //     amount,
        //     notes,
        //     paymentMethod,
        //     transactionType,
        //     role,
        //     selectedPerson
        // });
        try {
            if (transactionType === 'repayment') {
                await axios.post(
                    `${process.env.REACT_APP_BASE_URL}/api/repayments`,
                    {
                        branchId: actualBranchId,
                        userId: user?.userID,
                        name: selectedPerson,
                        partyType: role,
                        totalAmount: Number(amount),
                        notes: notes,
                        paymentMethod: paymentMethod
                    }
                );
                // console.log('Repayment Recorded:', response.data);
            } else {
                await axios.post(
                    `${process.env.REACT_APP_BASE_URL}/api/loans`,
                    {
                        branchId: actualBranchId,
                        userId: user?.userID,
                        name: selectedPerson,
                        partyType: role,
                        totalAmount: Number(amount),
                        notes: notes,
                        paymentMethod: paymentMethod
                    }
                );
                // console.log('Loan Recorded:', response.data);
            }
            alert('Transaction successful!');

            setAmount('');
            setNotes('');
            setPaymentMethod('cash');
            setTransactionType('loan');
            setRole('seller');
            setSelectedPerson('');
            navigate(-1);

        } catch (error) {
            console.error('Error recording expense:', error);
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value === '' || (Number(value) >= 0 && !isNaN(value))) {
            setAmount(value);
        }
    };

    return (
        <Container fluid className="p-0 d-flex flex-column min-vh-100" style={{ background: '#fff', fontFamily: 'inherit' }}>
            <Card className="shadow-sm" style={{ borderRadius: '0 0 1rem 1rem', border: 'none', minHeight: '100vh' }}>
                <div style={{ position: 'sticky', top: 0, zIndex: 1001, background: '#fff' }}>
                    <BackHeader text={`Record a ${transactionType === 'repayment' ? 'Repayment' : 'Loan'}`} />
                    <div style={{ background: '#fff', color: '#222', padding: '1rem', fontFamily: 'inherit', borderBottom: 'none' }}>
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3 align-items-center">
                                <Col xs={4}>
                                    <Form.Label>Record For</Form.Label>
                                </Col>
                                <Col xs={8} className="d-flex align-items-center">
                                    <Form.Check
                                        type="radio"
                                        id="seller"
                                        name="role"
                                        label="Seller"
                                        value="seller"
                                        checked={role === 'seller'}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="me-3"
                                    />
                                    <Form.Check
                                        type="radio"
                                        id="employee"
                                        name="role"
                                        label="Employee"
                                        value="employee"
                                        checked={role === 'employee'}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-3 align-items-center">
                                <Col xs={4}>
                                    <Form.Label>Select {role === 'seller' ? 'Seller' : 'Employee'}</Form.Label>
                                </Col>
                                <Col xs={8}>
                                    <Form.Control
                                        as="select"
                                        value={selectedPerson}
                                        onChange={(e) => setSelectedPerson(e.target.value)}
                                        required
                                    >
                                        <option value="">Select</option>
                                        {people.map((person) => (
                                            <option key={role === 'seller' ? person.SellerID : person.EmployeeID} value={person.id}>
                                                {role === 'seller' ? person.Name : `${person.FirstName} ${person.LastName}`}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Col>
                            </Row>
                            <Row className="mb-3 align-items-center">
                                <Col xs={4}>
                                    <Form.Label>Transaction Type</Form.Label>
                                </Col>
                                <Col xs={8}>
                                    <Form.Control
                                        as="select"
                                        value={transactionType}
                                        onChange={(e) => setTransactionType(e.target.value)}
                                        required
                                    >
                                        <option value="loan">Loan</option>
                                        <option value="repayment">Repayment</option>
                                    </Form.Control>
                                </Col>
                            </Row>
                            <Row className="mb-3 align-items-center">
                                <Col xs={4}>
                                    <Form.Label>Payment Method</Form.Label>
                                </Col>
                                <Col xs={8}>
                                    <Form.Control
                                        as="select"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        required
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="check">Check</option>
                                        <option value="online transfer">Online Transfer</option>
                                    </Form.Control>
                                </Col>
                            </Row>
                            <Row className="mb-3 align-items-center">
                                <Col xs={4}>
                                    <Form.Label>Amount</Form.Label>
                                </Col>
                                <Col xs={8}>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        onKeyPress={(e) => {
                                            if (!/^[0-9.]$/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onWheel={(e) => e.target.blur()}
                                        required
                                    />
                                </Col>
                            </Row>
                        </Form>
                        <div style={{ position: 'fixed', left: 0, bottom: 0, width: '100%', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, boxShadow: '0 -2px 8px rgba(0,0,0,0.08)', padding: '1rem 0', pointerEvents: 'none' }} className="d-flex justify-content-between align-items-center px-3">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <Button
                                    variant="dark"
                                    style={{ borderRadius: '1rem', fontFamily: 'inherit', fontSize: '1.1rem', padding: '0.75rem 2rem', fontWeight: 600, letterSpacing: 1, margin: '0 1rem', flex: 1, pointerEvents: 'auto' }}
                                    onClick={handleSubmit}
                                >
                                    Record Transaction
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Container>
    );
}

export default DebtPage;