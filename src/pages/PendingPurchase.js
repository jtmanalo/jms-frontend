import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Button, Form, Row, Col, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrash, FaMinus, FaChevronLeft } from 'react-icons/fa';
import { DeleteConfirmModal } from '../components/Modal';
import { useDashboard } from '../services/DashboardContext';
import { useAuth } from '../services/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function PendingPurchase() {
    const location = useLocation();
    const { state } = location || {};
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteIdx, setDeleteIdx] = useState(null);
    const { actualBranchId, shiftId, branchName, branchLocation } = useDashboard();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [allSellers, setAllSellers] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
    const [transactionNotes, setTransactionNotes] = useState('');
    const [showRowRemove, setShowRowRemove] = useState(false);
    const [seller, setSeller] = useState('');
    const [type, setType] = useState('');
    const sellerOptions = [];
    const typeOptions = [
        'Regular',
        'Extra'
    ];
    const [items, setItems] = useState([
        { name: '', quantity: '', pricing: '', subtotal: '' },
    ]);
    const [originalItems, setOriginalItems] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleTrashClick = (idx) => {
        setDeleteIdx(idx);
        setShowDeleteModal(true);
    };

    const confirmRemoveItem = () => {
        if (deleteIdx !== null) {
            setItems(items.filter((_, i) => i !== deleteIdx));
            setDeleteIdx(null);
        }
        setShowDeleteModal(false);
    };

    const cancelRemoveItem = () => {
        setDeleteIdx(null);
        setShowDeleteModal(false);
    };

    const fetchSellers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/sellers`);
            setAllSellers(response.data);
            // console.log('Fetched sellers:', response.data);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/items/branch/${actualBranchId}`);
            setAllItems(response.data);
            // console.log('Fetched items:', response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        if (type === 'regular') {
            fetchSellers();
        }
        fetchItems();
    }, [type]);

    useEffect(() => {
        if (actualBranchId && shiftId) {
            fetchItems();
        }
    }, [actualBranchId, shiftId]);

    useEffect(() => {
        if (state) {
            // console.log('PurchasePage received state:', state);
            const transactionId = state?.transactionId;
            const sellerName = state?.sellerName;
            const partyType = state?.partyType;

            if (partyType && typeOptions.includes(partyType)) {
                setType(partyType);
            }

            if (sellerName && allSellers.length > 0) {
                const matchingSeller = allSellers.find(s => s.Name === sellerName);
                if (matchingSeller) {
                    setSeller(matchingSeller.Name);
                }
            }

            if (transactionId) {
                const fetchTransactionItems = async () => {
                    try {
                        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/transaction-items/${transactionId}`);
                        const transactionData = response.data;
                        // console.log('Transaction Items:', transactionData);

                        if (Array.isArray(transactionData) && transactionData.length > 0) {
                            setItems(transactionData.map(item => ({
                                transactionItemId: item.TransactionItemID || '',
                                name: item.ItemName || '',
                                quantity: item.Quantity || '',
                                pricing: item.ItemPrice || '',
                                subtotal: item.Subtotal || '',
                            })));
                            setOriginalItems(transactionData.map(item => ({
                                transactionItemId: item.TransactionItemID || '',
                                name: item.ItemName || '',
                                quantity: item.Quantity || '',
                                pricing: item.ItemPrice || '',
                                subtotal: item.Subtotal || '',
                            })));
                        } else {
                            console.warn('No items found for transactionId:', transactionId);
                        }
                    } catch (error) {
                        console.error('Error fetching transaction items:', error);
                    }
                };

                fetchTransactionItems();
            }
        } else {
            console.warn('No state received in PurchasePage');
        }
    }, [state, allSellers]);

    useEffect(() => {
        if (state?.sellerName && allSellers.length > 0) {
            const matchingSeller = allSellers.find(s => s.Name === state.sellerName);
            // console.log('Matching seller for name', state.sellerName, ':', matchingSeller);
            if (matchingSeller) {
                setSeller(matchingSeller.Name);
            }
        }
    }, [state?.sellerName, allSellers]);


    useEffect(() => {
        if (state?.partyType && typeOptions.includes(state.partyType)) {
            setType(state.partyType);
        }
    }, [state?.partyType]);

    useEffect(() => {
        if (state) {
            const partyType = state?.partyType?.toLowerCase();
            const sellerName = state?.sellerName;

            if (partyType === 'regular') {
                setType(state?.partyType || '');
                setSeller(sellerName || '');
            } else {
                setType('Extra' || '');
                setSeller('');
            }
        } else {
            console.warn('No state received in PurchasePage');
        }
    }, [state]);

    const addItemRow = () => {
        setItems([...items, { name: '', quantity: '', pricing: '', subtotal: '' }]);
    };

    const handleItemChange = (idx, selectedItem) => {
        const selected = allItems.find(item => item.Name === selectedItem);
        if (selected) {
            const updatedItems = [...items];
            updatedItems[idx] = {
                ...updatedItems[idx],
                name: selectedItem,
                classification: selected.Classification || '',
                pricing: Math.max(selected.ItemPrice || 0, 0.01),
                subtotal: (updatedItems[idx].quantity || 0) * Math.max(selected.ItemPrice || 0, 0.01),
            };
            setItems(updatedItems);
            // console.log(`Item selected: ${selectedItem}, Price: ${selected.ItemPrice}`);
        }
    };

    const handleQuantityChange = (idx, newQuantity) => {
        if (isNaN(newQuantity)) return;
        const updatedItems = [...items];
        updatedItems[idx] = {
            ...updatedItems[idx],
            quantity: Math.max(newQuantity || 0, 1),
            subtotal: Math.max(newQuantity || 0, 1) * (updatedItems[idx].pricing || 0.01),
        };
        setItems(updatedItems);
    };

    const handlePricingChange = (idx, newPricing) => {
        if (isNaN(newPricing)) return;
        const updatedItems = [...items];
        updatedItems[idx] = {
            ...updatedItems[idx],
            pricing: Math.max(newPricing || 0, 0.01),
            subtotal: (updatedItems[idx].quantity || 0) * Math.max(newPricing || 0, 0.01),
        };
        setItems(updatedItems);
    };

    const handleFinalize = async () => {
        let isValid = true;
        const updatedItems = items.map((item) => {
            const updatedItem = { ...item };

            if (!item.name || item.quantity <= 0 || item.pricing <= 0) {
                isValid = false;
                updatedItem.isInvalid = true;
            } else {
                updatedItem.isInvalid = false;
            }

            return updatedItem;
        });

        setItems(updatedItems);

        if (isValid) {
            setIsProcessing(true);
            try {
                setShowPaymentModal(true);
            } finally {
                setIsProcessing(false);
            }
        } else {
            alert('Please fill out all fields correctly.');
        }
    };

    const confirmPaymentMethod = async (state) => {
        // console.log('Confirming payment method with state:', state);
        if (!selectedPaymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        try {
            const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
            const sellerId = allSellers.find(s => s.Name === seller)?.SellerID || null;
            const transactionData = {
                sellerId: sellerId,
                userType: user?.userType,
                partyType: type,
                paymentMethod: selectedPaymentMethod,
                status: 'completed',
                notes: transactionNotes || '',
                totalAmount,
                items: items.map(item => ({
                    itemId: allItems.find(i => i.Name === item.name).ItemID,
                    transactionItemId: item.transactionItemId,
                    classification: item.classification,
                    quantity: item.quantity,
                    price: item.pricing,
                    subtotal: item.subtotal,
                })),
            };
            // console.log("Seller ID:", transactionData.sellerId);
            // console.log('Transaction Data:', JSON.stringify(transactionData));

            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/purchases/${state?.transactionId}`, transactionData);

            // Prepare receipt data
            const receipt = {
                branchName: branchName,
                branchLocation: branchLocation,
                sellerName: seller,
                paymentMethod: selectedPaymentMethod,
                employeeName: user?.username,
                items: items,
                total: totalAmount,
                transactionType: 'Purchase',
                partyType: type,
            };

            // console.log('Receipt Data:', receipt);
            setSeller('');
            setType('');
            setItems([{ name: '', quantity: '', pricing: '', subtotal: '' }]);
            setSelectedPaymentMethod('cash');
            setTransactionNotes('');

            navigate(`/employee-dashboard/${user?.username}/receipt`, { state: { receiptData: receipt } });
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    console.error('Bad Request:', error.response.data);
                } else if (error.response.status === 500) {
                    console.error('Internal Server Error:', error.response.data);
                } else {
                    console.error('Other Error:', error.response.status, error.response.data);
                }
            } else if (error.request) {
                console.error('No Response:', error.request);
            } else {
                console.error('Error:', error.message);
            }
            alert('Failed to finalize transaction.');
        }
    };

    const handleMinimize = async (state) => {
        try {
            if (!state?.transactionId) {
                console.error('Transaction ID is missing.');
                alert('Transaction ID is required to save as pending.');
                return;
            }

            const totalAmount = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
            const sellerId = allSellers.find(s => s.Name === seller)?.SellerID || null;
            // console.log('Seller ID for pending transaction:', sellerId);
            // console.log('Transaction ID for pending transaction:', state?.transactionId);

            const transactionData = {
                sellerId: sellerId,
                userType: user?.userType,
                partyType: type,
                paymentMethod: selectedPaymentMethod,
                status: 'pending',
                notes: transactionNotes || '',
                totalAmount: totalAmount,
                items: items.map(item => ({
                    itemId: allItems.find(i => i.Name === item.name)?.ItemID,
                    quantity: item.quantity,
                    price: item.pricing,
                    subtotal: item.subtotal,
                    transactionItemId: item.TransactionItemID
                })),
                // items: items.map(item => {
                //     const transactionItemId = item.transactionItemId;
                //     console.log(`Item: ${item.name}, TransactionItemId: ${transactionItemId}`); // Debug log
                //     return {
                //         transactionItemId: item.TransactionItemID, // Include transactionItemId for updates
                //         itemId: allItems.find(i => i.Name === item.name)?.ItemID,
                //         quantity: item.quantity,
                //         price: item.pricing,
                //         subtotal: item.subtotal,
                //     };
                // }),
            };

            // console.log('Transaction Data (Pending):', transactionData);

            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/purchases/${state?.transactionId}`, transactionData);
            // console.log('Pending transaction saved:', response.data);

            alert('Transaction saved as pending.');
            setSeller('');
            setType('');
            setItems([{ name: '', quantity: '', pricing: '', subtotal: '' }]);
            setSelectedPaymentMethod('cash');
            setTransactionNotes('');
            navigate(-1);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error('Resource not found:', error.response.data);
                alert('The requested resource could not be found.');
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    const hasChanges = () => {
        if (items.length !== originalItems.length) return true;

        for (let i = 0; i < items.length; i++) {
            const currentItem = items[i];
            const originalItem = originalItems[i];

            if (
                currentItem.name !== originalItem.name ||
                currentItem.quantity !== originalItem.quantity ||
                currentItem.pricing !== originalItem.pricing ||
                currentItem.subtotal !== originalItem.subtotal
            ) {
                return true;
            }
        }

        return false;
    };

    const BackHeader = ({ text, onBack }) => {
        const navigate = useNavigate();

        const handleBackClick = () => {
            if (!hasChanges()) {
                navigate(-1);
            } else {
                handleMinimize(state);
            }
        };

        return (
            <Card.Header className="d-flex align-items-center" style={{ background: '#fff', borderBottom: '1px solid #343a40', paddingLeft: '0.5rem' }}>
                <Button
                    variant="link"
                    style={{ color: '#343a40', fontSize: '1.5rem', marginRight: '0.5rem', paddingLeft: 0 }}
                    onClick={onBack ? onBack : handleBackClick}
                >
                    <FaChevronLeft />
                </Button>
                <span style={{ fontFamily: 'inherit', fontSize: '1.25rem', fontWeight: 600, letterSpacing: 1, verticalAlign: 'middle', marginTop: '4px', display: 'inline-block' }}>{text}</span>
            </Card.Header>
        );
    };

    return (
        <Container fluid className="p-0 d-flex flex-column min-vh-100" style={{ background: '#fff', fontFamily: 'inherit' }}>
            <Card className="shadow-sm" style={{ borderRadius: '0 0 1rem 1rem', border: 'none', minHeight: '100vh' }}>
                <div style={{ position: 'sticky', top: 0, zIndex: 1001, background: '#fff' }}>
                    <BackHeader text="Record a Purchase" />
                    <div style={{ background: '#fff', color: '#222', padding: '1rem', fontFamily: 'inherit', borderBottom: 'none' }}>
                        <Form.Group className="mb-2">
                            <Row>
                                <Col xs={6}>
                                    <InputGroup>
                                        <InputGroup.Text style={{ background: 'transparent', color: '#222', border: 'none', fontWeight: 600, fontSize: '1rem', letterSpacing: 1, paddingRight: '0.5rem' }}>Seller:</InputGroup.Text>
                                        <Form.Select value={seller || ''} onChange={e => setSeller(e.target.value)} style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1 }}>
                                            <option value="" disabled>Name</option>
                                            {(type === 'regular' ? allSellers : sellerOptions).map((option, idx) => (
                                                <option key={idx} value={option.Name || option}>{option.Name || option}</option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </Col>
                                <Col xs={6}>
                                    <InputGroup>
                                        <InputGroup.Text style={{ background: 'transparent', color: '#222', border: 'none', fontWeight: 600, fontSize: '1rem', letterSpacing: 1, paddingRight: '0.5rem' }}>Type:</InputGroup.Text>
                                        <Form.Select value={type || ''} onChange={e => setType(e.target.value)} style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1 }}>
                                            <option value="" disabled>Type</option>
                                            {typeOptions.map((option, idx) => (
                                                <option key={idx} value={option}>{option}</option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Form.Group>
                        <div style={{ borderTop: '2px solid #343a40', borderBottom: '1px solid #343a40', background: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: '1rem', display: 'flex', padding: '0.75rem 0 0.5rem 0', color: '#343a40', letterSpacing: 1 }}>
                            <div style={{ flex: 3, textAlign: 'center', flexShrink: 0 }}>Item</div>
                            <div style={{ flex: 3, paddingLeft: '40px', textAlign: 'center', flexShrink: 0 }}>Unit Price</div>
                            <div style={{ flex: 3, paddingLeft: '10px', textAlign: 'center', flexShrink: 0 }}>Qty</div>
                            <div style={{ flex: 3, textAlign: 'center', flexShrink: 0 }}>Subtotal</div>
                        </div>
                    </div>
                </div>
                <Card.Body className="p-0" style={{ position: 'relative', height: 'calc(100vh - 220px)', overflow: 'auto', paddingBottom: '60px' }}>
                    {items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', borderBottom: '1px solid #ccc', margin: 0, background: '#fff', width: '100%', paddingLeft: '6px', paddingRight: '6px' }}>
                            {showRowRemove && (
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.5rem 0', marginRight: '4px' }}>
                                    <Button variant="light" style={{ border: '2px solid #dc3545', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }} onClick={() => handleTrashClick(idx)}>
                                        <FaTrash size={16} color="#dc3545" />
                                    </Button>
                                </div>
                            )}
                            <div style={{ flex: 3, padding: '0.5rem 0', marginRight: '4px' }}>
                                <Form.Select
                                    value={item.name}
                                    onChange={(e) => handleItemChange(idx, e.target.value)}
                                    style={{ background: '#222', color: '#fff', border: 'none', borderBottom: '1px solid #343a40', fontFamily: 'inherit', fontSize: '1rem', letterSpacing: 1, textAlign: 'center' }}
                                >
                                    <option value="" disabled>Item</option>
                                    {allItems.map((option) => (
                                        <option key={option.ItemID} value={option.Name}>
                                            {`${option.Name} ${option.Classification ? `- ${option.Classification}` : ''}`}
                                        </option>
                                    ))}
                                </Form.Select>


                            </div>
                            <div style={{ flex: 2, padding: '0.5rem 0', marginRight: '4px' }}>
                                <Form.Control
                                    type="number"
                                    value={item.pricing}
                                    onChange={(e) => handlePricingChange(idx, parseFloat(e.target.value) || 0)}
                                    onKeyPress={(e) => {
                                        if (!/^[0-9.]$/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    style={{
                                        background: '#f5f5f5',
                                        color: '#222',
                                        border: item.isInvalid && (!item.pricing || item.pricing <= 0) ? '2px solid red' : 'none',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        letterSpacing: 1,
                                        textAlign: 'center',
                                    }}
                                    placeholder="-"
                                />
                            </div>
                            <div style={{ flex: 2, padding: '0.5rem 0', marginRight: '4px' }}>
                                <Form.Control
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
                                    onKeyPress={(e) => {
                                        if (!/^[0-9.]$/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    style={{
                                        background: '#f5f5f5',
                                        color: '#222',
                                        border: item.isInvalid && (!item.quantity || item.quantity <= 0) ? '2px solid red' : 'none',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        letterSpacing: 1,
                                        textAlign: 'center',
                                    }}
                                    placeholder="0"
                                />
                            </div>

                            <div style={{ flex: 2, padding: '0.5rem 0' }}>
                                <Form.Control
                                    type="text"
                                    value={item.subtotal}
                                    readOnly
                                    style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1, textAlign: 'center' }}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    ))}
                    <div style={{ height: '140px' }}></div>
                    <div style={{ position: 'fixed', left: 0, bottom: 0, width: '100%', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, boxShadow: '0 -2px 8px rgba(0,0,0,0.08)', padding: '1rem 0', pointerEvents: 'none' }} className="d-flex justify-content-between align-items-center px-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Button variant="light" style={{ border: '2px solid #dc3545', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }} onClick={() => setShowRowRemove(show => !show)}>
                                <FaMinus color="#dc3545" size={24} />
                            </Button>
                            <Button variant="dark" style={{ borderRadius: '1rem', fontFamily: 'inherit', fontSize: '1.1rem', padding: '0.75rem 2rem', fontWeight: 600, letterSpacing: 1, margin: '0 1rem', flex: 1, pointerEvents: 'auto' }} onClick={handleFinalize} disabled={isProcessing}>
                                {isProcessing ? <Spinner animation="border" size="sm" /> : 'Generate Receipt'}
                            </Button>
                            <Button variant="light" style={{ border: '2px solid #343a40', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }} onClick={addItemRow}>
                                <FaPlus size={24} color="#343a40" />
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>
            <DeleteConfirmModal show={showDeleteModal} onCancel={cancelRemoveItem} onConfirm={confirmRemoveItem} />
            <Modal show={showPaymentModal} centered onHide={() => setShowPaymentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Payment Method</Form.Label>
                        <Form.Select value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)}>
                            <option value="" disabled>Select Payment Method</option>
                            <option value="cash">Cash</option>
                            <option value="online transfer">Online Transfer</option>
                            <option value="check">Check</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Transaction Notes</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={transactionNotes}
                            onChange={(e) => setTransactionNotes(e.target.value)}
                            placeholder="Optional notes..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={confirmPaymentMethod}
                        disabled={!selectedPaymentMethod}
                    >
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default PendingPurchase;
