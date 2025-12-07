// import SalesPerformanceChart from '../components/SalesPerformanceChart';
// import BreakEvenChart from '../components/BreakEvenChart';
// import ProfitMarginBarChart from '../components/ProfitMarginBarChart';
// import ExpenseBreakdownDonut from '../components/ExpenseBreakdownDonut';
// import ExpenseTrendStackedBar from '../components/ExpenseTrendStackedBar';
// import LocationAnalysisTable from '../components/LocationAnalysisTable';
import PriceTrendGraph from '../components/PriceTrendGraph';
import { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';

function AnalyticsPage() {
    const [entityTypeFilter, setEntityTypeFilter] = useState('buyer');
    const [entities, setEntities] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedEntityId, setSelectedEntityId] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [loadingEntities, setLoadingEntities] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);

    const fetchItems = useCallback(async () => {
        setLoadingItems(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/all-items`);
            // console.log('Fetched items:', response.data);
            setItems(response.data.map(item => ({
                id: item.ItemID,
                name: `${item.Name}${item.Classification ? ` - ${item.Classification}` : ''}`,
            })));
            setLoadingItems(false);
        } catch (error) {
            console.error('Error fetching items:', error);
            setLoadingItems(false);
            setItems([]);
        }
    }, []);

    const fetchEntities = useCallback(async (type) => {
        setLoadingEntities(true);
        setEntities([]);
        setSelectedEntityId(null);

        const endpoint = type === 'buyer' ? '/api/buyers-list' : '/api/branches';

        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}${endpoint}`);

            const entityData = response.data.map(e => ({
                id: type === 'buyer' ? e.BuyerID : e.BranchID,
                name: type === 'buyer' ? e.CompanyName : `${e.Name} - ${e.Location}`,
            }));

            setEntities(entityData);

            if (entityData.length > 0) {
                setSelectedEntityId(entityData[0].id);
            }
            setLoadingEntities(false);
        } catch (error) {
            console.error(`Error fetching ${type}s:`, error);
            setLoadingEntities(false);
            setEntities([]);
        }
    }, []);

    useEffect(() => {
        fetchItems();
        fetchEntities(entityTypeFilter);
    }, [fetchItems, fetchEntities, entityTypeFilter]);

    useEffect(() => {
        fetchEntities(entityTypeFilter);
    }, [entityTypeFilter, fetchEntities]);

    useEffect(() => {
        if (items.length > 0 && selectedItemId === null) {
            setSelectedItemId(items[0].id);
        }
    }, [items, selectedItemId]);

    const isLoading = loadingEntities || loadingItems;

    return (
        <div>
            <h1 className="mb-4">Analytics Dashboard</h1>

            <Card className="mb-4 p-3">
                <Row className="g-3">
                    {/* Entity Type Selector (Buyer/Branch) */}
                    <Col xs={12} md={3}>
                        <Form.Group controlId="entityTypeFilter">
                            <Form.Label>Entity Type</Form.Label>
                            <Form.Select
                                value={entityTypeFilter}
                                onChange={(e) => setEntityTypeFilter(e.target.value)}
                            >
                                <option value="buyer">Buyer</option>
                                <option value="branch">Branch</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Entity Selector (Buyer Name or Branch Name) */}
                    <Col xs={12} md={5}>
                        <Form.Group controlId="entitySelect">
                            <Form.Label>{entityTypeFilter === 'buyer' ? 'Buyer' : 'Branch'} Name</Form.Label>
                            <Form.Select
                                value={selectedEntityId || ''}
                                onChange={(e) => setSelectedEntityId(e.target.value)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <option>Loading...</option>
                                ) : entities.length === 0 ? (
                                    <option value="">No {entityTypeFilter === 'buyer' ? 'Buyer' : 'Branch'} Enrolled</option>
                                ) : (
                                    entities.map(entity => (
                                        <option key={entity.id} value={entity.id}>{entity.name}</option>
                                    ))
                                )}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Item Selector */}
                    <Col xs={12} md={4}>
                        <Form.Group controlId="itemSelect">
                            <Form.Label>Item</Form.Label>
                            <Form.Select
                                value={selectedItemId || ''}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <option>Loading...</option>
                                ) : items.length === 0 ? (
                                    <option value="">No Item Found</option>
                                ) : (
                                    items.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))
                                )}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Card>

            <hr />

            {/* --- Charts Section --- */}
            <div className="d-flex flex-column gap-4" style={{ width: '100%' }}>
                <Card body>
                    {/* Price Trend Graph */}
                    <h5 className="mb-3">Price Trend Analysis</h5>
                    {selectedEntityId && selectedItemId && !isLoading ? (
                        <PriceTrendGraph
                            entityId={selectedEntityId}
                            entityType={entityTypeFilter}
                            itemId={selectedItemId}
                        />
                    ) : (
                        <div className="text-center p-5 text-muted">
                            {isLoading ? "Fetching data lists..." : "Select an entity and an item to view the trend."}
                        </div>
                    )}
                </Card>

                {/* Placeholder for other charts */}
                {/* <SalesPerformanceChart /> */}
                {/* <BreakEvenChart /> */}
                {/* <ProfitMarginBarChart /> */}
            </div>
        </div>
    );
}

export default AnalyticsPage;