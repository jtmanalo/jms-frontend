import { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrash, FaMinus } from 'react-icons/fa';
import { BackHeader } from '../components/Header';
import { DeleteConfirmModal } from '../components/Modal';
import axios from 'axios';
import { useDashboard } from '../services/DashboardContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import moment from 'moment-timezone';

function SalePage() {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [transactionNotes, setTransactionNotes] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBackModal, setShowBackModal] = useState(false);
    const { user } = useAuth();
    const { actualBranchId, shiftId, branchName, branchLocation } = useDashboard();
    const [deleteIdx, setDeleteIdx] = useState(null);
    const [buyer, setBuyer] = useState('');
    const [buyerId, setBuyerId] = useState(null);
    const [type, setType] = useState('');
    const [allBuyers, setAllBuyers] = useState([]);
    const buyerOptions = [];
    const [allItems, setAllItems] = useState([]);
    const [showRowRemove, setShowRowRemove] = useState(false);
    const [items, setItems] = useState([
        { name: '', quantity: '', pricing: '', total: '' },
    ]);
    const [itemSearchFilters, setItemSearchFilters] = useState({});
    const typeOptions = [
        'Regular',
        'Extra'
    ];
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchItems = async (buyerId) => {
        try {
            // console.log('Fetching items for buyerId:', buyerId);
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/items/buyer/${buyerId}`);
            setAllItems(response.data);
            console.log('Fetched items:', response.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error('Items not found for the selected buyer:', error);
                alert('No items found for the selected buyer.');
            } else {
                console.error('Error fetching items:', error);
            }
        }
    };

    const fetchBuyers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/buyers`);
            const fetchedBuyers = response.data;

            const activeBuyers = fetchedBuyers.filter(buyer => buyer.Status === 'active');
            const uniqueBuyers = Array.from(new Set(activeBuyers.map(buyer => buyer.CompanyName)))
                .map(name => activeBuyers.find(buyer => buyer.CompanyName === name));

            setAllBuyers(uniqueBuyers);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.error('Buyers not found:', error);
                alert('No buyers found.');
            } else {
                console.error('Error fetching buyers:', error);
            }
        }
    };

    useEffect(() => {
        if (type === 'Regular') {
            fetchBuyers();
        } else if (type === 'Extra') {
            const fetchExtraItems = async () => {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/items/branch/active-prices/${actualBranchId}`);
                setAllItems(response.data);
            };
            fetchExtraItems();
        }
    }, [type]);

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

    const handleItemChange = (idx, selectedItemDisplay) => {
        const selected = allItems.find(item =>
            `${item.Name}${item.Classification ? ` - ${item.Classification}` : ''}` === selectedItemDisplay
        );
        if (selected) {
            const updatedItems = [...items];
            const itemPrice = Math.max(selected.ItemPrice || 0, 0);
            updatedItems[idx] = {
                ...updatedItems[idx],
                name: selected.Name,
                classification: selected.Classification || '',
                pricing: itemPrice,
                subtotal: (updatedItems[idx].quantity || 0) * itemPrice,
            };
            setItems(updatedItems);
            console.log(`Item selected: ${selected.Name}, Classification: ${selected.Classification}, Price: ${selected.ItemPrice}`);
        }
    };

    const handlePricingChange = (idx, newPricing) => {
        if (isNaN(newPricing)) return;
        const updatedItems = [...items];
        const pricing = Math.max(newPricing || 0, 0);
        updatedItems[idx] = {
            ...updatedItems[idx],
            pricing: pricing,
            subtotal: (updatedItems[idx].quantity || 0) * pricing,
        };
        setItems(updatedItems);
    };

    const handleQuantityChange = (idx, newQuantity) => {
        if (isNaN(newQuantity)) return;
        const updatedItems = [...items];
        const quantity = Math.max(newQuantity || 0, 0);
        updatedItems[idx] = {
            ...updatedItems[idx],
            quantity: quantity,
            subtotal: quantity * (updatedItems[idx].pricing || 0),
        };
        setItems(updatedItems);
    };

    const addItemRow = () => {
        setItems([...items, { name: '', quantity: '', pricing: '', total: '' }]);
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
                const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
                const transactionDate = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

                const receipt = {
                    branchName: branchName,
                    branchLocation: branchLocation,
                    transactionDate: transactionDate,
                    buyerName: buyer,
                    paymentMethod: selectedPaymentMethod,
                    employeeName: user?.username,
                    items: items,
                    total: totalAmount,
                    transactionType: 'Sale',
                    partyType: type,
                };

                setShowPaymentModal(true);
            } finally {
                setIsProcessing(false);
            }
        } else {
            alert('Please fill out all fields correctly.');
        }
    };

    const handleBuyerChange = (e) => {
        const selectedBuyer = allBuyers.find(b => b.CompanyName === e.target.value);
        setBuyer(e.target.value);
        const selectedBuyerId = selectedBuyer ? selectedBuyer.BuyerID : null;
        // console.log('Selected buyer ID:', selectedBuyerId);
        // console.log('Selected buyer:', selectedBuyer);

        if (selectedBuyerId) {
            setBuyerId(selectedBuyerId);
            fetchItems(selectedBuyerId);
        } else {
            setBuyerId(null);
            setAllItems([]);
        }
    };

    const confirmPaymentMethod = async () => {
        if (!selectedPaymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
            const buyerId = allBuyers.find(b => b.CompanyName === buyer)?.BuyerID || null;
            const transactionData = {
                branchId: actualBranchId,
                buyerId: buyerId,
                userId: user?.userID,
                partyType: type,
                paymentMethod: selectedPaymentMethod,
                status: 'completed',
                notes: transactionNotes || '',
                totalAmount,
                items: items.map(item => {
                    const matchedItem = allItems.find(i =>
                        i.Name === item.name && (i.Classification || '') === (item.classification || '')
                    );
                    return {
                        itemId: matchedItem?.ItemID,
                        classification: item.classification,
                        quantity: item.quantity,
                        itemPrice: item.pricing,
                        subtotal: item.subtotal,
                    };
                }),
            };
            // console.log("Seller ID:", transactionData.sellerId);
            // console.log('Transaction Data:', JSON.stringify(transactionData));

            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/sales`, transactionData);

            setShowPaymentModal(false);
            setBuyer('');
            setType('');
            setItems([{ name: '', quantity: '', pricing: '', subtotal: '' }]);
            setSelectedPaymentMethod('cash');
            setTransactionNotes('');
            setIsSubmitting(false);

            const receipt = {
                branchName: branchName,
                branchLocation: branchLocation,
                transactionDate: moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss'),
                buyerName: buyer,
                paymentMethod: selectedPaymentMethod,
                employeeName: user?.username,
                items: items,
                total: totalAmount,
                transactionType: 'Sale',
                partyType: type,
            };

            navigate(`/employee-dashboard/${user?.username}/receipt`, { state: { receiptData: receipt } });
        } catch (error) {
            setIsSubmitting(false);
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

    const handleBackClick = () => {
        setShowBackModal(true);
    };

    const confirmBackNavigation = () => {
        setShowBackModal(false);
        navigate(-1);
    };

    const cancelBackNavigation = () => {
        setShowBackModal(false);
    };

    return (
        <Container fluid className="p-0 d-flex flex-column min-vh-100" style={{ background: '#fff', fontFamily: 'inherit' }}>
            <Card className="shadow-sm" style={{ borderRadius: '0 0 1rem 1rem', border: 'none', minHeight: '100vh' }}>
                <div style={{ position: 'sticky', top: 0, zIndex: 1001, background: '#fff' }}>
                    <BackHeader text="Record a Sale" onBack={handleBackClick} />
                    <div style={{ background: '#fff', color: '#222', padding: '1rem', fontFamily: 'inherit', borderBottom: 'none' }}>
                        <Form.Group className="mb-2">
                            <Row>
                                <Col xs={6}>
                                    <InputGroup>
                                        <InputGroup.Text style={{ background: 'transparent', color: '#222', border: 'none', fontWeight: 600, fontSize: '1rem', letterSpacing: 1, paddingRight: '0.5rem' }}>Buyer:</InputGroup.Text>
                                        <Form.Select value={buyer} onChange={handleBuyerChange} style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1 }}>
                                            <option value="" disabled>Name</option>
                                            {(type === 'Regular' ? allBuyers : buyerOptions).map((option, idx) => (
                                                <option key={idx} value={option.CompanyName || option}>{option.CompanyName || option}</option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </Col>
                                <Col xs={6}>
                                    <InputGroup>
                                        <InputGroup.Text style={{ background: 'transparent', color: '#222', border: 'none', fontWeight: 600, fontSize: '1rem', letterSpacing: 1, paddingRight: '0.5rem' }}>Type:</InputGroup.Text>
                                        <Form.Select value={type} onChange={e => setType(e.target.value)} style={{ background: '#f5f5f5', color: '#222', border: 'none', fontSize: '1rem', fontFamily: 'inherit', letterSpacing: 1 }}>
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
                            <div style={{ flex: 3, textAlign: 'center', flexShrink: 0 }}>Total</div>
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
                                <div style={{ position: 'relative' }}>
                                    <Form.Control
                                        type="text"
                                        value={itemSearchFilters[idx] || (item.name ? `${item.name}${item.classification ? ` - ${item.classification}` : ''}` : '')}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setItemSearchFilters({ ...itemSearchFilters, [idx]: newValue });
                                            // If user clears the field, also clear the item
                                            if (newValue === '' && item.name) {
                                                const updatedItems = [...items];
                                                updatedItems[idx] = {
                                                    ...updatedItems[idx],
                                                    name: '',
                                                    classification: '',
                                                    pricing: 0,
                                                    subtotal: 0,
                                                };
                                                setItems(updatedItems);
                                            }
                                        }}
                                        style={{
                                            background: '#222',
                                            color: item.name || itemSearchFilters[idx] ? '#fff' : '#999',
                                            border: 'none',
                                            borderBottom: '1px solid #343a40',
                                            fontFamily: 'inherit',
                                            fontSize: '1rem',
                                            letterSpacing: 1,
                                            textAlign: 'center'
                                        }}
                                    />
                                    {itemSearchFilters[idx] && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            background: '#222',
                                            color: '#fff',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            zIndex: 100,
                                            border: '1px solid #343a40',
                                            borderTop: 'none',
                                        }}>
                                            {allItems
                                                .filter(option =>
                                                    `${option.Name}${option.Classification ? ` - ${option.Classification}` : ''}`.toLowerCase().includes(itemSearchFilters[idx].toLowerCase())
                                                )
                                                .slice(0, 10)
                                                .map((option) => (
                                                    <div
                                                        key={option.ItemID}
                                                        onClick={() => {
                                                            handleItemChange(idx, `${option.Name}${option.Classification ? ` - ${option.Classification}` : ''}`);
                                                            setItemSearchFilters({ ...itemSearchFilters, [idx]: '' });
                                                        }}
                                                        style={{
                                                            padding: '0.5rem',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #343a40',
                                                            fontSize: '0.9rem',
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#343a40'}
                                                        onMouseLeave={(e) => e.target.style.background = '#222'}
                                                    >
                                                        {`${option.Name}${option.Classification ? ` - ${option.Classification}` : ''}`}
                                                    </div>
                                                ))}
                                            {allItems.filter(option =>
                                                `${option.Name}${option.Classification ? ` - ${option.Classification}` : ''}`.toLowerCase().includes(itemSearchFilters[idx].toLowerCase())
                                            ).length === 0 && (
                                                    <div style={{ padding: '0.5rem', color: '#999' }}>No items found</div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ flex: 2, padding: '0.5rem 0', marginRight: '4px' }}>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={item.pricing}
                                    onChange={(e) => handlePricingChange(idx, parseFloat(e.target.value) || 0)}
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
                                    step="0.01"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
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

            <Modal show={showBackModal} onHide={cancelBackNavigation} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Cancel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to leave this page? Unsaved changes will be lost.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelBackNavigation}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmBackNavigation}>
                        Leave Page
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showPaymentModal} centered onHide={() => setShowPaymentModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Review Receipt</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: '#f5f5f5', maxHeight: '60vh', overflowY: 'auto' }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        {/* Receipt Header */}
                        <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #343a40', paddingBottom: '1rem' }}>
                            <h4 style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>SALE RECEIPT</h4>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{branchName}</p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{branchLocation}</p>
                        </div>

                        {/* Transaction Info */}
                        <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 500 }}>Date:</span>
                                <span>{moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss')}</span>
                            </div>
                            {type !== 'Extra' && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 500 }}>Buyer:</span>
                                    <span>{buyer}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 500 }}>Type:</span>
                                <span>{type}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 500 }}>Payment Method:</span>
                                <span style={{ textTransform: 'capitalize' }}>{selectedPaymentMethod}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 500 }}>Employee:</span>
                                <span style={{ textTransform: 'capitalize' }}>{user?.username}</span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div style={{ marginBottom: '1.5rem', borderTop: '2px solid #343a40', borderBottom: '2px solid #343a40', paddingTop: '1rem', paddingBottom: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                <div>Item</div>
                                <div style={{ textAlign: 'center' }}>Unit Price</div>
                                <div style={{ textAlign: 'center' }}>Qty</div>
                                <div style={{ textAlign: 'right' }}>Subtotal</div>
                            </div>
                            {items.map((item, idx) => (
                                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                    <div>{item.name}{item.classification ? ` - ${item.classification}` : ''}</div>
                                    <div style={{ textAlign: 'center' }}>₱{(item.pricing || 0).toFixed(2)}</div>
                                    <div style={{ textAlign: 'center' }}>{item.quantity}</div>
                                    <div style={{ textAlign: 'right' }}>₱{(item.subtotal || 0).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold', borderTop: '2px solid #343a40', paddingTop: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '50%' }}>
                                <div>TOTAL:</div>
                                <div style={{ textAlign: 'right' }}>₱{(items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0)).toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Notes */}
                        {transactionNotes && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Notes:</p>
                                <p style={{ margin: 0 }}>{transactionNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Method & Notes */}
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem' }}>
                        <Form.Group className="mb-3">
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Select value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)} disabled={isSubmitting}>
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
                                disabled={isSubmitting}
                            />
                        </Form.Group>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ padding: '1rem' }}>
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={confirmPaymentMethod} disabled={!selectedPaymentMethod || isSubmitting}>
                        {isSubmitting ? <Spinner animation="border" size="sm" className="me-2" /> : ''}
                        {isSubmitting ? 'Processing...' : 'Finalize'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default SalePage;
