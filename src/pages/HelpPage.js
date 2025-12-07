import { Card, Container, Row, Col, Accordion } from 'react-bootstrap';
import { FaUserShield, FaUsers, FaClipboardList } from 'react-icons/fa';

function HelpPage() {
    return (
        <Container className="py-4">
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <h1 className="mb-2">Help & Tutorial</h1>
                    <p className="text-muted">Find answers and learn how to use the Junkshop Management System</p>
                </Card.Body>
            </Card>

            <Row className="mb-4">
                <Col md={6} className="mb-3">
                    <Card className="shadow-sm h-100 border-primary">
                        <Card.Body>
                            <div className="d-flex align-items-center mb-3">
                                <FaUserShield size={28} className="text-primary me-2" />
                                <h5 className="mb-0">Admin/Owner Side</h5>
                            </div>
                            <p className="text-muted">Guide for administrators and owners</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} className="mb-3">
                    <Card className="shadow-sm h-100 border-success">
                        <Card.Body>
                            <div className="d-flex align-items-center mb-3">
                                <FaUsers size={28} className="text-success me-2" />
                                <h5 className="mb-0">Employee Side</h5>
                            </div>
                            <p className="text-muted">Guide for employees</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ADMIN SIDE */}
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">
                        <FaUserShield className="me-2" />
                        Admin/Owner Side
                    </h4>
                </Card.Header>
                <Card.Body>
                    <Accordion defaultActiveKey="0">
                        {/* Initial Setup */}
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <strong>1. Initial Setup (Required First)</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-primary">Follow these steps in order:</h6>
                                    <ol>
                                        <li className="mb-2">
                                            <strong>Add Branch</strong>
                                            <p className="mb-0 text-muted small">Create your business branches/locations. This is required before adding items and employees.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Add Items</strong>
                                            <p className="mb-0 text-muted small">Add all items/products that your business will handle.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Add Pricing</strong>
                                            <p className="mb-0 text-muted small">Set prices for each item per branch. This allows different pricing for different locations.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Add Employees, Sellers & Buyers</strong>
                                            <p className="mb-0 text-muted small">Once pricing is set, you can add staff and business partners to your system.</p>
                                        </li>
                                    </ol>
                                </div>
                                <div className="alert alert-info">
                                    <strong>Tip:</strong> Complete all setup steps before starting daily operations.
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* User Management */}
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>
                                <strong>2. User Management</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2">Track and Manage Employees:</h6>
                                    <ul>
                                        <li className="mb-2">
                                            <strong>Review Registrations</strong>
                                            <p className="mb-0 text-muted small">View employees who have registered as employees and are pending approval.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Approve or Reject</strong>
                                            <p className="mb-0 text-muted small">Accept or reject employee registrations based on your hiring decisions.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Manage Employee Status</strong>
                                            <p className="mb-0 text-muted small">Update employee status to:
                                                <ul className="mt-1">
                                                    <li><strong>Active:</strong> Employee is working</li>
                                                    <li><strong>Inactive:</strong> Employee is on leave or not assigned</li>
                                                    <li><strong>Terminated:</strong> Employee has left the company</li>
                                                </ul>
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Buyer Pricing */}
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>
                                <strong>3. Buyer Pricing Management</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <p className="text-muted">Set special pricing for each buyer's items. This allows you to maintain different pricing structures for different buyers.</p>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Price History (Optional) */}
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>
                                <strong>4. Price History Tracking (Optional)</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2">Record Version History:</h6>
                                    <p className="text-muted">You can optionally record previous versions of your pricelists and your buyers' pricelists.</p>
                                    <div className="alert alert-info">
                                        <strong>Benefits:</strong> Track how item prices have changed over time, analyze pricing trends, and maintain a complete audit trail of pricing decisions.
                                    </div>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Inventory (Optional) */}
                        <Accordion.Item eventKey="4">
                            <Accordion.Header>
                                <strong>5. Previous Month Inventory Recording (Optional)</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <p className="text-muted">Record your previous stock prior to the current month.</p>
                                    <div className="alert alert-info">
                                        <strong>Purpose:</strong> Maintain historical inventory data for analysis and reporting purposes.
                                    </div>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Profile & Settings */}
                        <Accordion.Item eventKey="5">
                            <Accordion.Header>
                                <strong>6. Profile & Settings</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2">Update Your Information:</h6>
                                    <p className="text-muted">Access the Settings/Profile page to update:</p>
                                    <ul>
                                        <li>Your name</li>
                                        <li>Email address</li>
                                        <li>Password</li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Shifts Management */}
                        <Accordion.Item eventKey="6">
                            <Accordion.Header>
                                <strong>7. Shifts & Operations Management</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2">Track All Shifts:</h6>
                                    <p className="text-muted">The Shifts page allows you to:</p>
                                    <ul>
                                        <li>View all employee shifts and schedules</li>
                                        <li>Monitor all transactions performed during each shift</li>
                                        <li>Track shift-by-shift performance and activities</li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Activity Logs */}
                        <Accordion.Item eventKey="7">
                            <Accordion.Header>
                                <strong>8. Activity Logs & Monitoring</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-primary mb-2">Monitor System Activity:</h6>
                                    <p className="text-muted">The Activity Logs page shows:</p>
                                    <ul>
                                        <li>User login and logout records</li>
                                        <li>Profile updates and changes</li>
                                        <li>All system activities for audit and security purposes</li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Ready for Operations */}
                        <Accordion.Item eventKey="8">
                            <Accordion.Header>
                                <strong>9. Begin Daily Operations</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <p className="text-muted">After completing all setup steps, your employees can now begin daily transactions on the Employee side of the system.</p>
                                    <div className="alert alert-success">
                                        <strong>System Ready:</strong> Your business is now set up and ready for operations!
                                    </div>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Card.Body>
            </Card>

            {/* EMPLOYEE SIDE */}
            <Card className="shadow-sm">
                <Card.Header className="bg-success text-white">
                    <h4 className="mb-0">
                        <FaUsers className="me-2" />
                        Employee Side
                    </h4>
                </Card.Header>
                <Card.Body>
                    <Accordion defaultActiveKey="0">
                        {/* Getting Started */}
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <strong>1. Getting Started</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-success mb-2">First Steps:</h6>
                                    <ol>
                                        <li className="mb-2">
                                            <strong>Select Your Branch Location</strong>
                                            <p className="mb-0 text-muted small">Choose which branch/location you will be working at. This determines your pricing and item availability.</p>
                                        </li>
                                    </ol>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* View Information */}
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>
                                <strong>2. View Key Information</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-success mb-2">Before Starting Your Shift, Review:</h6>
                                    <ul>
                                        <li className="mb-2">
                                            <strong>Seller & Employee Loans</strong>
                                            <p className="mb-0 text-muted small">Track outstanding loans given to sellers and employees.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Buyer Information & Pricelists</strong>
                                            <p className="mb-0 text-muted small">View all buyers and their current pricing for items.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Items & Current Pricing</strong>
                                            <p className="mb-0 text-muted small">Check all available items and their prices for your branch location.</p>
                                        </li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Start Shift */}
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>
                                <strong>3. Start Your Shift</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-success mb-2">Beginning Your Work Day:</h6>
                                    <ol>
                                        <li className="mb-2">
                                            <strong>Initiate Shift</strong>
                                            <p className="mb-0 text-muted small">Click "Start Shift" to begin your work session.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Add Co-Workers</strong>
                                            <p className="mb-0 text-muted small">Add other employees who are working alongside you in this shift.</p>
                                        </li>
                                    </ol>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Perform Transactions */}
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>
                                <strong>4. Perform Transactions</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-success mb-2">Transaction Types Available:</h6>
                                    <ul>
                                        <li className="mb-2">
                                            <strong>Sale</strong>
                                            <p className="mb-0 text-muted small">Sell items to buyers at their specified pricing.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Purchase</strong>
                                            <p className="mb-0 text-muted small">Purchase items from sellers.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Loan</strong>
                                            <p className="mb-0 text-muted small">Give loans to sellers or employees.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Expense</strong>
                                            <p className="mb-0 text-muted small">Record business expenses during your shift.</p>
                                        </li>
                                        <li className="mb-2">
                                            <strong>Repayment</strong>
                                            <p className="mb-0 text-muted small">Record loan repayments from sellers or employees.</p>
                                        </li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* View Transactions */}
                        <Accordion.Item eventKey="4">
                            <Accordion.Header>
                                <strong>5. View Transaction Logs</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-success mb-2">Access Your Records:</h6>
                                    <p className="text-muted">The Transaction Logs display all successful transactions completed during your shift, including details about each transaction.</p>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* View Pricing */}
                        <Accordion.Item eventKey="5">
                            <Accordion.Header>
                                <strong>6. Check Current Pricing</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-success mb-2">Pricing Information:</h6>
                                    <p className="text-muted">Access the Pricelist to view current pricing for your branch location. This ensures you charge the correct price for each transaction.</p>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Real-time Dashboard */}
                        <Accordion.Item eventKey="6">
                            <Accordion.Header>
                                <strong>7. Monitor Real-Time Metrics</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="mb-3">
                                    <h6 className="text-success mb-2">Track Your Shift Performance:</h6>
                                    <p className="text-muted">View real-time updates of:</p>
                                    <ul>
                                        <li><strong>Balance:</strong> Current cash balance for the shift</li>
                                        <li><strong>Total Sales:</strong> Sum of all sales during the shift</li>
                                        <li><strong>Total Purchases:</strong> Sum of all purchases during the shift</li>
                                        <li><strong>Total Expenses:</strong> Sum of all expenses during the shift</li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>

                        {/* Tips */}
                        <Accordion.Item eventKey="7">
                            <Accordion.Header>
                                <strong>Tips for Employees</strong>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="alert alert-info">
                                    <strong>Best Practices:</strong>
                                    <ul className="mb-0 mt-2">
                                        <li>Always review the pricelist before starting transactions</li>
                                        <li>Keep track of loans and repayments carefully</li>
                                        <li>Record all transactions immediately for accuracy</li>
                                        <li>Verify buyer pricing before completing sales</li>
                                        <li>Monitor your shift metrics to ensure accuracy</li>
                                    </ul>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default HelpPage;