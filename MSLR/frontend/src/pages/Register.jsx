import { Container, Row, Col, Card, Form, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useState, useEffect } from "react";
import { registerAuthUser } from "../services/authService";
import { validateSCC, createUserProfile, markSccUsed } from "../services/userService";

function Register() {
const darkRed = "#4d0303ff";
const gold = "#C9B37E";
const headerHeight = 92; // keeps space for header so the card never overlaps

const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [email, setEmail] = useState("");
const [dob, setDob] = useState("");
const [scc, setScc] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

// Tool Tip Helper Function
const InfoHint = ({ text }) => (
    <OverlayTrigger placement="right" overlay={<Tooltip>{text}</Tooltip>}>
    <span
        style={{
        cursor: "pointer",
        marginLeft: "6px",
        color: gold,
        fontWeight: "bold",
        }}
    >
        ⓘ
    </span>
    </OverlayTrigger>
);

// QR Code Scanning
useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrScc = params.get("scc");
    if (qrScc) setScc(qrScc);
}, []);

// Registration function
const registration = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !dob || !scc || !password || !confirmPassword) {
    setError("Please fill out all of the fields.");
    return;
    }

    if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
    }

    if (scc.length !== 10) {
    setError("Citizen Code must be exactly 10 characters.");
    return;
    }

    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) {
    setError("Your must be at least 18 years old to register.");
    return;
    }

    setLoading(true);

    try {
    const sccValid = await validateSCC(scc);
    if (!sccValid) {
        setError("Citizen Code Invalid or already in use.");
        setLoading(false);
        return;
    }

    const userCredential = await registerAuthUser(email, password);
    const uid = userCredential.user.uid;

    await createUserProfile(uid, { firstName, lastName, dob, scc });
    await markSccUsed(scc);

    window.location.href = "/voter";
    } catch (err) {
    if (err.code === "auth/email-already-in-use") {
        setError("This email address is already registered.");
    } else {
        console.log(err);
        setError("Registration failed. Please try again.");
    }
    } finally {
    setLoading(false);
    }
};

//  Input style (gold glow on focus)
const inputStyle = {
    borderRadius: "12px",
    paddingTop: "10px",
    paddingBottom: "10px",
    border: "1px solid rgba(0,0,0,0.12)",
    boxShadow: "none",
};

return (
    <div
    style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 0%, rgba(201,179,126,0.18), transparent 38%), #470e0eff",
    }}
    >
    {/* Header  */}
    <header
        style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: `${headerHeight}px`,
        backgroundColor: "#3a0808",
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "14px 20px",
        borderBottom: `3px solid ${gold}`,
        zIndex: 10,
        }}
    >
        <img src="/MSLR-Icon.png" alt="Shangri-La logo" style={{ height: "62px", marginRight: "16px" }} />
        <div>
        <div style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "0.02em" }}>
            Shangri-La Referendum
        </div>
        <div style={{ color: gold, fontSize: "0.9rem" }}>Registration Portal</div>
        </div>
    </header>

    {/* Content area */}
    <Container
        fluid
        style={{
        paddingTop: headerHeight + 26,
        paddingBottom: 40,
        }}
    >
        <Row className="justify-content-center w-100 m-0">
        <Col md={8} lg={5}>
            <Card
            className="border-0"
            style={{
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
                border: `1px solid rgba(201,179,126,0.28)`,
                background: "linear-gradient(180deg, #ffffff 0%, #fbf7f0 100%)",
            }}
            >
            {/* Top accent */}
            <div style={{ height: "6px", background: `linear-gradient(90deg, ${darkRed}, ${gold}, ${darkRed})` }} />

            <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                <h2 className="fw-bold" style={{ color: darkRed, letterSpacing: "0.01em" }}>
                    Registration
                </h2>

                {error && <div className="alert alert-danger text-center small mt-3 mb-0">{error}</div>}

                <p className="text-muted mt-3 mb-0">Create your official voting profile</p>
                </div>

                <Form onSubmit={registration}>
                <Row>
                    <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">First Name</Form.Label>
                        <Form.Control
                        type="text"
                        placeholder="John"
                        style={inputStyle}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onFocus={(e) => {
                            e.target.style.border = `1px solid ${gold}`;
                            e.target.style.boxShadow = `0 0 0 4px rgba(201,179,126,0.25)`;
                        }}
                        onBlur={(e) => {
                            e.target.style.border = "1px solid rgba(0,0,0,0.12)";
                            e.target.style.boxShadow = "none";
                        }}
                        />
                    </Form.Group>
                    </Col>

                    <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Last Name</Form.Label>
                        <Form.Control
                        type="text"
                        placeholder="Smith"
                        style={inputStyle}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        onFocus={(e) => {
                            e.target.style.border = `1px solid ${gold}`;
                            e.target.style.boxShadow = `0 0 0 4px rgba(201,179,126,0.25)`;
                        }}
                        onBlur={(e) => {
                            e.target.style.border = "1px solid rgba(0,0,0,0.12)";
                            e.target.style.boxShadow = "none";
                        }}
                        />
                    </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Email Address</Form.Label>
                    <Form.Control
                    type="email"
                    placeholder="example@email.com"
                    style={inputStyle}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => {
                        e.target.style.border = `1px solid ${gold}`;
                        e.target.style.boxShadow = `0 0 0 4px rgba(201,179,126,0.25)`;
                    }}
                    onBlur={(e) => {
                        e.target.style.border = "1px solid rgba(0,0,0,0.12)";
                        e.target.style.boxShadow = "none";
                    }}
                    />
                </Form.Group>

                <Row>
                    <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">
                        Citizen Code <InfoHint text="You may also scan the QR code provided on your council letter." />
                        </Form.Label>
                        <Form.Control
                        type="text"
                        placeholder="XXXXXXXXXX"
                        maxLength={10}
                        style={inputStyle}
                        value={scc}
                        onChange={(e) => setScc(e.target.value)}
                        onFocus={(e) => {
                            e.target.style.border = `1px solid ${gold}`;
                            e.target.style.boxShadow = `0 0 0 4px rgba(201,179,126,0.25)`;
                        }}
                        onBlur={(e) => {
                            e.target.style.border = "1px solid rgba(0,0,0,0.12)";
                            e.target.style.boxShadow = "none";
                        }}
                        />
                    </Form.Group>
                    </Col>

                    <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Date of Birth</Form.Label>
                        <Form.Control
                        type="date"
                        style={inputStyle}
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        onFocus={(e) => {
                            e.target.style.border = `1px solid ${gold}`;
                            e.target.style.boxShadow = `0 0 0 4px rgba(201,179,126,0.25)`;
                        }}
                        onBlur={(e) => {
                            e.target.style.border = "1px solid rgba(0,0,0,0.12)";
                            e.target.style.boxShadow = "none";
                        }}
                        />
                    </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">
                        Password <InfoHint text="Password must be at least 8 characters long." />
                        </Form.Label>
                        <Form.Control
                        type="password"
                        placeholder="••••••••"
                        style={inputStyle}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={(e) => {
                            e.target.style.border = `1px solid ${gold}`;
                            e.target.style.boxShadow = `0 0 0 4px rgba(201,179,126,0.25)`;
                        }}
                        onBlur={(e) => {
                            e.target.style.border = "1px solid rgba(0,0,0,0.12)";
                            e.target.style.boxShadow = "none";
                        }}
                        />
                    </Form.Group>
                    </Col>

                    <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold">Confirm Password</Form.Label>
                        <Form.Control
                        type="password"
                        placeholder="••••••••"
                        style={inputStyle}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={(e) => {
                            e.target.style.border = `1px solid ${gold}`;
                            e.target.style.boxShadow = `0 0 0 4px rgba(201,179,126,0.25)`;
                        }}
                        onBlur={(e) => {
                            e.target.style.border = "1px solid rgba(0,0,0,0.12)";
                            e.target.style.boxShadow = "none";
                        }}
                        />
                    </Form.Group>
                    </Col>
                </Row>

                <Button className="w-100 fw-bold" type="submit" disabled={loading} style={{
                    backgroundColor: darkRed,
                    border: `1px solid rgba(201,179,126,0.55)`,
                    borderRadius: "12px",
                    padding: "12px 14px",
                    boxShadow: "0 14px 26px rgba(77,3,3,0.22)"
                }}>
                    {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                </Button>

                <div className="text-center mt-3">
                    <small className="text-muted">
                    Already registered?{" "}
                    <a href="/" style={{ color: darkRed, fontWeight: "bold", textDecoration: "none" }}>
                        Log in here
                    </a>
                    </small>
                </div>
                </Form>
            </Card.Body>

            <Card.Footer className="bg-white border-0 text-center pb-4">
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                Shangri-La Electoral Commission © 2025 | Authorized Voting Portal
                <hr />
                </div>
            </Card.Footer>
            </Card>
        </Col>
        </Row>
    </Container>
    </div>
);
}

export default Register;
