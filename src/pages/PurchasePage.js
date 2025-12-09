import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Button, Form, Row, Col, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrash, FaMinus, FaChevronLeft } from 'react-icons/fa';
import { DeleteConfirmModal } from '../components/Modal';
import { useDashboard } from '../services/DashboardContext';
import { useAuth } from '../services/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment-timezone';

function PurchasePage() {
    const location = useLocation();
    // const { state } = location || {};
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showBackModal, setShowBackModal] = useState(false);
    const [itemSearchFilters, setItemSearchFilters] = useState({});

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
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/items/branch/active-prices/${actualBranchId}`);
            setAllItems(response.data);
            console.log('Fetched items:', response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        if (type === 'Regular') {
            fetchSellers();
        }
        fetchItems();
    }, [type]);

    useEffect(() => {
        if (actualBranchId && shiftId) {
            fetchItems();
        }
    }, [actualBranchId, shiftId]);

    // useEffect(() => {
    //     if (state) {
    //         console.log('PurchasePage received state:', state);
    //         const transactionId = state?.transactionId;
    //         const sellerName = state?.sellerName;
    //         const partyType = state?.partyType;
    //         setType(partyType || '');
    //         setSeller(sellerName || '');
    //         console.log('Setting seller to:', sellerName, 'and type to:', partyType);

    //         if (transactionId) {
    //             console.log('Loading transaction items for ID:', transactionId);
    //             const fetchTransactionItems = async () => {
    //                 try {
    //                     const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/transaction-items/${transactionId}`);
    //                     const transactionData = response.data;
    //                     console.log('Transaction Items:', transactionData);

    //                     if (Array.isArray(transactionData) && transactionData.length > 0) {
    //                         setItems(transactionData.map(item => ({
    //                             name: item.ItemName || '',
    //                             quantity: item.Quantity || '',
    //                             pricing: item.ItemPrice || '',
    //                             subtotal: item.Subtotal || '',
    //                         })));
    //                     } else {
    //                         console.warn('No items found for transactionId:', transactionId);
    //                     }

    //                     // Pass state to handleMinimize
    //                     handleMinimize({
    //                         status: state?.status,
    //                         sellerName: sellerName,
    //                         partyType: partyType,
    //                         items: transactionData.map(item => ({
    //                             name: item.ItemName,
    //                             quantity: item.Quantity,
    //                             pricing: item.ItemPrice,
    //                             subtotal: item.Subtotal,
    //                         })),
    //                     });
    //                 } catch (error) {
    //                     console.error('Error fetching transaction items:', error);
    //                 }
    //             };

    //             fetchTransactionItems();
    //         }
    //     } else {
    //         console.warn('No state received in PurchasePage');
    //     }
    // }, [state]);

    // useEffect(() => {
    //     console.log('USE Setting seller to:', seller, 'and type to:', type);
    // }, [seller, type]);

    const addItemRow = () => {
        setItems([...items, { name: '', quantity: '', pricing: '', subtotal: '' }]);
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
                    sellerName: seller,
                    paymentMethod: selectedPaymentMethod,
                    employeeName: user?.username,
                    items: items,
                    total: totalAmount,
                    transactionType: 'Purchase',
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
            const sellerId = allSellers.find(s => s.Name === seller)?.SellerID || null;
            const transactionData = {
                branchId: actualBranchId,
                sellerId: sellerId,
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

            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/purchases`, transactionData);

            const transactionDate = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

            const receipt = {
                branchName: branchName,
                branchLocation: branchLocation,
                transactionDate: transactionDate,
                sellerName: seller,
                paymentMethod: selectedPaymentMethod,
                employeeName: user?.username,
                items: items,
                total: totalAmount,
                transactionType: 'Purchase',
                partyType: type,
            };

            setShowPaymentModal(false);
            setSeller('');
            setType('');
            setItems([{ name: '', quantity: '', pricing: '', subtotal: '' }]);
            setSelectedPaymentMethod('cash');
            setTransactionNotes('');
            setIsSubmitting(false);

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

    // const handleMinimize = async () => {
    //     try {
    //         const totalAmount = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    //         const sellerId = allSellers.find(s => s.Name === seller)?.SellerID || null;

    //         const transactionData = {
    //             branchId: actualBranchId,
    //             sellerId: sellerId,
    //             userId: user?.userID,
    //             partyType: type,
    //             paymentMethod: selectedPaymentMethod,
    //             status: 'pending',
    //             notes: transactionNotes || '',
    //             totalAmount,
    //             items: items.map(item => ({
    //                 itemId: allItems.find(i => i.Name === item.name).ItemID,
    //                 quantity: item.quantity,
    //                 itemPrice: item.pricing,
    //                 subtotal: item.subtotal,
    //             })),
    //         };

    //         console.log('Transaction Data (Pending):', transactionData);

    //         const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/purchases`, transactionData);

    //         const transactionDate = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

    //         const pendingTransaction = {
    //             branchName: branchName,
    //             branchLocation: branchLocation,
    //             transactionDate: transactionDate,
    //             sellerName: seller,
    //             paymentMethod: selectedPaymentMethod,
    //             employeeName: user?.username,
    //             items: items,
    //             total: totalAmount,
    //             transactionType: 'Purchase',
    //             partyType: type,
    //         };

    //         console.log('Pending Transaction Data:', pendingTransaction);
    //         alert('Transaction saved as pending.');

    //         setSeller('');
    //         setType('');
    //         setItems([{ name: '', quantity: '', pricing: '', subtotal: '' }]);
    //         setSelectedPaymentMethod('cash');
    //         setTransactionNotes('');
    //         navigate(-1);
    //     } catch (error) {
    //         console.error('Error saving transaction as pending:', error);
    //         alert('Failed to save transaction as pending.');
    //     }
    // };

    const cancelBackNavigation = () => {
        setShowBackModal(false);
    };

    const confirmBackNavigation = () => {
        setShowBackModal(false);
        navigate(-1);
    };

    const BackHeader = ({ text, onBack }) => {
        const navigate = useNavigate();

        const handleBackClick = () => {
            if (items.every(item => !item.name && !item.quantity && !item.pricing && !item.subtotal)) {
                navigate(-1);
            } else {
                setShowBackModal(true);
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
                                            {(type === 'Regular' ? allSellers : sellerOptions).map((option, idx) => (
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
                            <h4 style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>PURCHASE RECEIPT</h4>
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
                                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>Seller:</span>
                                    <span>{seller}</span>
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

export default PurchasePage;
