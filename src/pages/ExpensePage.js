import { useState } from 'react';
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
    const { user } = useAuth();
    const navigate = useNavigate();

    // console.log('ExpensePage user and branch:', user, actualBranchId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log('Submitting expense:', {
        //     branchId: actualBranchId,
        //     userId: user?.userID,
        //     totalAmount: Number(amount),
        //     notes,
        //     paymentMethod
        // });
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/expenses`,
                {
                    branchId: actualBranchId,
                    userId: user?.userID,
                    totalAmount: Number(amount),
                    notes: notes,
                    paymentMethod: paymentMethod
                }
            );
            // console.log('Expense Recorded:', response.data);
            alert('Transaction successful!');
            setAmount('');
            setNotes('');
            setPaymentMethod('cash');
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
                    <BackHeader text="Record an Expense" />
                    <div style={{ background: '#fff', color: '#222', padding: '1rem', fontFamily: 'inherit', borderBottom: 'none' }}>
                        <Form onSubmit={handleSubmit}>
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
                                    <Form.Label>How much?</Form.Label>
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
                            <Row className="mb-3 align-items-center">
                                <Col xs={4}>
                                    <Form.Label>What for?</Form.Label>
                                </Col>
                                <Col xs={8}>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Enter notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
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
                                    Record Expense
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