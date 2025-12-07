import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import { useAuth } from '../services/AuthContext';
import { FaDownload, FaTimes } from 'react-icons/fa';
import html2canvas from 'html2canvas';

function ReceiptPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const receiptData = location.state?.receiptData;

    if (!receiptData) {
        return <div>No receipt data available.</div>;
    }
    // console.log('Rendering ReceiptPage with data:', receiptData);

    const saveAsImage = () => {
        const receiptElement = document.getElementById('receipt-content');
        html2canvas(receiptElement, {
            scale: 2,
            useCORS: true,
            width: receiptElement.scrollWidth,
            height: receiptElement.scrollHeight,
        }).then((canvas) => {
            const link = document.createElement('a');
            link.download = `${receiptData.transactionType}_${receiptData.transactionDate}_receipt.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    };

    const sortedItems = [...receiptData.items].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div>
            <div style={{ position: 'relative', padding: '2rem', maxWidth: '90vw', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff', overflowY: 'auto', maxHeight: '80vh' }}>
                <Button
                    variant="link"
                    onClick={saveAsImage}
                    style={{ position: 'absolute', top: '1rem', left: '1rem', fontSize: '1rem', color: '#000', zIndex: 1000 }}
                >
                    <FaDownload />
                </Button>
                <Button
                    variant="link"
                    onClick={() => navigate(`/employee-dashboard/${user?.username}`)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.5rem', color: '#000' }}
                >
                    <FaTimes />
                </Button>
                <div id="receipt-content" style={{ textAlign: 'center' }}>
                    <h3 style={{ paddingTop: '2rem' }}><strong>{receiptData.branchName.toUpperCase()}</strong></h3>
                    <p>{receiptData.branchLocation}</p>
                    <p>{receiptData.transactionDate}</p>
                    <p>{receiptData.transactionType} Receipt - {receiptData.paymentMethod.toUpperCase()}</p>
                    <p><strong>Employee:</strong> {receiptData.employeeName.toUpperCase()}</p>
                    {receiptData.transactionType.toLowerCase() === 'purchase' && receiptData.sellerName && (
                        <p><strong>Seller:</strong> {receiptData.sellerName.toUpperCase()}</p>
                    )}
                    {receiptData.transactionType.toLowerCase() === 'sale' && receiptData.buyerName && (
                        <p><strong>Buyer:</strong> {receiptData.buyerName.toUpperCase()}</p>
                    )}
                    <Table striped bordered hover style={{ margin: '0 auto', maxWidth: '80%' }}>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{item.name}{item.classification ? ` - ${item.classification}` : ''}</td>
                                    <td>{item.pricing}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.subtotal}</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                                <td>{receiptData.total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </div >
        </div >
    );
}

export default ReceiptPage;