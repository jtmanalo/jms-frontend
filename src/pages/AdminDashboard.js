import { useState, useEffect, useCallback } from 'react';
import { Container, Card, Row, Col, Form } from 'react-bootstrap';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { TopNav, SideNav } from '../components/NavBar';
import SettingsPage from './SettingsPage';
import AnalyticsPage from './AnalyticsPage';
import EmployeesPage from './EmployeesPage';
import BranchPage from './BranchPage';
import InventoryPage from './InventoryPage';
import LoanPage from './LoanPage';
import ShiftsPage from './ShiftsPage';
import BuyersPage from './BuyersPage';
import HelpPage from './HelpPage';
import ItemsPage from './ItemsPage';
import ActivityLogs from './ActivityLogs';
import { useAuth } from '../services/AuthContext';
// import { MetricCard, MetricChartCard } from '../components/Card';
// import { FaChartLine, FaShoppingCart, FaMoneyBillWave, FaReceipt, FaWallet } from 'react-icons/fa';
import moment from 'moment';
import axios from 'axios';
import NetIncomeChart from '../components/NetIncomeChart';


function AdminDashboard() {
    const currentYear = String(moment().year());
    const [incomeBranchFilter, setIncomeBranchFilter] = useState('2');
    const [incomeYearFilter, setIncomeYearFilter] = useState(currentYear);
    const [incomeChartData, setIncomeChartData] = useState([]);
    const [incomeLoading, setIncomeLoading] = useState(false);
    // const [dynamicMetrics, setDynamicMetrics] = useState(null);
    const [branches, setBranches] = useState([]);
    // const [loading, setLoading] = useState(true);

    // const fetchMetrics = useCallback(async () => {
    //     setLoading(true);
    //     try {
    //         const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/daily-metrics`);
    //         setDynamicMetrics(response.data);
    //     } catch (error) {
    //         console.error('Error fetching dashboard metrics:', error);
    //         setDynamicMetrics(null);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);

    // useEffect(() => {
    //     fetchMetrics();
    // }, [fetchMetrics]);

    // Function to calculate percentage change
    // const calculateTrend = (current, previous) => {
    //     current = parseFloat(current);
    //     previous = parseFloat(previous);

    //     if (previous === 0) {
    //         return current > 0 ? '+100%' : 'N/A';
    //     }
    //     const change = ((current - previous) / previous) * 100;
    //     return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    // };

    // Function to format currency (Philippine Peso)
    // const formatPeso = (value) => {
    //     return `₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
    // };

    // Only map the data if it has been fetched
    // const metricCards = dynamicMetrics ? [
    //     {
    //         title: 'Revenue',
    //         value: formatPeso(dynamicMetrics.revenue.today),
    //         icon: <FaChartLine size={24} color="#4CAF50" />,
    //         trend: calculateTrend(dynamicMetrics.revenue.today, dynamicMetrics.revenue.prev),
    //         subtitle: `${calculateTrend(dynamicMetrics.revenue.today, dynamicMetrics.revenue.prev)} from yesterday`,
    //         trendColor: dynamicMetrics.revenue.today >= dynamicMetrics.revenue.prev ? '#4CAF50' : '#E57373',
    //         iconBg: '#E8F5E9',
    //     },
    //     {
    //         title: 'Total Purchase',
    //         value: formatPeso(dynamicMetrics.totalPurchase.today),
    //         icon: <FaShoppingCart size={24} color="#FFC107" />,
    //         trend: calculateTrend(dynamicMetrics.totalPurchase.today, dynamicMetrics.totalPurchase.prev),
    //         subtitle: `${calculateTrend(dynamicMetrics.totalPurchase.today, dynamicMetrics.totalPurchase.prev)} from yesterday`,
    //         trendColor: calculateTrend(dynamicMetrics.totalPurchase.today, dynamicMetrics.totalPurchase.prev).includes('-') ? '#4CAF50' : '#E57373',
    //         iconBg: '#FFF8E1',
    //     },
    //     {
    //         title: 'Gross Profit',
    //         value: formatPeso(dynamicMetrics.grossProfit.today),
    //         icon: <FaMoneyBillWave size={24} color="#00BCD4" />,
    //         trend: calculateTrend(dynamicMetrics.grossProfit.today, dynamicMetrics.grossProfit.prev),
    //         subtitle: `${calculateTrend(dynamicMetrics.grossProfit.today, dynamicMetrics.grossProfit.prev)} from yesterday`,
    //         trendColor: dynamicMetrics.grossProfit.today >= dynamicMetrics.grossProfit.prev ? '#4CAF50' : '#E57373',
    //         iconBg: '#E0F7FA',
    //     },
    //     {
    //         title: 'Expenses',
    //         value: formatPeso(dynamicMetrics.expenses.today),
    //         icon: <FaReceipt size={24} color="#FF7043" />,
    //         trend: calculateTrend(dynamicMetrics.expenses.today, dynamicMetrics.expenses.prev),
    //         subtitle: `${calculateTrend(dynamicMetrics.expenses.today, dynamicMetrics.expenses.prev)} from yesterday`,
    //         trendColor: calculateTrend(dynamicMetrics.expenses.today, dynamicMetrics.expenses.prev).includes('-') ? '#4CAF50' : '#E57373',
    //         iconBg: '#FFEBEE',
    //     },
    //     {
    //         title: 'Net Income',
    //         value: formatPeso(dynamicMetrics.netIncome.today),
    //         icon: <FaWallet size={24} color="#8BC34A" />,
    //         trend: calculateTrend(dynamicMetrics.netIncome.today, dynamicMetrics.netIncome.prev),
    //         subtitle: `${calculateTrend(dynamicMetrics.netIncome.today, dynamicMetrics.netIncome.prev)} from yesterday`,
    //         trendColor: dynamicMetrics.netIncome.today >= dynamicMetrics.netIncome.prev ? '#4CAF50' : '#E57373',
    //         iconBg: '#F1F8E9',
    //     },
    // ] : [];

    // Generate year options (e.g., last 5 years)
    const yearsOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Fetch data when year or branch changes
    useEffect(() => {
        const fetchIncomeData = async () => {
            setIncomeLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/net-income`, {
                    params: {
                        year: incomeYearFilter,
                        branchId: incomeBranchFilter
                    }
                });
                setIncomeChartData(response.data);
            } catch (error) {
                console.error('Error fetching income trend:', error);
                setIncomeChartData([]);
            } finally {
                setIncomeLoading(false);
            }
        };
        if (incomeYearFilter && incomeBranchFilter) {
            fetchIncomeData();
        }
    }, [incomeYearFilter, incomeBranchFilter]);

    const fetchBranches = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches`);

            const branchesData = response.data.map(e => ({
                id: e.BranchID,
                name: `${e.Name} - ${e.Location}`,
            }));

            setBranches(branchesData);
            // Set the first branch as default if available
            if (branchesData.length > 0 && !incomeBranchFilter) {
                setIncomeBranchFilter(branchesData[0].id.toString());
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    }, [incomeBranchFilter]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);


    return (
        <>
            <h1 className="mb-4">Dashboard</h1>
            {/* {loading && <div>Loading metrics...</div>}

            {!loading && (
                <div className="d-flex flex-wrap gap-4 mb-4">
                    {metricCards.map((props, idx) => (
                        <MetricCard key={props.title} {...props} />
                    ))}
                </div>
            )} */}
            {/* Net Income Chart Card Example */}
            <div className="mt-4">
                {/* <MetricChartCard
                    title="Net Income"
                    chartData={netIncomeChartData}
                    chartOptions={netIncomeChartOptions}
                    months={months}
                    years={years}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={handleMonthChange}
                    onYearChange={handleYearChange}
                /> */}
                <Card className="mb-4 p-3">
                    <h5 className="mb-3">Net Income Trend (Revenue - Expenses)</h5>
                    <Row className="g-3 mb-3">
                        <Col xs={12} md={3}>
                            <Form.Group controlId="incomeBranchFilter">
                                <Form.Label>Select Branch</Form.Label>
                                <Form.Select
                                    value={incomeBranchFilter}
                                    onChange={(e) => setIncomeBranchFilter(e.target.value)}
                                >
                                    {branches.length === 0 ? (
                                        <option value="">No Branch Enrolled</option>
                                    ) : (
                                        branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))
                                    )}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={3}>
                            <Form.Group controlId="incomeYearFilter">
                                <Form.Label>Select Year</Form.Label>
                                <Form.Select
                                    value={incomeYearFilter}
                                    onChange={(e) => setIncomeYearFilter(e.target.value)}
                                >
                                    {yearsOptions.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Net Income Chart Rendering */}
                    <div style={{ height: '400px' }}>
                        {incomeLoading ? (
                            <div className="text-center p-5 text-muted">Loading Income Data...</div>
                        ) : (
                            <NetIncomeChart data={incomeChartData} />
                        )}
                    </div>
                </Card>
            </div>

        </>
    );
}

function AdminLayout({ activePage, setActivePage, username, children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const mainContentMarginLeft = isCollapsed ? '72px' : '260px';

    return (
        <div className="App d-flex min-vh-100 bg-light">

            {/* Sidebar (Fixed) */}
            <SideNav
                activePage={activePage}
                setActivePage={setActivePage}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
            />

            {/* Main Content Area */}
            <div
                className="flex-grow-1"
                style={{
                    marginLeft: mainContentMarginLeft,
                    transition: 'margin-left 0.3s ease',
                    paddingTop: '60px'
                }}
            >
                <TopNav toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} username={username} userType="Owner" />

                <Container fluid className="py-4 px-4" style={{ minHeight: 'calc(100vh - 60px)' }}>
                    {children}
                </Container>
            </div>
        </div>
    );
}

export default function DesktopRoutes() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const pathToKey = {
        [`/admin-dashboard/${user?.username}/analytics`]: 'analytics',
        [`/admin-dashboard/${user?.username}/inventory`]: 'inventory',
        [`/admin-dashboard/${user?.username}/items`]: 'items',
        [`/admin-dashboard/${user?.username}/buyers`]: 'buyers',
        [`/admin-dashboard/${user?.username}/loans`]: 'loans',
        [`/admin-dashboard/${user?.username}/shifts`]: 'shifts',
        [`/admin-dashboard/${user?.username}/employees`]: 'employees',
        [`/admin-dashboard/${user?.username}/branches`]: 'branches',
        [`/admin-dashboard/${user?.username}/settings`]: 'settings',
        [`/admin-dashboard/${user?.username}/help`]: 'help',
        [`/admin-dashboard/${user?.username}/items`]: 'items',
        [`/admin-dashboard/${user?.username}`]: 'dashboard'
    };

    const currentPath = location.pathname;

    const keyToPath = {
        analytics: `/admin-dashboard/${user?.username}/analytics`,
        inventory: `/admin-dashboard/${user?.username}/inventory`,
        items: `/admin-dashboard/${user?.username}/items`,
        buyers: `/admin-dashboard/${user?.username}/buyers`,
        loans: `/admin-dashboard/${user?.username}/loans`,
        shifts: `/admin-dashboard/${user?.username}/shifts`,
        employees: `/admin-dashboard/${user?.username}/employees`,
        branches: `/admin-dashboard/${user?.username}/branches`,
        settings: `/admin-dashboard/${user?.username}/settings`,
        help: `/admin-dashboard/${user?.username}/help`,
        dashboard: `/admin-dashboard/${user?.username}`,
    };

    const activePage = pathToKey[currentPath] || 'dashboard';
    const setActivePage = (key) => {
        navigate(keyToPath[key] || `/admin-dashboard/${user?.username}`);
    };

    return (
        <AdminLayout activePage={activePage} setActivePage={setActivePage} username={user?.username}>
            <Routes>
                <Route path=":username/analytics" element={<AnalyticsPage />} />
                <Route path=":username/inventory" element={<InventoryPage />} />
                <Route path=":username/items" element={<ItemsPage />} />
                <Route path=":username/buyers" element={<BuyersPage />} />
                <Route path=":username/loans" element={<LoanPage />} />
                <Route path=":username/shifts" element={<ShiftsPage />} />
                <Route path=":username/employees" element={<EmployeesPage />} />
                <Route path=":username/branches" element={<BranchPage />} />
                <Route path=":username/settings" element={<SettingsPage />} />
                <Route path=":username/help" element={<HelpPage />} />
                <Route path=":username/user-logs" element={<ActivityLogs />} />
                <Route path=":username" element={<AdminDashboard />} />
                <Route path="*" element={
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h1 className="mb-4">Not Found</h1>
                            <p>Page not found.</p>
                        </Card.Body>
                    </Card>
                } />
            </Routes>
        </AdminLayout>
    );
}
