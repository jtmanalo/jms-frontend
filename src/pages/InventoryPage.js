import { useState, useEffect } from 'react';
import { Table, Form, Button, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';
import InventoryMatrixTable from '../components/InventoryMatrixTable';

function InventoryPage() {
    const [branches, setBranches] = useState([]);
    const [items, setItems] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [branchFilter, setBranchFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState(String(moment.tz('Asia/Manila').month() + 1));
    const [yearFilter, setYearFilter] = useState(String(moment.tz('Asia/Manila').year()));
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalBranch, setModalBranch] = useState('');
    const [modalItems, setModalItems] = useState([]);
    const [yearsOptions, setYearsOptions] = useState([]);
    const [updatedStatus, setUpdatedStatus] = useState({});
    const [itemPrices, setItemPrices] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const fetchPricesForBranch = async (branchId) => {
        if (!branchId) return;

        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/pricelist-items/branch`, {
                params: { branchId }
            });

            const priceMap = {};
            (response.data || []).forEach(item => {
                priceMap[item.ItemID] = parseFloat(item.ItemPrice) || 0;
            });

            setItemPrices(priceMap);
            // console.log('Prices fetched for branch:', branchId, priceMap);
        } catch (error) {
            console.error('Error fetching prices for branch:', error);
        }
    };

    useEffect(() => {
        const fetchBranches = async () => {
            axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches`)
                .then(response => {
                    setBranches(response.data);
                    if (response.data.length > 0) {
                        setBranchFilter(response.data[0].BranchID);
                        // console.log('Default branch set to:', response.data[0].BranchID);
                    }
                })
                .catch(error => {
                    console.error('Error fetching branches:', error);
                });
        };

        const fetchAllItems = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/all-items`);
                const allItemsData = response.data.map(item => ({
                    ...item,
                    name: item.Name + (item.Classification ? ` - ${item.Classification}` : ''),
                    ItemID: item.ItemID,
                    lastMonthStock: 0,
                    totalStock: 0,
                    dailyStock: {}
                }));
                setAllItems(allItemsData);
                setFilteredItems(allItemsData);

                const initialPrices = {};
                allItemsData.forEach(item => {
                    initialPrices[item.ItemID] = 0;
                });
                setItemPrices(initialPrices);

            } catch (error) {
                console.error('Error fetching all items:', error);
            }
        };

        const fetchItems = async () => {
            try {
                const itemData = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/items`);
                setItems(itemData.data);
                const uniqueMap = new Map();
                (itemData.data || []).forEach((it) => {
                    const key = it.ItemID ?? it.id ?? `${it.Name}|${it.Classification || ''}`;
                    if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, {
                            ...it,
                            ItemID: it.ItemID ?? it.id ?? key,
                            totalQuantity: typeof it.totalQuantity === 'number' ? it.totalQuantity : 0,
                        });
                    }
                });
                setModalItems(Array.from(uniqueMap.values()));
                const years = Array.from(
                    new Set(
                        (itemData.data || [])
                            .map((it) => {
                                try {
                                    return moment(it.date).tz('Asia/Manila').year();
                                } catch (e) {
                                    return null;
                                }
                            })
                            .filter((y) => typeof y === 'number' && !isNaN(y))
                    )
                ).sort((a, b) => b - a);
                const currentYear = moment.tz('Asia/Manila').year();
                if (years.length === 0) {
                    setYearsOptions([currentYear]);
                } else {
                    if (!years.includes(currentYear)) {
                        years.unshift(currentYear);
                    }
                    setYearsOptions(years);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
                setItems([]);
                const currentYear = moment.tz('Asia/Manila').year();
                setYearsOptions([currentYear]);
            }
        };

        fetchBranches();
        fetchAllItems();
        fetchItems();
    }, []);

    useEffect(() => {
        fetchPricesForBranch(branchFilter);
    }, [branchFilter]);

    useEffect(() => {
        const fetchAndFilter = async () => {
            setIsLoading(true);
            let accumulationData = [];
            let previousMonthInventory = [];
            // console.log('Fetching accumulation data with filters:', { branchFilter, monthFilter, yearFilter });
            if (branchFilter && monthFilter && yearFilter) {
                try {
                    const { data: acc } = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/daily-changes?branchId=${branchFilter}&month=${Number(monthFilter)}&year=${Number(yearFilter)}`);
                    // console.log('Accumulation data fetched:', acc);
                    accumulationData = acc || [];

                    const currentMonth = Number(monthFilter);
                    const currentYear = Number(yearFilter);
                    let prevMonth = currentMonth - 1;
                    let prevYear = currentYear;
                    if (prevMonth < 1) {
                        prevMonth = 12;
                        prevYear = currentYear - 1;
                    }

                    const { data: prevInventory } = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/inventory-items/previous-records?branchId=${branchFilter}&month=${prevMonth}&year=${prevYear}`);
                    // console.log('Previous month inventory fetched:', prevInventory);
                    previousMonthInventory = prevInventory || [];
                } catch (e) {
                    console.error('Error fetching accumulation or previous inventory data:', e);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }

            const byItem = new Map();
            accumulationData.forEach((r) => {
                const id = Number(r.ItemID);
                const day = Number(r.day_of_month);
                const changeAmount = Number(r.change_amount);
                if (!byItem.has(id)) byItem.set(id, {});
                const m = byItem.get(id);
                m[day] = changeAmount;
            });

            const previousInventoryMap = new Map();
            previousMonthInventory.forEach(inv => {
                previousInventoryMap.set(Number(inv.ItemID), Number(inv.TotalQuantity));
            });

            let processedItems = allItems.map(item => {
                const keyId = Number(item.ItemID ?? item.id);
                const dailyStock = byItem.get(keyId) || {};
                const totalStock = Object.values(dailyStock).reduce((sum, current) => sum + current, 0);
                const lastMonthStock = previousInventoryMap.get(keyId) || 0;

                return {
                    ...item,
                    dailyStock,
                    totalStock,
                    lastMonthStock
                };
            });

            if (searchTerm) {
                processedItems = processedItems.filter(item =>
                    (item.name || item.Name).toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setFilteredItems(processedItems);
        };

        fetchAndFilter();
    }, [branchFilter, monthFilter, yearFilter, searchTerm, allItems]);

    const handleShowModal = () => {
        // console.log('Branch selected for modal:', modalBranch);
        // console.log('Preparing modal items from allItems:', allItems[0].ItemID);
        const itemsForModal = allItems.map(item => ({
            ItemID: item.ItemID,
            Name: item.Name,
            Classification: item.Classification,
            name: item.name,
            totalQuantity: 0
        }));
        setModalItems(itemsForModal);
        setShowModal(true);
    };

    const loadBranchPreviousInventory = async (branchId) => {
        if (!branchId) {
            const itemsForModal = allItems.map(item => ({
                ItemID: item.ItemID,
                Name: item.Name,
                Classification: item.Classification,
                name: item.name,
                totalQuantity: 0
            }));
            setModalItems(itemsForModal);
            return;
        }

        try {
            const currentMonth = Number(monthFilter);
            const currentYear = Number(yearFilter);
            let prevMonth = currentMonth - 1;
            let prevYear = currentYear;
            if (prevMonth < 1) {
                prevMonth = 12;
                prevYear = currentYear - 1;
            }

            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/inventory-items/previous-records?branchId=${branchId}&month=${prevMonth}&year=${prevYear}`);
            // console.log('Previous inventory data:', response.data);

            const existingInventoryMap = new Map();
            (response.data || []).forEach(inv => {
                existingInventoryMap.set(inv.ItemID, inv.TotalQuantity);
            });

            const itemsForModal = allItems.map(item => ({
                ItemID: item.ItemID,
                Name: item.Name,
                Classification: item.Classification,
                name: item.name,
                totalQuantity: existingInventoryMap.has(item.ItemID) ? existingInventoryMap.get(item.ItemID) : 0
            }));
            setModalItems(itemsForModal);
        } catch (error) {
            console.error('Error fetching previous inventory:', error);
            const itemsForModal = allItems.map(item => ({
                ItemID: item.ItemID,
                Name: item.Name,
                Classification: item.Classification,
                name: item.name,
                totalQuantity: 0
            }));
            setModalItems(itemsForModal);
        }
    };

    const handleUpdateItem = async (itemId, totalQuantity) => {
        // console.log('Updating item:', { itemId, totalQuantity, branchId: modalBranch });
        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/inventory-items/record-previous`, {
                branchId: modalBranch,
                itemId,
                totalQuantity
            });
            setUpdatedStatus((prev) => ({ ...prev, [itemId]: true }));
            setTimeout(() => {
                setUpdatedStatus((prev) => {
                    const next = { ...prev };
                    delete next[itemId];
                    return next;
                });
            }, 3000);
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item.');
        }
    };

    const handleUpdateAll = async () => {
        // console.log('Updating all items in modal:', modalItems);
        for (const item of modalItems) {
            try {
                // console.log('Updating item in bulk:', item, item.ItemID ?? item.id, item.totalQuantity);
                await handleUpdateItem(item.ItemID ?? item.id, item.totalQuantity);
            } catch (e) {
                console.error('Error updating item in bulk:', e);
            }
        }
    };

    const handleQuantityChange = (itemId, value) => {
        setModalItems(prevItems =>
            prevItems.map(item =>
                (item.ItemID ?? item.id) === itemId ? { ...item, totalQuantity: value } : item
            )
        );
    };

    const getHeaderMonthName = () => {
        if (monthFilter && yearFilter) {
            const selMonthIndex = parseInt(monthFilter, 10) - 1; // moment uses 0-11
            const selYear = parseInt(yearFilter, 10);
            return moment.tz([selYear, selMonthIndex], 'Asia/Manila').subtract(1, 'month').format('MMMM');
        }
        return moment.tz('Asia/Manila').subtract(1, 'month').format('MMMM');
    };

    const prevMonthName = getHeaderMonthName();

    const handlePriceChange = (itemId, price) => {
        setItemPrices(prevPrices => ({
            ...prevPrices,
            [itemId]: price,
        }));
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Inventory</h1>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Form style={{ display: 'flex', marginBottom: '20px' }}>
                    <Form.Group controlId="branchFilter" style={{ marginRight: '10px' }}>
                        <Form.Label>Branch</Form.Label>
                        <Form.Control
                            as="select"
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                        >
                            {branches.length === 0 ? (
                                <option value="">No Branch Enrolled</option>
                            ) : (
                                branches.map(branch => (
                                    <option key={uuidv4()} value={branch.BranchID}>{branch.Name} - {branch.Location}</option>
                                ))
                            )}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="monthFilter" style={{ marginRight: '10px' }}>
                        <Form.Label>Month</Form.Label>
                        <Form.Control
                            as="select"
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                        >
                            <option value="">All</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={uuidv4()} value={i + 1}>{moment().month(i).format('MMMM')}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="yearFilter" style={{ marginRight: '10px' }}>
                        <Form.Label>Year</Form.Label>
                        <Form.Control
                            as="select"
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                        >
                            <option value="">All</option>
                            {yearsOptions.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="searchBar" style={{ flexGrow: 1 }}>
                        <Form.Label>Search</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Search items"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group style={{ alignSelf: 'flex-end', marginLeft: '10px' }}>
                        <Button variant="outline-primary" onClick={handleShowModal}>
                            Add Previous Records
                        </Button>
                    </Form.Group>
                </Form>
            </div>
            {isLoading ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    padding: '40px'
                }}>
                    <Spinner animation="border" role="status" style={{ marginBottom: '20px' }}>
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p>Fetching inventory data...</p>
                </div>
            ) : (
                <>
                    {!isLoading && filteredItems.length === 0 && (
                        <div style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderRadius: '4px',
                            padding: '15px',
                            marginBottom: '20px',
                            color: '#856404',
                            maxWidth: '90%',
                        }}>
                            <strong>⚠️ No rows visible</strong> - If the table appears empty, try <strong>refreshing</strong> the page.
                        </div>
                    )}
                    <InventoryMatrixTable
                        filteredItems={filteredItems}
                        monthFilter={monthFilter}
                        yearFilter={yearFilter}
                        itemPrices={itemPrices}
                        handlePriceChange={handlePriceChange}
                        branchFilter={branchFilter}
                    />
                </>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Records for {prevMonthName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="modalBranch" style={{ marginBottom: '20px' }}>
                        <Form.Label>Branch</Form.Label>
                        <Form.Control
                            as="select"
                            value={modalBranch}
                            onChange={(e) => {
                                setModalBranch(e.target.value);
                                loadBranchPreviousInventory(e.target.value);
                            }}
                        >
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                                <option key={uuidv4()} value={branch.BranchID}>{branch.Name} - {branch.Location}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modalItems.map(item => (
                                <tr key={item.ItemID}>
                                    <td>{item.name}</td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            value={item.totalQuantity}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value);
                                                if (value > 0) {
                                                    handleQuantityChange(item.ItemID, e.target.value)
                                                }
                                            }}
                                            onKeyPress={(e) => {
                                                if (!/^[0-9.]$/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            variant={updatedStatus[item.ItemID] ? 'success' : 'outline-success'}
                                            onClick={() => handleUpdateItem(item.ItemID, item.totalQuantity)}
                                            disabled={updatedStatus[item.ItemID]}
                                        >
                                            {updatedStatus[item.ItemID] ? 'Updated' : 'Update'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleUpdateAll}>
                        Update All
                    </Button>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default InventoryPage;