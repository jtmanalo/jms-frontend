import { useState, useCallback, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import axios from 'axios';
import { useDashboard } from '../services/DashboardContext';
function PricelistPage() {
    const { actualBranchId, branchName, branchLocation } = useDashboard();
    const [allItemsList, setAllItemsList] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAllItems = useCallback((actualBranchId) => {
        if (!actualBranchId) return;
        setLoading(true);
        axios.get(`${process.env.REACT_APP_BASE_URL}/api/all-items-with-prices?branchId=${actualBranchId}`)
            .then(response => {
                setAllItemsList(response.data);
                // console.log('All items with prices:', response.data);
            })
            .catch(error => {
                console.error('Error fetching all items:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchAllItems(actualBranchId);
    }, [fetchAllItems, actualBranchId]);

    return (
        <>
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#f8f9fa',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 1050,
                }}>
                    <span className="spinner-border" role="status" aria-hidden="true"></span>
                </div>
            ) : (
                <div>
                    <h3 style={{ textAlign: 'center' }}>{branchName}</h3>
                    <h3 style={{ textAlign: 'center' }}>{branchLocation} Pricelist</h3>
                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allItemsList
                                    .filter(item => item.price !== null && item.price !== '')
                                    .map((item, index) => (
                                        <tr key={item.id || `item-${index}`}>
                                            <td>{item.name}{item.classification ? ` - ${item.classification}` : ''}</td>
                                            <td>{item.price}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}
        </>
    );
}

export default PricelistPage;