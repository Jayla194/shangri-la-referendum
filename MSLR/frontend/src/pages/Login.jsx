import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function Login() {
    // Styling Constants
    const DARKRED = "#4d0303ff";
    const GOLD = "#C9B37E";
    const headerHeight = 92;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setloading] = useState(false);
    const navigate = useNavigate();

    // Remember last email used
    useEffect(()=> {
        const saved = localStorage.getItem("mslr_last_email");
        if(saved) setEmail(saved);
    }, []);


    const LoginFunction = async (e) => {
        
        setloading(true);
        e.preventDefault();
        setError("");

        try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

        // Authenticate against Firebase Auth
        const userDetails = await signInWithEmailAndPassword(auth, email.trim(), password);

        const user = userDetails.user;
        const uid = user.uid;

        // Role from Firestore user
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            setError("User not found.");
            return;
        }

        const userData = userDocSnap.data();
        // Save or clear last email based on remember me tick box
        if (rememberMe) localStorage.setItem("mslr_last_email",email.trim());
            else localStorage.removeItem("mslr_last_email");
            
        // Routing to correct dashboard
        if (userData.role === "commission") {
            navigate("/commission");
        } else {
            
            navigate("/voter");
        }
        } catch (err) {
        console.error(err.code, err.message);

        if (err.code === "auth/user-not-found") {
            setError("No account found with this email.");
        } else if (err.code === "auth/wrong-password") {
            setError("Incorrect password.");
        } else if (err.code === "auth/invalid-email") {
            setError("Invalid email address.");
        } else {
            setError("Login failed. Please try again.");
        }
        }finally{
            setloading(false);
        }
    };

    //  Input style  (gold glow on focus)
    const inputStyle = {
        borderRadius: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        border: "1px solid rgba(0,0,0,0.12)",
        boxShadow: "none",
    };

    const handleFocus = (e) => {
        e.target.style.border = `1px solid ${GOLD}`;
        e.target.style.boxShadow = `0 0 0 4px rgba(201,179,126,0.25)`;
    };

    const handleBlur = (e) => {
        e.target.style.border = "1px solid rgba(0,0,0,0.12)";
        e.target.style.boxShadow = "none";
    };

    return (
        <div
        style={{
            minHeight: "100vh",
            background:
            "radial-gradient(circle at 20% 0%, rgba(201,179,126,0.18), transparent 38%), #470e0eff",
        }}>
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
            borderBottom: `3px solid ${GOLD}`,
            zIndex: 10,
            }}>
                
            <img
            src="/MSLR-Icon.png"
            alt="Shangri-La logo"
            style={{ height: "62px", marginRight: "16px" }}
            />
            <div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "0.02em" }}>
                Shangri-La Referendum
            </div>
            <div style={{ color: GOLD, fontSize: "0.9rem" }}>Voting Portal</div>
            </div>
        </header>

        {/* Main Content Area */}
        <Container fluid style={{ paddingTop: headerHeight + 30, paddingBottom: 40 }}>
            <Row className="justify-content-center w-100 m-0">
            <Col md={6} lg={4}>
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
                <div style={{ height: "6px", background: `linear-gradient(90deg, ${DARKRED}, ${GOLD}, ${DARKRED})` }} />

                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                    <h2 className="fw-bold" style={{ color: DARKRED }}>
                        Log In to Vote
                    </h2>
                    <p className="text-muted mb-0">Official Voting Referendum Portal</p>
                    </div>


                    {/* Error feedback */}
                    {error && (
                    <div className="alert alert-danger py-2" role="alert">
                        {error}
                    </div>
                    )}

                    {/* Login Form */}
                    <Form onSubmit={LoginFunction}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Email Address</Form.Label>
                        <Form.Control
                        type="email"
                        placeholder="example@email.com"
                        style={inputStyle}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        autoComplete="email"
                        disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Password</Form.Label>
                        <Form.Control
                        type="password"
                        placeholder="••••••••"
                        style={inputStyle}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        autoComplete={rememberMe ? "current-password" : "off"}
                        disabled={loading}
                        />
                    </Form.Group>

                    <Form.Check
                        className="mb-4"
                        type="checkbox"
                        label="Remember Me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />

                    <Button
                        className="w-100 fw-bold"
                        type="submit"
                        disabled={loading}
                        style={{
                        backgroundColor: DARKRED,
                        border: `1px solid rgba(201,179,126,0.55)`,
                        borderRadius: "12px",
                        padding: "12px 14px",
                        boxShadow: "0 14px 26px rgba(77,3,3,0.22)",
                        }}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="text-center mt-3">
                        <small className="text-muted">
                        Don&apos;t have a voter account?{" "}
                        <a href="/register" style={{ color: DARKRED, fontWeight: "bold", textDecoration: "none" }}>
                            Register here
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

export default Login;
