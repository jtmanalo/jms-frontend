import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { FaCloudUploadAlt } from 'react-icons/fa';

function ProfileSettings() {
    return (
        <div style={{ maxWidth: 1200, marginLeft: 0, padding: 24 }}>
            <div className="d-flex align-items-center mb-1" style={{ justifyContent: 'flex-start' }}>
                <h2 style={{ fontWeight: 600, marginRight: 24 }}>Setting Details</h2>
            </div>
            <div className="mb-3" style={{ color: '#888', textAlign: 'left' }}>Update your photo and personal details here.</div>
            <Row className="justify-content-start">
                <Col md={8}>
                    <Card className="mb-4" style={{ borderRadius: 12 }}>
                        <Card.Header className="bg-white" style={{ fontWeight: 500, fontSize: 18 }}>Personal information</Card.Header>
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={6} className="mb-3 mb-md-0">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control placeholder="Enter first name" />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control placeholder="Enter last name" />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6} className="mb-3 mb-md-0">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control placeholder="Enter email address" />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control placeholder="Enter user name" />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6} className="mb-3 mb-md-0">
                                    <Form.Label>Phone No</Form.Label>
                                    <Form.Control placeholder="Enter phone no" />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>City</Form.Label>
                                    <Form.Control placeholder="Enter your city" />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6} className="mb-3 mb-md-0">
                                    <Form.Label>Country Name</Form.Label>
                                    <Form.Control placeholder="Enter  country name" />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Zip code</Form.Label>
                                    <Form.Control placeholder="Enter zip code" />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Label>Bio<span style={{ color: '#888', fontSize: 13, marginLeft: 4 }}>(Write a short introduction)</span></Form.Label>
                                    <Form.Select className="mb-2">
                                        <option>Normal text</option>
                                    </Form.Select>
                                    <Form.Control as="textarea" rows={2} value={"Lorem ipsum, in graphical and textual context, refers to filler text that is placed in a document or visual presentation. Lorem ipsum is derived from the Latin 'dolorem ipsum' roughly translated as 'pain itself'."} />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Label>Timezone</Form.Label>
                                    <Form.Select>
                                        <option>Pacific Standard Time</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4" style={{ borderRadius: 12 }}>
                        <Card.Header className="bg-white" style={{ fontWeight: 500, fontSize: 18 }}>Your Photo</Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-center mb-3">
                                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }} />
                                <div>
                                    <div style={{ fontWeight: 500 }}>Edit your photo</div>
                                    <div style={{ color: '#888', fontSize: 13 }}>
                                        <span style={{ cursor: 'pointer', color: '#d32f2f', marginRight: 8 }}>Delete</span>
                                        <span style={{ cursor: 'pointer', color: '#1976d2' }}>Update</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ border: '2px dashed #b39ddb', borderRadius: 12, padding: 32, textAlign: 'center', color: '#888', marginBottom: 12 }}>
                                <FaCloudUploadAlt size={32} style={{ color: '#b39ddb', marginBottom: 8 }} />
                                <div>
                                    <span style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}>Click to upload</span> or drag and drop<br />
                                    SVG, PNG, JPG or GIF<br />
                                    <span style={{ fontSize: 13 }}>(max, 800x400px)</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card style={{ borderRadius: 12 }}>
                        <Card.Body>
                            <div className="d-flex align-items-center mb-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: 32, height: 32, marginRight: 12 }} />
                                <div style={{ fontWeight: 500 }}>Google</div>
                                <Button variant="outline-primary" size="sm" style={{ marginLeft: 'auto', background: '#f3eaff', color: '#7c4dff', border: 'none' }}>Connected</Button>
                            </div>
                            {/* <div style={{ color: '#888', fontSize: 14 }}>
                                Use Google to sign in to your account. <a href="#" style={{ color: '#1976d2' }}>Click here to learn more.</a>
                            </div> */}
                        </Card.Body>
                    </Card>
                    <div className="d-flex justify-content-end mt-3" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', width: 'auto' }}>
                            <Button variant="outline-secondary" style={{ minWidth: 100, marginRight: 12 }}>Cancel</Button>
                            <Button variant="primary" style={{ minWidth: 100 }}>Save</Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default ProfileSettings;
