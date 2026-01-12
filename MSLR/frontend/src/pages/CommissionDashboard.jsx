import { Container, Row, Col, Card, Button } from "react-bootstrap";
import ReferendumCard from "../components/ReferendumCard";
import { useEffect, useState } from "react";
import { fetchAllReferendums } from "../services/referendumService";
import { logoutUser } from "../services/authService";
import { getUserProfile } from "../services/userService";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import CreateReferendumModal from "../components/CreateReferendumModal";
import { createReferendum } from "../services/referendumService";
import { runReferendumManagement } from "../services/referendumManagement";
import { setReferendumStatus } from "../services/referendumService";

function CommissionDashboard() {

    // Styling
    const DARKRED = "#4d0303ff";
    const GOLD = "#C9B37E";
    const BACKGROUND = "#f4f1ee";
    const CARD_BG = "#ffffff";


    const PANEL = {
        background: "linear-gradient(180deg, #ffffff 0%, #fbf7f0 100%)",
        border: `1px solid rgba(201,179,126,0.35)`,
        borderRadius: "14px",
        padding: "16px 18px",
    };

    const GOLD_DIVIDER = {
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(201,179,126,0.85), transparent)",
    };

    const SECTION_TITLE = {
        color: DARKRED,
        fontWeight: 650,
        letterSpacing: "0.01em",
        display: "flex",
        alignItems: "baseline",
        gap: "10px",
        marginBottom: 0,
    };

    const COUNT_PILL = (count) => ({
        fontSize: "0.8rem",
        fontWeight: 650,
        color: DARKRED,
        border: `1px solid rgba(201,179,126,0.7)`,
        borderRadius: "999px",
        padding: "4px 10px",
        background: "rgba(201,179,126,0.10)",
        whiteSpace: "nowrap",
    });

    const primaryBtnStyle = {
        backgroundColor: DARKRED,
        border: `1px solid rgba(201,179,126,0.55)`,
        fontWeight: 700,
        borderRadius: "12px",
        padding: "10px 12px",
        boxShadow: "0 10px 18px rgba(77,3,3,0.18)",
    };

    const [referendums, setReferendums] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [username, setUsername] = useState("");
    const [userRole, setUserRole] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "/";
            return;
        }

        const profile = await getUserProfile(user.uid);

        const role = profile?.role || null;
        setUserRole(role);

        if (profile?.firstName) setUsername(profile.firstName);
        // Protects commission dashboard
        if (role !== "commission") {
            window.location.href = "/voter";
            return;
        }

        setAuthChecked(true);
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if (!authChecked) return;
        if (userRole !== "commission") return;

        const load = async () => {
        try {
            await runReferendumManagement();
        } catch (e) {
            console.warn("runReferendumManagement failed:", e);
        }

        const data = await fetchAllReferendums();
        setReferendums(data);
        };

        load();
    }, [authChecked, userRole]);

    const handleLogout = async () => {
        await logoutUser();
        window.location.href = "/";
    };

    const upcoming = referendums.filter((ref) => ref.status === "upcoming");
    const open = referendums.filter((ref) => ref.status === "open");
    const closed = referendums.filter((ref) => ref.status === "closed");

    if (!authChecked) {
        return (
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
            <p className="text-muted">Loading commission portal...</p>
        </Container>
        );
    }

    const handleCreate = async (newRef) => {
        // compute next numerical ref_id based on the number of refs already
        const currentMax = referendums.reduce((max,r)=>{
            const n = Number(r.ref_id);
            return Number.isFinite(n) ? Math.max(max,n) : max;
        },0);

        const nextId = currentMax + 1;

        await createReferendum({...newRef, ref_id: nextId});
        const data = await fetchAllReferendums();
        setReferendums(data);
    };

    const handleSetStatus = async (refId, newStatus) => {
        await setReferendumStatus(refId, newStatus);
        const data = await fetchAllReferendums();
        setReferendums(data);
    };

    return (
        <Container fluid className="min-vh-100 p-0" style={{ backgroundColor: BACKGROUND }}>
        <header
            style={{
            backgroundColor: "#2f0606",
            color: "white",
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `3px solid ${GOLD}`,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img src="/MSLR-Icon.png" style={{ height: "52px" }} />
            <div>
                <h1 className="m-0 fs-4">Shangri-La Referendum</h1>
                <small style={{ color: GOLD }}>Electoral Commission Portal</small>
            </div>
            </div>

            <div style={{ textAlign: "right" }}>
            <div className="small">
                Welcome, <strong>{username || "Commissioner"}</strong>
            </div>
            <Button size="sm" variant="outline-light" onClick={handleLogout} className="mt-1">
                Log out
            </Button>
            </div>
        </header>

        <Container className="py-4">
            <Row className="justify-content-center">
            <Col xl={11} lg={11} md={11}>
                <Card
                className="shadow-sm border-0"
                style={{
                    backgroundColor: CARD_BG,
                    borderRadius: "14px",
                    padding: "28px",
                }}
                >
                <div
                    style={{
                    borderLeft: `5px solid ${DARKRED}`,
                    paddingLeft: "16px",
                    marginBottom: "18px",
                    }}
                >
                    <h2 className="m-0">Commission Dashboard</h2>
                    <small className="text-muted">Oversight and management of national referendums</small>
                </div>

                {/* Civic Notice Panel */}
                <div style={{ ...PANEL, marginBottom: "18px" }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                        <h5 className="mb-1" style={{ color: DARKRED, fontWeight: 650 }}>
                        Commission Notice
                        </h5>
                        <div className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                        Maintain referendum schedules, open and close sessions, and oversee ongoing ballots.
                        Status changes take effect immediately.
                        </div>
                    </div>

                    <div
                        style={{
                        border: `1px solid rgba(201,179,126,0.55)`,
                        borderRadius: "999px",
                        padding: "10px 12px",
                        background: "rgba(201,179,126,0.10)",
                        fontWeight: 650,
                        color: DARKRED,
                        whiteSpace: "nowrap",
                        }}
                    >
                        Oversight Mode
                    </div>
                    </div>

                    <div style={{ ...GOLD_DIVIDER, marginTop: "14px" }} />

                    <div className="mt-3 d-flex gap-3 flex-wrap text-muted" style={{ fontSize: "0.92rem" }}>
                    <span>
                        <strong style={{ color: DARKRED }}>{open.length}</strong> open
                    </span>
                    <span>
                        <strong style={{ color: DARKRED }}>{upcoming.length}</strong> upcoming
                    </span>
                    <span>
                        <strong style={{ color: DARKRED }}>{closed.length}</strong> closed
                    </span>
                    </div>
                </div>

                {/* Create Referendums */}
                <div className="d-flex align-items-center gap-2 mb-4">
                    <Button onClick={() => setShowCreate(true)} style={primaryBtnStyle}>
                    + Create Referendum
                    </Button>

                </div>

                {/* Upcoming */}
                <section className="mb-5">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                    <h4 style={SECTION_TITLE}>
                        Upcoming Referendums <span style={COUNT_PILL(upcoming.length)}>{upcoming.length}</span>
                    </h4>
                    <div style={{ ...GOLD_DIVIDER, flex: 1, minWidth: "140px" }} />
                    </div>

                    {upcoming.length === 0 ? (
                    <p className="text-muted fst-italic">No upcoming referendums scheduled.</p>
                    ) : (
                    <Row className="g-4 mt-1">
                        {upcoming.map((ref) => (
                        <Col key={ref.id} xs={12} md={6} xl={4}>
                            <ReferendumCard
                            refData={ref}
                            hasVoted={false}
                            userRole={userRole}
                            onSetStatus={handleSetStatus}
                            />
                        </Col>
                        ))}
                    </Row>
                    )}
                </section>

                {/* Open */}
                <section className="mb-5">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                    <h4 style={SECTION_TITLE}>
                        Open Referendums <span style={COUNT_PILL(open.length)}>{open.length}</span>
                    </h4>
                    <div style={{ ...GOLD_DIVIDER, flex: 1, minWidth: "140px" }} />
                    </div>

                    {open.length === 0 ? (
                    <p className="text-muted fst-italic">No referendums are currently open.</p>
                    ) : (
                    <Row className="g-4 mt-1">
                        {open.map((ref) => (
                        <Col key={ref.id} xs={12} md={6} xl={4}>
                            <ReferendumCard
                            refData={ref}
                            hasVoted={false}
                            userRole={userRole}
                            onSetStatus={handleSetStatus}
                            />
                        </Col>
                        ))}
                    </Row>
                    )}
                </section>

                {/* Closed */}
                <section>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                    <h4 style={SECTION_TITLE}>
                        Closed Referendums <span style={COUNT_PILL(closed.length)}>{closed.length}</span>
                    </h4>
                    <div style={{ ...GOLD_DIVIDER, flex: 1, minWidth: "140px" }} />
                    </div>

                    {closed.length === 0 ? (
                    <p className="text-muted fst-italic">No referendums have closed yet.</p>
                    ) : (
                    <Row className="g-4 mt-1">
                        {closed.map((ref) => (
                        <Col key={ref.id} xs={12} md={6} xl={4}>
                            <ReferendumCard
                            refData={ref}
                            hasVoted={false}
                            userRole={userRole}
                            onSetStatus={handleSetStatus}
                            />
                        </Col>
                        ))}
                    </Row>
                    )}
                </section>
                </Card>
            </Col>
            </Row>
        </Container>

        <CreateReferendumModal show={showCreate} onHide={() => setShowCreate(false)} onCreate={handleCreate} />
        </Container>
    );
}

export default CommissionDashboard;

