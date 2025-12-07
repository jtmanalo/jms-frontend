import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import { useDashboard } from '../services/DashboardContext';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

function OngoingPage() {
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const { shiftId } = useDashboard();
    const navigate = useNavigate();
    const { user } = useAuth();
    // console.log('OngoingPage shiftId:', shiftId);

    useEffect(() => {
        if (!shiftId) {
            // console.log('Shift ID is null, skipping fetchPendingTransactions');
            return;
        }

        const fetchPendingTransactions = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/pending-transactions/${shiftId}`);
                setPendingTransactions(response.data);
                // console.log('Fetched pending transactions:', response.data);
            } catch (error) {
                console.error('Error fetching pending transactions:', error);
            }
        };

        fetchPendingTransactions();
    }, [shiftId]);

    const formatDateTime = (dateTime) => {
        const dateObj = moment(dateTime).tz('Asia/Manila');
        const date = dateObj.format('MM/DD/YYYY');
        const time = dateObj.format('hh:mm A');
        return { date, time };
    };

    const handleCardClick = async (transaction) => {
        navigate(`/employee-dashboard/${user?.username}/pending-purchases`, {
            state: {
                partyType: transaction.PartyType,
                sellerName: transaction.SellerName || '',
                transactionId: transaction.TransactionID,
                status: 'pending'
            }
        });
    };

    return (
        <div>
            <h3 style={{ textAlign: 'center' }}>Pending Purchases</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                {Array.isArray(pendingTransactions) && pendingTransactions.map(transaction => {
                    const { date, time } = formatDateTime(transaction.TransactionDate);
                    // console.log('Rendering transaction:', transaction);
                    // console.log("Name", transaction.SellerName);
                    return (
                        <Card
                            key={transaction.TransactionID}
                            style={{ padding: '15px', minHeight: '150px', cursor: 'pointer' }}
                            onClick={() => handleCardClick(transaction)}
                        >
                            <div style={{ textAlign: 'left', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '15px' }}>{transaction.PartyType.toUpperCase()}</div>
                                {transaction.PartyType.toUpperCase() === 'REGULAR' && <div style={{ position: 'absolute', top: '40px', left: '10px', fontSize: '12px' }}>{transaction.SellerName}</div>}
                                <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '12px' }}>{time}</div>
                                <div style={{ position: 'absolute', top: '90px', left: '10px', fontSize: '15px' }}>Amount: ₱{parseFloat(transaction.TotalAmount).toFixed(2)}</div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default OngoingPage;