import { Container, Modal, Form, Card, Button, Table, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaShoppingCart, FaMoneyBillWave, FaChartLine, FaFileInvoiceDollar, FaHandHoldingUsd, FaUserTie, FaBoxOpen, FaClock } from 'react-icons/fa';
import { ActiveTabCard, ButtonsCard } from '../components/Card';
import CustomButton from '../components/CustomButton';
import { MobileHeader } from '../components/Header';
import { StartShiftModal, EndShiftConfirmModal } from '../components/Modal';
import { useAuth } from '../services/AuthContext';
import { DashboardProvider } from '../services/DashboardContext';
import { useDashboard } from '../services/DashboardContext';
import LoadingScreen from '../components/LoadingScreen';
import { MobileNav } from '../components/NavBar';
import SettingsPage from './SettingsPage';
import OngoingPage from './OngoingPage';
import LogsPage from './LogsPage';
import BuyersPage from './BuyersPage';
import LoanPage from './LoanPage';
import ItemsPage from './ItemsPage';
import PurchasePage from './PurchasePage';
import ExpensePage from './ExpensePage';
import SalePage from './SalePage';
import DebtPage from './DebtPage';
import axios from 'axios';
import ReceiptPage from './ReceiptPage';
import PricelistPage from './ItemsTable';
import PendingPurchase from './PendingPurchase';

function SetBranchModal({ show, branchOptions, onSetBranch }) {
  const [selectedBranch, setSelectedBranch] = useState(branchOptions[0] || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuth();

  useEffect(() => {
    if (branchOptions.length > 0 && !selectedBranch) {
      setSelectedBranch(branchOptions[0]);
    }
  }, [branchOptions, selectedBranch]);

  const handleSetBranch = () => {
    if (branchOptions.length === 0) {
      alert('No branches enrolled. Please go to the admin dashboard and enroll a branch first.');
      return;
    }

    if (selectedBranch) {
      // setIsSubmitting(true);
      onSetBranch(selectedBranch);
    } else {
      alert('Please select a branch location.');
    }
  };

  return (
    <Modal show={show} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>Select Branch Location</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {branchOptions.length === 0 ? (
          <div className="text-center">
            <p style={{ color: '#dc3545', fontWeight: 'bold' }}>No branches enrolled yet.</p>
            <p>Please go to the admin dashboard and enroll a branch first before you can start a shift.</p>
          </div>
        ) : (
          <Form>
            <Form.Group>
              <Form.Label>Branch Location</Form.Label>
              <Form.Control
                as="select"
                value={selectedBranch?.display || ''}
                onChange={(e) => setSelectedBranch(branchOptions.find(branch => branch.display === e.target.value))}
              >
                {branchOptions.map((branch, index) => (
                  <option key={index} value={branch.display}>{branch.display}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        {user?.userType !== 'employee' && (
          <Button variant="secondary" onClick={() => navigate(`/admin-dashboard/${user?.username}/branches`)}>
            Go to Admin Dashboard
          </Button>
        )}
        <Button variant="primary" onClick={handleSetBranch} disabled={branchOptions.length === 0}>
          Set Location
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function MobileDashboard() {
  const { actualBranchId } = useDashboard();
  const { user, token } = useAuth();
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Balance');
  const [shiftStarted, setShiftStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [branch, setBranch] = useState('');
  const [startingCash, setStartingCash] = useState('1000.00');
  const [branchOptions, setBranchOptions] = useState([]);
  const [showSetBranchModal, setShowSetBranchModal] = useState(true);
  const [shiftId, setShiftId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showShiftEmployeesModal, setShowShiftEmployeesModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [totalPurchase, setTotalPurchase] = useState(0);
  const [totalSale, setTotalSale] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [shiftEmployees, setShiftEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchShiftEmployees = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/shift-employees/${shiftId}`
      );
      setShiftEmployees(response.data);
    } catch (error) {
      console.error('Error fetching shift employees:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (show) {
      fetchShiftEmployees();
    }
  }, [show, shiftId, token]);

  const handleAddEmployee = async () => {
    if (onAddEmployee) {
      await onAddEmployee();
      fetchShiftEmployees();
    }
  };

  const tableStyle = {
    maxHeight: '70vh',
    overflowY: 'auto',
  };

  useEffect(() => {
    if (!user) {
      console.error('User object is not initialized');
      return;
    }

    fetchActiveShift().then((data) => {
      if (data && data.length > 0) {
        const activeShift = data[0];
        setBranch({
          display: `${activeShift.Name} - ${activeShift.Location}`,
          id: activeShift.BranchID
        });
        setShowSetBranchModal(false);
      } else if (user.branchName && user.branchLocation) {
        const defaultBranch = `${user.branchName} - ${user.branchLocation}`;
        // console.log('Default branch from user data:', defaultBranch);
        setBranch({
          display: `${defaultBranch}`,
          id: user.defaultBranchID
        });
        setShowSetBranchModal(false);
      }
    }).catch((error) => {
      console.error('Failed to fetch active shift:', error);
    });
  }, [user]);

  const handleSwitchLocation = () => {
    if (shiftStarted) {
      alert('You should end your shift before switching location.');
    } else {
      setShowSetBranchModal(true);
    }
  };

  useEffect(() => {
    refreshBalance(actualBranchId, user?.userId);
    refreshTotalExpense(actualBranchId, user?.userId);
    refreshTotalPurchase(actualBranchId, user?.userId);
    refreshTotalSale(actualBranchId, user?.userId);
  }, [shiftStarted, user, actualBranchId]);

  const fetchActiveShift = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/shifts/active/${user.userID}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      const data = response.data;
      if (data && data.length > 0) {
        const activeShift = data[0];
        setShiftId(activeShift.ShiftID);
        setBranch({
          display: `${activeShift.Name} - ${activeShift.Location}`,
          id: activeShift.BranchID
        });
        setShiftStarted(true);
      } else {
        setShiftStarted(false);
      }
      return data;
    } catch (error) {
      console.error('Error fetching active shift:', error.response?.data || error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);

      try {
        const activeShiftData = await fetchActiveShift();
        if (activeShiftData && activeShiftData.length > 0) {
          setShowSetBranchModal(false);
          return;
        }

        if (user.branchName && user.branchLocation) {
          const defaultBranch = {
            display: `${user.branchName} - ${user.branchLocation}`,
            id: user.defaultBranchID,
          };
          setBranch(defaultBranch);
          setShowSetBranchModal(false);
          return;
        }

        setShowSetBranchModal(true);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branches-with-owner-usertype`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      const data = response.data;

      const branches = data.map(branch => ({
        display: `${branch.Name} - ${branch.Location}`,
        id: branch.BranchID
      }));
      // console.log('Extracted branch names and locations:', branches);
      setBranchOptions(branches); // Save to state
    } catch (error) {
      console.error('Error fetching branches with owner usertype:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSetBranch = (branch) => {
    setBranch(branch);
    setShowSetBranchModal(false);
  };

  const createShift = async (branchId, userId, initialCash, token) => {
    try {
      const payload = {
        branchId,
        userId,
        initialCash
      };
      // console.log('Creating shift with payload:', payload);
      setIsSubmitting(true);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/shifts`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // console.log('Shift created successfully:', response.data);
      refreshBalance(branchId, userId);
      return response.data;
    } catch (error) {
      console.error('Error creating shift:', error.response?.data || error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const endShift = async (shiftId, token) => {
    try {
      const payload = {
        shiftId
      };
      // console.log('Ending shift with payload:', payload);
      setIsSubmitting(true);
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/shifts/${shiftId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // console.log('Shift ended successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error ending shift:', error.response?.data || error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/employees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error.response?.data || error.message);
      }
    };

    fetchEmployees();
  }, [token]);

  const onSubmit = async () => {
    try {
      const branchId = branch.id;
      const userId = user?.userID;
      const initialCash = Number(startingCash);
      // console.log('Starting shift with:', { branchId, userId, initialCash });

      const shiftData = await createShift(branchId, userId, initialCash, token);
      setShiftId(shiftData.id);

      refreshBalance(branchId, userId);
      setShiftStarted(true);
      setShowModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error starting shift. Please try again later.';
      alert(errorMessage);
    }
    // console.log('Shift started with initial balance:', startingCash);
  };

  const onAddEmployee = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/shift-employees`,
        {
          shiftId,
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log('Employee added successfully:', response.data);
      setShiftEmployees((prevEmployees) => [...prevEmployees, response.data]);
    } catch (error) {
      console.error('Error adding employee:', error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshBalance = async (branchId, userId) => {
    if (!branchId || !userId) return;
    // console.log('Refreshing balance:', branchId, userId);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/balance?branchId=${branchId}&userId=${userId}`);
      // console.log('Balance response:', response.data);
      setBalance(response.data);
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  const refreshTotalExpense = async (branchId, userId) => {
    if (!branchId || !userId) return;
    // console.log('Refreshing total expense:', branchId, userId);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/expense-balance?branchId=${branchId}&userId=${userId}`);
      // console.log('Expense response:', response.data);
      setTotalExpense(response.data);
    } catch (error) {
      console.error('Error refreshing expense balance:', error);
    }
  };

  const refreshTotalPurchase = async (branchId, userId) => {
    if (!branchId || !userId) return;
    // console.log('Refreshing total purchase:', branchId, userId);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/purchase-balance?branchId=${branchId}&userId=${userId}`);
      // console.log('Purchase response:', response.data);
      setTotalPurchase(response.data);
    } catch (error) {
      console.error('Error refreshing purchase balance:', error);
    }
  };

  const refreshTotalSale = async (branchId, userId) => {
    if (!branchId || !userId) return;
    // console.log('Refreshing total sale:', branchId, userId);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/sale-balance?branchId=${branchId}&userId=${userId}`);
      // console.log('Sale response:', response.data);
      setTotalSale(response.data);
    } catch (error) {
      console.error('Error refreshing sale balance:', error);
    }
  };

  useEffect(() => {
    if (user && actualBranchId) {
      refreshBalance(actualBranchId, user.userID);
      refreshTotalExpense(actualBranchId, user.userID);
      refreshTotalPurchase(actualBranchId, user.userID);
      refreshTotalSale(actualBranchId, user.userID);
    }
  }, [user, actualBranchId]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <SetBranchModal
        show={showSetBranchModal}
        branchOptions={branchOptions}
        onSetBranch={handleSetBranch}
      />
      <div style={{ position: 'sticky', top: 0, zIndex: 1001, background: 'transparent' }}>
        {/* <MobileHeader
            nickname={user?.username}
            userType={user?.userType}
            handleSwitchLocation={handleSwitchLocation}
          /> */}
        {/* <div style={{ padding: '1rem', textAlign: 'center' }}>
          <div>
            <strong>Branch:</strong> {branch?.display}
          </div>
        </div> */}
        <div style={{ maxWidth: 480, margin: '0 auto', background: 'transparent', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            {['Balance', 'Purchase', 'Expense', 'Sale'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  background: activeTab === tab ? '#232323' : '#fff',
                  color: activeTab === tab ? 'white' : '#232323',
                  border: '0.5px solid #232323',
                  borderTopLeftRadius: '0.5rem',
                  borderTopRightRadius: '0.5rem',
                  borderRadius: 0,
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  fontSize: '1rem',
                  padding: '0.75rem 0',
                  boxShadow: 'none',
                  borderBottom: 'none',
                  transition: 'background 0.2s, color 0.2s',
                  zIndex: activeTab === tab ? 2 : 1,
                  position: 'relative',
                  marginBottom: 0,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === 'Balance' && (
            <ActiveTabCard
              title="AVAILABLE BALANCE"
              value={`₱ ${(shiftStarted ? (balance || 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#232323"
              textColor="white"
              branchDisplay={branch?.display || ''}
              handleSwitchLocation={handleSwitchLocation}
            />
          )}
          {activeTab === 'Purchase' && (
            <ActiveTabCard
              title="SPENT ON PURCHASES ( - )"
              value={`₱ ${(shiftStarted ? (totalPurchase || 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#232323"
              textColor="white"
              branchDisplay={branch?.display || ''}
              handleSwitchLocation={handleSwitchLocation}
            />
          )}
          {activeTab === 'Expense' && (
            <ActiveTabCard
              title="SPENT ON EXPENSES ( - )"
              value={`₱ ${(shiftStarted ? (totalExpense || 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#232323"
              textColor="white"
              branchDisplay={branch?.display || ''}
              handleSwitchLocation={handleSwitchLocation}
            />
          )}
          {activeTab === 'Sale' && (
            <ActiveTabCard
              title="EARNED FROM SALES ( + )"
              value={`₱ ${(shiftStarted ? (totalSale || 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              color="#232323"
              textColor="white"
              branchDisplay={branch?.display || ''}
              handleSwitchLocation={handleSwitchLocation}
            />
          )}
        </div>
      </div>
      <Container fluid className="py-4" style={{ maxWidth: 480, maxHeight: '45vh', overflowY: 'auto' }}>
        <div>
          <div style={{ height: 10 }} />
          <ButtonsCard
            header='Manage'
            actions={[
              {
                label: 'Loans',
                icon: <FaHandHoldingUsd size={28} color="#232323" />,
                onClick: () => navigate(`/employee-dashboard/${user?.username}/loans`),
              },
              {
                label: 'Buyer',
                icon: <FaUserTie size={28} color="#232323" />,
                onClick: () => navigate(`/employee-dashboard/${user?.username}/buyers`),
              },
              {
                label: 'Item',
                icon: <FaBoxOpen size={28} color="#232323" />,
                onClick: () => navigate(`/employee-dashboard/${user?.username}/items`),
              },
              {
                label: 'Shift',
                icon: <FaClock size={28} color="#232323" />,
                onClick: () => setShowShiftEmployeesModal(true),
                disabled: !shiftStarted
              },
            ]}
          />
          <div style={{ height: 10 }} />
          {shiftStarted ? (
            <>
              <ButtonsCard
                header='Record'
                actions={[
                  {
                    label: 'Purchase',
                    icon: <FaShoppingCart size={28} color="#232323" />,
                    onClick: () => navigate(`/employee-dashboard/${user?.username}/purchases`),
                  },
                  {
                    label: 'Expense',
                    icon: <FaMoneyBillWave size={28} color="#232323" />,
                    onClick: () => navigate(`/employee-dashboard/${user?.username}/expenses`),
                  },
                  {
                    label: 'Sale',
                    icon: <FaChartLine size={28} color="#232323" />,
                    onClick: () => navigate(`/employee-dashboard/${user?.username}/sales`),
                  },
                  {
                    label: 'Debt',
                    icon: <FaFileInvoiceDollar size={28} color="#232323" />,
                    onClick: () => navigate(`/employee-dashboard/${user?.username}/debts`),
                  }
                ]}
              />
              <div style={{ height: 10 }} />
              <div align="center">
                <CustomButton
                  text="End Shift"
                  color="danger"
                  size="md"
                  className="fw-bold px-4 py-2 end-shift-btn"
                  style={{ background: '#fff', color: '#dc3545', borderColor: '#dc3545', minWidth: 160 }}
                  onClick={() => setShowEndShiftModal(true)}
                />
              </div>
              <EndShiftConfirmModal
                show={showEndShiftModal}
                onCancel={() => setShowEndShiftModal(false)}
                onConfirm={async () => {
                  try {
                    const finalCash = balance;

                    await endShift(shiftId, finalCash, token);

                    setShiftStarted(false);
                    setShowEndShiftModal(false);
                  } catch (error) {
                    alert('Error ending shift. Please try again.');
                  }
                }}
              />


            </>
          ) : (
            <>
              <Card className="shadow-sm text-center" style={{ borderRadius: '1rem', border: 'none', background: '#fff', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="none" viewBox="0 0 24 24" stroke="#343a40" strokeWidth="2" style={{ marginBottom: '1rem' }}>
                    <circle cx="12" cy="12" r="10" stroke="#232323" strokeWidth="2" fill="none" />
                    <line x1="12" y1="7" x2="12" y2="12" stroke="#232323" strokeWidth="2" />
                    <line x1="12" y1="12" x2="15" y2="15" stroke="#232323" strokeWidth="2" />
                  </svg>
                  <div style={{ fontFamily: 'inherit', fontSize: '1.5rem', color: '#232323', fontWeight: 500, marginBottom: '0.5rem' }}>
                    Shift not yet started
                  </div>
                  <div style={{ fontFamily: 'inherit', fontSize: '1.2rem', color: '#232323', fontWeight: 400 }}>
                    Start shift to record transactions
                  </div>
                </Card.Body>
              </Card>
              <div style={{ height: 10 }} />
              <div align="center" style={{ paddingBottom: '1rem' }}>
                <CustomButton
                  text="Start Shift"
                  color="primary"
                  variant="outline-primary"
                  size="md"
                  className="fw-bold px-4 py-2 start-shift-btn"
                  style={{ background: '#fff', color: '#007bff', borderColor: '#007bff', minWidth: 160 }}
                  onClick={() => setShowModal(true)}
                />
              </div>

              <StartShiftModal
                show={showModal}
                onClose={() => setShowModal(false)}
                startingCash={startingCash}
                setStartingCash={setStartingCash}
                branch={branch}
                setBranch={setBranch}
                branchOptions={branchOptions}
                onSubmit={onSubmit}
              />
            </>
          )}
        </div>
      </Container>

      <AddEmployeeModal
        show={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        shiftId={shiftId}
        token={token}
        employees={employees}
      />
      <ShiftEmployeesModal
        show={showShiftEmployeesModal}
        onClose={() => setShowShiftEmployeesModal(false)}
        shiftId={shiftId}
        token={token}
        onAddEmployee={() => setShowAddEmployeeModal(true)}
        shiftStarted={shiftStarted}
      />
    </>
  );
}

const soloPages = [
  '/:username/purchases',
  '/:username/expenses',
  '/:username/sales',
  '/:username/debts',
  '/:username/receipt',
  '/:username/pending-purchases'
];

function MobileLayout({ activePage, setActivePage, username, userType, children }) {
  const location = useLocation();

  const isSoloPage = soloPages.some((path) => {
    const regex = new RegExp(path.replace(':username', username));
    return regex.test(location.pathname);
  });

  return (
    <div className="App d-flex min-vh-100 bg-light">
      {/* Conditionally render MobileNav */}
      {!isSoloPage && (
        <MobileNav
          activePage={activePage}
          setActivePage={setActivePage}
        />
      )}

      {/* Main Content Area */}
      <div
        className="flex-grow-1"
        style={{
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Conditionally render MobileHeader */}
        {!isSoloPage && (
          <MobileHeader nickname={username} userType={userType} />
        )}

        <Container fluid className="py-4 px-4" style={{ minHeight: 'calc(100vh - 60px)' }}>
          {children}
        </Container>
      </div>
    </div>
  );
}

export default function MobileRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const pathToKey = {
    [`/employee-dashboard/${user?.username}/pricelist`]: 'pricelist',
    [`/employee-dashboard/${user?.username}/logs`]: 'logs',
    [`/employee-dashboard/${user?.username}/ongoing`]: 'ongoing',
    [`/employee-dashboard/${user?.username}/profile`]: 'profile',
    [`/employee-dashboard/${user?.username}`]: 'dashboard'
  };

  const currentPath = location.pathname;

  const keyToPath = {
    pricelist: `/employee-dashboard/${user?.username}/pricelist`,
    logs: `/employee-dashboard/${user?.username}/logs`,
    ongoing: `/employee-dashboard/${user?.username}/ongoing`,
    profile: `/employee-dashboard/${user?.username}/profile`,
    dashboard: `/employee-dashboard/${user?.username}`,
  };

  const activePage = pathToKey[currentPath] || 'dashboard';
  const setActivePage = (key) => {
    navigate(keyToPath[key] || `/employee-dashboard/${user?.username}`);
  };

  return (
    <DashboardProvider user={user}>
      <MobileLayout activePage={activePage} setActivePage={setActivePage} username={user?.username} userType={user?.userType}>
        <Routes>
          {/* BottomNav */}
          <Route path=":username/pricelist" element={<PricelistPage />} />
          <Route path=":username/logs" element={<LogsPage />} />
          <Route path=":username/ongoing" element={<OngoingPage />} />
          <Route path=":username/profile" element={<SettingsPage />} />
          {/* Manage */}
          <Route path=":username/loans" element={<LoanPage />} />
          <Route path=":username/buyers" element={<BuyersPage />} />
          <Route path=":username/items" element={<ItemsPage />} />
          {/* Record */}
          <Route path=":username/purchases" element={<PurchasePage />} />
          <Route path=":username/pending-purchases" element={<PendingPurchase />} />
          <Route path=":username/expenses" element={<ExpensePage />} />
          <Route path=":username/sales" element={<SalePage />} />
          <Route path=":username/debts" element={<DebtPage />} />
          <Route path=":username/receipt" element={<ReceiptPage />} />
          {/* Dashboard */}
          <Route path=":username" element={<MobileDashboard />} />
          <Route path="*" element={
            <Card className="shadow-sm">
              <Card.Body>
                <h1 className="mb-4">Not Found</h1>
                <p>Page not found.</p>
              </Card.Body>
            </Card>
          } />
        </Routes>
      </MobileLayout>
    </DashboardProvider>
  );
}

function AddEmployeeModal({ show, onClose, shiftId, employees }) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEmployee = async () => {
    if (!selectedEmployee) {
      alert('Please select an employee.');
      return;
    }

    const [firstName, lastName] = selectedEmployee.split(' ');

    try {
      // console.log('Adding employee to shift:', { shiftId, firstName, lastName });
      setIsSubmitting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/shift-employees`,
        {
          shiftId,
          firstName,
          lastName,
        }
      );
      // console.log('Employee added successfully:', response.data);

      alert('Employee added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding employee:', error.response?.data || error.message);
      alert('Failed to add employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Employee to Shift</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Select Employee</Form.Label>
            <Form.Control
              as="select"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select an Employee</option>
              {Array.isArray(employees) && employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {`${employee.FirstName} ${employee.LastName}`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="outline-primary" onClick={handleAddEmployee} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Adding...
            </>
          ) : (
            `Add Employee`
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function ShiftEmployeesModal({ show, onClose, shiftId, token, onAddEmployee, shiftStarted }) {
  const [shiftEmployees, setShiftEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchShiftEmployees = async () => {
    if (!shiftId) {
      console.error('Shift ID is null or undefined. Cannot fetch employees.');
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/shift-employees/${shiftId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShiftEmployees(response.data);
    } catch (error) {
      console.error('Error fetching shift employees:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (show) {
      fetchShiftEmployees();
    }
  }, [show, shiftId, token]);

  const handleAddEmployee = async () => {
    if (onAddEmployee) {
      await onAddEmployee();
      fetchShiftEmployees();
    }
  };

  const tableStyle = {
    maxHeight: '70vh',
    overflowY: 'auto',
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Employees in Current Shift</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Employee List</h5>
          <Button variant="outline-primary" onClick={handleAddEmployee} disabled={!shiftStarted || isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              `Add Employee`
            )}
          </Button>
        </div>
        <div style={tableStyle}>
          {shiftEmployees.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Employee Name</th>
                </tr>
              </thead>
              <tbody>
                {shiftEmployees.map((employee) => (
                  <tr key={employee.EmployeeID}>
                    <td>{`${employee.FirstName} ${employee.LastName}`}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>
              {shiftStarted
                ? 'No employees found in the current shift.'
                : 'Start shift to start adding employees.'}
            </p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


